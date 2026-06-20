import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import { Card, Stat, Badge, PageTitle } from "@/components/membership/ui";
import CopyButton from "@/components/member/CopyButton";
import {
  LEDGER_LABEL,
  REWARD_STATUS_LABEL,
  BOOKING_STATUS_LABEL,
  fmtDate,
} from "@/lib/membership-format";

export const dynamic = "force-dynamic";

export default async function MemberHome() {
  const customer = await requireMember();
  const supabase = createServerSupabase();

  const [referralsRes, rewardsRes, ledgerRes, bookingsRes] = await Promise.all([
    supabase.from("referrals").select("*").eq("referrer_customer_id", customer.id),
    supabase.from("referral_rewards").select("*").eq("referrer_customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("points_ledger").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(12),
    supabase.from("bookings").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(8),
  ]);

  const referrals = referralsRes.data ?? [];
  const rewards = rewardsRes.data ?? [];
  const ledger = ledgerRes.data ?? [];
  const bookings = bookingsRes.data ?? [];

  const referredCount = referrals.length;
  const completedCount = referrals.filter((r) => r.status !== "registered").length;
  const tngPinCount = rewards.filter((r) => r.status === "issued").length;

  const referralLink = `${SITE_URL}/?ref=${customer.referral_code}`;

  return (
    <div className="space-y-8">
      <PageTitle
        title="我的香气会员中心"
        subtitle={`My Aroma Member Portal · 你好，${customer.name || "会员"}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="当前积分 · Points" value={customer.points_balance} />
        <Stat label="已推荐人数 · Referred" value={referredCount} />
        <Stat label="已完成体验 · Completed" value={completedCount} />
        <Stat label="已获得 TNG PIN" value={tngPinCount} />
      </div>

      {/* Referral code */}
      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">专属推荐码 · Your referral code</h2>
        <p className="mt-1 text-sm leading-relaxed text-taupe-600">
          这是你的专属推荐码。分享给朋友，当朋友完成首次体验后，你将获得 RM10 TNG PIN 与会员积分奖励。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="rounded-xl border border-gold-400/50 bg-gold-300/15 px-5 py-3 font-serif text-2xl font-bold tracking-[0.15em] text-sage-800">
            {customer.referral_code}
          </span>
          <CopyButton text={referralLink} label="复制推荐链接" copiedLabel="已复制！" />
        </div>
        <p className="mt-3 break-all text-xs text-taupe-500">{referralLink}</p>
        <Link href="/member/referral" className="mt-4 inline-block text-sm font-medium text-sage-700 hover:underline">
          前往推荐中心 →
        </Link>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Points ledger */}
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">积分记录 · Points history</h2>
          <ul className="mt-4 divide-y divide-taupe-200/60">
            {ledger.length === 0 && <li className="py-3 text-sm text-taupe-500">暂无记录</li>}
            {ledger.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-taupe-700">{LEDGER_LABEL[e.type] ?? e.type}</span>
                <span className={`text-sm font-semibold ${e.points >= 0 ? "text-sage-700" : "text-taupe-500"}`}>
                  {e.points >= 0 ? "+" : ""}{e.points}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* TNG PIN rewards */}
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">TNG PIN 奖励记录</h2>
          <ul className="mt-4 divide-y divide-taupe-200/60">
            {rewards.length === 0 && <li className="py-3 text-sm text-taupe-500">暂无奖励，推荐朋友即可获得。</li>}
            {rewards.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-taupe-700">
                  {r.reward_value} TNG PIN
                  {r.status === "issued" && r.tng_pin_code && (
                    <span className="ml-2 font-mono text-xs text-sage-700">{r.tng_pin_code}</span>
                  )}
                </span>
                <Badge status={r.status}>{REWARD_STATUS_LABEL[r.status] ?? r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Bookings */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">我的预约记录 · My bookings</h2>
          <Link href="/book" className="text-sm font-medium text-sage-700 hover:underline">+ 新预约</Link>
        </div>
        <ul className="mt-4 divide-y divide-taupe-200/60">
          {bookings.length === 0 && <li className="py-3 text-sm text-taupe-500">暂无预约</li>}
          {bookings.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-taupe-700">
                <span className="font-semibold text-sage-700">{b.package_type}</span> · {fmtDate(b.created_at)}
              </span>
              <Badge status={b.status}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
