import BrandMark from "./BrandMark";
import BottomTabs from "./BottomTabs";
import type { OperatorProfile } from "../lib/types";
import type { RouteKey } from "../routes";
import type { ReactNode } from "react";

export default function AppShell({
  profile,
  route,
  onNavigate,
  onLogout,
  children,
}: {
  profile: OperatorProfile;
  route: RouteKey;
  onNavigate: (route: RouteKey) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <BrandMark size="sm" />
          <div>
            <strong>香气读懂你的心</strong>
            <span>Admin App</span>
          </div>
        </div>
        <button className="ghost-button compact" type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="app-content">
        <div className="user-chip">{profile.email ?? "Admin"}</div>
        {children}
      </main>

      <BottomTabs active={route} onNavigate={onNavigate} />
    </div>
  );
}
