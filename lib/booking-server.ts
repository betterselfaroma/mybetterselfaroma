import "server-only";

import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  appendLegacyBookingQrToken,
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
  startTime: string;
  endTime: string;
  source: "member_self_booking" | "admin_offline_booking" | "whatsapp_manual";
  notes: string | null;
  createdByAdminEmail: string | null;
  status: "booked" | "confirmed" | "pending";
};

type UpdateScheduledBookingInput = {
  bookingId: string;
  packageType: PackageType;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
};

function isMissingScheduledBookingRpc(message: string) {
  return message.includes("Could not find the function public.create_scheduled_booking")
    || message.includes("PGRST202")
    || message.includes("schema cache");
}

function isMissingUpdateBookingRpc(message: string) {
  return message.includes("Could not find the function public.admin_update_scheduled_booking")
    || message.includes("PGRST202")
    || message.includes("schema cache");
}

function isMissingScheduleColumns(message: string) {
  return message.includes("bookings.start_time")
    || message.includes("bookings.end_time")
    || message.includes("column bookings.start_time does not exist")
    || message.includes("column bookings.end_time does not exist")
    || message.includes("Could not find the 'start_time' column")
    || message.includes("Could not find the 'end_time' column")
    || message.includes("start_time' column of 'bookings'")
    || message.includes("end_time' column of 'bookings'");
}

function legacyStatus(status: string) {
  if (status === "booked") return "pending";
  if (status === "no_show") return "cancelled";
  return status;
}

function shapeLegacyBooking(row: Record<string, unknown>, input: ScheduledBookingInput | UpdateScheduledBookingInput, token?: string): Booking {
  const packageType = input.packageType;
  const packageConfig = getPackageConfig(packageType);
  return {
    ...row,
    package_type: packageType,
    amount: packageConfig.amount,
    status: (input.status as Booking["status"]),
    booking_date: input.startTime,
    start_time: input.startTime,
    end_time: input.endTime,
    source: "source" in input ? input.source : ((row.source as string | undefined) ?? "member_self_booking"),
    booking_qr_token: token ?? (row.booking_qr_token as string | null | undefined) ?? "",
    booking_qr_created_at: (row.booking_qr_created_at as string | null | undefined) ?? new Date().toISOString(),
    notes: stripLegacyBookingQrToken(row.notes as string | null | undefined) || null,
    updated_at: (row.updated_at as string | undefined) ?? new Date().toISOString(),
  } as Booking;
}

async function assertNoConflictWithScheduleColumns(
  supabase: SupabaseClient,
  startTime: string,
  endTime: string,
  ignoreBookingId?: string,
) {
  let query = supabase
    .from("bookings")
    .select("id")
    .in("status", ["booked", "confirmed", "completed"])
    .lt("start_time", endTime)
    .gt("end_time", startTime)
    .limit(1);

  if (ignoreBookingId) query = query.neq("id", ignoreBookingId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (data && data.length > 0) throw new Error("booking_conflict");
}

async function assertNoConflictLegacy(
  supabase: SupabaseClient,
  startTime: string,
  endTime: string,
  ignoreBookingId?: string,
) {
  let query = supabase
    .from("bookings")
    .select("id,package_type,status,booking_date")
    .in("status", ["pending", "booked", "confirmed", "completed"]);

  if (ignoreBookingId) query = query.neq("id", ignoreBookingId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);
  const hasConflict = (data ?? []).some((booking) => {
    if (!booking.booking_date) return false;
    const existingStart = new Date(booking.booking_date);
    const existingEnd = new Date(existingStart.getTime() + getPackageConfig(booking.package_type).durationMinutes * 60 * 1000);
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (hasConflict) throw new Error("booking_conflict");
}

async function assertNoConflict(
  supabase: SupabaseClient,
  startTime: string,
  endTime: string,
  ignoreBookingId?: string,
) {
  try {
    await assertNoConflictWithScheduleColumns(supabase, startTime, endTime, ignoreBookingId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!isMissingScheduleColumns(message)) throw error;
    await assertNoConflictLegacy(supabase, startTime, endTime, ignoreBookingId);
  }
}

export async function createScheduledBooking(
  supabase: SupabaseClient,
  input: ScheduledBookingInput,
) {
  const rpcArgs = {
    p_created_by_admin_email: input.createdByAdminEmail,
    p_customer_email: input.customerEmail,
    p_customer_id: input.customerId,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_end_time: input.endTime,
    p_notes: input.notes,
    p_package_type: input.packageType,
    p_source: input.source,
    p_start_time: input.startTime,
    p_status: input.status,
  };

  const { data, error } = await supabase.rpc("create_scheduled_booking", rpcArgs);
  if (!error && data) return data as Booking;
  const rpcMessage = error?.message ?? "";
  if (error && !isMissingScheduledBookingRpc(rpcMessage) && !isMissingScheduleColumns(rpcMessage)) {
    throw new Error(error.message);
  }

  await assertNoConflict(supabase, input.startTime, input.endTime);

  const packageConfig = getPackageConfig(input.packageType);
  const token = randomBytes(24).toString("hex");
  const notesWithToken = appendLegacyBookingQrToken(input.notes, token);
  const { data: fallbackData, error: fallbackError } = await supabase
    .from("bookings")
    .insert({
      customer_id: input.customerId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      package_type: input.packageType,
      amount: packageConfig.amount,
      status: input.status,
      booking_date: input.startTime,
      start_time: input.startTime,
      end_time: input.endTime,
      source: input.source,
      booking_qr_token: token,
      booking_qr_created_at: new Date().toISOString(),
      notes: input.notes,
      created_by_admin_email: input.createdByAdminEmail,
    })
    .select("*")
    .single();

  if (!fallbackError) return fallbackData as Booking;
  if (!isMissingScheduleColumns(fallbackError.message)) throw new Error(fallbackError.message);

  const { data: legacyData, error: legacyError } = await supabase
    .from("bookings")
    .insert({
      customer_id: input.customerId,
      package_type: input.packageType,
      status: legacyStatus(input.status),
      booking_date: input.startTime,
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
  const rpcArgs = {
    p_booking_id: input.bookingId,
    p_end_time: input.endTime,
    p_notes: input.notes,
    p_package_type: input.packageType,
    p_start_time: input.startTime,
    p_status: input.status,
  };

  const { data, error } = await supabase.rpc("admin_update_scheduled_booking", rpcArgs);
  if (!error && data) return data as Booking;
  const rpcMessage = error?.message ?? "";
  if (error && !isMissingUpdateBookingRpc(rpcMessage) && !isMissingScheduleColumns(rpcMessage)) {
    throw new Error(error.message);
  }

  await assertNoConflict(supabase, input.startTime, input.endTime, input.bookingId);

  const { data: existing, error: existingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", input.bookingId)
    .single();
  if (existingError) throw new Error(existingError.message);

  const packageConfig = getPackageConfig(input.packageType);
  const existingRow = existing as Record<string, unknown>;
  const token = (existingRow.booking_qr_token as string | undefined) || randomBytes(24).toString("hex");
  const notesWithToken = appendLegacyBookingQrToken(input.notes, token);
  const patch: Record<string, unknown> = {
    package_type: input.packageType,
    amount: packageConfig.amount,
    status: input.status,
    booking_date: input.startTime,
    start_time: input.startTime,
    end_time: input.endTime,
    notes: input.notes,
    updated_at: new Date().toISOString(),
  };
  if (input.status === "completed" && !existingRow.completed_at) {
    patch.completed_at = new Date().toISOString();
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (!fallbackError) return fallbackData as Booking;
  if (!isMissingScheduleColumns(fallbackError.message)) throw new Error(fallbackError.message);

  const { data: legacyData, error: legacyError } = await supabase
    .from("bookings")
    .update({
      package_type: input.packageType,
      status: legacyStatus(input.status),
      booking_date: input.startTime,
      notes: notesWithToken,
    })
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (legacyError) throw new Error(legacyError.message);
  return shapeLegacyBooking(legacyData as Record<string, unknown>, input, token);
}
