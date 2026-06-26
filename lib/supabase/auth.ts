import { redirect } from "next/navigation";
import { createServerSupabase } from "./server";
import { isAdminEmail } from "./config";
import type { Customer } from "./types";

export type OperatorAccess = {
  role: string;
  isAdmin: boolean;
};

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

export async function getOperatorAccess(userId: string, email?: string | null): Promise<OperatorAccess> {
  const supabase = createServerSupabase();

  let withRoleQuery = supabase
    .from("customers")
    .select("role,is_admin");

  withRoleQuery = email
    ? withRoleQuery.or(`auth_user_id.eq.${userId},email.eq.${email}`)
    : withRoleQuery.eq("auth_user_id", userId);

  const withRole = await withRoleQuery.maybeSingle();

  if (!withRole.error) {
    return {
      role: (withRole.data?.role as string | null | undefined) ?? "member",
      isAdmin: Boolean(withRole.data?.is_admin),
    };
  }

  const message = withRole.error.message.toLowerCase();
  if (!message.includes("role")) throw new Error(withRole.error.message);

  let fallbackQuery = supabase
    .from("customers")
    .select("is_admin");

  fallbackQuery = email
    ? fallbackQuery.or(`auth_user_id.eq.${userId},email.eq.${email}`)
    : fallbackQuery.eq("auth_user_id", userId);

  const fallback = await fallbackQuery.maybeSingle();

  if (fallback.error) throw new Error(fallback.error.message);
  return {
    role: fallback.data?.is_admin ? "admin" : "member",
    isAdmin: Boolean(fallback.data?.is_admin),
  };
}

export function isStaffOrAdminAccess(email: string | null | undefined, access: OperatorAccess) {
  return isAdminEmail(email) || access.isAdmin || access.role === "admin" || access.role === "staff";
}

/** Require an admin/staff operator. Redirects regular members. */
export async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const access = await getOperatorAccess(user.id, user.email);
  if (!isStaffOrAdminAccess(user.email, access)) redirect("/member");
  return user;
}

/** Require a staff/admin operator. Until a separate staff role exists, reuse the admin email allowlist. */
export async function requireStaff(next = "/staff/scan") {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const access = await getOperatorAccess(user.id, user.email);
  if (!isStaffOrAdminAccess(user.email, access)) redirect("/member");
  return user;
}
