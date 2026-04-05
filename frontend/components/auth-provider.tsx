"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/lib/types";
import { fetchMe } from "@/lib/api";

const STORAGE = "dondesalem_token";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  setSession: (token: string | null, user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(STORAGE) : null;
    setToken(t);
    if (!t) {
      setLoading(false);
      return;
    }
    fetchMe(t)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(STORAGE);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((newToken: string | null, newUser: User | null) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window === "undefined") return;
    if (newToken) localStorage.setItem(STORAGE, newToken);
    else localStorage.removeItem(STORAGE);
  }, []);

  const logout = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const u = await fetchMe(token);
    setUser(u);
  }, [token]);

  const value = useMemo(
    () => ({ token, user, loading, setSession, logout, refreshUser }),
    [token, user, loading, setSession, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth dentro de AuthProvider");
  return ctx;
}
