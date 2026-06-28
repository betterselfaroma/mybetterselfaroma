"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

function completionErrorCode(message: string) {
  if (message.includes("token_used")) return "used";
  if (message.includes("token_expired")) return "expired";
  if (message.includes("not_authenticated")) return "login";
  return "invalid";
}

export async function completeBookingCheckIn(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) redirect("/complete-booking?status=invalid");

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("complete_booking_with_token", { p_token: token });

  if (error) {
    const status = completionErrorCode(error.message);
    redirect(`/complete-booking?token=${encodeURIComponent(token)}&status=${status}`);
  }

  revalidatePath("/member");
  revalidatePath("/member/referral");
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/referral-rewards");
  revalidatePath("/admin/points");
  redirect(`/complete-booking?token=${encodeURIComponent(token)}&status=success`);
}
