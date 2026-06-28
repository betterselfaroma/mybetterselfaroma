import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getErrorMessage, logAppError } from "../lib/errors";
import { loadOperatorProfile } from "../lib/auth";
import { hasSupabaseConfig, supabase } from "../lib/supabase";
import type { OperatorProfile } from "../lib/types";

type AuthContextValue = {
  session: Session | null;
  profile: OperatorProfile | null;
  booting: boolean;
  loading: boolean;
  error: string;
  hasConfig: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }
    const operator = await loadOperatorProfile(nextSession.user);
    setProfile(operator);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    setProfile(await loadOperatorProfile(session.user));
  }, [session]);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        if (!hasSupabaseConfig) {
          setError("缺少 Supabase 环境变量。请设置 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY。");
          return;
        }
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (mounted) await applySession(data.session);
      } catch (err) {
        logAppError("Native admin session restore failed", err);
        if (mounted) setError(getErrorMessage(err, "Session restore failed"));
      } finally {
        if (mounted) setBooting(false);
      }
    }

    restore();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession).catch((err) => {
        logAppError("Native admin auth state failed", err);
        setError(getErrorMessage(err, "Auth state failed"));
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (loginError) throw loginError;
      await applySession(data.session);
    } catch (err) {
      logAppError("Native admin login failed", err);
      const message = getErrorMessage(err, "Login failed");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
    } catch (err) {
      logAppError("Native admin logout failed", err);
    } finally {
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ session, profile, booting, loading, error, hasConfig: hasSupabaseConfig, login, logout, refreshProfile }),
    [session, profile, booting, loading, error, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
