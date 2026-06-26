import Link from "next/link";
import { LogoutButton } from "@/components/membership/LogoutButton";

const TABS = [
  { href: "/admin/dashboard", label: "首页", en: "Dashboard", icon: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z" },
  { href: "/admin/bookings", label: "预约", en: "Bookings", icon: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z" },
  { href: "/admin/scan", label: "扫码", en: "Scan", icon: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 9h6v6H9z" },
  { href: "/admin/members", label: "会员", en: "Members", icon: "M16 11a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0" },
  { href: "/admin/settings", label: "设置", en: "Settings", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2" },
];

function TabIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function AdminAppShell({
  userEmail,
  children,
}: {
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <header className="sticky top-0 z-40 border-b border-taupe-200/70 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-700 text-cream-50 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-base font-semibold text-ink">香气读懂你的心</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-sage-700">Admin App</span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            {userEmail && (
              <span className="hidden max-w-[190px] truncate rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-taupe-600 sm:inline">
                {userEmail}
              </span>
            )}
            <LogoutButton className="rounded-full border border-taupe-300 px-3 py-2 text-xs font-semibold text-taupe-700 hover:border-sage-500 hover:text-sage-700 disabled:opacity-60" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-28 pt-5 sm:px-6">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-taupe-200/80 bg-cream-50/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 shadow-[0_-8px_28px_rgba(31,61,46,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-4xl grid-cols-5 gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center text-[11px] font-semibold text-taupe-500 transition-colors hover:bg-sage-50 hover:text-sage-700"
            >
              <TabIcon path={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
