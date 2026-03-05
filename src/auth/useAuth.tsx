import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";
import type { SystemRole, UserProfile } from "../components/Tree/treeTypes";
import { getMyProfile, getMySystemRole } from "../lib/db";

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

function withTimeout<T>(p: Promise<T>, ms = 4000, label = "timeout") {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

async function safeLoadProfileAndRole() {
  try {
    const [p, r] = await withTimeout(
      Promise.all([getMyProfile(), getMySystemRole()]),
      5000,
      "profile/role timeout"
    );
    return { profile: p, role: r as SystemRole };
  } catch (e) {
    console.error("Failed to load profile/role:", e);
    return { profile: null, role: "member" as SystemRole };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [systemRole, setSystemRole] = useState<SystemRole>("member");

  async function refresh() {
    setLoading(true);
    try {
      const { data } = await withTimeout(supabase.auth.getSession(), 4000, "getSession timeout");
      const s = data.session ?? null;

      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        const res = await safeLoadProfileAndRole();
        setProfile(res.profile);
        setSystemRole(res.role);
      } else {
        setProfile(null);
        setSystemRole("member");
      }
    } catch (e) {
      console.error("Auth refresh failed:", e);
      // لا تعلّق الصفحة حتى لو Supabase ما رد
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

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true);
      try {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const res = await safeLoadProfileAndRole();
          setProfile(res.profile);
          setSystemRole(res.role);
        } else {
          setProfile(null);
          setSystemRole("member");
        }
      } catch (e) {
        console.error("onAuthStateChange handler failed:", e);
        setProfile(null);
        setSystemRole("member");
      } finally {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = useMemo<AuthCtx>(
    () => ({ loading, user, session, profile, systemRole, refresh, signOut }),
    [loading, user, session, profile, systemRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}