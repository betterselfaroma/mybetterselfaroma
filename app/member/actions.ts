"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/supabase/auth";
import { getSiteUrl } from "@/lib/site-url";
import { createScheduledBooking } from "@/lib/booking-server";
import {
  BOOKING_CONFLICT_MESSAGE,
  BOOKING_PACKAGES,
  buildBookingSlot,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingStart,
  getBookingQrUrl,
  getPackageConfig,
} from "@/lib/booking-config";
import type { PackageType } from "@/lib/supabase/types";

function bookingErrorMessage(message: string) {
  if (message.includes("booking_conflict")) return BOOKING_CONFLICT_MESSAGE;
  if (message.includes("outside_business_hours")) return "请选择 10:00 AM - 8:00 PM 之间的可预约时间。 · Please choose an available time between 10:00 AM and 8:00 PM.";
  if (message.includes("invalid_time")) return "请选择有效的预约日期和时间。 · Please choose a valid booking date and time.";
  return message || "预约失败，请稍后再试。 · Booking failed. Please try again.";
}

export async function createBooking(input: {
  packageType: PackageType;
  bookingDate: string;
  bookingTime: string;
  phone?: string | null;
  notes?: string | null;
}) {
  const customer = await requireMember();
  const contact = input.phone?.trim() || customer.phone?.trim() || null;
  const amount = getPackageConfig(input.packageType).amount;

  if (!(input.packageType in BOOKING_PACKAGES)) {
    return { error: "Please choose a valid package." };
  }

  if (!input.bookingDate) {
    return { error: "Please choose a booking date." };
  }

  if (!input.bookingTime) {
    return { error: "Please choose a booking time." };
  }

  if (!contact) {
    return { error: "Please enter your WhatsApp or phone number." };
  }

  if (!Number.isFinite(Number(amount))) {
    return { error: "Invalid package amount." };
  }

  let slot: { start: Date; end: Date };
  try {
    slot = buildBookingSlot(input.bookingDate, input.bookingTime, input.packageType);
  } catch (error) {
    return { error: bookingErrorMessage(error instanceof Error ? error.message : "invalid_time") };
  }

  const supabase = createAdminClient();
  let booking;
  try {
    booking = await createScheduledBooking(supabase, {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: contact,
      customerEmail: customer.email,
      packageType: input.packageType,
      bookingDate: input.bookingDate,
      bookingTime: input.bookingTime,
      contact,
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      source: "member_self_booking",
      notes: input.notes?.trim() || null,
      createdByAdminEmail: null,
      status: "confirmed",
    });
  } catch (error) {
    console.error("Create booking failed:", error);
    return { error: bookingErrorMessage(error instanceof Error ? error.message : "booking_failed") };
  }
  const qrToken = booking.booking_qr_token ?? "";
  const bookingUrl = getBookingQrUrl(getSiteUrl(), qrToken);
  const packageLabel = getPackageConfig(booking.package_type).label;

  revalidatePath("/member");
  revalidatePath("/book");
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");

  return {
    ok: true,
    booking: {
      id: booking.id,
      token: qrToken,
      bookingUrl,
      packageLabel,
      date: booking.booking_date ?? formatSingaporeDate(getBookingStart(booking)),
      time: booking.booking_time ?? formatSingaporeTimeRange(getBookingStart(booking), getBookingEnd(booking)),
      notes: booking.notes,
      name: booking.customer_name ?? customer.name,
      email: booking.customer_email ?? customer.email,
    },
  };
}

export async function redeemReward(rewardId: string) {
  await requireMember();
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("request_redemption", { p_reward_id: rewardId });
  if (error) return { error: error.message };
  revalidatePath("/member/rewards");
  revalidatePath("/member");
  return { ok: true };
}
