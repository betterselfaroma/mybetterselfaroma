import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { loadOperatorProfile, restoreSession, signIn, signOut } from "../features/auth/auth.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import type { OperatorProfile } from "../lib/types";
import { hideNativeSplash } from "./NativeBridge";

type AuthContextValue = {
  booting: boolean;
  profile: OperatorProfile | null;
  authError: string;
  configured: boolean;
  login: (email: string, password: string) => Promise<OperatorProfile | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [authError, setAuthError] = useState("");

  const refreshProfile = useCallback(async () => {
    setAuthError("");
    try {
      const session = await restoreSession();
      const operator = await loadOperatorProfile(session);
      setProfile(operator);
    } catch (error) {
      logAppError("Restore mobile admin session failed", error);
      setAuthError(getErrorMessage(error, "Session could not be restored"));
      setProfile(null);
    } finally {
      setBooting(false);
      await hideNativeSplash();
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    const authSub = supabase.auth.onAuthStateChange((_event, session) => {
      loadOperatorProfile(session)
        .then(setProfile)
        .catch((error) => {
          logAppError("Auth state profile load failed", error);
          setAuthError(getErrorMessage(error, "Profile could not be loaded"));
          setProfile(null);
        });
    });

    return () => authSub.data.subscription.unsubscribe();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await signIn(email, password);
    const operator = await loadOperatorProfile(session);
    setProfile(operator);
    return operator;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      logAppError("Mobile admin logout failed", error);
    } finally {
      setProfile(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      booting,
      profile,
      authError,
      configured: isSupabaseConfigured,
      login,
      logout,
      refreshProfile,
    }),
    [authError, booting, login, logout, profile, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
