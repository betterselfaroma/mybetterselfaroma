import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { getUser, requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/membership/PortalHeader";
import { Card, PageTitle } from "@/components/membership/ui";
import BookForm from "@/components/membership/BookForm";
import MobileMemberNav from "@/components/membership/MobileMemberNav";
import UpcomingBookingCard from "@/components/membership/UpcomingBookingCard";
import { BOOKING_STABLE_SELECT } from "@/lib/admin-mobile";
import { BOOKING_PACKAGES, stripLegacyBookingQrToken, todayInSingapore } from "@/lib/booking-config";
import { getSiteUrl } from "@/lib/site-url";
import type { Booking, PackageType } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams?: { reschedule?: string };
};

const LINKS = [
  { href: "/member", label: "会员中心" },
  { href: "/member/referral", label: "推荐中心" },
  { href: "/member/rewards", label: "积分兑换" },
  { href: "/book", label: "预约" },
];

const PACKAGE_INFO = [
  { price: "RM60", name: "摸香状态测试体验", note: "适合第一次体验" },
  { price: "RM150", name: "专属特调精油方案", note: "包含 RM60 摸香测试 + RM90 专属精油调配" },
];

function ownerFilter(customerId: string, authUserId?: string | null) {
  const filters = [`user_id.eq.${customerId}`, `customer_id.eq.${customerId}`];
  if (authUserId) filters.push(`user_id.eq.${authUserId}`);
  return filters.join(",");
}

export default async function BookPage({ searchParams }: PageProps) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const user = await getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-100 font-sans text-ink">
        <PortalHeader brandHref="/" links={LINKS} />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <PageTitle title="预约体验" subtitle="Book your experience" />

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {PACKAGE_INFO.map((pkg) => (
              <div key={pkg.price} className="rounded-2xl border border-taupe-200/70 bg-cream-50 p-5">
                <div className="font-serif text-xl font-semibold text-sage-700">{pkg.price}</div>
                <div className="mt-1 font-medium text-ink">{pkg.name}</div>
                <div className="mt-1 text-sm text-taupe-500">{pkg.note}</div>
              </div>
            ))}
          </div>

          <Card className="text-center">
            <p className="font-serif text-lg font-semibold text-ink">请先登录或注册会员后再预约体验。</p>
            <p className="mt-2 text-sm text-taupe-600">Please log in or register before booking your experience.</p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?next=/book"
                className="inline-flex items-center justify-center rounded-full border border-sage-300 bg-cream-50 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500"
              >
                登录 · Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
              >
                注册会员 · Register
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const today = todayInSingapore();
  const filter = ownerFilter(customer.id, customer.auth_user_id);
  const siteUrl = getSiteUrl();

  const upcomingRes = await supabase
    .from("bookings")
    .select(`${BOOKING_STABLE_SELECT},customer_id`)
    .or(filter)
    .gte("booking_date", today)
    .in("status", ["pending", "confirmed"])
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true })
    .limit(1);

  if (upcomingRes.error) {
    console.error("Load next member booking failed:", upcomingRes.error);
  }

  const upcomingBooking = (upcomingRes.data?.[0] ?? null) as Booking | null;
  const rescheduleId = typeof searchParams?.reschedule === "string" ? searchParams.reschedule.trim() : "";
  let rescheduleBooking: Booking | null = null;
  let rescheduleError = "";

  if (rescheduleId) {
    const rescheduleRes = await supabase
      .from("bookings")
      .select(`${BOOKING_STABLE_SELECT},customer_id`)
      .eq("id", rescheduleId)
      .or(filter)
      .maybeSingle();

    if (rescheduleRes.error) {
      console.error("Load member booking for reschedule failed:", rescheduleRes.error);
      rescheduleError = rescheduleRes.error.message;
    } else if (!rescheduleRes.data) {
      rescheduleError = "找不到可修改的预约。";
    } else if (!["pending", "confirmed"].includes(String(rescheduleRes.data.status))) {
      rescheduleError = "此预约状态不能改期。";
    } else {
      rescheduleBooking = rescheduleRes.data as Booking;
    }
  }

  const reschedulePackage = (rescheduleBooking?.package_code || "scent_test") as PackageType;
  const canUseReschedulePackage = reschedulePackage in BOOKING_PACKAGES;
  const rescheduleFormData = rescheduleBooking && canUseReschedulePackage
    ? {
        id: rescheduleBooking.id,
        packageType: reschedulePackage,
        bookingDate: rescheduleBooking.booking_date ?? today,
        bookingTime: rescheduleBooking.booking_time ?? "10:00",
        contact: rescheduleBooking.contact ?? customer.phone ?? "",
        notes: stripLegacyBookingQrToken(rescheduleBooking.notes),
      }
    : null;

  if (rescheduleBooking && !canUseReschedulePackage) {
    rescheduleError = "此预约套餐资料无法识别，请重新预约。";
  }

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-ink">
      <PortalHeader brandHref="/member" links={LINKS} points={customer.points_balance} />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 md:py-10">
        <PageTitle
          title={rescheduleFormData ? "修改预约" : "预约体验"}
          subtitle="Book your experience · 选择套餐，提交后我们会通过 WhatsApp 与你确认时间。"
        />
        <div className="space-y-6">
          {rescheduleError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {rescheduleError}
            </div>
          )}
          <UpcomingBookingCard booking={upcomingBooking} siteUrl={siteUrl} />
          <BookForm defaultPhone={customer.phone ?? ""} rescheduleBooking={rescheduleFormData} />
        </div>
      </main>
      <MobileMemberNav points={customer.points_balance} />
    </div>
  );
}
