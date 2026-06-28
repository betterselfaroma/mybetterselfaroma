import Link from "next/link";
import { Badge, EmptyState } from "./ui";
import CancelBookingButton from "./CancelBookingButton";
import { BOOKING_STATUS_LABEL } from "@/lib/membership-format";
import { bookingPackageLabel } from "@/lib/admin-mobile";
import {
  BOOKING_CONTACTS,
  buildBookingWhatsAppText,
  extractBookingQrToken,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingQrUrl,
  getBookingStart,
  getWhatsAppUrl,
  stripLegacyBookingQrToken,
} from "@/lib/booking-config";
import type { Booking, Customer } from "@/lib/supabase/types";

type ShapedBooking = {
  booking: Booking;
  qrToken: string;
  qrUrl: string;
  date: string;
  time: string;
  packageLabel: string;
  message: string;
};

function shapeBooking(booking: Booking, customer: Customer, siteUrl: string): ShapedBooking {
  const qrToken = extractBookingQrToken(booking);
  const qrUrl = qrToken ? getBookingQrUrl(siteUrl, qrToken) : "";
  const start = getBookingStart(booking) ?? booking.created_at;
  const end = getBookingEnd(booking);
  const date = formatSingaporeDate(start);
  const time = formatSingaporeTimeRange(start, end);
  const packageLabel = bookingPackageLabel(booking);
  const message = buildBookingWhatsAppText({
    name: customer.name,
    email: customer.email,
    packageLabel,
    date,
    time,
    bookingId: booking.id,
    bookingQrUrl: qrUrl || "-",
    notes: stripLegacyBookingQrToken(booking.notes),
  });

  return { booking, qrToken, qrUrl, date, time, packageLabel, message };
}

export default function MemberBookingsPanel({
  bookings,
  customer,
  siteUrl,
}: {
  bookings: Booking[];
  customer: Customer;
  siteUrl: string;
}) {
  if (bookings.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState>暂无预约记录 · No bookings yet</EmptyState>
      </div>
    );
  }

  const shaped = bookings.map((booking) => shapeBooking(booking, customer, siteUrl));

  return (
    <div className="mt-4">
      <div className="grid gap-3 md:hidden">
        {shaped.map(({ booking, qrToken, qrUrl, date, time, packageLabel, message }) => (
          <article key={booking.id} className="rounded-2xl border border-taupe-200/70 bg-cream-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{packageLabel}</p>
                <p className="mt-1 text-sm text-taupe-600">{date} · {time}</p>
              </div>
              <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
            </div>

            {booking.notes ? (
              <p className="mt-3 rounded-xl bg-cream-50 px-3 py-2 text-sm leading-6 text-taupe-600">
                {stripLegacyBookingQrToken(booking.notes)}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/member/bookings/${booking.id}`} className="rounded-full bg-sage-700 px-4 py-2 text-xs font-bold text-cream-50">
                查看详情
              </Link>
              {qrUrl ? (
                <Link href={`/booking-confirmation?token=${qrToken}`} className="rounded-full border border-sage-300 px-4 py-2 text-xs font-bold text-sage-700">
                  QR
                </Link>
              ) : null}
              {BOOKING_CONTACTS.map((contact) => (
                <a
                  key={contact.key}
                  href={getWhatsAppUrl(contact.wa, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-sage-300 px-4 py-2 text-xs font-bold text-sage-700"
                >
                  {contact.label}
                </a>
              ))}
              {["pending", "confirmed"].includes(booking.status) && (
                <>
                  <Link href={`/book?reschedule=${booking.id}`} className="rounded-full border border-gold-400/70 px-4 py-2 text-xs font-bold text-sage-800">
                    修改预约
                  </Link>
                  <CancelBookingButton bookingId={booking.id} />
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-taupe-400">
            <tr className="border-b border-taupe-200/60">
              <th className="py-2 pr-4">日期 · Date</th>
              <th className="py-2 pr-4">时间 · Time</th>
              <th className="py-2 pr-4">项目 · Package</th>
              <th className="py-2 pr-4">状态 · Status</th>
              <th className="py-2 pr-4">详情 · Detail</th>
              <th className="py-2 pr-4">WhatsApp</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {shaped.map(({ booking, qrToken, qrUrl, date, time, packageLabel, message }) => (
              <tr key={booking.id} className="border-b border-taupe-200/40 align-top">
                <td className="py-3 pr-4 text-taupe-600">{date}</td>
                <td className="py-3 pr-4 text-taupe-600">{time}</td>
                <td className="py-3 pr-4 font-semibold text-sage-700">{packageLabel}</td>
                <td className="py-3 pr-4">
                  <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/member/bookings/${booking.id}`} className="font-medium text-sage-700 hover:underline">
                      详情
                    </Link>
                    {qrUrl && (
                      <Link href={`/booking-confirmation?token=${qrToken}`} className="font-medium text-sage-700 hover:underline">
                        QR
                      </Link>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    {BOOKING_CONTACTS.map((contact) => (
                      <a
                        key={contact.key}
                        href={getWhatsAppUrl(contact.wa, message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-sage-300 px-3 py-1.5 text-xs font-medium text-sage-700 hover:border-sage-600"
                      >
                        {contact.label}
                      </a>
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  {["pending", "confirmed"].includes(booking.status) ? (
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/book?reschedule=${booking.id}`} className="rounded-full border border-gold-400/70 px-4 py-2 text-xs font-bold text-sage-800">
                        修改预约
                      </Link>
                      <CancelBookingButton bookingId={booking.id} />
                    </div>
                  ) : (
                    <span className="text-taupe-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
