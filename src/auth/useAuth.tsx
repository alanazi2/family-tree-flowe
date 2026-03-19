import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export type SystemRole = "super_admin" | "family_admin" | "member";

type AuthCtx = {
  loading: boolean;
  user: User | null;
  session: Session | null;
  systemRole: SystemRole;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // مؤقتًا نخليه member حتى يمر البناء
  const [systemRole, setSystemRole] = useState<SystemRole>("member");

  async function refresh() {
    try {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      setSession(session ?? null);
      setUser(session?.user ?? null);

      // مؤقتًا
      setSystemRole("member");
    } catch (error) {
      console.error("Auth refresh failed:", error);
      setSession(null);
      setUser(null);
      setSystemRole("member");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setSystemRole("member");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setSystemRole("member");
  }

  const value = useMemo<AuthCtx>(
    () => ({
      loading,
      user,
      session,
      systemRole,
      refresh,
      signOut,
    }),
    [loading, user, session, systemRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}