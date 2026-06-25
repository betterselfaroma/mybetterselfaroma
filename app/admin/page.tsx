import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { BOOKING_STATUS_LABEL, pkgLabel } from "@/lib/membership-format";
import { formatSingaporeTimeRange, singaporeDateTimeToUtc, todayInSingapore } from "@/lib/booking-config";
import { Stat, Card, PageTitle, EmptyState, Badge } from "@/components/membership/ui";
import CompletionQrCode from "@/components/membership/CompletionQrCode";
import CopyButton from "@/components/member/CopyButton";
import { createBookingCompletionToken } from "./actions";

export const dynamic = "force-dynamic";

type AdminHomeProps = {
  searchParams?: { qr?: string; qr_error?: string };
};

function fmtDateTime(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}

function qrStatus(token: { status: string; expires_at: string | null }) {
  if (token.status === "active" && token.expires_at && new Date(token.expires_at).getTime() <= Date.now()) {
    return "expired";
  }
  return token.status;
}

export default async function AdminHome({ searchParams }: AdminHomeProps) {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const selectedQrId = typeof searchParams?.qr === "string" ? searchParams.qr : "";
  const todayDate = todayInSingapore();
  const todayStart = singaporeDateTimeToUtc(todayDate, "00:00");
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [
    customersCount,
    pendingBookings,
    completedBookings,
    pendingRewards,
    pendingRedemptions,
    newThisMonth,
    customerListRes,
    recentTokensRes,
    selectedTokenRes,
    todayBookingsRes,
  ] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("referral_rewards").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("customers").select("id,name,email,phone").order("name"),
    supabase.from("booking_completion_tokens").select("*").order("created_at", { ascending: false }).limit(12),
    selectedQrId
      ? supabase.from("booking_completion_tokens").select("*").eq("id", selectedQrId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("bookings")
      .select("*")
      .gte("start_time", todayStart.toISOString())
      .lt("start_time", todayEnd.toISOString())
      .order("start_time", { ascending: true })
      .limit(8),
  ]);

  const customerList = customerListRes.data ?? [];
  const customerMap = new Map(customerList.map((c) => [c.id, c]));
  const recentTokens = recentTokensRes.data ?? [];
  const selectedToken = selectedTokenRes.data;
  const selectedCustomer = selectedToken ? customerMap.get(selectedToken.customer_id) : null;
  const completionUrl = selectedToken ? getSiteUrl() + "/complete-booking?token=" + selectedToken.token : "";
  const todayBookings = todayBookingsRes.data ?? [];

  const stats = [
    { label: "总顾客数 · Customers", value: customersCount.count ?? 0 },
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">今日预约 · Today’s Bookings</h2>
          <Link href={"/admin/bookings?date=" + todayDate} className="text-sm font-medium text-sage-700 hover:underline">管理预约 · Manage</Link>
        </div>
        {todayBookings.length === 0 ? (
          <div className="mt-4"><EmptyState>今日暂无预约</EmptyState></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-taupe-400">
                <tr className="border-b border-taupe-200/60">
                  <th className="py-2 pr-4">时间 · Time</th>
                  <th className="py-2 pr-4">顾客 · Customer</th>
                  <th className="py-2 pr-4">项目 · Package</th>
                  <th className="py-2">状态 · Status</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-taupe-200/40">
                    <td className="py-3 pr-4 text-taupe-600">{formatSingaporeTimeRange(booking.start_time, booking.end_time)}</td>
                    <td className="py-3 pr-4 text-ink">{booking.customer_name || booking.customer_email || "Guest"}</td>
                    <td className="py-3 pr-4 font-semibold text-sage-700">{pkgLabel(booking.package_type)}</td>
                    <td className="py-3"><Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">生成会员完成打卡 QR · Generate Booking Completion QR</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          只为已完成线下体验的会员生成一次性 QR。会员扫码并确认后，系统会创建 completed booking，并沿用现有积分与推荐奖励规则。
        </p>
        {searchParams?.qr_error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            QR 生成失败，请检查会员与项目后重试。 · QR creation failed. Please try again.
          </div>
        )}
        <form action={createBookingCompletionToken} className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr_0.7fr_auto] lg:items-end">
          <label className="block text-sm font-medium text-taupe-700">
            会员 · Member
            <select name="customer_id" required className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500">
              <option value="">选择会员 · Select member</option>
              {customerList.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {(customer.name || "Member") + " · " + customer.email + (customer.phone ? " · " + customer.phone : "")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-taupe-700">
            项目 · Package
            <select name="package_type" required defaultValue="scent_test" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500">
              <option value="scent_test">RM60 摸香状态测试体验</option>
              <option value="custom_blend">RM150 专属特调精油方案</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-taupe-700">
            有效小时 · Hours
            <input name="expires_hours" type="number" min="1" max="72" defaultValue="24" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500" />
          </label>
          <button className="rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50 shadow-soft hover:bg-sage-800">
            生成 QR Code
          </button>
        </form>

        {selectedToken && (
          <div className="mt-7 grid gap-6 rounded-2xl border border-gold-300/40 bg-cream-100 p-5 lg:grid-cols-[auto_1fr]">
            <CompletionQrCode value={completionUrl} />
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-semibold text-ink">会员完成打卡 QR · Booking Completion QR</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-taupe-500">会员 · Member</dt>
                  <dd className="font-semibold text-ink">{selectedCustomer?.name || selectedCustomer?.email || selectedToken.customer_id}</dd>
                </div>
                <div>
                  <dt className="text-taupe-500">项目 · Package</dt>
                  <dd className="font-semibold text-sage-700">{pkgLabel(selectedToken.package_type)}</dd>
                </div>
                <div>
                  <dt className="text-taupe-500">过期 · Expires</dt>
                  <dd>{fmtDateTime(selectedToken.expires_at)}</dd>
                </div>
                <div>
                  <dt className="text-taupe-500">状态 · Status</dt>
                  <dd><Badge status={qrStatus(selectedToken)}>{qrStatus(selectedToken)}</Badge></dd>
                </div>
              </dl>
              <p className="mt-4 break-all rounded-xl bg-cream-50 px-4 py-3 font-mono text-xs text-taupe-600">{completionUrl}</p>
              <CopyButton text={completionUrl} label="复制链接" copiedLabel="已复制" toast="QR 链接已复制" className="mt-4" />
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">最近生成的完成 QR · Recent Completion QR</h2>
        {recentTokens.length === 0 ? (
          <div className="mt-4"><EmptyState>暂无完成 QR 记录</EmptyState></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-taupe-400">
                <tr className="border-b border-taupe-200/60">
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Package</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Used at</th>
                  <th className="py-2 pr-4">Expires</th>
                  <th className="py-2">QR</th>
                </tr>
              </thead>
              <tbody>
                {recentTokens.map((token) => {
                  const customer = customerMap.get(token.customer_id);
                  return (
                    <tr key={token.id} className="border-b border-taupe-200/40 align-top">
                      <td className="py-3 pr-4 text-taupe-500">{fmtDateTime(token.created_at)}</td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-ink">{customer?.name || "-"}</div>
                        <div className="text-xs text-taupe-500">{customer?.email}</div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-sage-700">{pkgLabel(token.package_type)}</td>
                      <td className="py-3 pr-4"><Badge status={qrStatus(token)}>{qrStatus(token)}</Badge></td>
                      <td className="py-3 pr-4 text-taupe-500">{fmtDateTime(token.used_at)}</td>
                      <td className="py-3 pr-4 text-taupe-500">{fmtDateTime(token.expires_at)}</td>
                      <td className="py-3"><Link href={"/admin?qr=" + token.id} className="text-sm font-medium text-sage-700 hover:underline">查看 · View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">快速进入 · Manage</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-taupe-200/60 bg-cream-100 px-5 py-4 text-sm font-medium text-taupe-700 transition-colors hover:border-sage-400 hover:text-sage-700"
            >
              {l.label} -&gt;
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
