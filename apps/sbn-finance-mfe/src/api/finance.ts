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
} from '../types/finance'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// Helper para obter access token do localStorage (compartilhado com host)
// O host salva em 'sbn-auth-session' como JSON: { user, tokens: { accessToken, refreshToken } }
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
    const message = data?.message || data?.error || res.statusText
    throw new Error(
      typeof message === 'string' ? message : 'Erro ao comunicar com o servidor'
    )
  }

  return data as T
}

async function request<T>(path: string, init: RequestInit) {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  // Se receber 401, tenta renovar o token (refresh)
  if (res.status === 401) {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        // Tenta renovar o token
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshRes.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshRes.json()
          // Atualiza os tokens no localStorage
          updateTokens(newAccessToken, newRefreshToken)
          // Repete a requisição original com o novo token
          const newHeaders: Record<string, string> = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          }
          res = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers: newHeaders,
          })
        } else {
          // Refresh falhou, limpa a sessão
          clearSession()
          throw new Error('Sessão expirada. Faça login novamente.')
        }
      } else {
        clearSession()
        window.location.href = '/login'
        throw new Error('Sessão expirada. Faça login novamente.')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Sessão expirada')) {
        window.location.href = '/login'
        throw error
      }
      throw new Error('Erro ao renovar sessão')
    }
  }

  return handle<T>(res)
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
    // Ignora erros de parse
  }
}

function clearSession() {
  localStorage.removeItem('sbn-auth-session')
}

export const financeApi = {
  // Wallets
  wallets: {
    list: () => request<Wallet[]>('/api/finance/wallets', { method: 'GET' }),
    get: (id: string) =>
      request<Wallet>(`/api/finance/wallets/${id}`, { method: 'GET' }),
    create: (payload: CreateWalletRequest) =>
      request<Wallet>('/api/finance/wallets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Transactions
  transactions: {
    list: () =>
      request<Transaction[]>('/api/finance/transactions', { method: 'GET' }),
    create: (payload: CreateTransactionRequest) =>
      request<Transaction>('/api/finance/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<CreateTransactionRequest>) =>
      request<Transaction>(`/api/finance/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  // Categories
  categories: {
    list: () =>
      request<Category[]>('/api/finance/categories', { method: 'GET' }),
    create: (payload: CreateCategoryRequest) =>
      request<Category>('/api/finance/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Recurrences
  recurrences: {
    list: () =>
      request<Recurrence[]>('/api/finance/recurrences', { method: 'GET' }),
    create: (payload: CreateRecurrenceRequest) =>
      request<Recurrence>('/api/finance/recurrences', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Projections
  projections: {
    get: (months?: number) => {
      const params = months ? `?months=${months}` : ''
      return request<Projection>(`/api/finance/projections${params}`, {
        method: 'GET',
      })
    },
  },
}
