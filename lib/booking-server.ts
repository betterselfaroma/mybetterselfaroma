import "server-only";

import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  appendLegacyBookingQrToken,
  getBookingPackageFields,
  getPackageConfig,
  stripLegacyBookingQrToken,
} from "./booking-config";
import type { Booking, PackageType } from "./supabase/types";

type ScheduledBookingInput = {
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  packageType: PackageType;
  bookingDate: string;
  bookingTime: string;
  contact: string | null;
  startTime: string;
  endTime: string;
  source: "member_self_booking" | "admin_offline_booking" | "whatsapp_manual";
  notes: string | null;
  createdByAdminEmail: string | null;
  status: "confirmed" | "pending";
};

type UpdateScheduledBookingInput = {
  bookingId: string;
  packageType: PackageType;
  bookingDate: string;
  bookingTime: string;
  contact?: string | null;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
};

function isMissingBookingWriteColumn(message: string) {
  const normalized = message.toLowerCase();
  return [
    "amount",
    "package_name",
    "package_code",
    "booking_time",
    "contact",
    "user_id",
    "customer_name",
    "customer_phone",
    "customer_email",
    "source",
    "booking_qr_token",
    "booking_qr_created_at",
    "created_by_admin_email",
    "updated_at",
  ].some((column) => normalized.includes("bookings." + column)
    || normalized.includes("column bookings." + column + " does not exist")
    || normalized.includes("could not find the '" + column + "' column")
    || normalized.includes("'" + column + "' column of 'bookings'"));
}

function legacyStatus(status: string) {
  if (status === "booked") return "pending";
  if (status === "no_show") return "cancelled";
  return status;
}

function timeToMinutes(time: string | null | undefined) {
  const [hour, minute] = (time ?? "").split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function shapeLegacyBooking(row: Record<string, unknown>, input: ScheduledBookingInput | UpdateScheduledBookingInput, token?: string): Booking {
  const packageType = input.packageType;
  const packageFields = getBookingPackageFields(packageType);
  return {
    ...row,
    user_id: "customerId" in input ? input.customerId : null,
    package_name: packageFields.package_name,
    package_code: packageFields.package_code,
    package_type: packageType,
    amount: packageFields.amount,
    status: (input.status as Booking["status"]),
    booking_date: input.bookingDate,
    booking_time: input.bookingTime,
    contact: "contact" in input ? (input.contact ?? null) : null,
    source: "source" in input ? input.source : ((row.source as string | undefined) ?? "member_self_booking"),
    booking_qr_token: token ?? (row.booking_qr_token as string | null | undefined) ?? "",
    booking_qr_created_at: (row.booking_qr_created_at as string | null | undefined) ?? new Date().toISOString(),
    notes: stripLegacyBookingQrToken(row.notes as string | null | undefined) || null,
    updated_at: (row.updated_at as string | undefined) ?? new Date().toISOString(),
  } as Booking;
}

async function assertNoConflict(
  supabase: SupabaseClient,
  input: ScheduledBookingInput | UpdateScheduledBookingInput,
  ignoreBookingId?: string,
) {
  let query = supabase
    .from("bookings")
    .select("id,package_code,status,booking_date,booking_time")
    .eq("booking_date", input.bookingDate)
    .in("status", ["pending", "confirmed"]);

  if (ignoreBookingId) query = query.neq("id", ignoreBookingId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const newStart = timeToMinutes(input.bookingTime);
  if (newStart === null) throw new Error("invalid_time");
  const newEnd = newStart + getPackageConfig(input.packageType).durationMinutes;

  const hasConflict = (data ?? []).some((booking) => {
    const existingStart = timeToMinutes(booking.booking_time);
    if (existingStart === null) return false;
    const existingPackage = booking.package_code ?? "scent_test";
    const existingEnd = existingStart + getPackageConfig(existingPackage).durationMinutes;
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (hasConflict) throw new Error("booking_conflict");
}

export async function createScheduledBooking(
  supabase: SupabaseClient,
  input: ScheduledBookingInput,
) {
  await assertNoConflict(supabase, input);

  const packageFields = getBookingPackageFields(input.packageType);
  const token = randomBytes(24).toString("hex");
  const notesWithToken = appendLegacyBookingQrToken(input.notes, token);
  const now = new Date().toISOString();
  const { data: fullData, error: fullError } = await supabase
    .from("bookings")
    .insert({
      customer_id: input.customerId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      package_type: input.packageType,
      package_name: packageFields.package_name,
      package_code: packageFields.package_code,
      amount: packageFields.amount,
      status: input.status,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      contact: input.contact ?? input.customerPhone,
      user_id: input.customerId,
      source: input.source,
      booking_qr_token: token,
      booking_qr_created_at: now,
      notes: input.notes,
      created_by_admin_email: input.createdByAdminEmail,
      updated_at: now,
    })
    .select("*")
    .single();

  if (!fullError) return fullData as Booking;
  if (!isMissingBookingWriteColumn(fullError.message)) throw new Error(fullError.message);

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("bookings")
    .insert({
      user_id: input.customerId,
      package_name: packageFields.package_name,
      package_code: packageFields.package_code,
      amount: packageFields.amount,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      contact: input.contact ?? input.customerPhone,
      notes: input.notes,
      status: input.status,
    })
    .select("*")
    .single();

  if (!fallbackError) return shapeLegacyBooking(fallbackData as Record<string, unknown>, input, token);
  if (!isMissingBookingWriteColumn(fallbackError.message)) throw new Error(fallbackError.message);

  const { data: legacyData, error: legacyError } = await supabase
    .from("bookings")
    .insert({
      status: legacyStatus(input.status),
      package_name: packageFields.package_name,
      package_code: packageFields.package_code,
      amount: packageFields.amount,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      contact: input.contact ?? input.customerPhone,
      notes: notesWithToken,
    })
    .select("*")
    .single();

  if (legacyError) throw new Error(legacyError.message);
  return shapeLegacyBooking(legacyData as Record<string, unknown>, input, token);
}

export async function updateScheduledBooking(
  supabase: SupabaseClient,
  input: UpdateScheduledBookingInput,
) {
  await assertNoConflict(supabase, input, input.bookingId);

  const { data: existing, error: existingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", input.bookingId)
    .single();
  if (existingError) throw new Error(existingError.message);

  const packageFields = getBookingPackageFields(input.packageType);
  const existingRow = existing as Record<string, unknown>;
  const token = (existingRow.booking_qr_token as string | undefined) || randomBytes(24).toString("hex");
  const notesWithToken = appendLegacyBookingQrToken(input.notes, token);
  const fullPatch: Record<string, unknown> = {
    package_type: input.packageType,
    package_name: packageFields.package_name,
    package_code: packageFields.package_code,
    amount: packageFields.amount,
    status: input.status,
    booking_date: input.bookingDate,
    booking_time: input.bookingTime,
    contact: input.contact ?? null,
    notes: input.notes,
    updated_at: new Date().toISOString(),
  };
  if (input.status === "completed" && !existingRow.completed_at) {
    fullPatch.completed_at = new Date().toISOString();
  }

  const { data: fullData, error: fullError } = await supabase
    .from("bookings")
    .update(fullPatch)
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (!fullError) return fullData as Booking;
  if (!isMissingBookingWriteColumn(fullError.message)) throw new Error(fullError.message);

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("bookings")
    .update({
      package_name: packageFields.package_name,
      package_code: packageFields.package_code,
      amount: packageFields.amount,
      status: input.status,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      contact: input.contact ?? null,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (!fallbackError) return shapeLegacyBooking(fallbackData as Record<string, unknown>, input, token);
  if (!isMissingBookingWriteColumn(fallbackError.message)) throw new Error(fallbackError.message);

  const { data: legacyData, error: legacyError } = await supabase
    .from("bookings")
    .update({
      status: legacyStatus(input.status),
      package_name: packageFields.package_name,
      package_code: packageFields.package_code,
      amount: packageFields.amount,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      notes: notesWithToken,
    })
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (legacyError) throw new Error(legacyError.message);
  return shapeLegacyBooking(legacyData as Record<string, unknown>, input, token);
}
