const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:56080";

function getAccessToken(): string | null {
  return window.__SBN_AUTH__?.getAccessToken() ?? null;
}

async function handle<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText;
    throw new Error(
      typeof message === "string"
        ? message
        : "Erro ao comunicar com o servidor",
    );
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
    credentials: "include",
  });

  return handle<T>(res);
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  expiresAt: string | null;
  createdAt: string;
}

export const apiKeysApi = {
  list: () => request<ApiKey[]>("/api/auth/api-keys", { method: "GET" }),

  create: (name: string, expiresAt?: string) =>
    request<CreateApiKeyResponse>("/api/auth/api-keys", {
      method: "POST",
      body: JSON.stringify({ name, expiresAt }),
    }),

  revoke: (id: string) =>
    request<{ success: boolean }>(`/api/auth/api-keys/${id}`, {
      method: "DELETE",
    }),
};
