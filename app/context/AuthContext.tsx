"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as loginApi, register as registerApi } from "../api/services/auth";
import { getStoredToken, setStoredToken } from "../api/client";
import type { LoginCredentials, RegisterCredentials } from "../types/auth";
import type { User } from "../types/user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getMe();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        setStoredToken(null);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuthResponse = useCallback((accessToken: string, nextUser: User) => {
    setStoredToken(accessToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginApi(credentials);
      applyAuthResponse(response.accessToken, response.user);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const response = await registerApi(credentials);
      applyAuthResponse(response.accessToken, response.user);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
