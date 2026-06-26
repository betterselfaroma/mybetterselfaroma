"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractMemberQrToken } from "@/lib/member-qr";
import type { Booking, Customer } from "@/lib/supabase/types";

export type StaffScanBooking = {
  id: string;
  package_name: string | null;
  package_code: string | null;
  amount: number | null;
  status: string;
  booking_date: string | null;
  booking_time: string | null;
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

type PointTransactionType = "earn" | "redeem" | "adjust";

function pointTransactionType(rawType: PointTransactionType | undefined, points: number): PointTransactionType {
  if (rawType === "earn" || rawType === "redeem" || rawType === "adjust") return rawType;
  return points > 0 ? "earn" : "redeem";
}

async function writeAdminAuditLog(input: {
  adminUserId: string;
  action: string;
  targetTable: string;
  targetId: string;
  details?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_audit_logs").insert({
    admin_user_id: input.adminUserId,
    action: input.action,
    target_table: input.targetTable,
    target_id: input.targetId,
    details: input.details ?? null,
  });
  if (error) console.error("Write admin audit log failed:", error);
}

function bookingToStaffBooking(booking: Booking): StaffScanBooking {
  return {
    id: booking.id,
    package_name: booking.package_name,
    package_code: booking.package_code,
    amount: booking.amount ?? null,
    status: booking.status,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
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
    .select("id,user_id,package_name,package_code,amount,booking_date,booking_time,contact,notes,status,created_at")
    .eq("user_id", customer.id)
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
  const staffUser = await requireStaff();
  const token = extractMemberQrToken(rawValue);
  if (!token) return { ok: false, error: "二维码无效 · Invalid QR code" };

  try {
    const member = await loadStaffMemberByToken(token);
    if (!member) return { ok: false, error: "找不到会员 · Member not found" };
    await writeAdminAuditLog({
      adminUserId: staffUser.id,
      action: "member_scan",
      targetTable: "customers",
      targetId: member.id,
      details: { token },
    });
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
  transactionType?: PointTransactionType,
): Promise<StaffActionResult> {
  const staffUser = await requireStaff();
  const delta = Number(points);
  if (!customerId) return { ok: false, error: "Missing member ID" };
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 10000) {
    return { ok: false, error: "积分调整无效 · Invalid points adjustment" };
  }

  const supabase = createAdminClient();

  try {
    const type = pointTransactionType(transactionType, delta);
    const finalReason = reason?.trim()
      || (delta > 0 ? "Staff QR scan reward" : "Staff QR scan redeem");

    const { error } = await supabase.rpc("adjust_member_points", {
      target_customer_id: customerId,
      points_delta: delta,
      reason: finalReason,
      transaction_type: type,
      operator_user_id: staffUser.id,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/member");
    revalidatePath("/admin");
    revalidatePath("/admin/points");
    revalidatePath("/staff/scan");

    const member = await loadStaffMemberById(customerId);
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
  const staffUser = await requireStaff();
  if (!customerId || !bookingId) return { ok: false, error: "Missing booking" };

  const supabase = createAdminClient();

  try {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id,user_id,package_name,package_code,amount,booking_date,booking_time,contact,notes,status,created_at")
      .eq("id", bookingId)
      .eq("user_id", customerId)
      .single();
    if (bookingError) throw new Error(bookingError.message);

    const currentBooking = booking as Booking;
    if (currentBooking.status !== "completed") {
      const { error } = await supabase.rpc("admin_set_booking_status", {
        target_booking_id: bookingId,
        new_status: "completed",
        operator_user_id: staffUser.id,
      });
      if (error) throw new Error(error.message);
    }

    revalidatePath("/member");
    revalidatePath("/member/referral");
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/points");
    revalidatePath("/staff/scan");

    const member = await loadStaffMemberById(customerId);
    if (!member) return { ok: false, error: "找不到会员 · Member not found" };
    return { ok: true, member, message: "预约已确认 · Booking checked in" };
  } catch (error) {
    console.error("Staff booking check-in failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Check-in failed" };
  }
}
