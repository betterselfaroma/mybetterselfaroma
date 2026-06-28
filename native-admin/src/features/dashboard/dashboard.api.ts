import { BOOKING_SELECT } from "../../lib/admin";
import { malaysiaDayRange, todayInMalaysia } from "../../lib/dates";
import { getErrorMessage, logAppError } from "../../lib/errors";
import { supabase } from "../../lib/supabase";
import type { Booking, DashboardMetric, DashboardOverview } from "../../lib/types";

function metric(value = 0, error?: string): DashboardMetric {
  return error ? { value, error } : { value };
}

function resultError(label: string, result: PromiseSettledResult<{ error: unknown }>) {
  if (result.status === "rejected") return getErrorMessage(result.reason, `${label} load failed`);
  if (result.value.error) return getErrorMessage(result.value.error, `${label} load failed`);
  return "";
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const today = todayInMalaysia();
  const { dayStart, dayEnd } = malaysiaDayRange(today);

  const [todayBookings, pendingBookings, todayMembers, totalMembers, todayTransactions] = await Promise.allSettled([
    supabase.from("bookings").select(BOOKING_SELECT, { count: "exact" }).eq("booking_date", today).order("booking_date").order("booking_time"),
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
    resultError("Today points", todayTransactions),
  ].filter(Boolean);

  if (errors.length) logAppError("Native dashboard partial load failed", { message: errors.join(" | ") });

  const todayBookingsData = todayBookings.status === "fulfilled" && !todayBookings.value.error ? ((todayBookings.value.data ?? []) as Booking[]) : [];
  const todayPointsIssued = todayTransactions.status === "fulfilled" && !todayTransactions.value.error
    ? (todayTransactions.value.data ?? []).filter((row) => Number(row.points) > 0).reduce((sum, row) => sum + Number(row.points), 0)
    : 0;

  return {
    metrics: {
      todayBookings: metric(todayBookings.status === "fulfilled" && !todayBookings.value.error ? todayBookings.value.count ?? todayBookingsData.length : 0, resultError("Today bookings", todayBookings)),
      pendingBookings: metric(pendingBookings.status === "fulfilled" && !pendingBookings.value.error ? pendingBookings.value.count ?? 0 : 0, resultError("Pending bookings", pendingBookings)),
      todayMembers: metric(todayMembers.status === "fulfilled" && !todayMembers.value.error ? todayMembers.value.count ?? 0 : 0, resultError("Today members", todayMembers)),
      totalMembers: metric(totalMembers.status === "fulfilled" && !totalMembers.value.error ? totalMembers.value.count ?? 0 : 0, resultError("Total members", totalMembers)),
      todayPointsIssued: metric(todayPointsIssued, resultError("Today points", todayTransactions)),
    },
    todayBookings: todayBookingsData,
    errors,
  };
}
