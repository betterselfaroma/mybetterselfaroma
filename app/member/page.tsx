import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import MemberBookingShortcut from "@/components/membership/MemberBookingShortcut";
import MemberQrCard from "@/components/membership/MemberQrCard";
import MemberAppHero from "@/components/membership/MemberAppHero";
import MemberProfileStatusCard from "@/components/membership/MemberProfileStatusCard";
import ProfileForm from "@/components/membership/ProfileForm";
import MemberTaskList from "@/components/membership/MemberTaskList";
import MemberRecentActivity from "@/components/membership/MemberRecentActivity";
import MemberReferralCard from "@/components/membership/MemberReferralCard";
import { Card } from "@/components/membership/ui";
import { buildMemberQrUrl, ensureCustomerQrToken } from "@/lib/member-qr";
import { getSiteUrl } from "@/lib/site-url";
import { BOOKING_STABLE_SELECT } from "@/lib/admin-mobile";

export const dynamic = "force-dynamic";

const WA = "https://wa.me/60124761919";

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
  const supabase = await createServerSupabase();

  const [referralsRes, rewardsRes, ledgerRes, bookingsRes, completedBookingsRes, bookingCountRes, memberQrToken] = await Promise.all([
    supabase.from("referrals").select("*").eq("referrer_customer_id", customer.id),
    supabase.from("referral_rewards").select("*").eq("referrer_customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("points_ledger").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(12),
    supabase.from("bookings").select(BOOKING_STABLE_SELECT).eq("user_id", customer.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("bookings").select(BOOKING_STABLE_SELECT).eq("user_id", customer.id).eq("status", "completed").order("created_at", { ascending: false }).limit(8),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", customer.id),
    ensureCustomerQrToken(customer.id, customer.qr_token).catch((error) => {
      console.error("Ensure member QR token failed:", error);
      return "";
    }),
  ]);

  const dataErrorSources = [
    ["推荐记录", referralsRes.error],
    ["推荐奖励", rewardsRes.error],
    ["积分记录", ledgerRes.error],
    ["预约记录", bookingsRes.error],
    ["完成体验", completedBookingsRes.error],
    ["预约数量", bookingCountRes.error],
  ] as const;

  dataErrorSources.forEach(([label, error]) => {
    if (error) console.error(`Load member center ${label} failed:`, error);
  });
  const dataErrors = dataErrorSources.flatMap(([label, error]) => error ? [[String(label), error.message] as const] : []);

  const referrals = referralsRes.data ?? [];
  const rewards = rewardsRes.data ?? [];
  const ledger = ledgerRes.data ?? [];
  const bookings = bookingsRes.data ?? [];
  const completedBookings = completedBookingsRes.data ?? [];

  const completedReferrals = referrals.filter((r) => r.status !== "registered").length;
  const tngPinCount = rewards.filter((r) => r.status === "issued").length;
  const bookingCount = bookingCountRes.count ?? bookings.length;

  const siteUrl = getSiteUrl();
  const referralLink = `${SITE_URL || siteUrl}/?ref=${customer.referral_code}`;
  const memberQrUrl = memberQrToken ? buildMemberQrUrl(siteUrl, memberQrToken) : null;

  const quickLinks = [
    { href: "/book", label: "预约体验", sub: "Book", icon: ICONS.calendar, external: false },
    { href: "/member/points", label: "积分明细", sub: "Points", icon: ICONS.points, external: false },
    { href: "/member/referral", label: "推荐奖励", sub: "Referral", icon: ICONS.gift, external: false },
    { href: "/member/rewards", label: "积分兑换", sub: "Rewards", icon: ICONS.star, external: false },
    { href: WA, label: "WhatsApp 咨询", sub: "Chat", icon: ICONS.whatsapp, external: true },
  ];

  return (
    <div className="space-y-8">
      <MemberAppHero
        name={customer.name}
        points={customer.points_balance}
        referralCode={customer.referral_code}
        referralCount={completedReferrals}
        bookingCount={bookingCount}
        qrReady={Boolean(memberQrToken)}
      />

      {dataErrors.length > 0 && (
        <Card className="border-gold-300/60 bg-gold-300/15">
          <p className="text-sm font-semibold text-ink">部分会员资料暂时无法载入</p>
          <div className="mt-2 space-y-1 text-sm leading-6 text-taupe-700">
            {dataErrors.map(([label, error]) => (
              <p key={label}>{label}：{error}</p>
            ))}
          </div>
        </Card>
      )}

      {/* Welcome */}
      <div className="sr-only">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          欢迎回来，{customer.name || "会员"}
        </h1>
        <p className="mt-2 text-sm text-taupe-600">Welcome back, {customer.name || "member"}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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

      <MemberTaskList customer={customer} bookings={bookings} memberQrReady={Boolean(memberQrToken)} />

      <MemberBookingShortcut bookings={bookings} />

      <MemberRecentActivity
        ledger={ledger}
        rewards={rewards}
        completedBookings={completedBookings}
        bookings={bookings}
      />

      <MemberProfileStatusCard
        customer={customer}
        memberQrReady={Boolean(memberQrToken)}
        bookingCount={bookingCount}
        referralCount={completedReferrals}
        tngPinCount={tngPinCount}
      />

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <MemberQrCard value={memberQrUrl} token={memberQrToken} />
        <ProfileForm name={customer.name} phone={customer.phone} email={customer.email} />
      </section>

      <MemberReferralCard referralCode={customer.referral_code} referralLink={referralLink} />
    </div>
  );
}
