import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOperatorAccess, isStaffOrAdminAccess } from "@/lib/supabase/auth";
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

  if (!user) {
    return NextResponse.json({ authenticated: false, isAdmin: false });
  }

  try {
    const access = await getOperatorAccess(user.id, user.email);
    return NextResponse.json({
      authenticated: true,
      isAdmin: isStaffOrAdminAccess(user.email, access),
    });
  } catch (error) {
    console.error("Session admin check failed:", error);
    return NextResponse.json({
      authenticated: true,
      isAdmin: false,
    });
  }
}
