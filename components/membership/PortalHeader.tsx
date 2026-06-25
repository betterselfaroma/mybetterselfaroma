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
    <header className="sticky top-0 z-40 border-b border-taupe-200/70 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <Link href={brandHref} className="flex items-center gap-2 font-serif font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-700 text-cream-50">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
              </svg>
            </span>
            <span className="hidden sm:inline">香气读懂你的心</span>
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
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
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {points != null && (
            <span className="rounded-full bg-sage-100 px-3 py-1 text-sm font-semibold text-sage-700">
              {points} pts
            </span>
          )}
          <LogoutButton className="text-sm font-medium text-taupe-500 transition-colors hover:text-ink disabled:opacity-60" />
        </div>
      </div>
    </header>
  );
}
