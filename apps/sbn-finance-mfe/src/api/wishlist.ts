const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:56080'

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('sbn-auth-session')
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      user?: unknown
      tokens?: { accessToken?: string; refreshToken?: string }
    }
    return parsed.tokens?.accessToken ?? null
  } catch {
    return null
  }
}

async function handle<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const data = isJson ? await res.json() : null
  if (!res.ok) {
    const dataObj =
      data && typeof data === 'object'
        ? (data as Record<string, unknown>)
        : null
    const rawMessage = (dataObj?.message ??
      dataObj?.error ??
      res.statusText) as unknown
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : 'Erro ao comunicar com o servidor'
    throw new Error(message)
  }
  return data as T
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem('sbn-auth-session')
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      user?: unknown
      tokens?: { accessToken?: string; refreshToken?: string }
    }
    return parsed.tokens?.refreshToken ?? null
  } catch {
    return null
  }
}

function updateTokens(newAccessToken: string, newRefreshToken: string) {
  try {
    const raw = localStorage.getItem('sbn-auth-session')
    if (!raw) return
    const parsed = JSON.parse(raw) as {
      user?: unknown
      tokens?: { accessToken?: string; refreshToken?: string }
    }
    if (parsed.tokens) {
      parsed.tokens.accessToken = newAccessToken
      parsed.tokens.refreshToken = newRefreshToken
      localStorage.setItem('sbn-auth-session', JSON.stringify(parsed))
    }
  } catch {
    return
  }
}

function clearSession() {
  localStorage.removeItem('sbn-auth-session')
}

let refreshPromise: Promise<{
  accessToken: string
  refreshToken: string
}> | null = null

async function handlerRefresh(): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Refresh failed')
  }

  const data = await response.json()
  updateTokens(data.accessToken, data.refreshToken)
  return data
}

async function request<T>(path: string, init: RequestInit) {
  const token = getAccessToken()
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  }
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    const currentToken = getAccessToken()
    if (token && currentToken && token !== currentToken) {
      const newHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${currentToken}`,
      }
      return handle<T>(
        await fetch(`${API_BASE}${path}`, { ...init, headers: newHeaders }),
      )
    }

    try {
      if (!refreshPromise) {
        refreshPromise = handlerRefresh().finally(() => {
          refreshPromise = null
        })
      }

      const tokens = await refreshPromise
      const newHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      }
      return handle<T>(
        await fetch(`${API_BASE}${path}`, { ...init, headers: newHeaders }),
      )
    } catch (error) {
      console.error('[Wishlist API] Token refresh failed:', error)
      clearSession()
      window.location.href = '/login'
      throw new Error('Sessão expirada. Redirecionando para login...')
    }
  }

  return handle<T>(res)
}

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
