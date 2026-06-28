import { ALLOWED_BOOKING_STATUSES, BOOKING_SELECT } from "../../lib/admin";
import { supabase } from "../../lib/supabase";
import type { Booking, BookingStatus } from "../../lib/types";

export async function fetchBookings(filters: { q?: string; date?: string; status?: string }) {
  let query = supabase.from("bookings").select(BOOKING_SELECT).order("booking_date", { ascending: true }).order("booking_time", { ascending: true }).limit(200);

  if (filters.date) query = query.eq("booking_date", filters.date);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.q?.trim()) query = query.ilike("contact", `%${filters.q.trim()}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function setBookingStatus(bookingId: string, status: BookingStatus, operatorUserId: string) {
  if (!bookingId || !ALLOWED_BOOKING_STATUSES.has(status)) throw new Error("Invalid booking status.");

  const { error } = await supabase.rpc("admin_set_booking_status", {
    target_booking_id: bookingId,
    new_status: status,
    operator_user_id: operatorUserId,
  });
  if (error) throw error;
}
