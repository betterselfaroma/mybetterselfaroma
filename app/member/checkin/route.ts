import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL("/member", request.url));
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.redirect(new URL("/member", request.url));
  }

  const scanUrl = new URL("/admin/scan", request.url);
  if (token) scanUrl.searchParams.set("token", token);
  return NextResponse.redirect(scanUrl);
}
