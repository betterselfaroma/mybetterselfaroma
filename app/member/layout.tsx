import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { requireMember } from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/membership/PortalHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LINKS = [
  { href: "/member", label: "会员中心" },
  { href: "/member/referral", label: "推荐中心" },
  { href: "/member/rewards", label: "积分兑换" },
  { href: "/book", label: "预约" },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const customer = await requireMember();

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/member" links={LINKS} points={customer.points_balance} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
