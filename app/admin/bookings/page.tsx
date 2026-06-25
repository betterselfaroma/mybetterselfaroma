import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge, PageTitle, EmptyState } from "@/components/membership/ui";
import { BOOKING_STATUS_LABEL, pkgLabel } from "@/lib/membership-format";
import {
  BOOKING_CONFLICT_MESSAGE,
  BOOKING_PACKAGES,
  extractBookingQrToken,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingStart,
  getTimeOptionsForPackage,
  stripLegacyBookingQrToken,
  singaporeDateTimeToUtc,
  todayInSingapore,
} from "@/lib/booking-config";
import { createAdminBooking, setBookingStatus, updateAdminBookingSchedule } from "../actions";
import type { Booking } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type AdminBookingsProps = {
  searchParams?: { date?: string; error?: string };
};

const SOURCE_LABEL: Record<string, string> = {
  member_self_booking: "会员自助 · Member",
  admin_offline_booking: "线下新增 · Offline",
  whatsapp_manual: "WhatsApp 手动 · WhatsApp",
  qr_completion: "完成打卡 · Completion QR",
};

const ERROR_LABEL: Record<string, string> = {
  conflict: BOOKING_CONFLICT_MESSAGE,
  invalid_time: "请选择有效营业时间。 · Please choose a valid business-hour time slot.",
  customer_not_found: "找不到所选会员。 · Selected member was not found.",
  failed: "预约保存失败，请稍后再试。 · Booking could not be saved. Please try again.",
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(value: string | null) {
  if (!value) return todayInSingapore();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function timeInputValue(value: string | null) {
  if (!value) return "10:00";
  const sg = new Date(new Date(value).getTime() + 8 * 60 * 60 * 1000);
  return pad2(sg.getUTCHours()) + ":" + pad2(sg.getUTCMinutes());
}

function StatusBtn({ id, status, label, primary }: { id: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-cream-50 hover:bg-sage-800"
            : "rounded-lg border border-taupe-300 px-3 py-1.5 text-xs font-medium text-taupe-700 hover:border-sage-400 hover:text-sage-700"
        }
      >
        {label}
      </button>
    </form>
  );
}

function isMissingScheduleColumns(message: string) {
  return message.includes("bookings.start_time")
    || message.includes("column bookings.start_time does not exist")
    || message.includes("Could not find the 'start_time' column");
}

function filterBookingsForDate(bookings: Booking[], selectedDate: string) {
  return bookings.filter((booking) => {
    const start = getBookingStart(booking);
    if (!start) return false;
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(start)) === selectedDate;
  }).sort((a, b) => new Date(getBookingStart(a) ?? 0).getTime() - new Date(getBookingStart(b) ?? 0).getTime());
}

async function loadBookingsForDate(supabase: ReturnType<typeof createAdminClient>, selectedDate: string, dayStart: Date, dayEnd: Date) {
  const scheduled = await supabase
    .from("bookings")
    .select("*")
    .gte("start_time", dayStart.toISOString())
    .lt("start_time", dayEnd.toISOString())
    .order("start_time", { ascending: true });

  if (!scheduled.error) return scheduled;
  if (!isMissingScheduleColumns(scheduled.error.message)) return scheduled;

  const legacy = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (legacy.error) return legacy;
  return { data: filterBookingsForDate((legacy.data ?? []) as Booking[], selectedDate), error: null };
}

function hasOverlap(bookings: Booking[], start: Date, end: Date) {
  return bookings.some((booking) => {
    const bookingStart = getBookingStart(booking);
    const bookingEnd = getBookingEnd(booking);
    if (!bookingStart || !bookingEnd) return false;
    if (booking.status === "cancelled" || booking.status === "no_show") return false;
    return start < new Date(bookingEnd) && end > new Date(bookingStart);
  });
}

function availableSlots(bookings: Booking[], date: string, packageType: string) {
  return getTimeOptionsForPackage(packageType).filter((time) => {
    const slot = {
      start: singaporeDateTimeToUtc(date, time),
      end: new Date(singaporeDateTimeToUtc(date, time).getTime() + BOOKING_PACKAGES[packageType as keyof typeof BOOKING_PACKAGES].durationMinutes * 60 * 1000),
    };
    return !hasOverlap(bookings, slot.start, slot.end);
  });
}

export default async function AdminBookings({ searchParams }: AdminBookingsProps) {
  const selectedDate = typeof searchParams?.date === "string" && searchParams.date ? searchParams.date : todayInSingapore();
  const dayStart = singaporeDateTimeToUtc(selectedDate, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const supabase = createAdminClient();
  const [bookingsRes, customersRes] = await Promise.all([
    loadBookingsForDate(supabase, selectedDate, dayStart, dayEnd),
    supabase.from("customers").select("id,name,email,phone").order("name"),
  ]);

  const bookings = (bookingsRes.data ?? []) as Booking[];
  const customers = customersRes.data ?? [];
  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled" && booking.status !== "no_show");
  const rm60Slots = availableSlots(bookings, selectedDate, "scent_test");
  const rm150Slots = availableSlots(bookings, selectedDate, "custom_blend");
  const error = searchParams?.error && ERROR_LABEL[searchParams.error] ? ERROR_LABEL[searchParams.error] : "";

  return (
    <div className="space-y-6">
      <PageTitle
        title="预约管理"
        subtitle="Bookings · 会员预约和线下预约都会检查时间是否重叠；完成后才发放积分和推荐奖励。"
      />

      <Card>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" action="/admin/bookings">
          <label className="block text-sm font-medium text-taupe-700">
            选择日期查看预约 · Select a date to view bookings
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500 sm:w-56"
            />
          </label>
          <button className="rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50 hover:bg-sage-800">
            查看 · View
          </button>
          <Link href="/admin/bookings" className="rounded-full border border-taupe-300 px-5 py-3 text-center text-sm font-semibold text-taupe-700 hover:border-sage-500">
            今日 · Today
          </Link>
        </form>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">新增线下预约 · Add Offline Booking</h2>
          <form action={createAdminBooking} className="mt-5 grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block text-sm font-medium text-taupe-700">
                已有会员 · Existing member
                <select name="customer_id" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500">
                  <option value="">线下顾客 / 不选择会员</option>
                  {customers.map((customer) => (
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
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <label className="block text-sm font-medium text-taupe-700">
                日期 · Date
                <input name="booking_date" type="date" required defaultValue={selectedDate} className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500" />
              </label>
              <label className="block text-sm font-medium text-taupe-700">
                时间 · Time
                <select name="booking_time" required defaultValue="10:00" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500">
                  {getTimeOptionsForPackage("scent_test").map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-taupe-700">
                WhatsApp / 电话 · Phone
                <input name="customer_phone" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500" />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block text-sm font-medium text-taupe-700">
                线下顾客姓名 · Guest name
                <input name="customer_name" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500" />
              </label>
              <label className="block text-sm font-medium text-taupe-700">
                Email
                <input name="customer_email" type="email" className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500" />
              </label>
            </div>

            <label className="block text-sm font-medium text-taupe-700">
              备注 · Notes
              <textarea name="notes" rows={3} className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500" />
            </label>

            <button className="rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50 hover:bg-sage-800">
              保存预约 · Save Booking
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">已预约时间 · Booked Time Slots</h2>
          {activeBookings.length === 0 ? (
            <div className="mt-4"><EmptyState>这一天暂无已占用时段</EmptyState></div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-taupe-700">
              {activeBookings.map((booking) => (
                <li key={booking.id} className="rounded-xl bg-cream-100 px-4 py-3">
                  <span className="font-semibold text-ink">{formatSingaporeTimeRange(getBookingStart(booking), getBookingEnd(booking))}</span>
                  <span className="mx-2 text-taupe-400">|</span>
                  {pkgLabel(booking.package_type)}
                  <span className="mx-2 text-taupe-400">|</span>
                  {booking.customer_name || booking.customer_email || "Guest"}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-sage-800">可选择时间 · RM60</h3>
              <p className="mt-2 leading-6 text-taupe-600">{rm60Slots.length ? rm60Slots.join(" · ") : "无可用时段"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sage-800">Available Time Slots · RM150</h3>
              <p className="mt-2 leading-6 text-taupe-600">{rm150Slots.length ? rm150Slots.join(" · ") : "No slots"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <h2 className="font-serif text-xl font-semibold text-ink">今日预约 · Today’s Bookings</h2>
        {bookings.length === 0 ? (
          <div className="mt-4"><EmptyState>暂无预约记录</EmptyState></div>
        ) : (
          <table className="mt-4 w-full min-w-[1120px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-taupe-400">
              <tr className="border-b border-taupe-200/60">
                <th className="py-2 pr-4">时间 · Time</th>
                <th className="py-2 pr-4">顾客 · Customer</th>
                <th className="py-2 pr-4">项目 · Package</th>
                <th className="py-2 pr-4">状态 · Status</th>
                <th className="py-2 pr-4">来源 · Source</th>
                <th className="py-2">操作 · Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-taupe-200/40 align-top">
                  <td className="py-3 pr-4 text-taupe-600">
                    <div className="font-medium text-ink">{formatSingaporeTimeRange(getBookingStart(booking), getBookingEnd(booking))}</div>
                    <div className="text-xs text-taupe-500">{formatSingaporeDate(getBookingStart(booking))}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{booking.customer_name || "Guest"}</div>
                    <div className="text-xs text-taupe-500">{booking.customer_phone || booking.customer_email || "-"}</div>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-sage-700">{pkgLabel(booking.package_type)}</td>
                  <td className="py-3 pr-4"><Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge></td>
                  <td className="py-3 pr-4 text-taupe-600">{SOURCE_LABEL[booking.source] ?? booking.source}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBtn id={booking.id} status="confirmed" label="确认 · Confirm" />
                      <StatusBtn id={booking.id} status="completed" label="完成 · Complete" primary />
                      <StatusBtn id={booking.id} status="cancelled" label="取消 · Cancel" />
                      <StatusBtn id={booking.id} status="no_show" label="未出席 · No-show" />
                      {extractBookingQrToken(booking) && (
                        <Link href={"/booking-confirmation?token=" + extractBookingQrToken(booking)} className="rounded-lg border border-sage-300 px-3 py-1.5 text-xs font-medium text-sage-700 hover:border-sage-600">
                          QR
                        </Link>
                      )}
                    </div>
                    <form action={updateAdminBookingSchedule} className="mt-3 grid gap-2 rounded-xl bg-cream-100 p-3">
                      <input type="hidden" name="id" value={booking.id} />
                      <div className="grid gap-2 sm:grid-cols-4">
                        <select name="package_type" defaultValue={booking.package_type} className="rounded-lg border border-taupe-200 bg-cream-50 px-2 py-2 text-xs">
                          <option value="scent_test">RM60</option>
                          <option value="custom_blend">RM150</option>
                        </select>
                        <input name="booking_date" type="date" defaultValue={dateInputValue(getBookingStart(booking))} className="rounded-lg border border-taupe-200 bg-cream-50 px-2 py-2 text-xs" />
                        <select name="booking_time" defaultValue={timeInputValue(getBookingStart(booking))} className="rounded-lg border border-taupe-200 bg-cream-50 px-2 py-2 text-xs">
                          {getTimeOptionsForPackage(booking.package_type).map((time) => <option key={time} value={time}>{time}</option>)}
                        </select>
                        <select name="status" defaultValue={booking.status} className="rounded-lg border border-taupe-200 bg-cream-50 px-2 py-2 text-xs">
                          <option value="booked">booked</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="no_show">no_show</option>
                        </select>
                      </div>
                      <textarea name="notes" rows={2} defaultValue={stripLegacyBookingQrToken(booking.notes) ?? ""} className="rounded-lg border border-taupe-200 bg-cream-50 px-2 py-2 text-xs" />
                      <button className="justify-self-start rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-cream-50 hover:bg-sage-800">
                        修改预约 · Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
