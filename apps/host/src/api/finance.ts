const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:56080";

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

  return handle<T>(res);
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  isActive: boolean;
  limit?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: "Receita" | "Despesa";
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
}

export interface CreateTransactionRequest {
  walletId: string;
  categoryId: string;
  amount: string;
  currency?: string;
  date: string;
  description?: string;
  status?: "Pendente" | "Pago" | "Cancelado";
  type: "Receita" | "Despesa";
  isPaid?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  installments?: number;
  isRecurring?: boolean;
  frequency?: "MONTHLY" | "WEEKLY";
}

export const financeApi = {
  wallets: {
    list: () => request<Wallet[]>("/api/finance/wallets", { method: "GET" }),
  },
  categories: {
    list: () =>
      request<Category[]>("/api/finance/categories", { method: "GET" }),
  },
  transactions: {
    create: (payload: CreateTransactionRequest) =>
      request<unknown>("/api/finance/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};
