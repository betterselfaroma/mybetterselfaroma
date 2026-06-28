import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { BOOKING_STABLE_SELECT } from "@/lib/admin-mobile";
import { todayInSingapore } from "@/lib/booking-config";
import { Card, PageTitle } from "@/components/membership/ui";
import MemberBookingsPanel from "@/components/membership/MemberBookingsPanel";
import { getSiteUrl } from "@/lib/site-url";
import type { Booking } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    status?: string;
    date?: string;
  };
};

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态 · All" },
  { value: "pending", label: "待确认 · Pending" },
  { value: "confirmed", label: "已确认 · Confirmed" },
  { value: "completed", label: "已完成 · Completed" },
  { value: "cancelled", label: "已取消 · Cancelled" },
];

const VALID_STATUS = new Set(["pending", "confirmed", "completed", "cancelled"]);

function ownerFilter(customerId: string, authUserId?: string | null) {
  const filters = [`user_id.eq.${customerId}`, `customer_id.eq.${customerId}`];
  if (authUserId) filters.push(`user_id.eq.${authUserId}`);
  return filters.join(",");
}

export default async function MemberBookingsPage({ searchParams }: PageProps) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const status = searchParams?.status ?? "all";
  const date = searchParams?.date ?? "";
  const safeStatus = VALID_STATUS.has(status) ? status : "all";

  let query = supabase
    .from("bookings")
    .select(`${BOOKING_STABLE_SELECT},customer_id`)
    .or(ownerFilter(customer.id, customer.auth_user_id))
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false })
    .limit(100);

  if (safeStatus !== "all") query = query.eq("status", safeStatus);
  if (date) query = query.eq("booking_date", date);

  const bookingsRes = await query;

  if (bookingsRes.error) {
    console.error("Load member bookings failed:", bookingsRes.error);
  }

  const bookings = (bookingsRes.data ?? []) as Booking[];
  const siteUrl = getSiteUrl();
  const today = todayInSingapore();

  return (
    <div className="space-y-6">
      <PageTitle
        title="预约记录"
        subtitle="Booking History · 查看每一次预约的状态、QR、改期和联系入口。"
      />

      <Card className="p-5">
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" action="/member/bookings">
          <select
            name="status"
            defaultValue={safeStatus}
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            defaultValue={date}
            max="2099-12-31"
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
          />
          <button className="min-h-12 rounded-full bg-sage-700 px-5 text-sm font-semibold text-cream-50">
            筛选 · Filter
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/member/bookings" className="rounded-full border border-taupe-200 px-3 py-1.5 font-semibold text-sage-700">
            全部预约
          </Link>
          <Link href={`/member/bookings?date=${today}`} className="rounded-full border border-taupe-200 px-3 py-1.5 font-semibold text-sage-700">
            今天
          </Link>
          <Link href="/book" className="rounded-full border border-gold-400/70 px-3 py-1.5 font-semibold text-sage-800">
            新预约
          </Link>
        </div>
      </Card>

      {bookingsRes.error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{bookingsRes.error.message}</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">我的预约 · My Bookings</h2>
            <p className="mt-1 text-sm text-taupe-600">共 {bookings.length} 笔记录</p>
          </div>
          <Link href="/book" className="hidden rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 sm:inline-flex">
            + 新预约
          </Link>
        </div>
        <MemberBookingsPanel bookings={bookings} customer={customer} siteUrl={siteUrl} />
      </Card>
    </div>
  );
}
