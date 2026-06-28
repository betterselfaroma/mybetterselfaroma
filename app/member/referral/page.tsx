import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import { Card, Badge, PageTitle, Stat } from "@/components/membership/ui";
import CopyButton from "@/components/member/CopyButton";
import { REWARD_STATUS_LABEL, fmtDate } from "@/lib/membership-format";

export const dynamic = "force-dynamic";

const REFERRAL_STATUS_LABEL: Record<string, string> = {
  registered: "已注册 · Registered",
  completed_rm49: "完成 RM60 · Completed RM60",
  completed_rm129: "完成 RM150 · Completed RM150",
  rewarded: "已奖励 · Rewarded",
};

export default async function ReferralCenter() {
  const customer = await requireMember();
  const supabase = await createServerSupabase();

  const [referralsRes, rewardsRes] = await Promise.all([
    supabase.from("referrals").select("*").eq("referrer_customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("referral_rewards").select("*").eq("referrer_customer_id", customer.id).order("created_at", { ascending: false }),
  ]);
  const referrals = referralsRes.data ?? [];
  const rewards = rewardsRes.data ?? [];
  const rewardByReferred = new Map(rewards.map((r) => [r.referred_customer_id, r]));
  const pendingRewards = rewards.filter((reward) => ["pending", "approved"].includes(reward.status)).length;
  const issuedRewards = rewards.filter((reward) => reward.status === "issued").length;
  const completedReferrals = referrals.filter((referral) => referral.status !== "registered").length;

  const referralLink = `${SITE_URL}/?ref=${customer.referral_code}`;

  return (
    <div className="space-y-8">
      <PageTitle
        title="推荐中心"
        subtitle="Referral Center · 分享推荐码，朋友完成首次体验后即可获得 RM10 TnG PIN 与积分。"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="推荐人数 · Referrals" value={referrals.length} />
        <Stat label="完成体验 · Completed" value={completedReferrals} />
        <Stat label="待发奖励 · Pending" value={pendingRewards} />
        <Stat label="已发 TnG · Issued" value={issuedRewards} />
      </div>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">我的推荐码 · My code</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="rounded-xl border border-gold-400/50 bg-gold-300/15 px-5 py-3 font-serif text-2xl font-bold tracking-[0.15em] text-sage-800">
            {customer.referral_code}
          </span>
          <CopyButton text={referralLink} label="复制推荐链接" copiedLabel="已复制！" toast="已复制推荐链接" />
        </div>
        <p className="mt-3 break-all text-xs text-taupe-500">{referralLink}</p>

        <div className="mt-5 rounded-xl bg-cream-100 p-4 text-sm leading-relaxed text-taupe-600">
          <p className="font-medium text-ink">分享说明 · How it works</p>
          <p className="mt-1">
            分享你的专属推荐码给朋友。朋友使用你的推荐码并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TnG PIN 与会员积分奖励。
          </p>
          <p className="mt-2 text-taupe-500">
            Share your personal referral code with a friend. When they complete their first RM60 or RM150 experience, you will receive an RM10 TnG PIN plus member points.
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">推荐规则 · Rules</h2>
        <p className="mt-3 text-sm leading-relaxed text-taupe-600">
          推荐朋友完成首次 RM60 或 RM150 体验后，你将获得 RM10 TnG PIN 与会员积分奖励。奖励将在后台确认朋友完成体验后发放。不可自我推荐，积分不可提现。
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">推荐记录与奖励状态 · Referrals</h2>
        {referrals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-taupe-200 bg-cream-100/70 px-5 py-8 text-center text-sm text-taupe-500 md:hidden">
            暂无推荐记录，分享推荐码开始吧。
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:hidden">
            {referrals.map((r, i) => {
              const reward = rewardByReferred.get(r.referred_customer_id);
              return (
                <article key={r.id} className="rounded-2xl border border-taupe-200/70 bg-cream-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">朋友 #{referrals.length - i}</p>
                      <p className="mt-1 text-sm text-taupe-600">{fmtDate(r.created_at)}</p>
                    </div>
                    <Badge status={r.status === "registered" ? "pending" : "completed"}>
                      {REFERRAL_STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2 text-sm">
                    <span className="text-taupe-500">TnG PIN 奖励</span>
                    {reward ? (
                      <Badge status={reward.status}>{REWARD_STATUS_LABEL[reward.status] ?? reward.status}</Badge>
                    ) : (
                      <span className="text-taupe-400">等待完成体验</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-taupe-400">
              <tr className="border-b border-taupe-200/60">
                <th className="py-2 pr-4">朋友 · Friend</th>
                <th className="py-2 pr-4">注册日期 · Joined</th>
                <th className="py-2 pr-4">推荐状态 · Status</th>
                <th className="py-2">TnG PIN 奖励</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-taupe-500">暂无推荐记录，分享推荐码开始吧。</td></tr>
              )}
              {referrals.map((r, i) => {
                const reward = rewardByReferred.get(r.referred_customer_id);
                return (
                  <tr key={r.id} className="border-b border-taupe-200/40">
                    <td className="py-3 pr-4 text-taupe-700">朋友 #{referrals.length - i}</td>
                    <td className="py-3 pr-4 text-taupe-600">{fmtDate(r.created_at)}</td>
                    <td className="py-3 pr-4">
                      <Badge status={r.status === "registered" ? "pending" : "completed"}>
                        {REFERRAL_STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {reward ? (
                        <Badge status={reward.status}>{REWARD_STATUS_LABEL[reward.status] ?? reward.status}</Badge>
                      ) : (
                        <span className="text-taupe-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
