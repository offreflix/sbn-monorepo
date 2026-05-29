import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "../api/auth";
import type {
  AuthResponse,
  AuthTokens,
  RefreshResponse,
  User,
} from "../types/auth";
import { getAuthBridge } from "./sessionBridge";

type SessionState = {
  user: User | null;
  accessToken: string | null;
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
      return { user: null, accessToken: null };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null };
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return { user: parsed.user ?? null, accessToken: null };
  } catch (error) {
    console.error("[Auth] Failed to load session:", error);
    return { user: null, accessToken: null };
  }
}

function persistSession(session: SessionState) {
  try {
    if (typeof window === "undefined" || !localStorage) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: session.user }));
  } catch (error) {
    console.error("[Auth] Failed to persist session:", error);
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionState>({
    user: null,
    accessToken: null,
  });
  const [loading, setLoading] = useState(true);
  const refreshPromise = useRef<Promise<AuthTokens> | null>(null);

  const applyAuthResponse = (resp: AuthResponse) => {
    if (!resp.accessToken) {
      throw new Error("Token de acesso nao recebido do servidor");
    }

    getAuthBridge().setAccessToken(resp.accessToken);
    const nextSession: SessionState = {
      user: resp.user,
      accessToken: resp.accessToken,
    };
    setSession(nextSession);
    persistSession(nextSession);
  };

  useEffect(() => {
    const stored = loadSession();
    setSession(stored);

    authApi
      .refresh()
      .then(applyAuthResponse)
      .catch(() => {
        getAuthBridge().clear();
        const nextSession = { user: null, accessToken: null };
        setSession(nextSession);
        persistSession(nextSession);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("[Auth] Failed to invalidate refresh token:", error);
    }

    getAuthBridge().clear();
    const nextSession: SessionState = { user: null, accessToken: null };
    setSession(nextSession);
    persistSession(nextSession);
  };

  const refreshTokens = async () => {
    if (!refreshPromise.current) {
      refreshPromise.current = authApi
        .refresh()
        .then((tokens: RefreshResponse) => {
          getAuthBridge().setAccessToken(tokens.accessToken);

          setSession((prev) => {
            const next = {
              user: tokens.user ?? prev.user,
              accessToken: tokens.accessToken,
            };
            persistSession(next);
            return next;
          });

          return { accessToken: tokens.accessToken };
        })
        .finally(() => {
          refreshPromise.current = null;
        });
    }

    return refreshPromise.current;
  };

  const login = async (credentials: { email: string; password: string }) => {
    const resp = await authApi.login(credentials);
    applyAuthResponse(resp);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    const registerResp = await authApi.register(payload);

    if (!registerResp.accessToken) {
      const loginResp = await authApi.login({
        email: payload.email,
        password: payload.password,
      });
      applyAuthResponse(loginResp);
    } else {
      applyAuthResponse(registerResp);
    }
  };

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const doFetch = async (token: string | null) => {
      const headers = new Headers(init?.headers || {});
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers, credentials: "include" });
    };

    let response = await doFetch(
      session.accessToken ?? getAuthBridge().getAccessToken(),
    );

    if (response.status === 401) {
      try {
        const tokens = await refreshTokens();
        response = await doFetch(tokens.accessToken);
      } catch {
        logout();
        throw new Error("Sessao expirada. Faca login novamente.");
      }
    }

    return response;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      accessToken: session.accessToken ?? null,
      refreshToken: null,
      loading,
      login,
      register,
      logout,
      refreshTokens,
      authFetch,
    }),
    [session.user, session.accessToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
