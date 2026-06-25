import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import { Card, Stat, Badge, EmptyState } from "@/components/membership/ui";
import CopyButton from "@/components/member/CopyButton";
import BookForm from "@/components/membership/BookForm";
import MemberBookingsPanel from "@/components/membership/MemberBookingsPanel";
import { getSiteUrl } from "@/lib/site-url";
import {
  LEDGER_LABEL,
  REWARD_STATUS_LABEL,
  BOOKING_STATUS_LABEL,
  fmtDate,
  pkgLabel,
  pkgPrice,
} from "@/lib/membership-format";

export const dynamic = "force-dynamic";

const WA = "https://wa.me/60124761919";

const EXPERIENCE_POINTS: Record<string, number> = {
  scent_test: 20,
  custom_blend: 60,
};

const ICONS = {
  points: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 16.8 7.1 18.8l1.3-5.6L4 9.4l5.8-.5L12 3Z" /></svg>
  ),
  referral: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" /></svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16v3H4zM5 12h14v8H5zM12 9v11" /><path d="M12 9C9 9 8 5 10 4c1.5-.8 2 2 2 5 0-3 .5-5.8 2-5 2 1 1 5-2 5Z" /></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 17l-5.6 3 1.6-6.3-5-4.2 6.5-.5L12 3Z" /></svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Z" /></svg>
  ),
};

export default async function MemberHome() {
  const customer = await requireMember();
  const supabase = createServerSupabase();

  const [referralsRes, rewardsRes, ledgerRes, bookingsRes, completedBookingsRes, bookingCountRes] = await Promise.all([
    supabase.from("referrals").select("*").eq("referrer_customer_id", customer.id),
    supabase.from("referral_rewards").select("*").eq("referrer_customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("points_ledger").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(12),
    supabase.from("bookings").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("bookings").select("*").eq("customer_id", customer.id).eq("status", "completed").order("created_at", { ascending: false }).limit(8),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("customer_id", customer.id),
  ]);

  const referrals = referralsRes.data ?? [];
  const rewards = rewardsRes.data ?? [];
  const ledger = ledgerRes.data ?? [];
  const bookings = bookingsRes.data ?? [];
  const completedBookings = completedBookingsRes.data ?? [];

  const completedReferrals = referrals.filter((r) => r.status !== "registered").length;
  const tngPinCount = rewards.filter((r) => r.status === "issued").length;
  const bookingCount = bookingCountRes.count ?? bookings.length;

  const referralLink = `${SITE_URL}/?ref=${customer.referral_code}`;
  const siteUrl = getSiteUrl();

  const quickLinks = [
    { href: "/book", label: "预约体验", sub: "Book", icon: ICONS.calendar, external: false },
    { href: "/member/referral", label: "推荐奖励", sub: "Referral", icon: ICONS.gift, external: false },
    { href: "/member/rewards", label: "积分兑换", sub: "Rewards", icon: ICONS.star, external: false },
    { href: WA, label: "WhatsApp 咨询", sub: "Chat", icon: ICONS.whatsapp, external: true },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink">
          欢迎回来，{customer.name || "会员"}
        </h1>
        <p className="mt-2 text-sm text-taupe-600">Welcome back, {customer.name || "member"}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((q) => {
          const inner = (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60 transition-colors group-hover:bg-sage-700 group-hover:text-cream-50">
                {q.icon}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-ink">{q.label}</span>
                <span className="block text-xs text-taupe-500">{q.sub}</span>
              </span>
            </>
          );
          const cls = "group flex items-center gap-3 rounded-2xl border border-taupe-200/60 bg-cream-50 px-4 py-3.5 shadow-sm transition-colors hover:border-sage-400";
          return q.external ? (
            <a key={q.href} href={q.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
          ) : (
            <Link key={q.href} href={q.href} className={cls}>{inner}</Link>
          );
        })}
      </div>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">预约香气体验 · Book a Scent Experience</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          选择日期、时间与项目后，系统会检查该时段是否可预约。预约不会自动加积分，完成体验后才会由后台或完成打卡触发积分。
        </p>
        <div className="mt-5">
          <BookForm defaultPhone={customer.phone ?? ""} />
        </div>
      </Card>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="当前积分 · Points" value={customer.points_balance} icon={ICONS.points} />
        <Stat label="已成功推荐 · Referred" value={completedReferrals} icon={ICONS.referral} />
        <Stat label="已获得 TNG PIN" value={tngPinCount} icon={ICONS.gift} />
        <Stat label="我的预约次数 · Bookings" value={bookingCount} icon={ICONS.calendar} />
      </div>

      {/* Referral code */}
      <Card className="border-gold-400/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <h2 className="font-serif text-xl font-semibold text-ink">我的推荐码 · Your referral code</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="rounded-xl border border-gold-400/50 bg-gold-300/15 px-5 py-3 font-serif text-2xl font-bold tracking-[0.15em] text-sage-800">
            {customer.referral_code}
          </span>
          <CopyButton text={referralLink} label="复制推荐链接" copiedLabel="已复制！" toast="已复制推荐链接" />
        </div>
        <p className="mt-3 break-all text-xs text-taupe-500">{referralLink}</p>
        <div className="mt-4 rounded-xl bg-cream-100 p-4 text-sm leading-relaxed text-taupe-600">
          <p>
            分享你的专属推荐码给朋友。朋友使用你的推荐码并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TNG PIN 与会员积分奖励。
          </p>
          <p className="mt-2 text-taupe-500">
            Share your personal referral code with a friend. When they complete their first RM60 or RM150 experience, you will receive an RM10 TNG PIN plus member points.
          </p>
        </div>
        <Link href="/member/referral" className="mt-4 inline-block text-sm font-medium text-sage-700 hover:underline">
          前往推荐中心 · Go to referral center →
        </Link>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Points ledger */}
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">积分记录 · Points history</h2>
          {ledger.length === 0 ? (
            <div className="mt-4"><EmptyState>暂无积分记录</EmptyState></div>
          ) : (
            <ul className="mt-4 divide-y divide-taupe-200/60">
              {ledger.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm text-taupe-700">{LEDGER_LABEL[e.type] ?? e.type}</span>
                  <span className={`text-sm font-semibold ${e.points >= 0 ? "text-sage-700" : "text-taupe-500"}`}>
                    {e.points >= 0 ? "+" : ""}{e.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* TNG PIN rewards */}
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">TNG PIN 奖励记录</h2>
          {rewards.length === 0 ? (
            <div className="mt-4"><EmptyState>暂无推荐奖励，推荐朋友即可获得。</EmptyState></div>
          ) : (
            <ul className="mt-4 divide-y divide-taupe-200/60">
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
          )}
        </Card>
      </div>

      {/* Completed scent experiences */}
      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">我的香气体验记录 · My Scent Experience Records</h2>
        {completedBookings.length === 0 ? (
          <div className="mt-4"><EmptyState>你还没有完成任何香气体验。 · You have not completed any scent experiences yet.</EmptyState></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-taupe-400">
                <tr className="border-b border-taupe-200/60">
                  <th className="py-2 pr-4">日期 · Date</th>
                  <th className="py-2 pr-4">项目 · Package</th>
                  <th className="py-2 pr-4">获得积分 · Points</th>
                  <th className="py-2">状态 · Status</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((b) => (
                  <tr key={b.id} className="border-b border-taupe-200/40">
                    <td className="py-3 pr-4 text-taupe-600">{fmtDate(b.completed_at ?? b.booking_date ?? b.created_at)}</td>
                    <td className="py-3 pr-4 font-semibold text-sage-700">{pkgLabel(b.package_type)}</td>
                    <td className="py-3 pr-4 font-semibold text-sage-700">+{EXPERIENCE_POINTS[b.package_type] ?? 0} points</td>
                    <td className="py-3"><Badge status={b.status}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bookings */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl font-semibold text-ink">我的预约 · My Bookings</h2>
          <Link href="/book" className="text-sm font-medium text-sage-700 hover:underline">+ 新预约</Link>
        </div>
        <MemberBookingsPanel bookings={bookings} customer={customer} siteUrl={siteUrl} />
      </Card>
    </div>
  );
}
