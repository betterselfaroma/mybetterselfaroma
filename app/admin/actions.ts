"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function refreshAdmin() {
  for (const p of [
    "/admin",
    "/admin/bookings",
    "/admin/referral-rewards",
    "/admin/points",
    "/admin/redemptions",
    "/admin/customers",
  ]) {
    revalidatePath(p);
  }
}

/** Change a booking status. Setting it to 'completed' fires the DB trigger that
 *  awards purchase points + creates the referral reward (idempotent). */
export async function setBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const supabase = createAdminClient();
  await supabase.from("bookings").update({ status }).eq("id", id);
  refreshAdmin();
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

/** Manual points adjustment — always written to the ledger, then balance synced. */
export async function adjustPoints(formData: FormData) {
  await requireAdmin();
  const customerId = String(formData.get("customer_id"));
  const points = parseInt(String(formData.get("points")), 10);
  const description = String(formData.get("description") ?? "").trim() || "Manual adjustment";
  if (!customerId || !Number.isFinite(points) || points === 0) return;

  const supabase = createAdminClient();
  await supabase.from("points_ledger").insert({
    customer_id: customerId,
    points,
    type: "manual_adjustment",
    description,
  });
  const { data: c } = await supabase.from("customers").select("points_balance").eq("id", customerId).single();
  if (c) {
    await supabase.from("customers").update({ points_balance: c.points_balance + points }).eq("id", customerId);
  }
  refreshAdmin();
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

  // Refund points if cancelling a redemption that had deducted points.
  if (status === "cancelled" && redemption.status !== "cancelled") {
    await supabase.from("points_ledger").insert({
      customer_id: redemption.customer_id,
      points: redemption.points_used,
      type: "manual_adjustment",
      description: "Redemption cancelled — points refunded",
    });
    const { data: c } = await supabase.from("customers").select("points_balance").eq("id", redemption.customer_id).single();
    if (c) {
      await supabase
        .from("customers")
        .update({ points_balance: c.points_balance + redemption.points_used })
        .eq("id", redemption.customer_id);
    }
  }
  refreshAdmin();
}
