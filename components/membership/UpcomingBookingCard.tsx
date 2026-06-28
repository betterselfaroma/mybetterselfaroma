import Link from "next/link";
import { Badge } from "./ui";
import { bookingPackageLabel } from "@/lib/admin-mobile";
import {
  extractBookingQrToken,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingQrUrl,
  getBookingStart,
} from "@/lib/booking-config";
import { BOOKING_STATUS_LABEL } from "@/lib/membership-format";
import type { Booking } from "@/lib/supabase/types";

export default function UpcomingBookingCard({
  booking,
  siteUrl,
}: {
  booking: Booking | null;
  siteUrl: string;
}) {
  if (!booking) {
    return (
      <section className="rounded-[1.5rem] border border-dashed border-taupe-200 bg-cream-50 p-5 text-sm leading-6 text-taupe-600">
        <p className="font-semibold text-ink">暂时没有即将到来的预约</p>
        <p className="mt-1">选择下方套餐和时间后，就会出现在这里。</p>
      </section>
    );
  }

  const start = getBookingStart(booking) ?? booking.created_at;
  const end = getBookingEnd(booking);
  const date = formatSingaporeDate(start);
  const time = formatSingaporeTimeRange(start, end);
  const qrToken = extractBookingQrToken(booking);
  const qrUrl = qrToken ? getBookingQrUrl(siteUrl, qrToken) : "";

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-sage-700/15 bg-sage-900 text-cream-50 shadow-[0_20px_50px_rgba(31,61,46,0.18)]">
      <div className="relative p-5">
        <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full border border-gold-300/25" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Next Booking</p>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold leading-tight">
              {bookingPackageLabel(booking)}
            </h2>
            <p className="mt-2 text-sm text-cream-100/78">{date} · {time}</p>
          </div>
          <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {qrUrl ? (
            <Link
              href={`/booking-confirmation?token=${qrToken}`}
              className="rounded-full bg-cream-50 px-4 py-2.5 text-sm font-semibold text-sage-900"
            >
              查看预约 QR
            </Link>
          ) : null}
          <Link
            href="/member/bookings"
            className="rounded-full border border-cream-50/30 px-4 py-2.5 text-sm font-semibold text-cream-50"
          >
            我的预约记录
          </Link>
        </div>
      </div>
    </section>
  );
}
