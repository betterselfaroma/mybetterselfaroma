"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBookingSlot } from "@/lib/booking-config";
import { createScheduledBooking, updateScheduledBooking } from "@/lib/booking-server";
import { getErrorMessage } from "@/lib/get-error-message";
import { ensureCustomerQrToken } from "@/lib/member-qr";
import type { PackageType } from "@/lib/supabase/types";

function refreshAdmin() {
  for (const p of [
    "/admin",
    "/admin/dashboard",
    "/admin/bookings",
    "/admin/members",
    "/admin/referral-rewards",
    "/admin/rewards",
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
const ALLOWED_CUSTOMER_ROLES = new Set(["member", "staff", "admin"]);
const ALLOWED_REDEMPTION_STATUSES = new Set(["pending", "approved", "completed", "cancelled"]);
const REWARD_IMAGE_BUCKET = "reward-products";
const REWARD_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_REWARD_IMAGE_BYTES = 5 * 1024 * 1024;

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

function adminRewardsUrl(error?: string, notice?: string) {
  const params = new URLSearchParams();
  if (error) params.set("error", error);
  if (notice) params.set("notice", notice);
  return "/admin/rewards" + (params.toString() ? "?" + params.toString() : "");
}

function numberFromForm(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

async function uploadRewardProductImage(supabase: ReturnType<typeof createAdminClient>, image: File) {
  if (!REWARD_IMAGE_TYPES.has(image.type)) {
    throw new Error("Only JPG, PNG or WebP reward images are allowed.");
  }
  if (image.size > MAX_REWARD_IMAGE_BYTES) {
    throw new Error("Reward image must be 5MB or smaller.");
  }

  const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
  const buffer = Buffer.from(await image.arrayBuffer());
  const { error } = await supabase.storage
    .from(REWARD_IMAGE_BUCKET)
    .upload(path, buffer, {
      contentType: image.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(REWARD_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
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

export async function setCustomerRole(formData: FormData) {
  const adminUser = await requireAdmin();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim().toLowerCase();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/members");

  if (!customerId || !ALLOWED_CUSTOMER_ROLES.has(role)) {
    redirect(withActionResult(returnTo, "error", "invalid_role"));
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .update({
      role,
      is_admin: role === "admin",
    })
    .eq("id", customerId);

  if (error) {
    console.error("Admin customer role update failed:", error);
    redirect(withActionResult(returnTo, "error", error.message));
  }

  await supabase.from("admin_audit_logs").insert({
    admin_user_id: adminUser.id,
    action: "customer_role_update",
    target_table: "customers",
    target_id: customerId,
    details: { role },
  });

  refreshAdmin();
  redirect(withActionResult(returnTo, "notice", "role_updated"));
}

export async function generateCustomerQrToken(formData: FormData) {
  const adminUser = await requireAdmin();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/members");

  if (!customerId) {
    redirect(withActionResult(returnTo, "error", "invalid_customer"));
  }

  const supabase = createAdminClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .select("id,qr_token")
    .eq("id", customerId)
    .single();

  if (error || !customer) {
    console.error("Load customer for QR token failed:", error);
    redirect(withActionResult(returnTo, "error", error?.message ?? "customer_not_found"));
  }

  try {
    const token = await ensureCustomerQrToken(customer.id, customer.qr_token);
    await supabase.from("admin_audit_logs").insert({
      admin_user_id: adminUser.id,
      action: "generate_customer_qr_token",
      target_table: "customers",
      target_id: customer.id,
      details: { generated: Boolean(token) },
    });
  } catch (error) {
    console.error("Generate customer QR token failed:", error);
    redirect(withActionResult(returnTo, "error", getErrorMessage(error)));
  }

  refreshAdmin();
  redirect(withActionResult(returnTo, "notice", "qr_token_generated"));
}

export async function saveRewardProduct(formData: FormData) {
  const adminUser = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const existingImageUrl = String(formData.get("existing_image_url") ?? "").trim();
  const manualImageUrl = String(formData.get("image_url") ?? "").trim();
  const pointsCost = numberFromForm(formData.get("points_cost"));
  const stock = numberFromForm(formData.get("stock"));
  const sortOrder = numberFromForm(formData.get("sort_order"));
  const active = formData.get("active") === "on" || formData.get("active") === "true";
  const image = formData.get("image");
  let errorMessage = "";

  try {
    if (!name) throw new Error("Product name is required.");
    if (!Number.isFinite(pointsCost) || pointsCost <= 0) throw new Error("Points cost must be greater than 0.");
    if (!Number.isFinite(stock) || stock < 0) throw new Error("Stock cannot be negative.");

    const supabase = createAdminClient();
    let imageUrl = manualImageUrl || existingImageUrl || null;

    if (isUploadFile(image)) {
      imageUrl = await uploadRewardProductImage(supabase, image);
    }

    const payload = {
      name,
      description,
      image_url: imageUrl,
      points_cost: pointsCost,
      stock,
      active,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };

    const result = id
      ? await supabase.from("reward_products").update(payload).eq("id", id)
      : await supabase.from("reward_products").insert({
          ...payload,
          created_by: adminUser.id,
        });

    if (result.error) throw new Error(result.error.message);
  } catch (error) {
    console.error("Save reward product failed:", error);
    errorMessage = getErrorMessage(error);
  }

  if (errorMessage) redirect(adminRewardsUrl(errorMessage));

  refreshAdmin();
  revalidatePath("/admin/rewards");
  revalidatePath("/member/rewards");
  redirect(adminRewardsUrl(undefined, "product_saved"));
}

export async function setRewardProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) redirect(adminRewardsUrl("invalid_product"));

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reward_products")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Toggle reward product failed:", error);
    redirect(adminRewardsUrl(error.message));
  }

  refreshAdmin();
  revalidatePath("/admin/rewards");
  revalidatePath("/member/rewards");
  redirect(adminRewardsUrl(undefined, active ? "product_active" : "product_inactive"));
}

/** Move a redemption through its lifecycle. Cancelling refunds the points. */
export async function setRedemptionStatus(formData: FormData) {
  const adminUser = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/redemptions");
  if (!id || !ALLOWED_REDEMPTION_STATUSES.has(status)) {
    redirect(withActionResult(returnTo, "error", "invalid_redemption_status"));
  }
  const supabase = createAdminClient();

  const { data: redemption } = await supabase
    .from("reward_redemptions")
    .select("*")
    .eq("id", id)
    .single();
  if (!redemption) redirect(withActionResult(returnTo, "error", "redemption_not_found"));

  const patch: Record<string, unknown> = { status };
  if (status === "completed") patch.completed_at = new Date().toISOString();
  const { error: updateError } = await supabase.from("reward_redemptions").update(patch).eq("id", id);
  if (updateError) {
    console.error("Admin redemption status update failed:", updateError);
    redirect(withActionResult(returnTo, "error", updateError.message));
  }

  if (status === "cancelled" && redemption.status !== "cancelled") {
    const refundPoints = Number(redemption.points_used ?? redemption.points_cost ?? 0);
    await supabase.from("points_ledger").insert({
      customer_id: redemption.customer_id,
      points: refundPoints,
      type: "manual_adjustment",
      description: "Redemption cancelled - points refunded",
    });
    const { data: c } = await supabase.from("customers").select("id,auth_user_id,points_balance").eq("id", redemption.customer_id).single();
    if (c) {
      const nextPoints = Number(c.points_balance ?? 0) + refundPoints;
      await supabase
        .from("customers")
        .update({
          points_balance: nextPoints,
          points: nextPoints,
        })
        .eq("id", redemption.customer_id);
      await supabase.from("points_transactions").insert({
        user_id: c.auth_user_id ?? c.id,
        points: refundPoints,
        type: "earn",
        reason: "Redemption cancelled - points refunded",
      });
    }
    if (redemption.product_id) {
      const { data: product } = await supabase
        .from("reward_products")
        .select("stock")
        .eq("id", redemption.product_id)
        .single();
      if (product) {
        await supabase
          .from("reward_products")
          .update({
            stock: Number(product.stock ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", redemption.product_id);
      }
    }
  }

  await supabase.from("admin_audit_logs").insert({
    admin_user_id: adminUser.id,
    action: `reward_redemption_${status}`,
    target_table: "reward_redemptions",
    target_id: id,
    details: {
      previous_status: redemption.status,
      new_status: status,
      customer_id: redemption.customer_id,
      product_id: redemption.product_id ?? null,
      reward_id: redemption.reward_id ?? null,
    },
  });

  refreshAdmin();
  revalidatePath("/admin/rewards");
  revalidatePath("/member/rewards");
  redirect(withActionResult(returnTo, "notice", "redemption_updated"));
}
