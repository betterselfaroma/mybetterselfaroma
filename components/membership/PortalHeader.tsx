import Link from "next/link";
import { LogoutButton } from "@/components/membership/LogoutButton";

export function PortalHeader({
  brandHref,
  links,
  points,
  isAdmin = false,
}: {
  brandHref: string;
  links: { href: string; label: string }[];
  points?: number;
  isAdmin?: boolean;
}) {
  const secondaryLinks = links.filter((link) => link.href !== "/member" && link.href !== "/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-sage-900/10 bg-cream-50/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={brandHref} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-800 text-cream-50 shadow-[0_14px_34px_-22px_rgba(31,61,46,0.8)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
            </svg>
          </Link>
          <div className="min-w-0">
            <Link href={brandHref} className="block truncate font-serif text-base font-semibold text-ink sm:text-lg">
              香气读懂你的心
            </Link>
            <div className="mt-0.5 flex items-center gap-2">
              <Link href="/" className="text-xs font-medium text-sage-700 md:hidden">返回主页</Link>
              {points != null && (
                <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-bold text-sage-700">
                  {points} pts
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 md:flex">
          <Link href="/" className="text-sm font-medium text-sage-700 transition-colors hover:text-sage-900">
            返回主页 · Back to Home
          </Link>
          <Link href="/member" className="text-sm text-taupe-600 transition-colors hover:text-sage-700">
            会员中心 · Member Center
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm text-taupe-600 transition-colors hover:text-sage-700">
              后台管理 · Admin
            </Link>
          )}
          {secondaryLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-taupe-600 transition-colors hover:text-sage-700">
              {l.label}
            </Link>
          ))}
          <LogoutButton className="text-sm font-medium text-taupe-500 transition-colors hover:text-ink disabled:opacity-60" />
        </nav>

        <div className="md:hidden">
          <LogoutButton className="rounded-full border border-taupe-200 bg-cream-100 px-3 py-2 text-xs font-bold text-taupe-600 disabled:opacity-60" label="登出" loadingLabel="登出中" />
        </div>
      </div>
    </header>
  );
}
