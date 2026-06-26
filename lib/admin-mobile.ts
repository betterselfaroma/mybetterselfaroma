import { getBookingEnd, getBookingStart } from "@/lib/booking-config";
import type { Booking } from "@/lib/supabase/types";

export function localWhatsappToWaMe(phone?: string | null) {
  const normalized = formatMalaysiaWhatsAppNumber(phone);
  return normalized ? `https://wa.me/${normalized}` : "";
}

export function formatMalaysiaWhatsAppNumber(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("60")
    ? digits
    : digits.startsWith("0")
      ? `60${digits.slice(1)}`
      : `60${digits}`;
}

export function bookingDateLabel(booking: Booking) {
  const start = getBookingStart(booking);
  if (!start) return booking.booking_date ?? "-";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeZone: "Asia/Singapore",
  }).format(new Date(start));
}

export function bookingTimeLabel(booking: Booking) {
  const start = getBookingStart(booking);
  const end = getBookingEnd(booking);
  if (!start || !end) return booking.booking_time ?? "-";
  const formatter = new Intl.DateTimeFormat("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore",
  });
  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

export function todayDateInSingapore() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
