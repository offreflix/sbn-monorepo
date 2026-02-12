const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Helper para obter access token do localStorage
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
  });

  return handle<T>(res);
}

export interface WishlistItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  url?: string;
  imageUrl?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "WISHED" | "PURCHASED" | "REMOVED";
  tags: string[];
  notes?: string;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateWishlistItemRequest {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  url?: string;
  imageUrl?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "WISHED" | "PURCHASED" | "REMOVED";
  tags?: string[];
  notes?: string;
}

export const wishlistApi = {
  list: (status?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return request<WishlistItem[]>(`/api/finance/wishlist${queryString}`, {
      method: "GET",
    });
  },
  get: (id: string) =>
    request<WishlistItem>(`/api/finance/wishlist/${id}`, { method: "GET" }),
  create: (payload: CreateWishlistItemRequest) =>
    request<WishlistItem>("/api/finance/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<CreateWishlistItemRequest>) =>
    request<WishlistItem>(`/api/finance/wishlist/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  markAsPurchased: (id: string) =>
    request<WishlistItem>(`/api/finance/wishlist/${id}/purchase`, {
      method: "PATCH",
    }),
  delete: (id: string) =>
    request<void>(`/api/finance/wishlist/${id}`, {
      method: "DELETE",
    }),
};
