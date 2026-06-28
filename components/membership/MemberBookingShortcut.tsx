import Link from "next/link";
import { Badge } from "./ui";
import { bookingPackageLabel } from "@/lib/admin-mobile";
import {
  BOOKING_PACKAGES,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingStart,
  todayInSingapore,
} from "@/lib/booking-config";
import { BOOKING_STATUS_LABEL } from "@/lib/membership-format";
import type { Booking } from "@/lib/supabase/types";

function nextBooking(bookings: Booking[]) {
  const today = todayInSingapore();
  return bookings
    .filter((booking) => ["pending", "confirmed"].includes(booking.status))
    .filter((booking) => !booking.booking_date || booking.booking_date >= today)
    .sort((a, b) => `${a.booking_date ?? ""} ${a.booking_time ?? ""}`.localeCompare(`${b.booking_date ?? ""} ${b.booking_time ?? ""}`))[0] ?? null;
}

export default function MemberBookingShortcut({ bookings }: { bookings: Booking[] }) {
  const upcoming = nextBooking(bookings);

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-sage-700/15 bg-cream-50 shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-sage-900 p-5 text-cream-50 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Booking</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight">
            预约香气体验
          </h2>
          <p className="mt-3 text-sm leading-7 text-cream-100/78">
            首页只保留快速入口，选择套餐、日期和时间会在独立预约页完成，减少手机页面拥挤感。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/book" className="rounded-full bg-cream-50 px-5 py-3 text-sm font-semibold text-sage-900">
              新预约
            </Link>
            <Link href="/member/bookings" className="rounded-full border border-cream-50/30 px-5 py-3 text-sm font-semibold text-cream-50">
              预约记录
            </Link>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {upcoming ? (
            <UpcomingSummary booking={upcoming} />
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Choose Package</p>
              <h3 className="mt-1 font-serif text-xl font-semibold text-ink">选择体验方案</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(BOOKING_PACKAGES).map(([key, pkg]) => (
                  <Link
                    key={key}
                    href="/book"
                    className="rounded-2xl border border-taupe-200/70 bg-cream-100 p-4 transition hover:border-sage-400"
                  >
                    <p className="font-serif text-2xl font-semibold text-sage-700">RM{pkg.amount}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{pkg.label}</p>
                    <p className="mt-2 text-xs leading-5 text-taupe-500">{pkg.durationMinutes} min · 到预约页选择时间</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function UpcomingSummary({ booking }: { booking: Booking }) {
  const start = getBookingStart(booking) ?? booking.created_at;
  const end = getBookingEnd(booking);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Next Booking</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{bookingPackageLabel(booking)}</h3>
          <p className="mt-2 text-sm leading-6 text-taupe-600">
            {formatSingaporeDate(start)} · {formatSingaporeTimeRange(start, end)}
          </p>
        </div>
        <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/member/bookings/${booking.id}`} className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50">
          查看详情
        </Link>
        <Link href={`/book?reschedule=${booking.id}`} className="rounded-full border border-gold-400/70 px-4 py-2 text-sm font-semibold text-sage-800">
          修改预约
        </Link>
        <Link href="/member/bookings" className="rounded-full border border-taupe-200 px-4 py-2 text-sm font-semibold text-sage-700">
          全部记录
        </Link>
      </div>
    </div>
  );
}
