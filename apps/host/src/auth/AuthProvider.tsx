import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "../api/auth";
import type { AuthTokens, User } from "../types/auth";

type SessionState = {
  user: User | null;
  tokens: AuthTokens | null;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<AuthTokens>;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
};

const STORAGE_KEY = "sbn-auth-session";

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): SessionState {
  try {
    if (typeof window === "undefined" || !localStorage) {
      return { user: null, tokens: null };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, tokens: null };
    const parsed = JSON.parse(raw) as SessionState;
    return parsed;
  } catch (error) {
    console.error("[Auth] Failed to load session:", error);
    return { user: null, tokens: null };
  }
}

function persistSession(session: SessionState) {
  try {
    if (typeof window === "undefined" || !localStorage) {
      console.warn("[Auth] localStorage not available");
      return;
    }
    const serialized = JSON.stringify(session);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Debug: verificar se foi salvo
    if (process.env.NODE_ENV === "development") {
      const verify = localStorage.getItem(STORAGE_KEY);
      console.log("[Auth] Session saved to localStorage:", {
        hasUser: !!session.user,
        hasTokens: !!session.tokens,
        tokenLength: session.tokens?.accessToken?.length || 0,
        saved: verify !== null,
        matches: verify === serialized,
      });
    }
  } catch (error) {
    console.error("[Auth] Failed to persist session:", error);
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionState>({
    user: null,
    tokens: null,
  });
  const [loading, setLoading] = useState(true);
  const refreshPromise = useRef<Promise<AuthTokens> | null>(null);

  useEffect(() => {
    setSession(loadSession());
    setLoading(false);
  }, []);

  const applyAuthResponse = (resp: any) => {
    // Backend retorna camelCase
    console.log("[AuthProvider] Auth Response:", resp);
    const accessToken = resp.accessToken;
    const refreshToken = resp.refreshToken || null;

    if (!accessToken) {
      console.error("[Auth] No access token in response:", resp);
      throw new Error("Token de acesso não recebido do servidor");
    }

    if (!refreshToken) {
      console.warn("[Auth] No refresh token in response!", resp);
    }

    const nextSession: SessionState = {
      user: resp.user,
      tokens: {
        accessToken,
        refreshToken: refreshToken || "",
      },
    };
    setSession(nextSession);
    persistSession(nextSession);
    // Debug: verificar se foi salvo
    if (process.env.NODE_ENV === "development") {
      console.log("[Auth] Login/Register successful, session saved:", {
        userId: resp.user?.id,
        email: resp.user?.email,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });
    }
  };

  const logout = async () => {
    // Try to invalidate refresh token on backend
    const refreshToken = session.tokens?.refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (error) {
        console.warn("[Auth] Failed to invalidate refresh token:", error);
      }
    }

    const nextSession: SessionState = { user: null, tokens: null };
    setSession(nextSession);
    persistSession(nextSession);
  };

  const refreshTokens = async () => {
    const stored = session.tokens?.refreshToken;
    if (!stored || stored === "") {
      logout();
      throw new Error("Sessão expirada");
    }

    if (!refreshPromise.current) {
      refreshPromise.current = authApi
        .refresh(stored)
        .then((tokens: any) => {
          // Backend retorna camelCase
          const accessToken = tokens.accessToken;
          const refreshToken = tokens.refreshToken || stored;

          const normalizedTokens: AuthTokens = {
            accessToken,
            refreshToken,
          };

          // Preserva o user ao atualizar os tokens
          setSession((prev) => {
            const next = { ...prev, tokens: normalizedTokens };
            persistSession(next);
            return next;
          });
          return normalizedTokens;
        })
        .finally(() => {
          refreshPromise.current = null;
        });
    }

    return refreshPromise.current;
  };

  const login = async (credentials: { email: string; password: string }) => {
    const resp = (await authApi.login(credentials)) as any;
    applyAuthResponse(resp);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    // Register pode não retornar tokens, então fazemos login após registro
    const registerResp = (await authApi.register(payload)) as any;

    // Se não tiver tokens, faz login automaticamente
    if (!registerResp.accessToken && !registerResp.access_token) {
      const loginResp = (await authApi.login({
        email: payload.email,
        password: payload.password,
      })) as any;
      applyAuthResponse(loginResp);
    } else {
      applyAuthResponse(registerResp);
    }
  };

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const doFetch = async (token: string | null) => {
      const headers = new Headers(init?.headers || {});
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    };

    let response = await doFetch(session.tokens?.accessToken ?? null);

    if (response.status === 401 && session.tokens?.refreshToken) {
      try {
        const tokens = await refreshTokens();
        response = await doFetch(tokens.accessToken);
      } catch {
        logout();
        throw new Error("Sessão expirada. Faça login novamente.");
      }
    }

    return response;
  };

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
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
