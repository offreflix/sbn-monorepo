// Entity types (API responses)
export interface WishlistItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  price?: number;
  installmentCount?: number;
  installmentValue?: number;
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

export interface WishlistPriceEntry {
  id: string;
  wishlistItemId: string;
  price: number;
  cashPrice?: number;
  installmentCount?: number;
  installmentValue?: number;
  currency: string;
  store: string;
  storeUrl?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface WishlistPriorityEntry {
  id: string;
  wishlistItemId: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  date: string;
  notes?: string;
  createdAt: string;
}

// Request DTOs (API payloads)
export interface CreateWishlistItemRequest {
  name: string;
  description?: string;
  price?: number;
  installmentCount?: number;
  installmentValue?: number;
  currency?: string;
  url?: string;
  imageUrl?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "WISHED" | "PURCHASED" | "REMOVED";
  tags?: string[];
  notes?: string;
}

export interface CreatePriceEntryRequest {
  price: number;
  cashPrice?: number;
  installmentCount?: number;
  installmentValue?: number;
  store: string;
  currency?: string;
  storeUrl?: string;
  date: string;
  notes?: string;
}

export interface CreatePriorityEntryRequest {
  priority: "LOW" | "MEDIUM" | "HIGH";
  date: string;
  notes?: string;
}

// Form state types
export type WishlistCreateFormData = {
  name: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  imageUrl: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  tags: string;
  notes: string;
  installmentCount: number;
  installmentValue: number;
};
