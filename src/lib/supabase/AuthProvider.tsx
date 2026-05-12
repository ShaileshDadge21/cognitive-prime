/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./client";
import { getAuthSession } from "./auth";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(configured);

  const refreshSession = React.useCallback(async () => {
    if (!configured) {
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setSession(await getAuthSession());
    } finally {
      setLoading(false);
    }
  }, [configured]);

  React.useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    void refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      // Don't set loading to false here to avoid flickering during initial load
    });

    return () => subscription.unsubscribe();
  }, [configured, refreshSession]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured,
      refreshSession,
    }),
    [configured, loading, refreshSession, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
