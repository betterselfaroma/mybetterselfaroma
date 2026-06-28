import { supabase } from "../../lib/supabase";
import { getErrorMessage, logAppError } from "../../lib/errors";
import { malaysiaDayRange, todayInMalaysia } from "../../lib/dates";
import type { Booking, DashboardMetric, DashboardOverview } from "../../lib/types";

const BOOKING_SELECT =
  "id,customer_id,user_id,package_type,package_name,package_code,amount,booking_date,booking_time,contact,notes,status,points_awarded,referral_reward_created,created_at";

function metric(value = 0, error?: string): DashboardMetric {
  return error ? { value, error } : { value };
}

function resultError(label: string, result: PromiseSettledResult<{ error: unknown }>) {
  if (result.status === "rejected") return getErrorMessage(result.reason, `${label} could not be loaded`);
  if (result.value.error) return getErrorMessage(result.value.error, `${label} could not be loaded`);
  return "";
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const today = todayInMalaysia();
  const { dayStart, dayEnd } = malaysiaDayRange(today);

  const [
    todayBookings,
    pendingBookings,
    todayMembers,
    totalMembers,
    todayTransactions,
  ] = await Promise.allSettled([
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

  const errors = [
    resultError("Today bookings", todayBookings),
    resultError("Pending bookings", pendingBookings),
    resultError("Today members", todayMembers),
    resultError("Total members", totalMembers),
    resultError("Today points transactions", todayTransactions),
  ].filter(Boolean);

  if (errors.length > 0) {
    logAppError("Mobile dashboard partial load failed", { message: errors.join(" | ") });
  }

  const todayBookingsData =
    todayBookings.status === "fulfilled" && !todayBookings.value.error
      ? ((todayBookings.value.data ?? []) as Booking[])
      : [];

  const todayPointsIssued =
    todayTransactions.status === "fulfilled" && !todayTransactions.value.error
      ? (todayTransactions.value.data ?? [])
          .filter((row) => Number(row.points) > 0)
          .reduce((sum, row) => sum + Number(row.points), 0)
      : 0;

  return {
    metrics: {
      todayBookings: metric(
        todayBookings.status === "fulfilled" && !todayBookings.value.error ? todayBookings.value.count ?? todayBookingsData.length : 0,
        resultError("Today bookings", todayBookings),
      ),
      pendingBookings: metric(
        pendingBookings.status === "fulfilled" && !pendingBookings.value.error ? pendingBookings.value.count ?? 0 : 0,
        resultError("Pending bookings", pendingBookings),
      ),
      todayMembers: metric(
        todayMembers.status === "fulfilled" && !todayMembers.value.error ? todayMembers.value.count ?? 0 : 0,
        resultError("Today members", todayMembers),
      ),
      totalMembers: metric(
        totalMembers.status === "fulfilled" && !totalMembers.value.error ? totalMembers.value.count ?? 0 : 0,
        resultError("Total members", totalMembers),
      ),
      todayPointsIssued: metric(todayPointsIssued, resultError("Today points transactions", todayTransactions)),
    },
    todayBookings: todayBookingsData,
    errors,
  };
}
