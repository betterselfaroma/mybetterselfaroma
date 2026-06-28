export function parseQrToken(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    return url.searchParams.get("token")?.trim() || "";
  } catch {
    const tokenParam = raw.match(/[?&]token=([^&]+)/i);
    if (tokenParam?.[1]) return decodeURIComponent(tokenParam[1]).trim();
    if (/^[A-Za-z0-9._:-]{12,180}$/.test(raw)) return raw;
    return "";
  }
}
