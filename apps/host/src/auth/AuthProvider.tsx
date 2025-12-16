import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authApi } from '../api/auth'
import type { AuthResponse, AuthTokens, User } from '../types/auth'

type SessionState = {
  user: User | null
  tokens: AuthTokens | null
}

type AuthContextValue = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (payload: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
  refreshTokens: () => Promise<AuthTokens>
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const STORAGE_KEY = 'sbn-auth-session'

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, tokens: null }
    const parsed = JSON.parse(raw) as SessionState
    return parsed
  } catch {
    return { user: null, tokens: null }
  }
}

function persistSession(session: SessionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionState>({ user: null, tokens: null })
  const [loading, setLoading] = useState(true)
  const refreshPromise = useRef<Promise<AuthTokens> | null>(null)

  useEffect(() => {
    setSession(loadSession())
    setLoading(false)
  }, [])

  const applyAuthResponse = (resp: AuthResponse) => {
    const nextSession: SessionState = {
      user: resp.user,
      tokens: { accessToken: resp.accessToken, refreshToken: resp.refreshToken },
    }
    setSession(nextSession)
    persistSession(nextSession)
  }

  const logout = () => {
    const nextSession: SessionState = { user: null, tokens: null }
    setSession(nextSession)
    persistSession(nextSession)
  }

  const refreshTokens = async () => {
    const stored = session.tokens?.refreshToken
    if (!stored) {
      logout()
      throw new Error('Sessão expirada')
    }

    if (!refreshPromise.current) {
      refreshPromise.current = authApi
        .refresh(stored)
        .then((tokens) => {
          const next = { ...session, tokens }
          setSession(next)
          persistSession(next)
          return tokens
        })
        .finally(() => {
          refreshPromise.current = null
        })
    }

    return refreshPromise.current
  }

  const login = async (credentials: { email: string; password: string }) => {
    const resp = await authApi.login(credentials)
    applyAuthResponse(resp)
  }

  const register = async (payload: { name: string; email: string; password: string }) => {
    const resp = await authApi.register(payload)
    applyAuthResponse(resp)
  }

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const doFetch = async (token: string | null) => {
      const headers = new Headers(init?.headers || {})
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(input, { ...init, headers })
    }

    let response = await doFetch(session.tokens?.accessToken ?? null)

    if (response.status === 401 && session.tokens?.refreshToken) {
      try {
        const tokens = await refreshTokens()
        response = await doFetch(tokens.accessToken)
      } catch {
        logout()
        throw new Error('Sessão expirada. Faça login novamente.')
      }
    }

    return response
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      accessToken: session.tokens?.accessToken ?? null,
      refreshToken: session.tokens?.refreshToken ?? null,
      loading,
      login,
      register,
      logout,
      refreshTokens,
      authFetch,
    }),
    [session.user, session.tokens, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

