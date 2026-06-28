import * as Linking from "expo-linking";

export function formatMalaysiaWhatsAppNumber(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `60${digits.slice(1)}`;
  return `60${digits}`;
}

export function toWhatsAppUrl(phone?: string | null) {
  const normalized = formatMalaysiaWhatsAppNumber(phone);
  return normalized ? `https://wa.me/${normalized}` : "";
}

export async function openWhatsApp(phone?: string | null) {
  const url = toWhatsAppUrl(phone);
  if (!url) throw new Error("没有可用的 WhatsApp 号码");
  await Linking.openURL(url);
}
