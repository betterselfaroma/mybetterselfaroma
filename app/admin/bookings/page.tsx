import { Badge, Card, EmptyState, PageTitle } from "@/components/membership/ui";
import { BOOKING_PACKAGES, getTimeOptionsForPackage, todayInSingapore } from "@/lib/booking-config";
import { BOOKING_STATUS_LABEL, pkgLabel } from "@/lib/membership-format";
import { bookingDateLabel, bookingTimeLabel, localWhatsappToWaMe } from "@/lib/admin-mobile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAdminBooking, setBookingStatus } from "../actions";
import type { Booking } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { q?: string; date?: string; status?: string; new?: string };
};

const STATUS_OPTIONS = ["all", "pending", "booked", "confirmed", "completed", "cancelled"];

function StatusButton({ id, status, label, primary }: { id: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "min-h-11 rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-sage-800"
            : "min-h-11 rounded-full border border-taupe-300 px-4 py-2 text-sm font-semibold text-taupe-700 hover:border-sage-500"
        }
      >
        {label}
      </button>
    </form>
  );
}

function matchesDate(booking: Booking, date: string) {
  if (!date) return true;
  return bookingDateLabel(booking) !== "-" && new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(booking.start_time ?? booking.booking_date ?? booking.created_at)) === date;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const date = searchParams?.date ?? todayInSingapore();
  const status = searchParams?.status ?? "all";

  let error = "";
  let bookings: Booking[] = [];
  let customers: { id: string; name: string; email: string; phone: string | null }[] = [];

  try {
    const supabase = createAdminClient();
    const [bookingsRes, customersRes] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(150),
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
    .filter((booking) => status === "all" || booking.status === status)
    .filter((booking) => {
      if (!q) return true;
      return [
        booking.customer_name,
        booking.customer_phone,
        booking.customer_email,
        booking.contact,
        booking.notes,
      ].some((value) => (value ?? "").toLowerCase().includes(q));
    });

  return (
    <div className="space-y-5">
      <PageTitle title="预约 · Bookings" subtitle="手机预约管理 · Mobile booking desk" />

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
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
          <button className="min-h-12 rounded-full bg-sage-700 px-5 text-sm font-semibold text-cream-50">筛选 · Filter</button>
        </form>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">新增预约 · Add Booking</h2>
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
          <input name="customer_name" placeholder="顾客名字 · Name" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <textarea name="notes" rows={3} placeholder="备注 · Notes" className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          <button className="min-h-12 rounded-full bg-sage-700 px-5 text-sm font-semibold text-cream-50">保存预约 · Save</button>
        </form>
      </Card>

      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <Card><EmptyState>没有符合条件的预约 · No matching bookings</EmptyState></Card>
        ) : (
          filteredBookings.map((booking) => {
            const phone = booking.customer_phone || booking.contact;
            const waHref = localWhatsappToWaMe(phone);
            return (
              <Card key={booking.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-ink">{booking.customer_name || "Guest"}</h2>
                    <p className="mt-1 text-sm text-taupe-600">{phone || booking.customer_email || "-"}</p>
                  </div>
                  <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-taupe-500">套餐</dt><dd className="font-semibold text-sage-700">{pkgLabel(booking.package_type)}</dd></div>
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
                  <StatusButton id={booking.id} status="confirmed" label="Confirm" />
                  <StatusButton id={booking.id} status="completed" label="Complete" primary />
                  <StatusButton id={booking.id} status="cancelled" label="Cancel" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
