import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { isStaffOrAdmin } from "./permissions";
import type { Customer, OperatorProfile } from "./types";

const CUSTOMER_SELECT = "id,auth_user_id,email,name,phone,referral_code,points_balance,points,created_at,qr_token,role,is_admin";

export async function loadOperatorProfile(user: User): Promise<OperatorProfile> {
  const email = user.email?.trim().toLowerCase() ?? null;

  let query = supabase.from("customers").select(CUSTOMER_SELECT).eq("auth_user_id", user.id).maybeSingle();
  let { data, error } = await query;
  if (error) throw error;

  if (!data && email) {
    const fallback = await supabase.from("customers").select(CUSTOMER_SELECT).eq("email", email).maybeSingle();
    if (fallback.error) throw fallback.error;
    data = fallback.data;
  }

  const customer = (data ?? null) as Customer | null;
  return {
    userId: user.id,
    email,
    customer,
    canAccessAdmin: isStaffOrAdmin(customer),
  };
}
