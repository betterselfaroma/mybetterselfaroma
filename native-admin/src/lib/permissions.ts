import type { Customer } from "./types";

export function isStaffOrAdmin(customer?: Customer | null) {
  const role = (customer?.role ?? "").toLowerCase();
  return role === "admin" || role === "staff" || customer?.is_admin === true;
}

export function displayPoints(customer?: Customer | null) {
  return Number(customer?.points_balance ?? customer?.points ?? 0);
}
