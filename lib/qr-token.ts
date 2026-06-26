export const MEMBER_QR_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{3,200}$/;

export function parseQrToken(rawValue: string) {
  const raw = rawValue.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw, "https://scentknowsyou.com");
    const token = url.searchParams.get("token")?.trim();
    if (token && MEMBER_QR_TOKEN_PATTERN.test(token)) return token;
  } catch {
    // Plain-token QR codes are also accepted below.
  }

  const tokenMatch = raw.match(/[?&]token=([^&\s]+)/);
  if (tokenMatch?.[1]) {
    const token = decodeURIComponent(tokenMatch[1]).trim();
    if (MEMBER_QR_TOKEN_PATTERN.test(token)) return token;
  }

  return MEMBER_QR_TOKEN_PATTERN.test(raw) ? raw : null;
}
