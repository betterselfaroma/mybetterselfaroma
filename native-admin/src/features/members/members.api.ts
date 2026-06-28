import * as Crypto from "expo-crypto";
import { CUSTOMER_SELECT } from "../../lib/admin";
import { adjustMemberPoints } from "../../lib/points";
import { supabase } from "../../lib/supabase";
import type { Customer, TransactionType } from "../../lib/types";

export async function fetchMembers(q = "") {
  const { data, error } = await supabase.from("customers").select(CUSTOMER_SELECT).order("created_at", { ascending: false }).limit(250);
  if (error) throw error;

  const needle = q.trim().toLowerCase();
  const members = (data ?? []) as Customer[];
  if (!needle) return members;
  return members.filter((customer) => [customer.name, customer.phone, customer.email, customer.referral_code].some((value) => (value ?? "").toLowerCase().includes(needle)));
}

export async function adjustCustomerPoints(customerId: string, points: number, type: TransactionType, reason: string, operatorUserId: string) {
  await adjustMemberPoints(customerId, points, type, reason, operatorUserId);
}

export async function generateCustomerQrToken(customerId: string, operatorUserId: string) {
  const token = Crypto.randomUUID();
  const { error } = await supabase.from("customers").update({ qr_token: token }).eq("id", customerId);
  if (error) {
    const rpc = await supabase.rpc("generate_customer_qr_token", {
      target_customer_id: customerId,
      operator_user_id: operatorUserId,
    });
    if (rpc.error) throw rpc.error;
    return String(rpc.data ?? token);
  }
  return token;
}
