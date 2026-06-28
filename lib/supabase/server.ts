import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/** Server Supabase client bound to the request cookies (anon key, RLS as the
 *  logged-in user). Use in Server Components, Route Handlers and Server Actions. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cookiesToSet: { name: string; value: string; options?: any }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (read-only cookies) — safe to ignore;
          // session refresh happens in middleware.
        }
      },
    },
  });
}
