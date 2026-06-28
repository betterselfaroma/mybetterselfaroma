import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { isStaffOrAdminAccess, requireMember } from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/membership/PortalHeader";
import MobileMemberNav from "@/components/membership/MobileMemberNav";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LINKS = [
  { href: "/member", label: "会员中心" },
  { href: "/member/bookings", label: "预约记录" },
  { href: "/member/points", label: "积分明细" },
  { href: "/member/notifications", label: "通知中心" },
  { href: "/member/referral", label: "推荐中心" },
  { href: "/member/rewards", label: "积分兑换" },
  { href: "/book", label: "预约" },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const customer = await requireMember();
  const isAdmin = isStaffOrAdminAccess(customer.email, {
    role: customer.role ?? "member",
    isAdmin: Boolean(customer.is_admin),
  });

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/member" links={LINKS} points={customer.points_balance} isAdmin={isAdmin} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:py-10">{children}</main>
      <MobileMemberNav points={customer.points_balance} />
    </div>
  );
}
