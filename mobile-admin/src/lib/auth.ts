import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Customer, OperatorProfile } from "./types";

export async function restoreSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadOperatorProfile(session: Session | null): Promise<OperatorProfile | null> {
  const user = session?.user;
  if (!user) return null;

  let query = supabase
    .from("customers")
    .select("id,auth_user_id,email,name,phone,points_balance,points,qr_token,role,is_admin,created_at");

  if (user.email) {
    query = query.or(`auth_user_id.eq.${user.id},email.eq.${user.email}`);
  } else {
    query = query.eq("auth_user_id", user.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;

  const customer = (data as Customer | null) ?? null;
  const role = customer?.role ?? "member";
  const canAccessAdmin = Boolean(customer?.is_admin || role === "admin" || role === "staff");

  return {
    userId: user.id,
    email: user.email ?? customer?.email ?? null,
    customer,
    canAccessAdmin,
  };
}
