"use client";

import { useEffect } from "react";

/**
 * Captures a `?ref=CODE` query param on the landing page and stores it in a
 * cookie so it survives until the visitor registers.
 */
export default function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `bsa_ref=${encodeURIComponent(
        ref.trim(),
      )}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    }
  }, []);
  return null;
}
