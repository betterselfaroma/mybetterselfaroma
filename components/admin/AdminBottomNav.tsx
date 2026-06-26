"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dashboard", label: "首页", en: "Dashboard", icon: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z" },
  { href: "/admin/bookings", label: "预约", en: "Bookings", icon: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z" },
  { href: "/admin/scan", label: "扫码", en: "Scan", icon: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 9h6v6H9z", primary: true },
  { href: "/admin/members", label: "会员", en: "Members", icon: "M16 11a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0" },
  { href: "/admin/settings", label: "设置", en: "Settings", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2" },
];

function TabIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sage-900/10 bg-cream-50/90 px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-16px_40px_rgba(31,61,46,0.12)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1.5">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/admin/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[1.35rem] px-1 text-center text-[10px] font-semibold transition-all",
                tab.primary
                  ? "relative -mt-5 min-h-[68px] bg-sage-800 text-cream-50 shadow-[0_16px_38px_-22px_rgba(31,61,46,0.95)] ring-4 ring-cream-50"
                  : active
                    ? "bg-sage-50 text-sage-800"
                    : "text-taupe-500 hover:bg-sage-50 hover:text-sage-700",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-2xl transition-colors",
                  tab.primary
                    ? "bg-gold-300/20 text-gold-300"
                    : active
                      ? "bg-cream-50 text-sage-800 shadow-sm"
                      : "text-inherit",
                ].join(" ")}
              >
                <TabIcon path={tab.icon} />
              </span>
              <span className={tab.primary ? "text-[11px] text-cream-50" : ""}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
