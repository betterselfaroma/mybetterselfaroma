import "server-only";

import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBER_QR_TOKEN_PATTERN, parseQrToken } from "@/lib/qr-token";

function isMissingQrTokenColumn(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("customers.qr_token")
    || normalized.includes("column customers.qr_token does not exist")
    || normalized.includes("could not find the 'qr_token' column")
    || normalized.includes("'qr_token' column of 'customers'");
}

export function createMemberQrToken() {
  return randomBytes(32).toString("base64url");
}

export function buildMemberQrUrl(siteUrl: string, token: string) {
  return `${siteUrl.replace(/\/+$/, "")}/member/checkin?token=${encodeURIComponent(token)}`;
}

export function extractMemberQrToken(rawValue: string) {
  return parseQrToken(rawValue);
}

export async function ensureCustomerQrToken(customerId: string, existingToken?: string | null) {
  if (existingToken && MEMBER_QR_TOKEN_PATTERN.test(existingToken)) return existingToken;

  const supabase = createAdminClient();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const token = createMemberQrToken();
    const { data, error } = await supabase
      .from("customers")
      .update({ qr_token: token })
      .eq("id", customerId)
      .select("qr_token")
      .single();

    if (!error && data?.qr_token) return data.qr_token as string;
    if (error && isMissingQrTokenColumn(error.message)) return null;
    if (error && error.message.toLowerCase().includes("duplicate")) continue;
    if (error) throw new Error(error.message);
  }

  throw new Error("Unable to create a member QR token.");
}
