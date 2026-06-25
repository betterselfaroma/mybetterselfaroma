import { NextResponse } from "next/server";
import { isAdminEmail, isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ authenticated: false, isAdmin: false });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    authenticated: Boolean(user),
    isAdmin: isAdminEmail(user?.email),
  });
}
