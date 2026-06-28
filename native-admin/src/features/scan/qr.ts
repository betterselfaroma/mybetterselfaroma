import { BOOKING_SELECT, CUSTOMER_SELECT } from "../../lib/admin";
import { parseQrToken } from "../../lib/qr";
import { supabase } from "../../lib/supabase";
import type { Booking, Customer } from "../../lib/types";

export async function fetchMemberByQr(rawValue: string) {
  const token = parseQrToken(rawValue);
  if (!token) throw new Error("二维码无效");

  const { data: customer, error } = await supabase.from("customers").select(CUSTOMER_SELECT).eq("qr_token", token).maybeSingle();
  if (error) throw error;
  if (!customer) throw new Error("找不到会员");

  const { data: bookings, error: bookingsError } = await supabase.from("bookings").select(BOOKING_SELECT).eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(5);
  if (bookingsError) throw bookingsError;

  return {
    token,
    customer: customer as Customer,
    bookings: (bookings ?? []) as Booking[],
  };
}
