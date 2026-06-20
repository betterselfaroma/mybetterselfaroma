import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Stat, Card, PageTitle } from "@/components/membership/ui";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createAdminClient();
  const [customers, pendingBookings, pendingRewards, pendingRedemptions] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase.from("referral_rewards").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const links = [
    { href: "/admin/customers", label: "顾客 · Customers" },
    { href: "/admin/bookings", label: "预约 · Bookings" },
    { href: "/admin/referral-rewards", label: "推荐奖励 · Referral rewards" },
    { href: "/admin/points", label: "积分 · Points" },
    { href: "/admin/redemptions", label: "兑换 · Redemptions" },
  ];

  return (
    <div className="space-y-8">
      <PageTitle title="后台总览" subtitle="Admin overview · Let Scent Understand Your Heart" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="顾客总数 · Customers" value={customers.count ?? 0} />
        <Stat label="待处理预约 · Open bookings" value={pendingBookings.count ?? 0} />
        <Stat label="待审核奖励 · Pending rewards" value={pendingRewards.count ?? 0} />
        <Stat label="待审核兑换 · Pending redeem" value={pendingRedemptions.count ?? 0} />
      </div>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">快速进入 · Manage</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-taupe-200/60 bg-cream-100 px-5 py-4 text-sm font-medium text-taupe-700 transition-colors hover:border-sage-400 hover:text-sage-700"
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
