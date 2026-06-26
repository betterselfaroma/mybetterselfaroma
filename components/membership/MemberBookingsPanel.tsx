import Link from "next/link";
import { Badge, EmptyState } from "./ui";
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

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-taupe-400">
          <tr className="border-b border-taupe-200/60">
            <th className="py-2 pr-4">日期 · Date</th>
            <th className="py-2 pr-4">时间 · Time</th>
            <th className="py-2 pr-4">项目 · Package</th>
            <th className="py-2 pr-4">状态 · Status</th>
            <th className="py-2 pr-4">预约 QR Code</th>
            <th className="py-2">WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
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

            return (
              <tr key={booking.id} className="border-b border-taupe-200/40 align-top">
                <td className="py-3 pr-4 text-taupe-600">{date}</td>
                <td className="py-3 pr-4 text-taupe-600">{time}</td>
                <td className="py-3 pr-4 font-semibold text-sage-700">{packageLabel}</td>
                <td className="py-3 pr-4">
                  <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
                </td>
                <td className="py-3 pr-4">
                  {qrUrl ? (
                    <Link href={`/booking-confirmation?token=${qrToken}`} className="font-medium text-sage-700 hover:underline">
                      查看预约 · View QR
                    </Link>
                  ) : (
                    <span className="text-taupe-400">-</span>
                  )}
                </td>
                <td className="py-3">
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
