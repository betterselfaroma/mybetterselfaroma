import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { createAdminClient } from "./admin";
import { createServerSupabase } from "./server";
import { isAdminEmail, SERVICE_ROLE_KEY } from "./config";
import type { Customer } from "./types";

export type OperatorAccess = {
  role: string;
  isAdmin: boolean;
};

export type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function metadataString(user: AuthUser, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

const CUSTOMER_QR_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{3,200}$/;

async function createUniqueReferralCode(supabase: ReturnType<typeof createAdminClient>) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomBytes(6).toString("hex").slice(0, 8).toUpperCase();
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return code;
  }

  throw new Error("Unable to create referral code.");
}

async function createUniqueQrToken(supabase: ReturnType<typeof createAdminClient>, preferredToken?: string | null) {
  const candidate = preferredToken?.trim();
  if (candidate && CUSTOMER_QR_TOKEN_PATTERN.test(candidate)) {
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .eq("qr_token", candidate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return candidate;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const token = randomToken();
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .eq("qr_token", token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return token;
  }

  throw new Error("Unable to create member QR token.");
}

function customerLookup(
  supabase: ReturnType<typeof createServerSupabase> | ReturnType<typeof createAdminClient>,
  user: AuthUser,
) {
  const email = normalizeEmail(user.email);
  const query = supabase.from("customers").select("*").limit(1);
  return email
    ? query.or(`auth_user_id.eq.${user.id},email.eq.${email}`)
    : query.eq("auth_user_id", user.id);
}

async function loadCustomerForUser(
  supabase: ReturnType<typeof createServerSupabase> | ReturnType<typeof createAdminClient>,
  user: AuthUser,
) {
  const { data, error } = await customerLookup(supabase, user).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Customer | null) ?? null;
}

async function createMissingCustomerProfile(user: AuthUser): Promise<Customer | null> {
  if (!SERVICE_ROLE_KEY) return null;

  const supabase = createAdminClient();
  const email = normalizeEmail(user.email);
  if (!email) return null;

  const existing = await loadCustomerForUser(supabase, user);
  if (existing) {
    const patch: Record<string, unknown> = {};
    if (!existing.auth_user_id) patch.auth_user_id = user.id;
    if (!existing.qr_token) patch.qr_token = await createUniqueQrToken(supabase, metadataString(user, "qr_token"));

    if (Object.keys(patch).length > 0) {
      const { data, error } = await supabase
        .from("customers")
        .update(patch)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data as Customer;
    }

    return existing;
  }

  const referralCode = await createUniqueReferralCode(supabase);
  const qrToken = await createUniqueQrToken(supabase, metadataString(user, "qr_token"));
  const rawReferral = metadataString(user, "referred_by_code").toUpperCase();
  let referredByCode: string | null = null;

  if (rawReferral) {
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .eq("referral_code", rawReferral)
      .maybeSingle();

    if (error) throw new Error(error.message);
    referredByCode = data ? rawReferral : null;
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      auth_user_id: user.id,
      name: metadataString(user, "name"),
      email,
      phone: metadataString(user, "phone") || null,
      referral_code: referralCode,
      referred_by_code: referredByCode,
      points_balance: 10,
      points: 10,
      role: "member",
      is_admin: false,
      qr_token: qrToken,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await Promise.allSettled([
    supabase
      .from("points_ledger")
      .insert({
        customer_id: customer.id,
        points: 10,
        type: "signup_bonus",
        description: "New member signup bonus",
      }),
    supabase
      .from("customers")
      .update({ points_balance: 10, points: 10, role: "member" })
      .eq("id", customer.id),
  ]);

  if (referredByCode) {
    const { data: referrer } = await supabase
      .from("customers")
      .select("id")
      .eq("referral_code", referredByCode)
      .maybeSingle();

    if (referrer?.id) {
      await supabase.from("referrals").insert({
        referrer_customer_id: referrer.id,
        referred_customer_id: customer.id,
        referral_code: referredByCode,
        status: "registered",
      });
    }
  }

  return loadCustomerForUser(supabase, user);
}

/** The logged-in auth user, or null. */
export async function getUser() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getOrCreateCustomerForUser(user: AuthUser): Promise<Customer | null> {
  const supabase = createServerSupabase();
  let customer: Customer | null = null;

  try {
    customer = await loadCustomerForUser(supabase, user);
  } catch (error) {
    console.error("Load member profile failed:", error);
  }

  if (!customer || !customer.auth_user_id || !customer.qr_token) {
    try {
      const ensuredCustomer = await createMissingCustomerProfile(user);
      if (ensuredCustomer) return ensuredCustomer;
    } catch (error) {
      console.error("Create or repair member profile failed:", error);
    }
  }

  return customer;
}

/** Require a logged-in member; returns their customer row. Redirects to /login. */
export async function requireMember(): Promise<Customer> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customer = await getOrCreateCustomerForUser(user);

  if (!customer) redirect("/login");
  return customer;
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
