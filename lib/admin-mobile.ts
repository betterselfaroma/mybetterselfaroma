import { getBookingEnd, getBookingStart } from "@/lib/booking-config";
import { pkgLabel } from "@/lib/membership-format";
import type { Booking } from "@/lib/supabase/types";

export const BOOKING_STABLE_SELECT =
  "id,user_id,package_name,package_code,amount,booking_date,booking_time,contact,notes,status,created_at";

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

  try {
    const date = new Date(start);
    if (Number.isNaN(date.getTime())) return booking.booking_date ?? "-";
    return new Intl.DateTimeFormat("en-SG", {
      dateStyle: "medium",
      timeZone: "Asia/Singapore",
    }).format(date);
  } catch {
    return booking.booking_date ?? "-";
  }
}

export function bookingTimeLabel(booking: Booking) {
  const start = getBookingStart(booking);
  const end = getBookingEnd(booking);
  if (!start || !end) return booking.booking_time ?? "-";

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return booking.booking_time ?? "-";
    }

    const formatter = new Intl.DateTimeFormat("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Singapore",
    });
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  } catch {
    return booking.booking_time ?? "-";
  }
}

export function bookingCustomerLabel(booking: Booking) {
  return (
    booking.customer_name ||
    booking.customer?.name ||
    booking.customer?.full_name ||
    booking.contact ||
    "未命名顾客"
  );
}

export function bookingPackageLabel(booking: Booking) {
  return booking.package_name || pkgLabel(booking.package_code || booking.package_type || "scent_test");
}

export function todayDateInSingapore() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
