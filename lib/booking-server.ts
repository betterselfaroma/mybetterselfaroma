import "server-only";

import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPackageConfig } from "./booking-config";
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

async function assertNoConflict(
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
  if (error && !isMissingScheduledBookingRpc(error.message)) throw new Error(error.message);

  await assertNoConflict(supabase, input.startTime, input.endTime);

  const packageConfig = getPackageConfig(input.packageType);
  const token = randomBytes(24).toString("hex");
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

  if (fallbackError) throw new Error(fallbackError.message);
  return fallbackData as Booking;
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
  if (error && !isMissingUpdateBookingRpc(error.message)) throw new Error(error.message);

  await assertNoConflict(supabase, input.startTime, input.endTime, input.bookingId);

  const { data: existing, error: existingError } = await supabase
    .from("bookings")
    .select("completed_at")
    .eq("id", input.bookingId)
    .single();
  if (existingError) throw new Error(existingError.message);

  const packageConfig = getPackageConfig(input.packageType);
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
  if (input.status === "completed" && !existing?.completed_at) {
    patch.completed_at = new Date().toISOString();
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (fallbackError) throw new Error(fallbackError.message);
  return fallbackData as Booking;
}
