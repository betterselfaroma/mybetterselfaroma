import { Badge, Card, EmptyState } from "@/components/membership/ui";
import { BOOKING_PACKAGES, getTimeOptionsForPackage, todayInSingapore } from "@/lib/booking-config";
import { BOOKING_STATUS_LABEL } from "@/lib/membership-format";
import {
  BOOKING_STABLE_SELECT,
  bookingDateLabel,
  bookingPackageLabel,
  bookingTimeLabel,
  localWhatsappToWaMe,
} from "@/lib/admin-mobile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAdminBooking, setBookingStatus } from "../actions";
import type { Booking } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { q?: string; date?: string; status?: string; new?: string; notice?: string; error?: string };
};

const STATUS_OPTIONS = ["all", "pending", "confirmed", "completed", "cancelled"];

function StatusButton({ id, status, label, returnTo, primary }: { id: string; status: string; label: string; returnTo: string; primary?: boolean }) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="return_to" value={returnTo} />
      <button
        className={
          primary
            ? "min-h-11 rounded-full bg-sage-800 px-4 py-2 text-sm font-semibold text-cream-50 shadow-sm hover:bg-sage-900"
            : "min-h-11 rounded-full border border-taupe-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-taupe-700 hover:border-sage-500"
        }
      >
        {label}
      </button>
    </form>
  );
}

function matchesDate(booking: Booking, date: string) {
  if (!date) return true;
  return booking.booking_date === date;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const date = searchParams?.date ?? todayInSingapore();
  const status = searchParams?.status ?? "all";
  const notice = searchParams?.notice ?? "";
  const actionError = searchParams?.error ?? "";
  const returnTo = `/admin/bookings?${new URLSearchParams({ q, date, status }).toString()}`;

  let error = "";
  let bookings: Booking[] = [];
  let customers: { id: string; name: string; email: string; phone: string | null }[] = [];

  try {
    const supabase = createAdminClient();
    let bookingsQuery = supabase
      .from("bookings")
      .select(BOOKING_STABLE_SELECT)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })
      .limit(150);

    if (date) bookingsQuery = bookingsQuery.eq("booking_date", date);
    if (status !== "all") bookingsQuery = bookingsQuery.eq("status", status);

    const [bookingsRes, customersRes] = await Promise.all([
      bookingsQuery,
      supabase.from("customers").select("id,name,email,phone").order("name"),
    ]);
    if (bookingsRes.error) throw new Error(bookingsRes.error.message);
    if (customersRes.error) throw new Error(customersRes.error.message);
    bookings = (bookingsRes.data ?? []) as Booking[];
    customers = customersRes.data ?? [];
  } catch (loadError) {
    console.error("Load admin bookings failed:", loadError);
    error = loadError instanceof Error ? loadError.message : "Bookings could not be loaded.";
  }

  const filteredBookings = bookings
    .filter((booking) => matchesDate(booking, date))
    .filter((booking) => {
      if (!q) return true;
      return [
        booking.contact,
        booking.notes,
        booking.package_name,
        booking.package_code,
      ].some((value) => (value ?? "").toLowerCase().includes(q));
    });

  return (
    <div className="space-y-5">
      <div className="rounded-[1.65rem] bg-cream-50/90 p-5 shadow-[0_20px_58px_-38px_rgba(82,67,47,0.5)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-600">Bookings</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">预约管理</h1>
        <p className="mt-2 text-sm leading-6 text-taupe-600">按日期、状态和电话快速处理今日预约。</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">操作已完成 · Action completed</div>}

      <Card className="rounded-[1.65rem]">
        <form className="grid gap-3" action="/admin/bookings">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索电话 / 名字 · Search phone/name"
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
            />
            <select
              name="status"
              defaultValue={status}
              className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
            >
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50">筛选 · Filter</button>
        </form>
      </Card>

      <details className="rounded-[1.65rem] border border-taupe-200/60 bg-cream-50 shadow-sm" open={searchParams?.new === "1"}>
        <summary className="cursor-pointer list-none px-6 py-5 font-serif text-xl font-semibold text-ink">
          新增预约 · Add Booking
        </summary>
        <div className="border-t border-taupe-200/60 px-6 pb-6 pt-4">
        <form action={createAdminBooking} className="mt-4 grid gap-3">
          <select name="customer_id" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm">
            <option value="">线下顾客 / 不选择会员</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {(customer.name || "Member") + " · " + customer.email + (customer.phone ? " · " + customer.phone : "")}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select name="package_type" defaultValue="scent_test" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm">
              {Object.entries(BOOKING_PACKAGES).map(([key, pkg]) => (
                <option key={key} value={key}>{pkg.shortLabel} · {pkg.amount}</option>
              ))}
            </select>
            <input name="customer_phone" placeholder="WhatsApp / 电话" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="booking_date" type="date" required defaultValue={date} className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
            <select name="booking_time" required defaultValue="10:00" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm">
              {getTimeOptionsForPackage("scent_test").map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
          </div>
          <textarea name="notes" rows={3} placeholder="备注 · Notes" className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50">保存预约 · Save</button>
        </form>
        </div>
      </details>

      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <Card><EmptyState>没有符合条件的预约 · No matching bookings</EmptyState></Card>
        ) : (
          filteredBookings.map((booking) => {
            const phone = booking.contact;
            const waHref = localWhatsappToWaMe(phone);
            return (
              <Card key={booking.id} className="rounded-[1.65rem]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-ink">{phone || "未填写电话"}</h2>
                    <p className="mt-1 text-sm text-taupe-600">{bookingPackageLabel(booking)}</p>
                  </div>
                  <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-taupe-500">套餐</dt><dd className="font-semibold text-sage-700">{bookingPackageLabel(booking)}</dd></div>
                  <div><dt className="text-taupe-500">金额</dt><dd className="font-semibold text-ink">RM{booking.amount ?? "-"}</dd></div>
                  <div><dt className="text-taupe-500">日期</dt><dd>{bookingDateLabel(booking)}</dd></div>
                  <div><dt className="text-taupe-500">时间</dt><dd>{bookingTimeLabel(booking)}</dd></div>
                </dl>
                {booking.notes && <p className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-sm text-taupe-700">{booking.notes}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {waHref && (
                    <a href={waHref} target="_blank" rel="noopener noreferrer" className="min-h-11 rounded-full border border-sage-300 px-4 py-2 text-sm font-semibold text-sage-700">
                      WhatsApp
                    </a>
                  )}
                  <StatusButton id={booking.id} status="confirmed" label="Confirm" returnTo={returnTo} />
                  <StatusButton id={booking.id} status="completed" label="Complete" returnTo={returnTo} primary />
                  <StatusButton id={booking.id} status="cancelled" label="Cancel" returnTo={returnTo} />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
