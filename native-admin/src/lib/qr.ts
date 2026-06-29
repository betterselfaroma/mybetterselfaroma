const QR_TOKEN_PATTERN = /^[A-Za-z0-9._:-]{3,240}$/;
const TOKEN_PARAM_NAMES = ["token", "qr_token", "booking_qr_token", "code"];

function cleanToken(value?: string | null) {
  if (!value) return "";
  let token = value.trim();

  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(token);
      if (decoded === token) break;
      token = decoded.trim();
    } catch {
      break;
    }
  }

  token = token.replace(/^["'`]+|["'`,.;\s]+$/g, "");
  return QR_TOKEN_PATTERN.test(token) ? token : "";
}

function addCandidate(candidates: string[], value?: string | null) {
  const token = cleanToken(value);
  if (token && !candidates.includes(token)) candidates.push(token);
}

function extractFromUrl(raw: string, candidates: string[]) {
  try {
    const url = new URL(raw, "https://scentknowsyou.com");
    for (const name of TOKEN_PARAM_NAMES) addCandidate(candidates, url.searchParams.get(name));

    const hashParams = new URLSearchParams(url.hash.replace(/^#\/?\??/, ""));
    for (const name of TOKEN_PARAM_NAMES) addCandidate(candidates, hashParams.get(name));

    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    if (url.pathname.includes("checkin") || url.pathname.includes("scan") || url.pathname.includes("booking")) {
      addCandidate(candidates, lastSegment);
    }
  } catch {
    // Non-URL payloads are handled by the regex/plain-token extraction below.
  }
}

export function getQrTokenCandidates(value?: string | null) {
  const raw = (value ?? "").trim();
  const candidates: string[] = [];
  if (!raw) return candidates;

  extractFromUrl(raw, candidates);

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const name of TOKEN_PARAM_NAMES) {
      if (typeof parsed[name] === "string") addCandidate(candidates, parsed[name] as string);
    }
  } catch {
    // Most camera payloads are not JSON.
  }

  const paramMatches = raw.matchAll(/(?:[?&#]|^)(token|qr_token|booking_qr_token|code)=([^&\s]+)/gi);
  for (const match of paramMatches) addCandidate(candidates, match[2]);

  addCandidate(candidates, raw);
  return candidates;
}

export function parseQrToken(value?: string | null) {
  return getQrTokenCandidates(value)[0] ?? "";
}
