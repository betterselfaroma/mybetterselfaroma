"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateCustomerForUser, requireMember } from "@/lib/supabase/auth";
import { getSiteUrl } from "@/lib/site-url";
import { createScheduledBooking, updateScheduledBooking } from "@/lib/booking-server";
import { getErrorMessage } from "@/lib/get-error-message";
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
  const authSupabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError) {
    console.error("Load booking user failed:", userError);
    return { error: getErrorMessage(userError) };
  }

  if (!user) {
    return { error: "请先登录后再预约", loginUrl: "/login?next=/book" };
  }

  const customer = await getOrCreateCustomerForUser(user);
  if (!customer?.id) {
    return { error: "找不到会员资料，请重新登录后再预约。" };
  }

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
      customerPhone: contact,
      packageType: input.packageType,
      bookingDate: input.bookingDate,
      bookingTime: input.bookingTime,
      contact,
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      source: "member_self_booking",
      notes: input.notes?.trim() || null,
      createdByAdminEmail: null,
      status: "pending",
    });
  } catch (error) {
    console.error("Create booking failed:", error);
    return { error: bookingErrorMessage(getErrorMessage(error)) };
  }
  const qrToken = booking.booking_qr_token ?? "";
  const bookingUrl = getBookingQrUrl(getSiteUrl(), qrToken);
  const packageLabel = getPackageConfig(booking.package_code || booking.package_type || input.packageType).label;

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
      name: customer.name,
      email: customer.email,
    },
  };
}

export async function redeemReward(rewardId: string) {
  await requireMember();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("request_redemption", { p_reward_id: rewardId });
  if (error) return { error: error.message };
  revalidatePath("/member/rewards");
  revalidatePath("/member");
  return { ok: true };
}

export async function redeemRewardProduct(productId: string) {
  await requireMember();
  const supabase = await createServerSupabase();

  try {
    const { error } = await supabase.rpc("redeem_reward_product", { product_id: productId });
    if (error) throw error;
  } catch (error) {
    console.error("Redeem reward product failed:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/member/rewards");
  revalidatePath("/member");
  return { ok: true };
}

export async function updateMemberProfile(input: {
  name: string;
  phone: string;
}) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!name) {
    return { error: "请输入姓名 · Please enter your name." };
  }

  if (!phone) {
    return { error: "请输入 WhatsApp 电话 · Please enter your WhatsApp number." };
  }

  try {
    const { error } = await supabase
      .from("customers")
      .update({ name, phone })
      .eq("id", customer.id);

    if (error) throw error;

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { name, phone },
    });

    if (metadataError) {
      console.error("Update auth metadata after profile save failed:", metadataError);
    }
  } catch (error) {
    console.error("Update member profile failed:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/member");
  revalidatePath("/book");
  return { ok: true };
}

export async function cancelMemberBooking(bookingId: string) {
  const customer = await requireMember();
  const supabase = createAdminClient();

  try {
    const { data: booking, error: loadError } = await supabase
      .from("bookings")
      .select("id,user_id,customer_id,status")
      .eq("id", bookingId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!booking) return { error: "找不到预约记录 · Booking not found." };

    const ownerIds = new Set([customer.id, customer.auth_user_id].filter(Boolean));
    const belongsToMember = ownerIds.has(booking.user_id) || booking.customer_id === customer.id;
    if (!belongsToMember) {
      return { error: "你只能取消自己的预约 · You can only cancel your own booking." };
    }

    if (!["pending", "confirmed"].includes(String(booking.status))) {
      return { error: "此预约状态不能取消 · This booking cannot be cancelled." };
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Cancel member booking failed:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/member");
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  return { ok: true };
}

export async function rescheduleMemberBooking(input: {
  bookingId: string;
  packageType: PackageType;
  bookingDate: string;
  bookingTime: string;
  phone?: string | null;
  notes?: string | null;
}) {
  const customer = await requireMember();
  const supabase = createAdminClient();
  const bookingId = input.bookingId.trim();
  const contact = input.phone?.trim() || customer.phone?.trim() || null;
  const amount = getPackageConfig(input.packageType).amount;

  if (!bookingId) {
    return { error: "找不到预约记录 · Booking not found." };
  }

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

  try {
    const { data: existing, error: loadError } = await supabase
      .from("bookings")
      .select("id,user_id,customer_id,status")
      .eq("id", bookingId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!existing) return { error: "找不到预约记录 · Booking not found." };

    const ownerIds = new Set([customer.id, customer.auth_user_id].filter(Boolean));
    const belongsToMember = ownerIds.has(existing.user_id) || existing.customer_id === customer.id;
    if (!belongsToMember) {
      return { error: "你只能修改自己的预约 · You can only reschedule your own booking." };
    }

    if (!["pending", "confirmed"].includes(String(existing.status))) {
      return { error: "此预约状态不能改期 · This booking cannot be rescheduled." };
    }

    const slot = buildBookingSlot(input.bookingDate, input.bookingTime, input.packageType);
    const booking = await updateScheduledBooking(supabase, {
      bookingId,
      packageType: input.packageType,
      bookingDate: input.bookingDate,
      bookingTime: input.bookingTime,
      contact,
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      status: String(existing.status),
      notes: input.notes?.trim() || null,
    });

    const qrToken = booking.booking_qr_token ?? "";
    const bookingUrl = getBookingQrUrl(getSiteUrl(), qrToken);
    const packageLabel = getPackageConfig(booking.package_code || booking.package_type || input.packageType).label;

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
        name: customer.name,
        email: customer.email,
      },
    };
  } catch (error) {
    console.error("Reschedule member booking failed:", error);
    return { error: bookingErrorMessage(getErrorMessage(error)) };
  }
}
