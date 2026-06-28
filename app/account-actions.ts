"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createServerSupabase();
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout failed:", error);
  }
  redirect("/");
}
