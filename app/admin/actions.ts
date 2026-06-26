"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBookingSlot } from "@/lib/booking-config";
import { createScheduledBooking, updateScheduledBooking } from "@/lib/booking-server";
import type { PackageType } from "@/lib/supabase/types";

function refreshAdmin() {
  for (const p of [
    "/admin",
    "/admin/dashboard",
    "/admin/bookings",
    "/admin/members",
    "/admin/referral-rewards",
    "/admin/points",
    "/admin/redemptions",
    "/admin/customers",
    "/booking-confirmation",
  ]) {
    revalidatePath(p);
  }
}

const COMPLETION_PACKAGE_AMOUNT: Record<PackageType, number> = {
  scent_test: 60,
  custom_blend: 150,
};

const ALLOWED_BOOKING_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);

function adminBookingsUrl(date: string, error?: string) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (error) params.set("error", error);
  return "/admin/bookings" + (params.toString() ? "?" + params.toString() : "");
}

function bookingErrorCode(message: string) {
  if (message.includes("booking_conflict")) return "conflict";
  if (message.includes("invalid_time") || message.includes("outside_business_hours")) return "invalid_time";
  return "failed";
}

function safeReturnTo(rawValue: FormDataEntryValue | null, fallback: string) {
  const raw = String(rawValue ?? "").trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function withActionResult(path: string, type: "notice" | "error", code: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(type, code);
  return pathname + "?" + params.toString();
}

function pointTransactionType(rawType: FormDataEntryValue | null, points: number): "earn" | "redeem" | "adjust" {
  const type = String(rawType ?? "");
  if (type === "earn" || type === "redeem" || type === "adjust") return type;
  return points > 0 ? "earn" : "redeem";
}

export async function createBookingCompletionToken(formData: FormData) {
  const adminUser = await requireAdmin();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const packageType = String(formData.get("package_type") ?? "") as PackageType;
  const rawHours = Number(formData.get("expires_hours") ?? 24);
  const expiresHours = Number.isFinite(rawHours) ? Math.min(Math.max(rawHours, 1), 72) : 24;

  if (!customerId || !(packageType in COMPLETION_PACKAGE_AMOUNT)) {
    redirect("/admin?qr_error=invalid_input");
  }

  const supabase = createAdminClient();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000).toISOString();

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .single();

  if (!customer) redirect("/admin?qr_error=customer_not_found");

  const { data, error } = await supabase
    .from("booking_completion_tokens")
    .insert({
      token,
      customer_id: customerId,
      package_type: packageType,
      amount: COMPLETION_PACKAGE_AMOUNT[packageType],
      status: "active",
      expires_at: expiresAt,
      created_by_admin_email: adminUser.email ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Create booking completion QR failed:", error);
    redirect("/admin?qr_error=create_failed");
  }

  revalidatePath("/admin");
  redirect("/admin?qr=" + data.id);
}

export async function createAdminBooking(formData: FormData) {
  const adminUser = await requireAdmin();
  const supabase = createAdminClient();
  const packageType = String(formData.get("package_type") ?? "") as PackageType;
  const bookingDate = String(formData.get("booking_date") ?? "");
  const bookingTime = String(formData.get("booking_time") ?? "");
  const selectedCustomerId = String(formData.get("customer_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  let slot: { start: Date; end: Date };
  try {
    slot = buildBookingSlot(bookingDate, bookingTime, packageType);
  } catch (error) {
    redirect(adminBookingsUrl(bookingDate, bookingErrorCode(error instanceof Error ? error.message : "invalid_time")));
  }

  let customerId: string | null = selectedCustomerId || null;
  let customerPhone = String(formData.get("customer_phone") ?? "").trim() || null;

  if (customerId) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id,phone")
      .eq("id", customerId)
      .single();
    if (!customer) redirect(adminBookingsUrl(bookingDate, "customer_not_found"));
    customerPhone = customer.phone;
  }

  try {
    await createScheduledBooking(supabase, {
      customerId,
      customerPhone,
      packageType,
      bookingDate,
      bookingTime,
      contact: customerPhone,
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      source: "admin_offline_booking",
      notes,
      createdByAdminEmail: adminUser.email ?? null,
      status: "confirmed",
    });
  } catch (error) {
    redirect(adminBookingsUrl(bookingDate, bookingErrorCode(error instanceof Error ? error.message : "failed")));
  }

  refreshAdmin();
  redirect(adminBookingsUrl(bookingDate, "created"));
}

export async function updateAdminBookingSchedule(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("id") ?? "");
  const packageType = String(formData.get("package_type") ?? "") as PackageType;
  const bookingDate = String(formData.get("booking_date") ?? "");
  const bookingTime = String(formData.get("booking_time") ?? "");
  const status = String(formData.get("status") ?? "confirmed");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  let slot: { start: Date; end: Date };
  try {
    slot = buildBookingSlot(bookingDate, bookingTime, packageType);
  } catch (error) {
    redirect(adminBookingsUrl(bookingDate, bookingErrorCode(error instanceof Error ? error.message : "invalid_time")));
  }

  const supabase = createAdminClient();
  try {
    await updateScheduledBooking(supabase, {
      bookingId,
      packageType,
      bookingDate,
      bookingTime,
      contact: null,
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      status,
      notes,
    });
  } catch (error) {
    redirect(adminBookingsUrl(bookingDate, bookingErrorCode(error instanceof Error ? error.message : "failed")));
  }

  refreshAdmin();
  redirect(adminBookingsUrl(bookingDate, "updated"));
}

/** Change a booking status. Setting it to completed fires the DB trigger that
 *  awards purchase points + creates the referral reward (idempotent). */
export async function setBookingStatus(formData: FormData) {
  const adminUser = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/bookings");
  if (!id || !ALLOWED_BOOKING_STATUSES.has(status)) {
    redirect(withActionResult(returnTo, "error", "invalid_status"));
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("admin_set_booking_status", {
    target_booking_id: id,
    new_status: status,
    operator_user_id: adminUser.id,
  });

  if (error) {
    console.error("Admin booking status update failed:", error);
    redirect(withActionResult(returnTo, "error", error.message));
  }

  refreshAdmin();
  redirect(withActionResult(returnTo, "notice", "booking_updated"));
}

export async function approveReward(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("referral_rewards").update({ status: "approved" }).eq("id", id);
  refreshAdmin();
}

export async function issueReward(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const pin = String(formData.get("tng_pin_code") ?? "").trim();
  if (!pin) return;
  const supabase = createAdminClient();
  const { data: reward } = await supabase
    .from("referral_rewards")
    .update({ status: "issued", tng_pin_code: pin, issued_at: new Date().toISOString() })
    .eq("id", id)
    .select("referred_customer_id")
    .single();
  if (reward) {
    await supabase
      .from("referrals")
      .update({ status: "rewarded" })
      .eq("referred_customer_id", reward.referred_customer_id);
  }
  refreshAdmin();
}

export async function cancelReward(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("referral_rewards").update({ status: "cancelled" }).eq("id", id);
  refreshAdmin();
}

/** Manual points adjustment - always written to the ledger, then balance synced. */
export async function adjustPoints(formData: FormData) {
  const adminUser = await requireAdmin();
  const customerId = String(formData.get("customer_id"));
  const points = parseInt(String(formData.get("points")), 10);
  const transactionType = pointTransactionType(formData.get("transaction_type"), points);
  const description = String(formData.get("description") ?? "").trim() || "Manual adjustment";
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/points");
  if (!customerId || !Number.isFinite(points) || points === 0) {
    redirect(withActionResult(returnTo, "error", "invalid_points"));
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("adjust_member_points", {
    target_customer_id: customerId,
    points_delta: points,
    reason: description,
    transaction_type: transactionType,
    operator_user_id: adminUser.id,
  });

  if (error) {
    console.error("Admin points adjustment failed:", error);
    redirect(withActionResult(returnTo, "error", error.message));
  }

  refreshAdmin();
  redirect(withActionResult(returnTo, "notice", "points_updated"));
}

/** Move a redemption through its lifecycle. Cancelling refunds the points. */
export async function setRedemptionStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const supabase = createAdminClient();

  const { data: redemption } = await supabase
    .from("reward_redemptions")
    .select("*")
    .eq("id", id)
    .single();
  if (!redemption) return;

  const patch: Record<string, unknown> = { status };
  if (status === "completed") patch.completed_at = new Date().toISOString();
  await supabase.from("reward_redemptions").update(patch).eq("id", id);

  if (status === "cancelled" && redemption.status !== "cancelled") {
    await supabase.from("points_ledger").insert({
      customer_id: redemption.customer_id,
      points: redemption.points_used,
      type: "manual_adjustment",
      description: "Redemption cancelled - points refunded",
    });
    const { data: c } = await supabase.from("customers").select("points_balance").eq("id", redemption.customer_id).single();
    if (c) {
      await supabase
        .from("customers")
        .update({
          points_balance: c.points_balance + redemption.points_used,
          points: c.points_balance + redemption.points_used,
        })
        .eq("id", redemption.customer_id);
    }
  }
  refreshAdmin();
}
