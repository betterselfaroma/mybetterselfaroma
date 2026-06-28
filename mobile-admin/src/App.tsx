import { useEffect, useRef, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import AppShell from "./components/AppShell";
import LoadingScreen from "./components/LoadingScreen";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { loadOperatorProfile, restoreSession, signIn, signOut } from "./lib/auth";
import type { OperatorProfile } from "./lib/types";
import { parseRoute, routeToHash, type RouteKey } from "./routes";
import Login from "./routes/Login";
import Dashboard from "./routes/Dashboard";
import Bookings from "./routes/Bookings";
import Members from "./routes/Members";
import Scan from "./routes/Scan";
import Points from "./routes/Points";
import Rewards from "./routes/Rewards";
import Settings from "./routes/Settings";

export default function App() {
  const initial = parseRoute();
  const [route, setRoute] = useState<RouteKey>(initial.route);
  const [params, setParams] = useState(initial.params);
  const [booting, setBooting] = useState(true);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [authError, setAuthError] = useState("");
  const routeRef = useRef<RouteKey>(initial.route);

  function navigate(nextRoute: RouteKey, nextParams?: URLSearchParams) {
    window.location.hash = routeToHash(nextRoute, nextParams);
  }

  async function loadSession() {
    setAuthError("");
    try {
      const session = await restoreSession();
      const operator = await loadOperatorProfile(session);
      setProfile(operator);
    } catch (err) {
      console.error("Restore mobile admin session failed:", err);
      setAuthError(err instanceof Error ? err.message : "Session could not be restored.");
      setProfile(null);
    } finally {
      setBooting(false);
      SplashScreen.hide().catch(() => undefined);
    }
  }

  useEffect(() => {
    StatusBar.setBackgroundColor({ color: "#2f5d46" }).catch(() => undefined);
    StatusBar.setStyle({ style: Style.Light }).catch(() => undefined);
    loadSession();

    const authSub = supabase.auth.onAuthStateChange((_event, session) => {
      loadOperatorProfile(session)
        .then(setProfile)
        .catch((err) => {
          console.error("Auth state profile load failed:", err);
          setProfile(null);
        });
    });

    const onHashChange = () => {
      const next = parseRoute();
      routeRef.current = next.route;
      setRoute(next.route);
      setParams(next.params);
    };
    window.addEventListener("hashchange", onHashChange);

    const backSub = CapacitorApp.addListener("backButton", () => {
      if (routeRef.current !== "dashboard") {
        navigate("dashboard");
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      authSub.data.subscription.unsubscribe();
      window.removeEventListener("hashchange", onHashChange);
      backSub.then((handle) => handle.remove()).catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <main className="login-screen">
        <div className="login-card">
          <h1>缺少 Supabase 设置</h1>
          <p className="muted">请在 mobile-admin/.env 填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。</p>
        </div>
      </main>
    );
  }

  if (booting) return <LoadingScreen />;

  async function handleLogin(email: string, password: string) {
    const session = await signIn(email, password);
    const operator = await loadOperatorProfile(session);
    setProfile(operator);
    if (!operator?.canAccessAdmin) return;
    navigate("dashboard");
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error("Mobile admin logout failed:", err);
    } finally {
      setProfile(null);
    }
  }

  if (!profile) return <Login onLogin={handleLogin} />;

  if (!profile.canAccessAdmin) {
    return (
      <main className="login-screen">
        <div className="login-card">
          <h1>无后台权限</h1>
          <p className="muted">此账号不是 admin 或 staff，不能进入 Admin App。</p>
          {authError && <p className="error-box">{authError}</p>}
          <button className="primary-button full" onClick={handleLogout}>退出登录</button>
        </div>
      </main>
    );
  }

  return (
    <AppShell profile={profile} route={route} onNavigate={navigate} onLogout={handleLogout}>
      {route === "dashboard" && <Dashboard onNavigate={navigate} />}
      {route === "bookings" && <Bookings profile={profile} />}
      {route === "members" && <Members profile={profile} />}
      {route === "scan" && <Scan profile={profile} initialToken={params.get("token") ?? ""} />}
      {route === "points" && <Points />}
      {route === "rewards" && <Rewards profile={profile} />}
      {route === "settings" && <Settings profile={profile} />}
    </AppShell>
  );
}
