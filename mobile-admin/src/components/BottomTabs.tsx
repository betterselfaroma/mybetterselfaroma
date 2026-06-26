import type { RouteKey } from "../routes";

const TABS: { route: RouteKey; label: string; icon: string; primary?: boolean }[] = [
  { route: "dashboard", label: "首页", icon: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z" },
  { route: "bookings", label: "预约", icon: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z" },
  { route: "scan", label: "扫码", icon: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 9h6v6H9z", primary: true },
  { route: "members", label: "会员", icon: "M16 11a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0" },
  { route: "settings", label: "设置", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2" },
];

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function BottomTabs({ active, onNavigate }: { active: RouteKey; onNavigate: (route: RouteKey) => void }) {
  return (
    <nav className="bottom-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.route}
          type="button"
          className={["tab-button", active === tab.route ? "active" : "", tab.primary ? "primary" : ""].join(" ")}
          onClick={() => onNavigate(tab.route)}
        >
          <span className="tab-icon"><Icon path={tab.icon} /></span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
