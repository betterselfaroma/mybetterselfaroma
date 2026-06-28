import type { OperatorProfile } from "./types";

export function canUseAdmin(profile: OperatorProfile | null) {
  const role = profile?.customer?.role;
  return Boolean(profile?.customer?.is_admin || role === "admin" || role === "staff");
}
