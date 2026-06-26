import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/public-config";
import { SERVICE_ROLE_KEY } from "@/lib/supabase/config";
import { getErrorMessage } from "@/lib/get-error-message";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase() ?? "";

  if (!code) {
    return NextResponse.json({ valid: false });
  }

  if (!isSupabaseConfigured || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { valid: false, error: "Referral validation is not configured." },
      { status: 503 },
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ valid: Boolean(data) });
  } catch (error) {
    console.error("Referral validation error:", error);
    return NextResponse.json(
      { valid: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
