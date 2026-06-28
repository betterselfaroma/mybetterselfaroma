import { supabase } from "./supabase";
import type { TransactionType } from "./types";

export async function adjustMemberPoints(customerId: string, points: number, type: TransactionType, reason: string, operatorUserId: string) {
  if (!customerId || !Number.isFinite(points) || points === 0) {
    throw new Error("Invalid points adjustment.");
  }

  const { error } = await supabase.rpc("adjust_member_points", {
    target_customer_id: customerId,
    points_delta: points,
    reason,
    transaction_type: type,
    operator_user_id: operatorUserId,
  });

  if (error) throw error;
}
