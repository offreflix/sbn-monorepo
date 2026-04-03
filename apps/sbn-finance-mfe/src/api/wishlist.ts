import { request } from './client'

export interface WishlistItem {
  id: string
  userId: string
  name: string
  description?: string
  price?: number
  installmentCount?: number
  installmentValue?: number
  currency: string
  url?: string
  imageUrl?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'WISHED' | 'PURCHASED' | 'REMOVED'
  tags: string[]
  notes?: string
  purchasedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface WishlistPriceEntry {
  id: string
  wishlistItemId: string
  price: number
  cashPrice?: number
  installmentCount?: number
  installmentValue?: number
  currency: string
  store: string
  storeUrl?: string
  date: string
  notes?: string
  createdAt: string
}

export interface CreateWishlistItemRequest {
  name: string
  description?: string
  price?: number
  installmentCount?: number
  installmentValue?: number
  currency?: string
  url?: string
  imageUrl?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  status?: 'WISHED' | 'PURCHASED' | 'REMOVED'
  tags?: string[]
  notes?: string
}

export interface CreatePriceEntryRequest {
  price: number
  cashPrice?: number
  installmentCount?: number
  installmentValue?: number
  store: string
  currency?: string
  storeUrl?: string
  date: string
  notes?: string
}

export interface WishlistPriorityEntry {
  id: string
  wishlistItemId: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  date: string
  notes?: string
  createdAt: string
}

export interface CreatePriorityEntryRequest {
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  date: string
  notes?: string
}

export const wishlistApi = {
  list: (status?: string, priority?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (priority) params.append('priority', priority)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return request<WishlistItem[]>(`/api/finance/wishlist${queryString}`, {
      method: 'GET',
    })
  },
  get: (id: string) =>
    request<WishlistItem>(`/api/finance/wishlist/${id}`, { method: 'GET' }),
  create: (payload: CreateWishlistItemRequest) =>
    request<WishlistItem>('/api/finance/wishlist', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<CreateWishlistItemRequest>) =>
    request<WishlistItem>(`/api/finance/wishlist/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  markAsPurchased: (id: string) =>
    request<WishlistItem>(`/api/finance/wishlist/${id}/purchase`, {
      method: 'PATCH',
    }),
  delete: (id: string) =>
    request<void>(`/api/finance/wishlist/${id}`, { method: 'DELETE' }),

  getPrices: (id: string) =>
    request<WishlistPriceEntry[]>(`/api/finance/wishlist/${id}/prices`, {
      method: 'GET',
    }),
  addPrice: (id: string, payload: CreatePriceEntryRequest) =>
    request<WishlistPriceEntry>(`/api/finance/wishlist/${id}/prices`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removePrice: (id: string, entryId: string) =>
    request<void>(`/api/finance/wishlist/${id}/prices/${entryId}`, {
      method: 'DELETE',
    }),

  getPriorities: (id: string) =>
    request<WishlistPriorityEntry[]>(`/api/finance/wishlist/${id}/priorities`, {
      method: 'GET',
    }),
  addPriority: (id: string, payload: CreatePriorityEntryRequest) =>
    request<WishlistPriorityEntry>(`/api/finance/wishlist/${id}/priorities`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removePriority: (id: string, entryId: string) =>
    request<void>(`/api/finance/wishlist/${id}/priorities/${entryId}`, {
      method: 'DELETE',
    }),
}
