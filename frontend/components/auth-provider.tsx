"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { User } from "@/lib/types";
import { fetchMe } from "@/lib/api";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  /** Token intermedio cuando Google OK pero falta 2FA. */
  pendingTotpToken: string | null;
  loading: boolean;
  /** Actualiza la sesión JWT de NextAuth (p. ej. tras cambiar datos). */
  setSession: (token: string | null, user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const loading = status === "loading";
  const token = session?.accessToken ?? null;
  const user = session?.apiUser ?? null;
  const pendingTotpToken = session?.pendingTotpToken ?? null;

  const setSession = useCallback(
    (newToken: string | null, newUser: User | null) => {
      void update({
        accessToken: newToken,
        apiUser: newUser ?? undefined,
        pendingTotpToken: null,
      });
    },
    [update],
  );

  const logout = useCallback(() => {
    void signOut({ callbackUrl: "/" });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const u = await fetchMe(token);
    await update({ apiUser: u });
  }, [token, update]);

  const value = useMemo(
    () => ({
      token,
      user,
      pendingTotpToken,
      loading,
      setSession,
      logout,
      refreshUser,
    }),
    [token, user, pendingTotpToken, loading, setSession, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth dentro de AuthProvider");
  return ctx;
}
