import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppProvider";
import { useAuth } from "./AuthProvider";
import ErrorBoundary from "./ErrorBoundary";
import {
  hideNativeSplash,
  exitNativeApp,
  initializeNativeBridge,
  installKeyboardClassHandlers,
  onNativeBackButton,
  readLastRoute,
  saveLastRoute,
} from "./NativeBridge";
import MobileShell from "../components/mobile/MobileShell";
import LoadingState from "../components/mobile/LoadingState";
import ErrorState from "../components/mobile/ErrorState";
import Login from "../routes/Login";
import Dashboard from "../routes/Dashboard";
import Bookings from "../routes/Bookings";
import Members from "../routes/Members";
import Scan from "../routes/Scan";
import Points from "../routes/Points";
import Rewards from "../routes/Rewards";
import Settings from "../routes/Settings";
import { parseRoute, routeToHash, type RouteKey } from "../routes";

export default function AppRouter() {
  const initial = parseRoute();
  const [route, setRoute] = useState<RouteKey>(initial.route);
  const [params, setParams] = useState(initial.params);
  const routeRef = useRef<RouteKey>(initial.route);
  const lastExitTapRef = useRef(0);
  const { pageDirty, setPageDirty, showToast } = useApp();
  const { booting, profile, authError, configured, login, logout } = useAuth();

  function navigate(nextRoute: RouteKey, nextParams?: URLSearchParams) {
    setPageDirty(false);
    const hash = routeToHash(nextRoute, nextParams);
    window.location.hash = hash;
    saveLastRoute(hash);
  }

  useEffect(() => {
    initializeNativeBridge();
    const removeKeyboardHandlers = installKeyboardClassHandlers();

    readLastRoute().then((hash) => {
      if (!window.location.hash && hash) window.location.hash = hash;
    });

    const onHashChange = () => {
      const next = parseRoute();
      routeRef.current = next.route;
      setRoute(next.route);
      setParams(next.params);
      saveLastRoute(window.location.hash || routeToHash(next.route, next.params));
    };
    window.addEventListener("hashchange", onHashChange);

    const backSub = onNativeBackButton(() => {
      if (pageDirty) {
        showToast("表单还没保存，再点返回会回到首页", "warning");
        setPageDirty(false);
        return;
      }

      if (routeRef.current !== "dashboard") {
        navigate("dashboard");
        return;
      }

      const now = Date.now();
      if (now - lastExitTapRef.current < 1800) {
        exitNativeApp();
        return;
      }
      lastExitTapRef.current = now;
      showToast("再按一次返回退出 Admin App", "warning");
    });

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      backSub.then((handle) => handle.remove()).catch(() => undefined);
      removeKeyboardHandlers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageDirty, setPageDirty, showToast]);

  useEffect(() => {
    if (!booting) hideNativeSplash();
  }, [booting]);

  if (!configured) {
    return (
      <main className="login-screen">
        <ErrorState
          title="缺少 Supabase 设置"
          message="请在 mobile-admin/.env.local 填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。"
        />
      </main>
    );
  }

  if (booting) return <LoadingState text="正在恢复 Admin App..." />;

  if (!profile) {
    return (
      <Login
        onLogin={async (email, password) => {
          const operator = await login(email, password);
          if (operator?.canAccessAdmin) navigate("dashboard");
        }}
      />
    );
  }

  if (!profile.canAccessAdmin) {
    return (
      <main className="login-screen">
        <ErrorState
          title="无后台权限"
          message="此账号不是 admin 或 staff，不能进入 Admin App。"
          details={authError}
          actionLabel="退出登录"
          onRetry={logout}
        />
      </main>
    );
  }

  return (
    <MobileShell profile={profile} route={route} onNavigate={navigate} onLogout={logout}>
      <ErrorBoundary>
        {route === "dashboard" && <Dashboard onNavigate={navigate} profile={profile} />}
        {route === "bookings" && <Bookings profile={profile} />}
        {route === "members" && <Members profile={profile} />}
        {route === "scan" && <Scan profile={profile} initialToken={params.get("token") ?? ""} />}
        {route === "points" && <Points />}
        {route === "rewards" && <Rewards profile={profile} />}
        {route === "settings" && <Settings profile={profile} />}
      </ErrorBoundary>
    </MobileShell>
  );
}
