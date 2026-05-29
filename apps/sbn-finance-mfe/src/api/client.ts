const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:56080";

let fallbackAccessToken: string | null = null;

function getAccessToken(): string | null {
  return window.__SBN_AUTH__?.getAccessToken() ?? fallbackAccessToken;
}

function updateAccessToken(newAccessToken: string) {
  fallbackAccessToken = newAccessToken;
  window.__SBN_AUTH__?.setAccessToken(newAccessToken);
}

function clearSession() {
  fallbackAccessToken = null;
  window.__SBN_AUTH__?.clear();
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

let refreshPromise: Promise<{ accessToken: string }> | null = null;

async function handlerRefresh(): Promise<{ accessToken: string }> {
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) throw new Error("Refresh failed");

  const data = (await response.json()) as { accessToken: string };
  updateAccessToken(data.accessToken);
  return { accessToken: data.accessToken };
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

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const currentToken = getAccessToken();
    if (token && currentToken && token !== currentToken) {
      return handle<T>(
        await fetch(`${API_BASE}${path}`, {
          ...init,
          headers: { ...headers, Authorization: `Bearer ${currentToken}` },
          credentials: "include",
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
          credentials: "include",
        }),
      );
    } catch {
      clearSession();
      window.location.href = "/login";
      throw new Error("Sessao expirada. Redirecionando para login...");
    }
  }

  return handle<T>(res);
}

export { API_BASE };
