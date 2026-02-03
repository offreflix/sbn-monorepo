import {
  type AuthResponse,
  type LoginRequest,
  type RefreshResponse,
  type RegisterRequest,
} from '../types/auth'

const API_BASE = `${import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'}/api/auth`

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
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    ...init,
  })
  return handle<T>(res)
}

export const authApi = {
  login: (payload: LoginRequest) =>
    request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterRequest) =>
    request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  refresh: (refreshToken: string) =>
    request<RefreshResponse>('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken?: string) =>
    request<{ success: boolean }>('/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
}
