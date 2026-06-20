import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SERVICE_ROLE_KEY } from "./config";

/**
 * Service-role Supabase client. Bypasses RLS — SERVER ONLY.
 * `server-only` makes the build fail if this is ever imported by client code.
 */
export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
