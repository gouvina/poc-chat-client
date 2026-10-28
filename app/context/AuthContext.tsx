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
import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { getMe, login as loginApi, register as registerApi, logout as logoutApi } from "../api/services/auth";
import { AUTH_SESSION_EXPIRED_EVENT } from "../api/client";
import type { LoginCredentials, RegisterCredentials } from "../types/auth";
import type { User } from "../types/user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("auth") === "expired") {
      setUser(null)
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const profile = await getMe();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
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

  const clearExpiredAuthParams = useCallback(() => {
    if (searchParams.get("auth") !== "expired") {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete("auth")

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`)
  }, [pathname, router, searchParams])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginApi(credentials);
      setUser(response.user)
      clearExpiredAuthParams()
      router.refresh()
    },
    [clearExpiredAuthParams],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const response = await registerApi(credentials);
      setUser(response.user)
      clearExpiredAuthParams()
    },
    [clearExpiredAuthParams],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } finally {
      setUser(null)
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
