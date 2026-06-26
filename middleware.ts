import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Lightweight, Edge-safe route guard.
 *
 * Middleware runs on the Edge Runtime, so it must NOT import the Supabase SDK
 * (`@supabase/ssr` / `@supabase/supabase-js` use Node APIs like `process.version`).
 * Here we only check for the presence of a Supabase auth cookie to fast-redirect
 * signed-out visitors. The authoritative session + admin checks run in the
 * member/admin layouts (`requireMember` / `requireAdmin`) on the Node runtime.
 */
export function middleware(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => /^sb-.*-auth-token/.test(c.name));

  if (!hasAuthCookie) {
    const path = request.nextUrl.pathname;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/admin/:path*", "/staff/:path*"],
};
