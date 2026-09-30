"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/lib/api/auth";
import type { SanitizedUser } from "@/lib/api/auth";
import {
  AUTH_LOGOUT_EVENT,
  clearTokens,
  hasTokens,
  setTokens,
} from "@/lib/auth/token-storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: SanitizedUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<SanitizedUser>;
  logout: () => Promise<void>;
  hasRole: (...roleKeys: authApi.PlatformRoleKey[]) => boolean;
}

const ME_QUERY_KEY = ["auth", "me"] as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    enabled: hasTokens(),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const handleLogout = () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      setTokens(response.accessToken, response.refreshToken);
      queryClient.setQueryData(ME_QUERY_KEY, response.user);
      return response.user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network/auth errors on logout — we clear local state regardless.
    }
    clearTokens();
    queryClient.setQueryData(ME_QUERY_KEY, null);
  }, [queryClient]);

  const user = meQuery.data ?? null;

  const status: AuthStatus = !hasTokens()
    ? "unauthenticated"
    : meQuery.isLoading
      ? "loading"
      : user
        ? "authenticated"
        : "unauthenticated";

  const hasRole = useCallback(
    (...roleKeys: authApi.PlatformRoleKey[]) => {
      if (!user) return false;
      return roleKeys.some((key) => user.roles.includes(key));
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, status, login, logout, hasRole }),
    [user, status, login, logout, hasRole],
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
