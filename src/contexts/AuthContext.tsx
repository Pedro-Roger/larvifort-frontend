"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  isAuthenticated as checkToken,
  login as loginService,
  logout as logoutService,
  refreshToken as refreshTokenService,
} from "@/services/auth";
import type { AuthUser } from "@/services/auth";
import { setRefreshHandler, setUnauthorizedHandler } from "@/services/api";

const USER_STORAGE_KEY = "larvifort:user";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Persistência de usuário é best-effort; token é a fonte de verdade.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkToken());
  const [isLoading] = useState(false);

  const logout = useCallback(() => {
    logoutService();
    writeStoredUser(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setRefreshHandler(() => refreshTokenService());
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => {
      setRefreshHandler(null);
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginService({ email, password });
      writeStoredUser(result.user);
      setUser(result.user);
      setIsAuthenticated(true);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, isLoading, login, logout }),
    [user, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  return ctx;
}

export default AuthContext;
