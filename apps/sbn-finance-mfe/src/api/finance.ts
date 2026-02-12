import type {
  Wallet,
  Category,
  Transaction,
  Recurrence,
  Projection,
  CreateWalletRequest,
  CreateTransactionRequest,
  CreateCategoryRequest,
  CreateRecurrenceRequest,
  DashboardSummary,
  DashboardCategories,
} from "../types/finance";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:56080";

// Helper para obter access token do localStorage (compartilhado com host)
// O host salva em 'sbn-auth-session' como JSON: { user, tokens: { accessToken, refreshToken } }
function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("sbn-auth-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      user?: unknown;
      tokens?: { accessToken?: string; refreshToken?: string };
    };
    return parsed.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function handle<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const rawMessage = data?.message || data?.error || res.statusText;
    // Handle array of messages (NestJS validation errors)
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : typeof rawMessage === "string"
        ? rawMessage
        : "Erro ao comunicar com o servidor";
    throw new Error(message);
  }

  return data as T;
}

async function request<T>(path: string, init: RequestInit) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // Se receber 401
  if (res.status === 401) {
    // 1. Verificar se o token já foi atualizado por outra aba/processo (Race Condition)
    const currentToken = getAccessToken();
    if (token && currentToken && token !== currentToken) {
      // Token mudou, tenta novamente com o novo token
      const newHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${currentToken}`,
      };
      return handle<T>(
        await fetch(`${API_BASE}${path}`, {
          ...init,
          headers: newHeaders,
        }),
      );
    }

    try {
      if (!refreshPromise) {
        refreshPromise = handlerRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const tokens = await refreshPromise;
      const newHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      };
      return handle<T>(
        await fetch(`${API_BASE}${path}`, {
          ...init,
          headers: newHeaders,
        }),
      );
    } catch (error) {
      // Refresh failed - clear session and redirect to login
      console.error("[Finance API] Token refresh failed:", error);
      clearSession();
      window.location.href = "/login";
      throw new Error("Sessão expirada. Redirecionando para login...");
    }
  }

  return handle<T>(res);
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("sbn-auth-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      user?: unknown;
      tokens?: { accessToken?: string; refreshToken?: string };
    };
    return parsed.tokens?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function updateTokens(newAccessToken: string, newRefreshToken: string) {
  try {
    const raw = localStorage.getItem("sbn-auth-session");
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      user?: unknown;
      tokens?: { accessToken?: string; refreshToken?: string };
    };
    if (parsed.tokens) {
      parsed.tokens.accessToken = newAccessToken;
      parsed.tokens.refreshToken = newRefreshToken;
      localStorage.setItem("sbn-auth-session", JSON.stringify(parsed));
    }
  } catch {
    // Ignora erros de parse
  }
}

// Promise singleton to deduplicate refresh requests
let refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

async function handlerRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Refresh failed");
  }

  const data = await response.json();
  updateTokens(data.accessToken, data.refreshToken);
  return data;
}

function clearSession() {
  localStorage.removeItem("sbn-auth-session");
}

export const financeApi = {
  // Wallets
  wallets: {
    list: () => request<Wallet[]>("/api/finance/wallets", { method: "GET" }),
    get: (id: string) =>
      request<Wallet>(`/api/finance/wallets/${id}`, { method: "GET" }),
    create: (payload: CreateWalletRequest) =>
      request<Wallet>("/api/finance/wallets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Transactions
  transactions: {
    list: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<Transaction[]>(`/api/finance/transactions${queryString}`, {
        method: "GET",
      });
    },
    summary: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardSummary>(
        `/api/finance/transactions/summary${queryString}`,
        { method: "GET" },
      );
    },
    create: (payload: CreateTransactionRequest) =>
      request<Transaction>("/api/finance/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<CreateTransactionRequest>) =>
      request<Transaction>(`/api/finance/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/finance/transactions/${id}`, {
        method: "DELETE",
      }),
  },

  // Categories
  categories: {
    list: () =>
      request<Category[]>("/api/finance/categories", { method: "GET" }),
    create: (payload: CreateCategoryRequest) =>
      request<Category>("/api/finance/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Recurrences
  recurrences: {
    list: () =>
      request<Recurrence[]>("/api/finance/recurrences", { method: "GET" }),
    create: (payload: CreateRecurrenceRequest) =>
      request<Recurrence>("/api/finance/recurrences", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Projections
  projections: {
    get: (months?: number) => {
      const params = months ? `?months=${months}` : "";
      return request<Projection>(`/api/finance/projections${params}`, {
        method: "GET",
      });
    },
  },

  dashboard: {
    summary: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardSummary>(
        `/api/finance/dashboard/summary${queryString}`,
        { method: "GET" },
      );
    },
    categories: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardCategories>(
        `/api/finance/dashboard/categories${queryString}`,
        { method: "GET" },
      );
    },
  },
};
