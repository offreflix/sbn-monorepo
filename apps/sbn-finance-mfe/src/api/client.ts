const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:56080";

type AuthSession = {
  user?: unknown;
  tokens?: { accessToken?: string; refreshToken?: string };
};

function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem("sbn-auth-session");
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function getAccessToken(): string | null {
  return getSession()?.tokens?.accessToken ?? null;
}

function getRefreshToken(): string | null {
  return getSession()?.tokens?.refreshToken ?? null;
}

function updateTokens(newAccessToken: string, newRefreshToken: string) {
  try {
    const raw = localStorage.getItem("sbn-auth-session");
    if (!raw) return;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed.tokens) {
      parsed.tokens.accessToken = newAccessToken;
      parsed.tokens.refreshToken = newRefreshToken;
      localStorage.setItem("sbn-auth-session", JSON.stringify(parsed));
    }
  } catch {
    // Ignora erros de parse
  }
}

function clearSession() {
  localStorage.removeItem("sbn-auth-session");
}

async function handle<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const dataObj =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null;
    const rawMessage = dataObj?.message ?? dataObj?.error ?? res.statusText;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : typeof rawMessage === "string"
        ? rawMessage
        : "Erro ao comunicar com o servidor";
    throw new Error(message);
  }

  return data as T;
}

// Promise singleton to deduplicate concurrent refresh requests
let refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

async function handlerRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error("Refresh failed");

  const data = await response.json();
  updateTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAccessToken();
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    // Race condition: another tab may have already refreshed the token
    const currentToken = getAccessToken();
    if (token && currentToken && token !== currentToken) {
      return handle<T>(
        await fetch(`${API_BASE}${path}`, {
          ...init,
          headers: { ...headers, Authorization: `Bearer ${currentToken}` },
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
      return handle<T>(
        await fetch(`${API_BASE}${path}`, {
          ...init,
          headers: {
            ...headers,
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }),
      );
    } catch (error) {
      console.error("[API] Token refresh failed:", error);
      clearSession();
      window.location.href = "/login";
      throw new Error("Sessão expirada. Redirecionando para login...");
    }
  }

  return handle<T>(res);
}

export { API_BASE };
