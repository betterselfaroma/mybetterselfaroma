import { supabase } from "./supabase";
import { parseQrToken } from "./qr";
import type { Booking, BookingStatus, CmsSection, Customer, DashboardStats, PointsTransaction, RewardProduct, SiteSetting, TransactionType } from "./types";

const BOOKING_SELECT =
  "id,user_id,package_name,package_code,amount,booking_date,booking_time,contact,notes,status,created_at";

const CUSTOMER_SELECT =
  "id,auth_user_id,email,name,phone,referral_code,points_balance,points,created_at,qr_token,role,is_admin";

const REWARD_PRODUCT_SELECT =
  "id,name,description,image_url,points_cost,stock,active,sort_order,created_by,created_at,updated_at";

const CMS_SECTION_SELECT =
  "id,page_slug,section_key,section_type,title,subtitle,body,image_url,button_text,button_url,data,sort_order,visible,created_at,updated_at";

const ALLOWED_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);

export function todayInMalaysia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function displayPackage(booking: Booking) {
  return booking.package_name || booking.package_code || "Package";
}

export function displayPoints(customer?: Customer | null) {
  return Number(customer?.points_balance ?? customer?.points ?? 0);
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const today = todayInMalaysia();
  const dayStart = new Date(`${today}T00:00:00+08:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [todayBookings, pendingBookings, todayMembers, totalMembers, todayTransactions] = await Promise.all([
    supabase
      .from("bookings")
      .select(BOOKING_SELECT, { count: "exact" })
      .eq("booking_date", today)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", dayStart.toISOString()).lt("created_at", dayEnd.toISOString()),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("points_transactions").select("points").gte("created_at", dayStart.toISOString()).lt("created_at", dayEnd.toISOString()),
  ]);

  for (const result of [todayBookings, pendingBookings, todayMembers, totalMembers, todayTransactions]) {
    if (result.error) throw result.error;
  }

  const todayPointsIssued = (todayTransactions.data ?? [])
    .filter((row) => Number(row.points) > 0)
    .reduce((sum, row) => sum + Number(row.points), 0);

  return {
    todayBookingsCount: todayBookings.count ?? todayBookings.data?.length ?? 0,
    pendingBookingsCount: pendingBookings.count ?? 0,
    todayMembersCount: todayMembers.count ?? 0,
    totalMembersCount: totalMembers.count ?? 0,
    todayPointsIssued,
    todayBookings: (todayBookings.data ?? []) as Booking[],
  };
}

export async function fetchBookings(filters: { q?: string; date?: string; status?: string }) {
  let query = supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true })
    .limit(200);

  if (filters.date) query = query.eq("booking_date", filters.date);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);

  const needle = (filters.q ?? "").trim();
  if (needle) query = query.ilike("contact", `%${needle}%`);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as Booking[];
}

export async function setBookingStatus(bookingId: string, status: BookingStatus, operatorUserId: string) {
  if (!bookingId || !ALLOWED_STATUSES.has(status)) throw new Error("Invalid booking status.");
  const { error } = await supabase.rpc("admin_set_booking_status", {
    target_booking_id: bookingId,
    new_status: status,
    operator_user_id: operatorUserId,
  });
  if (error) throw error;
}

export async function fetchMembers(q = "") {
  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .order("created_at", { ascending: false })
    .limit(250);
  if (error) throw error;

  const needle = q.trim().toLowerCase();
  const members = (data ?? []) as Customer[];
  if (!needle) return members;
  return members.filter((customer) =>
    [customer.name, customer.phone, customer.email, customer.referral_code]
      .some((value) => (value ?? "").toLowerCase().includes(needle)),
  );
}

export async function adjustMemberPoints(customerId: string, points: number, type: TransactionType, reason: string, operatorUserId: string) {
  if (!customerId || !Number.isFinite(points) || points === 0) throw new Error("Invalid points adjustment.");
  const { error } = await supabase.rpc("adjust_member_points", {
    target_customer_id: customerId,
    points_delta: points,
    reason,
    transaction_type: type,
    operator_user_id: operatorUserId,
  });
  if (error) throw error;
}

export async function generateCustomerQrToken(customerId: string, operatorUserId: string) {
  if (!customerId) throw new Error("Invalid customer.");
  const { data, error } = await supabase.rpc("generate_customer_qr_token", {
    target_customer_id: customerId,
    operator_user_id: operatorUserId,
  });
  if (error) throw error;
  return String(data ?? "");
}

export async function fetchPointsTransactions() {
  const { data, error } = await supabase
    .from("points_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) throw error;
  return (data ?? []) as PointsTransaction[];
}

export async function fetchRewardProducts() {
  const { data, error } = await supabase
    .from("reward_products")
    .select(REWARD_PRODUCT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as RewardProduct[];
}

export async function saveRewardProduct(input: {
  id?: string;
  name: string;
  description?: string;
  image_url?: string;
  points_cost: number;
  stock: number;
  active: boolean;
  sort_order?: number;
  operatorUserId: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Product name is required.");
  if (!Number.isFinite(input.points_cost) || input.points_cost <= 0) throw new Error("Points cost must be greater than 0.");
  if (!Number.isFinite(input.stock) || input.stock < 0) throw new Error("Stock cannot be negative.");

  const payload = {
    name,
    description: input.description?.trim() || null,
    image_url: input.image_url?.trim() || null,
    points_cost: input.points_cost,
    stock: input.stock,
    active: input.active,
    sort_order: input.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };

  const result = input.id
    ? await supabase.from("reward_products").update(payload).eq("id", input.id)
    : await supabase.from("reward_products").insert({
        ...payload,
        created_by: input.operatorUserId,
      });

  if (result.error) throw result.error;
}

export async function setRewardProductActive(productId: string, active: boolean) {
  if (!productId) throw new Error("Invalid product.");
  const { error } = await supabase
    .from("reward_products")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", productId);
  if (error) throw error;
}

export async function fetchMobileCmsOverview() {
  const [settingsRes, sectionsRes] = await Promise.all([
    supabase
      .from("site_settings")
      .select("id,setting_key,setting_value,updated_at")
      .in("setting_key", ["whatsapp_number", "email", "business_hours"])
      .order("setting_key", { ascending: true }),
    supabase
      .from("page_sections")
      .select(CMS_SECTION_SELECT)
      .eq("page_slug", "home")
      .order("sort_order", { ascending: true })
      .limit(30),
  ]);

  if (settingsRes.error) throw settingsRes.error;
  if (sectionsRes.error) throw sectionsRes.error;

  return {
    settings: (settingsRes.data ?? []) as SiteSetting[],
    sections: (sectionsRes.data ?? []) as CmsSection[],
  };
}

export async function saveMobileSiteSetting(settingKey: string, settingValue: Record<string, unknown>) {
  if (!settingKey) throw new Error("Setting key is required.");
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      setting_key: settingKey,
      setting_value: settingValue,
      updated_at: new Date().toISOString(),
    }, { onConflict: "setting_key" });
  if (error) throw error;
}

export async function saveMobileCmsSectionText(input: {
  id: string;
  title: string;
  subtitle: string;
  body: string;
}) {
  if (!input.id) throw new Error("Section id is required.");
  const { error } = await supabase
    .from("page_sections")
    .update({
      title: input.title.trim() || null,
      subtitle: input.subtitle.trim() || null,
      body: input.body.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw error;
}

export async function fetchMemberByQr(rawToken: string) {
  const token = parseQrToken(rawToken);
  if (!token) throw new Error("二维码无效");

  const { data: customer, error } = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("qr_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!customer) throw new Error("找不到会员");

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("user_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(5);
  if (bookingsError) throw bookingsError;

  return {
    token,
    customer: customer as Customer,
    bookings: (bookings ?? []) as Booking[],
  };
}
