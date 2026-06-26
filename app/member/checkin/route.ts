import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL("/member", request.url));
  }

  await requireStaff(request.nextUrl.pathname + request.nextUrl.search);

  const scanUrl = new URL("/admin/scan", request.url);
  if (token) scanUrl.searchParams.set("token", token);
  return NextResponse.redirect(scanUrl);
}
