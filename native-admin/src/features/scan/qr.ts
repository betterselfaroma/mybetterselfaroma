import { BOOKING_SELECT, CUSTOMER_SELECT } from "../../lib/admin";
import { parseQrToken } from "../../lib/qr";
import { supabase } from "../../lib/supabase";
import type { Booking, Customer } from "../../lib/types";

type QrResolution = {
  customer_id?: string | null;
  booking_id?: string | null;
  source?: string | null;
};

function errorText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const err = error as { code?: string; message?: string; details?: string; hint?: string };
  return [err.code, err.message, err.details, err.hint].filter(Boolean).join(" ").toLowerCase();
}

function isMissingRpc(error: unknown) {
  const combined = errorText(error);
  return combined.includes("pgrst202")
    || combined.includes("pgrst203")
    || combined.includes("could not find the function")
    || combined.includes("schema cache");
}

function isMissingColumn(error: unknown, column: string) {
  const combined = errorText(error);
  return combined.includes(`column bookings.${column} does not exist`)
    || combined.includes(`could not find the '${column}' column`)
    || combined.includes(`'${column}' column of 'bookings'`);
}

async function resolveCustomerIdWithRpc(token: string) {
  const { data, error } = await supabase.rpc("resolve_member_qr_token", {
    raw_token: token,
  });

  if (error) {
    if (isMissingRpc(error)) return null;
    throw error;
  }

  const rows = Array.isArray(data) ? data : data ? [data] : [];
  const first = rows[0] as QrResolution | undefined;
  return first?.customer_id ?? null;
}

async function loadCustomerById(customerId: string) {
  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("id", customerId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Customer | null;
}

async function loadCustomerByMemberToken(token: string) {
  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("qr_token", token)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Customer | null;
}

async function loadBookingByQrToken(token: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("booking_qr_token", token)
    .maybeSingle();

  if (error) {
    if (isMissingColumn(error, "booking_qr_token")) return null;
    throw error;
  }

  return (data ?? null) as Booking | null;
}

async function loadBookingByLegacyNoteToken(token: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .ilike("notes", `%[booking_qr_token:${token}]%`)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Booking | null;
}

async function loadCustomerByBookingToken(token: string) {
  const booking = await loadBookingByQrToken(token) ?? await loadBookingByLegacyNoteToken(token);
  const customerId = booking?.customer_id ?? booking?.user_id ?? null;
  return customerId ? loadCustomerById(customerId) : null;
}

async function loadCustomerByCompletionToken(token: string) {
  const { data, error } = await supabase
    .from("booking_completion_tokens")
    .select("customer_id")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    if (isMissingRpc(error)) return null;
    throw error;
  }

  return data?.customer_id ? loadCustomerById(String(data.customer_id)) : null;
}

async function loadRecentBookings(customerId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .or(`customer_id.eq.${customerId},user_id.eq.${customerId}`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function fetchMemberByQr(rawValue: string) {
  const token = parseQrToken(rawValue);
  if (!token) throw new Error("Invalid QR code");

  const rpcCustomerId = await resolveCustomerIdWithRpc(token);
  const customer = rpcCustomerId
    ? await loadCustomerById(rpcCustomerId)
    : await loadCustomerByMemberToken(token)
      ?? await loadCustomerByBookingToken(token)
      ?? await loadCustomerByCompletionToken(token);

  if (!customer) {
    throw new Error("Member not found. Please make sure this is a member QR, or run the latest QR resolver SQL migration.");
  }

  const bookings = await loadRecentBookings(customer.id);

  return {
    token,
    customer,
    bookings,
  };
}
