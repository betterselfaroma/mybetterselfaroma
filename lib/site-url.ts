/**
 * Resolve a guaranteed-valid absolute site URL for metadata / Open Graph.
 *
 * `NEXT_PUBLIC_SITE_URL` can be unset, blank, or supplied without a protocol
 * (e.g. "scentknowsyou.com" — a common Vercel misconfiguration). `new URL()`
 * throws on any of those, which crashed the production build while statically
 * generating `/_not-found` (TypeError: Invalid URL).
 *
 * `getSiteUrl()` validates the env value and falls back to a known-good URL so
 * the build can never crash on a bad value. This is metadata/SEO only — it does
 * not touch pricing, Supabase, membership, referral, points, or WhatsApp logic.
 */
const DEFAULT_SITE_URL = "https://scentknowsyou.com";

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (!raw) return DEFAULT_SITE_URL;

  // Accept values supplied without a scheme by defaulting to https.
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

/** Always-valid URL object for Next.js `metadataBase`. Never throws. */
export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}
