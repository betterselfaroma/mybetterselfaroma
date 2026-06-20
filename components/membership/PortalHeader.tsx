import Link from "next/link";
import { signOut } from "@/app/account-actions";

export function PortalHeader({
  brandHref,
  links,
  points,
}: {
  brandHref: string;
  links: { href: string; label: string }[];
  points?: number;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-taupe-200/70 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href={brandHref} className="flex items-center gap-2 font-serif font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-700 text-cream-50">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
              </svg>
            </span>
            <span className="hidden sm:inline">闻见更好的自己</span>
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            {links.map((l) => (
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
          <form action={signOut}>
            <button type="submit" className="text-sm text-taupe-500 transition-colors hover:text-ink">
              退出 · Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
