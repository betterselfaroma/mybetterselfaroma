import Link from "next/link";
import { LogoutButton } from "@/components/membership/LogoutButton";
import AdminBrandMark from "./AdminBrandMark";
import AdminBottomNav from "./AdminBottomNav";

export default function AdminAppShell({
  userEmail,
  children,
}: {
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f2e6_0%,#fbf9f2_46%,#f0e6d6_100%)] font-sans text-ink">
      <header className="sticky top-0 z-40 border-b border-sage-900/10 bg-cream-50/88 pt-[env(safe-area-inset-top)] shadow-[0_10px_34px_-30px_rgba(31,61,46,0.7)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3 sm:max-w-4xl">
          <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
            <AdminBrandMark size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-serif text-[17px] font-semibold leading-tight text-ink">香气读懂你的心</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-sage-700">Admin App</span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            {userEmail && (
              <span className="hidden max-w-[170px] truncate rounded-full bg-cream-100 px-3 py-1.5 text-xs font-medium text-taupe-600 ring-1 ring-taupe-200/60 sm:inline">
                {userEmail}
              </span>
            )}
            <LogoutButton className="min-h-10 rounded-full border border-taupe-300 bg-cream-50 px-3 py-2 text-xs font-semibold text-taupe-700 shadow-sm hover:border-sage-500 hover:text-sage-700 disabled:opacity-60" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-32 pt-5 sm:max-w-4xl sm:px-6">
        {children}
      </main>

      <AdminBottomNav />
    </div>
  );
}
