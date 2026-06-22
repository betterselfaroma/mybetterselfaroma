import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Stat, Card, PageTitle } from "@/components/membership/ui";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    customers,
    pendingBookings,
    completedBookings,
    pendingRewards,
    pendingRedemptions,
    newThisMonth,
  ] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("referral_rewards").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
  ]);

  const stats = [
    { label: "总顾客数 · Customers", value: customers.count ?? 0 },
    { label: "待处理预约 · Open bookings", value: pendingBookings.count ?? 0 },
    { label: "已完成预约 · Completed", value: completedBookings.count ?? 0 },
    { label: "待发 TNG PIN · Pending rewards", value: pendingRewards.count ?? 0 },
    { label: "待审核兑换 · Pending redeem", value: pendingRedemptions.count ?? 0 },
    { label: "本月新增会员 · New this month", value: newThisMonth.count ?? 0 },
  ];

  const links = [
    { href: "/admin/customers", label: "顾客管理 · Customers" },
    { href: "/admin/bookings", label: "预约管理 · Bookings" },
    { href: "/admin/referral-rewards", label: "推荐奖励 · Referral rewards" },
    { href: "/admin/points", label: "积分记录 · Points" },
    { href: "/admin/redemptions", label: "积分兑换 · Redemptions" },
  ];

  return (
    <div className="space-y-8">
      <PageTitle title="后台总览" subtitle="Admin overview · Scent Knows You" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} />
        ))}
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
