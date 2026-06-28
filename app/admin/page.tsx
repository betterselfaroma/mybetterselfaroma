import Link from "next/link";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge, Card, EmptyState } from "@/components/membership/ui";
import { BOOKING_STATUS_LABEL, pkgLabel } from "@/lib/membership-format";
import {
  BOOKING_STABLE_SELECT,
  bookingCustomerLabel,
  bookingDateLabel,
  bookingPackageLabel,
  bookingTimeLabel,
  todayDateInSingapore,
} from "@/lib/admin-mobile";
import { getSiteUrl } from "@/lib/site-url";
import CompletionQrCode from "@/components/membership/CompletionQrCode";
import CopyButton from "@/components/member/CopyButton";
import { createBookingCompletionToken } from "./actions";
import type { Booking, BookingCompletionToken } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { qr?: string; qr_error?: string };
};

type DashboardData = {
  error: string | null;
  metricErrors: Partial<Record<"todayBookings" | "openBookings" | "todayMembers" | "totalMembers" | "todayPoints", string>>;
  todayBookingsCount: number;
  openBookingsCount: number;
  todayMembersCount: number;
  totalMembersCount: number;
  todayPointsIssued: number;
  todayBookings: Booking[];
};

type AdminLikeError = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  name?: unknown;
  digest?: unknown;
};

function adminErrorDetails(error: unknown, fallback = "Unknown error") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;

  if (typeof error === "object") {
    const err = error as AdminLikeError;
    const parts = [
      typeof err.message === "string" && err.message.trim() ? err.message.trim() : "",
      typeof err.code === "string" && err.code.trim() ? `code: ${err.code.trim()}` : "",
      typeof err.details === "string" && err.details.trim() ? `details: ${err.details.trim()}` : "",
      typeof err.hint === "string" && err.hint.trim() ? `hint: ${err.hint.trim()}` : "",
      typeof err.digest === "string" && err.digest.trim() ? `digest: ${err.digest.trim()}` : "",
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(" | ");
  }

  try {
    const json = JSON.stringify(error);
    return json && json !== "{}" ? json : fallback;
  } catch {
    return fallback;
  }
}

function logAdminDashboardError(label: string, error: unknown) {
  const err = (error ?? {}) as AdminLikeError;
  console.error(label, {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
    digest: err.digest,
    raw: error,
  });
}

type SupabaseLikeResult<T> = {
  data?: T | null;
  count?: number | null;
  error?: AdminLikeError | null;
};

function readSettledDashboardResult<T>(
  label: string,
  result: PromiseSettledResult<SupabaseLikeResult<T>>,
) {
  if (result.status === "rejected") {
    logAdminDashboardError(`Admin dashboard ${label} query rejected:`, result.reason);
    return {
      data: null,
      count: 0,
      error: `${label} failed: ${adminErrorDetails(result.reason, "Unexpected query failure")}`,
    };
  }

  if (result.value.error) {
    logAdminDashboardError(`Admin dashboard ${label} query failed:`, result.value.error);
    return {
      data: result.value.data ?? null,
      count: result.value.count ?? 0,
      error: `${label} failed: ${adminErrorDetails(result.value.error, "Supabase query failure")}`,
    };
  }

  return {
    data: result.value.data ?? null,
    count: result.value.count ?? 0,
    error: "",
  };
}

async function loadDashboardData(): Promise<DashboardData> {
  const supabase = createAdminClient();
  const today = todayDateInSingapore();
  const dayStart = new Date(`${today}T00:00:00+08:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [
    todayBookingsResult,
    openBookingsResult,
    todayMembersResult,
    totalMembersResult,
    todayTransactionsResult,
  ] = await Promise.allSettled([
    supabase
      .from("bookings")
      .select(BOOKING_STABLE_SELECT, { count: "exact" })
      .eq("booking_date", today)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true }),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
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

  const todayBookings = readSettledDashboardResult<Booking[]>("today bookings", todayBookingsResult);
  const openBookings = readSettledDashboardResult<{ id: string }[]>("pending bookings", openBookingsResult);
  const todayMembers = readSettledDashboardResult<{ id: string }[]>("today members", todayMembersResult);
  const totalMembers = readSettledDashboardResult<{ id: string }[]>("total members", totalMembersResult);
  const todayTransactions = readSettledDashboardResult<{ points: number | string | null }[]>(
    "today points transactions",
    todayTransactionsResult,
  );

  const metricErrors: DashboardData["metricErrors"] = {};
  if (todayBookings.error) metricErrors.todayBookings = todayBookings.error;
  if (openBookings.error) metricErrors.openBookings = openBookings.error;
  if (todayMembers.error) metricErrors.todayMembers = todayMembers.error;
  if (totalMembers.error) metricErrors.totalMembers = totalMembers.error;
  if (todayTransactions.error) metricErrors.todayPoints = todayTransactions.error;

  const issued = (todayTransactions.data ?? [])
    .filter((entry) => Number(entry.points) > 0)
    .reduce((total, entry) => total + Number(entry.points), 0);

  return {
    error: null,
    metricErrors,
    todayBookingsCount: todayBookings.count ?? todayBookings.data?.length ?? 0,
    openBookingsCount: openBookings.count ?? 0,
    todayMembersCount: todayMembers.count ?? 0,
    totalMembersCount: totalMembers.count ?? 0,
    todayPointsIssued: issued,
    todayBookings: (todayBookings.data ?? []) as Booking[],
  };
}

const quickActions = [
  { href: "/admin/scan", label: "扫会员 QR", sub: "Scan member", primary: true },
  { href: "/admin/bookings", label: "今日预约", sub: "Today bookings" },
  { href: "/admin/bookings?new=1", label: "新增预约", sub: "Add booking" },
  { href: "/admin/members", label: "搜索会员", sub: "Find member" },
  { href: "/admin/rewards", label: "积分商品", sub: "Rewards products" },
];

async function CompletionQrTool({
  selectedQrId,
  qrError,
}: {
  selectedQrId: string;
  qrError?: string;
}) {
  const supabase = createAdminClient();
  let customers: { id: string; name: string | null; email: string | null; phone: string | null }[] = [];
  let selectedToken: BookingCompletionToken | null = null;
  let qrLoadError = "";

  try {
    const [customersRes, selectedTokenRes] = await Promise.all([
      supabase.from("customers").select("id,name,email,phone").order("name"),
      selectedQrId
        ? supabase.from("booking_completion_tokens").select("*").eq("id", selectedQrId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (customersRes.error) {
      logAdminDashboardError("Admin dashboard QR customers load failed:", customersRes.error);
      qrLoadError = `QR customers failed: ${adminErrorDetails(customersRes.error)}`;
    } else {
      customers = customersRes.data ?? [];
    }

    if (selectedTokenRes.error) {
      logAdminDashboardError("Admin dashboard selected completion QR load failed:", selectedTokenRes.error);
      qrLoadError = `Selected QR failed: ${adminErrorDetails(selectedTokenRes.error)}`;
    } else {
      selectedToken = selectedTokenRes.data as BookingCompletionToken | null;
    }
  } catch (error) {
    logAdminDashboardError("Admin dashboard completion QR tool failed:", error);
    qrLoadError = `Completion QR failed: ${adminErrorDetails(error)}`;
  }

  const selectedCustomer = selectedToken ? customers.find((customer) => customer.id === selectedToken.customer_id) : null;
  const completionUrl = selectedToken ? `${getSiteUrl()}/complete-booking?token=${selectedToken.token}` : "";

  return (
    <Card className="rounded-[1.65rem]">
      <h2 className="font-serif text-xl font-semibold text-ink">完成体验 QR</h2>
      <p className="mt-2 text-sm leading-6 text-taupe-600">
        会员完成线下体验后，生成一次性 QR 给会员扫码打卡。
      </p>
      {qrError && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          QR 生成失败，请检查会员与套餐。
        </p>
      )}
      {qrLoadError && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Dashboard failed: {qrLoadError}
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
  );
}

function CompletionQrToolFallback() {
  return (
    <Card className="rounded-[1.65rem]">
      <div className="h-5 w-28 rounded-full bg-cream-200" />
      <div className="mt-3 h-4 w-full rounded-full bg-cream-200" />
      <div className="mt-2 h-4 w-3/4 rounded-full bg-cream-200" />
      <div className="mt-5 h-12 rounded-2xl bg-cream-200" />
      <div className="mt-3 h-12 rounded-full bg-sage-100" />
    </Card>
  );
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const data = await loadDashboardData();
  const selectedQrId = typeof searchParams?.qr === "string" ? searchParams.qr : "";

  const stats = [
    { label: "今日预约", value: data.todayBookingsCount, sub: "Today bookings", error: data.metricErrors.todayBookings },
    { label: "待确认预约", value: data.openBookingsCount, sub: "Open bookings", error: data.metricErrors.openBookings },
    { label: "今日新增会员", value: data.todayMembersCount, sub: "New members", error: data.metricErrors.todayMembers },
    { label: "总会员数量", value: data.totalMembersCount, sub: "Total members", error: data.metricErrors.totalMembers },
    { label: "今日积分发放", value: data.todayPointsIssued, sub: "Points issued", error: data.metricErrors.todayPoints },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] bg-forest-depth px-5 py-5 text-cream-50 shadow-[0_26px_60px_-38px_rgba(31,61,46,0.85)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">Admin Dashboard</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight">今日后台</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-cream-100/82">
          快速处理预约、扫码与会员积分，适合手机单手操作。
        </p>
      </div>

      {data.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {data.error}
        </div>
      )}

      <Card className="rounded-[1.65rem] border-sage-200 bg-cream-50/90">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">PWA Admin</p>
        <h2 className="mt-2 font-serif text-xl font-semibold text-ink">想像手机 App 一样使用？</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          点击浏览器菜单 → Add to Home Screen / 添加到主屏幕。
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.45rem] border border-cream-50/70 bg-cream-50/88 p-4 shadow-[0_18px_50px_-34px_rgba(82,67,47,0.42)]">
            <p className="text-xs font-semibold text-taupe-500">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold leading-none text-sage-800">{stat.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-taupe-400">{stat.sub}</p>
            {stat.error && (
              <p className="mt-2 line-clamp-3 break-words text-[11px] leading-4 text-red-700">{stat.error}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={[
              "rounded-[1.45rem] border p-4 shadow-sm transition-colors",
              action.primary
                ? "col-span-2 border-sage-700 bg-sage-800 text-cream-50 shadow-[0_22px_52px_-34px_rgba(31,61,46,0.95)] hover:bg-sage-900"
                : "border-taupe-200/70 bg-cream-50 hover:border-sage-400",
            ].join(" ")}
          >
            <span className={action.primary ? "block font-semibold text-cream-50" : "block font-semibold text-ink"}>{action.label}</span>
            <span className={action.primary ? "mt-1 block text-xs text-cream-100/75" : "mt-1 block text-xs text-taupe-500"}>{action.sub}</span>
          </Link>
        ))}
      </div>

      <Suspense fallback={<CompletionQrToolFallback />}>
        <CompletionQrTool selectedQrId={selectedQrId} qrError={searchParams?.qr_error} />
      </Suspense>

      <Card className="rounded-[1.65rem]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink">今日预约</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-sage-700">全部</Link>
        </div>
        {data.metricErrors.todayBookings ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {data.metricErrors.todayBookings}
          </div>
        ) : data.todayBookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState>今天暂无预约 · No bookings today</EmptyState>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {data.todayBookings.slice(0, 6).map((booking) => (
              <div key={booking.id} className="rounded-2xl bg-cream-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{bookingCustomerLabel(booking)}</p>
                    <p className="mt-1 text-sm text-taupe-600">{bookingPackageLabel(booking)}</p>
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
