"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  loadingLabel?: string;
  onSignedOut?: () => void;
};

export function LogoutButton({
  className,
  label = "登出 · Logout",
  loadingLabel = "登出中... · Logging out...",
  onSignedOut,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Logout error:", error);
      }

      onSignedOut?.();
      router.replace("/");
      router.refresh();
      window.setTimeout(() => {
        if (window.location.pathname !== "/") window.location.href = "/";
      }, 800);
    } catch (error) {
      console.error("Logout failed:", error);
      onSignedOut?.();
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button type="button" disabled={isLoggingOut} onClick={handleLogout} className={className}>
      {isLoggingOut ? loadingLabel : label}
    </button>
  );
}
