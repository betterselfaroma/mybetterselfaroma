import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { Card, Badge, PageTitle, EmptyState } from "@/components/membership/ui";
import RedeemButton from "@/components/membership/RedeemButton";
import { REDEMPTION_STATUS_LABEL, fmtDate } from "@/lib/membership-format";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const customer = await requireMember();
  const supabase = createServerSupabase();

  const [catalogueRes, redemptionsRes] = await Promise.all([
    supabase.from("rewards").select("*").eq("is_active", true).order("points_required"),
    supabase.from("reward_redemptions").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }),
  ]);
  const catalogue = catalogueRes.data ?? [];
  const redemptions = redemptionsRes.data ?? [];

  return (
    <div className="space-y-8">
      <PageTitle title="积分兑换" subtitle="Rewards · 用积分兑换指定体验优惠" />

      <Card className="flex items-center justify-between border-gold-400/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <div>
          <p className="text-sm text-taupe-500">当前积分 · Your points</p>
          <p className="font-serif text-4xl font-bold text-sage-700">
            {customer.points_balance} <span className="text-base font-medium">pts</span>
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 17l-5.6 3 1.6-6.3-5-4.2 6.5-.5L12 3Z" /></svg>
        </span>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">可兑换奖励 · Redeemable rewards</h2>
        {catalogue.length === 0 && <div className="mt-4"><EmptyState>暂无可兑换奖励</EmptyState></div>}
        <ul className="mt-4 space-y-3">
          {catalogue.map((r) => {
            const enough = customer.points_balance >= r.points_required;
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-taupe-200/60 bg-cream-100 px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{r.name_cn}</p>
                  <p className="text-sm text-taupe-500">{r.name_en}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-lg font-semibold text-sage-700">{r.points_required} pts</span>
                  <RedeemButton rewardId={r.id} disabled={!enough} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-taupe-500">
          积分可用于兑换指定体验优惠，最终兑换规则以店内确认为准。积分不可提现，不等同现金。
          Points can be used to redeem selected experience rewards. Final redemption terms are subject to store confirmation. Points are not cash and cannot be withdrawn.
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">已兑换记录 · Redemption history</h2>
        {redemptions.length === 0 && <div className="mt-4"><EmptyState>暂无兑换记录</EmptyState></div>}
        <ul className="mt-4 divide-y divide-taupe-200/60">
          {redemptions.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-taupe-700">{fmtDate(r.created_at)} · −{r.points_used} pts</span>
              <Badge status={r.status}>{REDEMPTION_STATUS_LABEL[r.status] ?? r.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
