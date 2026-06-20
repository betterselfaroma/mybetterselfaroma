import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { requireAdmin } from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/membership/PortalHeader";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "总览" },
  { href: "/admin/customers", label: "顾客" },
  { href: "/admin/bookings", label: "预约" },
  { href: "/admin/referral-rewards", label: "推荐奖励" },
  { href: "/admin/points", label: "积分" },
  { href: "/admin/redemptions", label: "兑换" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/admin" links={LINKS} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
