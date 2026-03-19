import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { getMyProfile, getMySystemRole } from "../lib/db";
import type { SystemRole, UserProfile } from "../components/Tree/treeTypes";

type AuthCtx = {
  loading: boolean;
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  systemRole: SystemRole;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [systemRole, setSystemRole] = useState<SystemRole>("member");

  async function refresh() {
    try {
      setLoading(true);

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      setSession(currentSession ?? null);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        try {
          const [profileData, roleData] = await Promise.all([
            getMyProfile().catch(() => null),
            getMySystemRole().catch(() => "member" as SystemRole),
          ]);

          setProfile(profileData);
          setSystemRole(roleData ?? "member");
        } catch (e) {
          console.error("Failed to load profile/role:", e);
          setProfile(null);
          setSystemRole("member");
        }
      } else {
        setProfile(null);
        setSystemRole("member");
      }
    } catch (error) {
      console.error("Auth refresh failed:", error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setSystemRole("member");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          const [profileData, roleData] = await Promise.all([
            getMyProfile().catch(() => null),
            getMySystemRole().catch(() => "member" as SystemRole),
          ]);

          setProfile(profileData);
          setSystemRole(roleData ?? "member");
        } catch (e) {
          console.error("Failed to load profile/role:", e);
          setProfile(null);
          setSystemRole("member");
        }
      } else {
        setProfile(null);
        setSystemRole("member");
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setSystemRole("member");
  }

  const value = useMemo<AuthCtx>(
    () => ({
      loading,
      user,
      session,
      profile,
      systemRole,
      refresh,
      signOut,
    }),
    [loading, user, session, profile, systemRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}