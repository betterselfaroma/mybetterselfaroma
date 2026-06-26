import type { PackageType } from "./supabase/types";

export const BOOKING_TIME_ZONE = "Asia/Singapore";
export const BOOKING_OPEN_MINUTES = 10 * 60;
export const BOOKING_CLOSE_MINUTES = 20 * 60;
export const BOOKING_SLOT_INTERVAL_MINUTES = 30;

export const BOOKING_CONTACTS = [
  { key: "yaning", label: "雅凝 · Yaning", display: "0124761919", wa: "60124761919" },
  { key: "wenshan", label: "文珊 · Wenshan", display: "0177898668", wa: "60177898668" },
] as const;

export const BOOKING_PACKAGES: Record<
  PackageType,
  {
    amount: 60 | 150;
    durationMinutes: 30 | 60;
    label: string;
    shortLabel: string;
  }
> = {
  scent_test: {
    amount: 60,
    durationMinutes: 30,
    label: "RM60 摸香状态测试体验 · RM60 Scent Test",
    shortLabel: "RM60",
  },
  custom_blend: {
    amount: 150,
    durationMinutes: 60,
    label: "RM150 专属特调精油方案 · RM150 Custom Blend",
    shortLabel: "RM150",
  },
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  pending: "待确认 · Pending",
  booked: "已预约 · Booked",
  confirmed: "已确认 · Confirmed",
  completed: "已完成 · Completed",
  cancelled: "已取消 · Cancelled",
  no_show: "未出席 · No-show",
};

export const BOOKING_CONFLICT_MESSAGE =
  "这个时间已经被预约了，请选择其他时间。 · This time slot has already been booked. Please choose another time.";

export function getPackageConfig(packageType: string) {
  return BOOKING_PACKAGES[packageType as PackageType] ?? BOOKING_PACKAGES.scent_test;
}

export function getBookingPackageFields(packageType: PackageType) {
  if (packageType === "custom_blend") {
    return {
      package_name: "RM150 Custom Blend",
      package_code: "custom_blend",
      amount: 150,
    } as const;
  }

  return {
    package_name: "RM60 Scent Test",
    package_code: "scent_test",
    amount: 60,
  } as const;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function getTimeOptionsForPackage(packageType: string) {
  const { durationMinutes } = getPackageConfig(packageType);
  const options: string[] = [];
  for (
    let minutes = BOOKING_OPEN_MINUTES;
    minutes + durationMinutes <= BOOKING_CLOSE_MINUTES;
    minutes += BOOKING_SLOT_INTERVAL_MINUTES
  ) {
    options.push(minutesToTime(minutes));
  }
  return options;
}

export function singaporeDateTimeToUtc(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    throw new Error("invalid_time");
  }
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

export function buildBookingSlot(date: string, time: string, packageType: string) {
  const start = singaporeDateTimeToUtc(date, time);
  const duration = getPackageConfig(packageType).durationMinutes;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  if (!getTimeOptionsForPackage(packageType).includes(time)) {
    throw new Error("outside_business_hours");
  }

  return { start, end };
}

export function todayInSingapore() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatSingaporeDate(value: string | Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeZone: BOOKING_TIME_ZONE,
  }).format(new Date(value));
}

export function formatSingaporeTime(value: string | Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: BOOKING_TIME_ZONE,
  }).format(new Date(value));
}

export function formatSingaporeTimeRange(start: string | Date | null, end: string | Date | null) {
  if (!start || !end) return "-";
  return `${formatSingaporeTime(start)} - ${formatSingaporeTime(end)}`;
}

export function getBookingQrUrl(siteUrl: string, token: string) {
  return `${siteUrl.replace(/\/+$/, "")}/booking-confirmation?token=${encodeURIComponent(token)}`;
}

const LEGACY_QR_PREFIX = "[booking_qr_token:";

export function appendLegacyBookingQrToken(notes: string | null | undefined, token: string) {
  const cleanNotes = stripLegacyBookingQrToken(notes);
  return [cleanNotes || null, `${LEGACY_QR_PREFIX}${token}]`].filter(Boolean).join("\n");
}

export function extractBookingQrToken(booking: {
  booking_qr_token?: string | null;
  notes?: string | null;
}) {
  if (booking.booking_qr_token) return booking.booking_qr_token;
  const match = booking.notes?.match(/\[booking_qr_token:([^\]]+)\]/);
  return match?.[1] ?? "";
}

export function stripLegacyBookingQrToken(notes: string | null | undefined) {
  return (notes ?? "").replace(/\n?\[booking_qr_token:[^\]]+\]/g, "").trim();
}

export function getBookingStart(booking: {
  booking_date?: string | null;
  booking_time?: string | null;
}) {
  if (booking.booking_date && booking.booking_time) {
    return singaporeDateTimeToUtc(booking.booking_date, booking.booking_time).toISOString();
  }
  return booking.booking_date ?? null;
}

export function getBookingEnd(booking: {
  booking_date?: string | null;
  booking_time?: string | null;
  package_type: string;
}) {
  const start = getBookingStart(booking);
  if (!start) return null;
  return new Date(new Date(start).getTime() + getPackageConfig(booking.package_type).durationMinutes * 60 * 1000).toISOString();
}

export function buildBookingWhatsAppText(input: {
  name?: string | null;
  email?: string | null;
  packageLabel: string;
  date: string;
  time: string;
  bookingId: string;
  bookingQrUrl: string;
  notes?: string | null;
}) {
  const notes = input.notes?.trim() || "-";
  return [
    "你好，我已完成预约。",
    "",
    `姓名：${input.name || "-"}`,
    `会员 Email：${input.email || "-"}`,
    `预约项目：${input.packageLabel}`,
    `预约日期：${input.date}`,
    `预约时间：${input.time}`,
    `预约编号：${input.bookingId}`,
    `预约 QR：${input.bookingQrUrl}`,
    `备注：${notes}`,
    "",
    "请帮我确认，谢谢。",
    "",
    "Hi, I have completed a booking.",
    "",
    `Name: ${input.name || "-"}`,
    `Member Email: ${input.email || "-"}`,
    `Package: ${input.packageLabel}`,
    `Date: ${input.date}`,
    `Time: ${input.time}`,
    `Booking ID: ${input.bookingId}`,
    `Booking QR: ${input.bookingQrUrl}`,
    `Notes: ${notes}`,
    "",
    "Please help me confirm. Thank you.",
  ].join("\n");
}

export function getWhatsAppUrl(waNumber: string, message: string) {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
