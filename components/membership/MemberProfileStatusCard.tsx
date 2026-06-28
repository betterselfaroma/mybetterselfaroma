import Link from "next/link";
import type { Customer } from "@/lib/supabase/types";

type Tier = {
  name: string;
  en: string;
  min: number;
  next?: number;
  note: string;
};

const TIERS: Tier[] = [
  { name: "新香会员", en: "New Member", min: 0, next: 100, note: "完成资料、预约体验，开始累积香气地图。" },
  { name: "香气探索者", en: "Scent Explorer", min: 100, next: 300, note: "你已经开始建立自己的香气体验记录。" },
  { name: "香气收藏家", en: "Scent Keeper", min: 300, note: "你拥有稳定的会员积分与香气体验轨迹。" },
];

function getTier(points: number) {
  return [...TIERS].reverse().find((tier) => points >= tier.min) ?? TIERS[0];
}

function nextTierProgress(points: number, tier: Tier) {
  if (!tier.next) return 100;
  const span = tier.next - tier.min;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((points - tier.min) / span) * 100)));
}

function ChecklistItem({
  label,
  done,
  href,
}: {
  label: string;
  done: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
        done
          ? "border-sage-200 bg-sage-50 text-sage-800"
          : "border-gold-300/60 bg-gold-300/15 text-taupe-700"
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${done ? "bg-sage-700 text-cream-50" : "bg-cream-50 text-gold-700"}`}>
        {done ? "完成" : "待补齐"}
      </span>
    </Link>
  );
}

export default function MemberProfileStatusCard({
  customer,
  memberQrReady,
  bookingCount,
  referralCount,
  tngPinCount,
}: {
  customer: Customer;
  memberQrReady: boolean;
  bookingCount: number;
  referralCount: number;
  tngPinCount: number;
}) {
  const points = Number(customer.points_balance ?? customer.points ?? 0);
  const tier = getTier(points);
  const progress = nextTierProgress(points, tier);
  const remaining = tier.next ? Math.max(tier.next - points, 0) : 0;
  const checks = [
    { label: "姓名", done: Boolean(customer.name?.trim()), href: "#member-profile" },
    { label: "WhatsApp", done: Boolean(customer.phone?.trim()), href: "#member-profile" },
    { label: "会员 QR", done: memberQrReady, href: "#member-qr" },
    { label: "推荐码", done: Boolean(customer.referral_code?.trim()), href: "/member/referral" },
    { label: "预约记录", done: bookingCount > 0, href: "/member/bookings" },
  ];
  const doneCount = checks.filter((item) => item.done).length;
  const completeness = Math.round((doneCount / checks.length) * 100);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-[1.5rem] border border-sage-700/15 bg-cream-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Member Status</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{tier.name}</h2>
            <p className="mt-1 text-sm text-taupe-500">{tier.en}</p>
          </div>
          <div className="rounded-2xl bg-sage-900 px-4 py-3 text-right text-cream-50">
            <p className="text-[11px] uppercase tracking-[0.16em] text-cream-100/60">Points</p>
            <p className="font-serif text-3xl font-semibold text-gold-100">{points}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-taupe-600">{tier.note}</p>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-taupe-500">
            <span>{tier.next ? `距离下一阶段还差 ${remaining} pts` : "已达到当前最高展示阶段"}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream-200">
            <div className="h-full rounded-full bg-gradient-to-r from-sage-700 to-gold-400" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs leading-5 text-taupe-500">
            此会员阶段只用于前端展示，不改变积分、兑换或推荐奖励规则。
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-cream-100 px-3 py-3">
            <p className="text-[11px] text-taupe-500">推荐成功</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-sage-700">{referralCount}</p>
          </div>
          <div className="rounded-2xl bg-cream-100 px-3 py-3">
            <p className="text-[11px] text-taupe-500">TNG PIN</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-sage-700">{tngPinCount}</p>
          </div>
          <div className="rounded-2xl bg-cream-100 px-3 py-3">
            <p className="text-[11px] text-taupe-500">预约记录</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-sage-700">{bookingCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-taupe-200/70 bg-cream-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Profile Ready</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">资料完整度 {completeness}%</h2>
          </div>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">
            {doneCount}/{checks.length}
          </span>
        </div>
        <div className="mt-5 grid gap-2">
          {checks.map((item) => (
            <ChecklistItem key={item.label} label={item.label} done={item.done} href={item.href} />
          ))}
        </div>
      </div>
    </section>
  );
}
