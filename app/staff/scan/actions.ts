"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractMemberQrToken } from "@/lib/member-qr";
import { getBookingEnd, getBookingStart } from "@/lib/booking-config";
import type { Booking, Customer, PackageType } from "@/lib/supabase/types";

const EXPERIENCE_POINTS: Record<PackageType, number> = {
  scent_test: 20,
  custom_blend: 60,
};

export type StaffScanBooking = {
  id: string;
  package_type: string;
  amount: number | null;
  status: string;
  booking_date: string | null;
  booking_time: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  created_at: string;
};

export type StaffScanMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  referral_code: string;
  points_balance: number;
  is_admin: boolean;
  created_at: string;
  qr_token: string | null;
  bookings: StaffScanBooking[];
};

type StaffActionResult =
  | { ok: true; member: StaffScanMember; message?: string }
  | { ok: false; error: string };

function bookingToStaffBooking(booking: Booking): StaffScanBooking {
  return {
    id: booking.id,
    package_type: booking.package_type,
    amount: booking.amount ?? null,
    status: booking.status,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    start_time: getBookingStart(booking),
    end_time: getBookingEnd(booking),
    notes: booking.notes,
    created_at: booking.created_at,
  };
}

async function loadStaffMemberById(customerId: string): Promise<StaffScanMember | null> {
  const supabase = createAdminClient();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();

  if (customerError) throw new Error(customerError.message);
  if (!customer) return null;

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(8);

  if (bookingsError) throw new Error(bookingsError.message);

  const c = customer as Customer;
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    referral_code: c.referral_code,
    points_balance: c.points_balance,
    is_admin: c.is_admin,
    created_at: c.created_at,
    qr_token: c.qr_token,
    bookings: ((bookings ?? []) as Booking[]).map(bookingToStaffBooking),
  };
}

async function loadStaffMemberByToken(token: string): Promise<StaffScanMember | null> {
  const supabase = createAdminClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .select("id")
    .eq("qr_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!customer?.id) return null;
  return loadStaffMemberById(customer.id);
}

export async function lookupMemberByQrToken(rawValue: string): Promise<StaffActionResult> {
  await requireStaff();
  const token = extractMemberQrToken(rawValue);
  if (!token) return { ok: false, error: "二维码无效 · Invalid QR code" };

  try {
    const member = await loadStaffMemberByToken(token);
    if (!member) return { ok: false, error: "找不到会员 · Member not found" };
    return { ok: true, member };
  } catch (error) {
    console.error("Staff QR lookup failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lookup failed" };
  }
}

export async function adjustScannedMemberPoints(
  customerId: string,
  points: number,
  reason?: string,
): Promise<StaffActionResult> {
  await requireStaff();
  const delta = Number(points);
  if (!customerId) return { ok: false, error: "Missing member ID" };
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 10000) {
    return { ok: false, error: "积分调整无效 · Invalid points adjustment" };
  }

  const supabase = createAdminClient();

  try {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError) throw new Error(customerError.message);
    const c = customer as Customer;
    const nextBalance = c.points_balance + delta;
    if (nextBalance < 0) return { ok: false, error: "积分不足，无法扣除 · Not enough points" };

    const type = delta > 0 ? "earn" : "redeem";
    const finalReason = reason?.trim()
      || (delta > 0 ? "Staff QR scan reward" : "Staff QR scan redeem");

    const { error: transactionError } = await supabase
      .from("points_transactions")
      .insert({
        user_id: c.auth_user_id ?? c.id,
        points: delta,
        type,
        reason: finalReason,
      });
    if (transactionError) throw new Error(transactionError.message);

    const { error: ledgerError } = await supabase
      .from("points_ledger")
      .insert({
        customer_id: c.id,
        points: delta,
        type: "manual_adjustment",
        description: finalReason,
      });
    if (ledgerError) throw new Error(ledgerError.message);

    const { error: updateError } = await supabase
      .from("customers")
      .update({ points_balance: nextBalance })
      .eq("id", c.id);
    if (updateError) throw new Error(updateError.message);

    revalidatePath("/member");
    revalidatePath("/admin");
    revalidatePath("/admin/points");
    revalidatePath("/staff/scan");

    const member = await loadStaffMemberById(c.id);
    if (!member) return { ok: false, error: "找不到会员 · Member not found" };
    return { ok: true, member, message: "积分已更新 · Points updated" };
  } catch (error) {
    console.error("Staff points adjustment failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Points update failed" };
  }
}

export async function checkInScannedBooking(
  customerId: string,
  bookingId: string,
): Promise<StaffActionResult> {
  await requireStaff();
  if (!customerId || !bookingId) return { ok: false, error: "Missing booking" };

  const supabase = createAdminClient();

  try {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    if (customerError) throw new Error(customerError.message);
    const c = customer as Customer;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("customer_id", customerId)
      .single();
    if (bookingError) throw new Error(bookingError.message);

    const currentBooking = booking as Booking;
    if (currentBooking.status !== "completed") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "completed",
          completed_at: currentBooking.completed_at ?? new Date().toISOString(),
        })
        .eq("id", bookingId);
      if (updateError) throw new Error(updateError.message);

      const points = EXPERIENCE_POINTS[currentBooking.package_type] ?? 0;
      if (points > 0) {
        const { error: transactionError } = await supabase
          .from("points_transactions")
          .insert({
            user_id: c.auth_user_id ?? c.id,
            points,
            type: "earn",
            reason: "Staff QR scan check-in",
          });
        if (transactionError) throw new Error(transactionError.message);
      }
    }

    revalidatePath("/member");
    revalidatePath("/member/referral");
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/points");
    revalidatePath("/staff/scan");

    const member = await loadStaffMemberById(c.id);
    if (!member) return { ok: false, error: "找不到会员 · Member not found" };
    return { ok: true, member, message: "预约已确认 · Booking checked in" };
  } catch (error) {
    console.error("Staff booking check-in failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Check-in failed" };
  }
}
