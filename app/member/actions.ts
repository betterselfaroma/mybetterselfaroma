"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireMember } from "@/lib/supabase/auth";
import type { PackageType } from "@/lib/supabase/types";

export async function createBooking(input: {
  packageType: PackageType;
  bookingDate?: string | null;
  notes?: string | null;
}) {
  const customer = await requireMember();
  const supabase = createServerSupabase();
  // Only package_type + status drive logic; booking_date/notes are optional
  // free-form columns that already exist on the bookings table.
  const { error } = await supabase.from("bookings").insert({
    customer_id: customer.id,
    package_type: input.packageType,
    status: "pending",
    booking_date: input.bookingDate || null,
    notes: input.notes || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/member");
  revalidatePath("/book");
  return { ok: true };
}

export async function redeemReward(rewardId: string) {
  await requireMember();
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("request_redemption", { p_reward_id: rewardId });
  if (error) return { error: error.message };
  revalidatePath("/member/rewards");
  revalidatePath("/member");
  return { ok: true };
}
