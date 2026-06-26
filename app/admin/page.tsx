import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge, Card, EmptyState, PageTitle } from "@/components/membership/ui";
import { BOOKING_STATUS_LABEL, pkgLabel } from "@/lib/membership-format";
import { bookingDateLabel, bookingTimeLabel, todayDateInSingapore } from "@/lib/admin-mobile";
import { singaporeDateTimeToUtc } from "@/lib/booking-config";
import { getSiteUrl } from "@/lib/site-url";
import CompletionQrCode from "@/components/membership/CompletionQrCode";
import CopyButton from "@/components/member/CopyButton";
import { createBookingCompletionToken } from "./actions";
import type { Booking } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { qr?: string; qr_error?: string };
};

type DashboardData = {
  error: string | null;
  todayBookingsCount: number;
  openBookingsCount: number;
  todayMembersCount: number;
  totalMembersCount: number;
  todayPointsIssued: number;
  todayBookings: Booking[];
};

async function loadDashboardData(): Promise<DashboardData> {
  const supabase = createAdminClient();
  const today = todayDateInSingapore();
  const dayStart = singaporeDateTimeToUtc(today, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  try {
    const [
      todayBookings,
      openBookings,
      todayMembers,
      totalMembers,
      todayTransactions,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("*", { count: "exact" })
        .gte("start_time", dayStart.toISOString())
        .lt("start_time", dayEnd.toISOString())
        .order("start_time", { ascending: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "booked", "confirmed"]),
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString())
        .lt("created_at", dayEnd.toISOString()),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase
        .from("points_transactions")
        .select("points")
        .gte("created_at", dayStart.toISOString())
        .lt("created_at", dayEnd.toISOString()),
    ]);

    for (const result of [todayBookings, openBookings, todayMembers, totalMembers, todayTransactions]) {
      if (result.error) throw new Error(result.error.message);
    }

    const issued = (todayTransactions.data ?? [])
      .filter((entry) => Number(entry.points) > 0)
      .reduce((total, entry) => total + Number(entry.points), 0);

    return {
      error: null,
      todayBookingsCount: todayBookings.count ?? todayBookings.data?.length ?? 0,
      openBookingsCount: openBookings.count ?? 0,
      todayMembersCount: todayMembers.count ?? 0,
      totalMembersCount: totalMembers.count ?? 0,
      todayPointsIssued: issued,
      todayBookings: (todayBookings.data ?? []) as Booking[],
    };
  } catch (error) {
    console.error("Load admin dashboard failed:", error);
    return {
      error: error instanceof Error ? error.message : "Dashboard could not be loaded.",
      todayBookingsCount: 0,
      openBookingsCount: 0,
      todayMembersCount: 0,
      totalMembersCount: 0,
      todayPointsIssued: 0,
      todayBookings: [],
    };
  }
}

const quickActions = [
  { href: "/admin/scan", label: "扫会员 QR", sub: "Scan member" },
  { href: "/admin/bookings", label: "查看今日预约", sub: "Today bookings" },
  { href: "/admin/bookings?new=1", label: "新增预约", sub: "Add booking" },
  { href: "/admin/members", label: "搜索会员", sub: "Find member" },
];

export default async function AdminDashboard({ searchParams }: PageProps) {
  const data = await loadDashboardData();
  const selectedQrId = typeof searchParams?.qr === "string" ? searchParams.qr : "";
  const supabase = createAdminClient();
  const [customersRes, selectedTokenRes] = await Promise.all([
    supabase.from("customers").select("id,name,email,phone").order("name"),
    selectedQrId
      ? supabase.from("booking_completion_tokens").select("*").eq("id", selectedQrId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (customersRes.error) console.error("Load QR customers failed:", customersRes.error);
  if (selectedTokenRes.error) console.error("Load selected completion QR failed:", selectedTokenRes.error);
  const customers = customersRes.data ?? [];
  const selectedToken = selectedTokenRes.data;
  const selectedCustomer = selectedToken ? customers.find((customer) => customer.id === selectedToken.customer_id) : null;
  const completionUrl = selectedToken ? `${getSiteUrl()}/complete-booking?token=${selectedToken.token}` : "";

  const stats = [
    { label: "今日预约", value: data.todayBookingsCount, sub: "Today bookings" },
    { label: "待确认预约", value: data.openBookingsCount, sub: "Open bookings" },
    { label: "今日新增会员", value: data.todayMembersCount, sub: "New members" },
    { label: "总会员数量", value: data.totalMembersCount, sub: "Total members" },
    { label: "今日积分发放", value: data.todayPointsIssued, sub: "Points issued" },
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Admin Dashboard" subtitle="手机后台 · Mobile admin app" />

      {data.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {data.error}
        </div>
      )}

      <Card className="border-sage-200 bg-gradient-to-br from-sage-700 to-sage-900 text-cream-50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">PWA Admin</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold">像手机 App 一样使用</h2>
        <p className="mt-2 text-sm leading-6 text-cream-100/85">
          点击浏览器菜单 → Add to Home Screen / 添加到主屏幕。
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-taupe-200/70 bg-cream-50 p-4 shadow-sm">
            <p className="text-xs text-taupe-500">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-sage-700">{stat.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-taupe-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-2xl border border-taupe-200/70 bg-cream-50 p-4 shadow-sm transition-colors hover:border-sage-400"
          >
            <span className="block font-semibold text-ink">{action.label}</span>
            <span className="mt-1 block text-xs text-taupe-500">{action.sub}</span>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">完成体验 QR</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          保留原有完成打卡 QR 功能。会员扫码后会沿用现有积分与推荐奖励规则。
        </p>
        {searchParams?.qr_error && (
          <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            QR 生成失败，请检查会员与套餐。
          </p>
        )}
        <form action={createBookingCompletionToken} className="mt-4 grid gap-3">
          <select name="customer_id" required className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm">
            <option value="">选择会员 · Select member</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {(customer.name || "Member") + " · " + customer.email + (customer.phone ? " · " + customer.phone : "")}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select name="package_type" defaultValue="scent_test" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm">
              <option value="scent_test">RM60 Scent Test</option>
              <option value="custom_blend">RM150 Custom Blend</option>
            </select>
            <input name="expires_hours" type="number" min="1" max="72" defaultValue="24" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          </div>
          <button className="min-h-12 rounded-full bg-sage-700 px-5 text-sm font-semibold text-cream-50">生成 QR Code</button>
        </form>

        {selectedToken && (
          <div className="mt-5 rounded-2xl bg-cream-100 p-4">
            <CompletionQrCode value={completionUrl} />
            <p className="mt-3 font-semibold text-ink">{selectedCustomer?.name || selectedCustomer?.email || "Member"}</p>
            <p className="mt-1 text-sm text-taupe-600">{pkgLabel(selectedToken.package_type)} · {selectedToken.status}</p>
            <p className="mt-3 break-all rounded-xl bg-cream-50 px-3 py-2 font-mono text-xs text-taupe-600">{completionUrl}</p>
            <CopyButton text={completionUrl} label="复制链接" copiedLabel="已复制" toast="QR 链接已复制" className="mt-3" />
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink">今日预约</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-sage-700">全部</Link>
        </div>
        {data.todayBookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState>今天暂无预约 · No bookings today</EmptyState>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {data.todayBookings.slice(0, 6).map((booking) => (
              <div key={booking.id} className="rounded-2xl bg-cream-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{booking.customer_name || booking.customer_phone || "Guest"}</p>
                    <p className="mt-1 text-sm text-taupe-600">{pkgLabel(booking.package_type)}</p>
                    <p className="mt-1 text-xs text-taupe-500">{bookingDateLabel(booking)} · {bookingTimeLabel(booking)}</p>
                  </div>
                  <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
