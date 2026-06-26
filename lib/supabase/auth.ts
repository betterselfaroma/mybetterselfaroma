import { redirect } from "next/navigation";
import { createServerSupabase } from "./server";
import { isAdminEmail } from "./config";
import type { Customer } from "./types";

/** The logged-in auth user, or null. */
export async function getUser() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Require a logged-in member; returns their customer row. Redirects to /login. */
export async function requireMember(): Promise<Customer> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!customer) redirect("/login");
  return customer as Customer;
}

/** Require an admin (email in ADMIN_EMAILS). Redirects non-admins. */
export async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) redirect("/member");
  return user;
}

/** Require a staff/admin operator. Until a separate staff role exists, reuse the admin email allowlist. */
export async function requireStaff(next = "/staff/scan") {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!isAdminEmail(user.email)) redirect("/member");
  return user;
}
