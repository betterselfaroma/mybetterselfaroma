import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { BOOKING_STABLE_SELECT, bookingPackageLabel } from "@/lib/admin-mobile";
import { Badge, Card, PageTitle } from "@/components/membership/ui";
import CancelBookingButton from "@/components/membership/CancelBookingButton";
import {
  BOOKING_CONTACTS,
  buildBookingWhatsAppText,
  extractBookingQrToken,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingQrUrl,
  getBookingStart,
  getWhatsAppUrl,
  stripLegacyBookingQrToken,
} from "@/lib/booking-config";
import { BOOKING_STATUS_LABEL } from "@/lib/membership-format";
import { getSiteUrl } from "@/lib/site-url";
import type { Booking } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

function ownerFilter(customerId: string, authUserId?: string | null) {
  const filters = [`user_id.eq.${customerId}`, `customer_id.eq.${customerId}`];
  if (authUserId) filters.push(`user_id.eq.${authUserId}`);
  return filters.join(",");
}

export default async function MemberBookingDetailPage({ params }: PageProps) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();

  const bookingRes = await supabase
    .from("bookings")
    .select(`${BOOKING_STABLE_SELECT},customer_id`)
    .eq("id", params.id)
    .or(ownerFilter(customer.id, customer.auth_user_id))
    .maybeSingle();

  if (bookingRes.error) {
    console.error("Load member booking detail failed:", bookingRes.error);
    return (
      <div className="space-y-6">
        <PageTitle title="预约详情" subtitle="Booking Detail" />
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{bookingRes.error.message}</p>
          <Link href="/member" className="mt-4 inline-flex rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50">
            返回会员中心
          </Link>
        </Card>
      </div>
    );
  }

  const booking = (bookingRes.data ?? null) as Booking | null;

  if (!booking) {
    return (
      <div className="space-y-6">
        <PageTitle title="预约详情" subtitle="Booking Detail" />
        <Card>
          <p className="text-sm text-taupe-600">找不到这笔预约，或它不属于当前会员。</p>
          <Link href="/member" className="mt-4 inline-flex rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50">
            返回会员中心
          </Link>
        </Card>
      </div>
    );
  }

  const start = getBookingStart(booking) ?? booking.created_at;
  const end = getBookingEnd(booking);
  const date = formatSingaporeDate(start);
  const time = formatSingaporeTimeRange(start, end);
  const packageLabel = bookingPackageLabel(booking);
  const qrToken = extractBookingQrToken(booking);
  const qrUrl = qrToken ? getBookingQrUrl(getSiteUrl(), qrToken) : "";
  const notes = stripLegacyBookingQrToken(booking.notes);
  const canManage = ["pending", "confirmed"].includes(booking.status);
  const message = buildBookingWhatsAppText({
    name: customer.name,
    email: customer.email,
    packageLabel,
    date,
    time,
    bookingId: booking.id,
    bookingQrUrl: qrUrl || "-",
    notes,
  });

  return (
    <div className="space-y-6">
      <PageTitle title="预约详情" subtitle="Booking Detail · 查看预约状态、QR、联系与改期。" />

      <Card className="overflow-hidden p-0">
        <div className="bg-sage-900 p-5 text-cream-50 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Booking</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold leading-tight">{packageLabel}</h1>
              <p className="mt-2 text-sm text-cream-100/78">{date} · {time}</p>
            </div>
            <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">预约编号</dt>
              <dd className="mt-1 break-all font-semibold text-ink">{booking.id}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">状态</dt>
              <dd className="mt-1 font-semibold text-ink">{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">日期</dt>
              <dd className="mt-1 font-semibold text-ink">{date}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">时间</dt>
              <dd className="mt-1 font-semibold text-ink">{time}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">金额</dt>
              <dd className="mt-1 font-semibold text-sage-700">RM{booking.amount ?? "-"}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">WhatsApp / 电话</dt>
              <dd className="mt-1 font-semibold text-ink">{booking.contact || "-"}</dd>
            </div>
          </dl>

          {notes && (
            <div className="mt-5 rounded-2xl bg-cream-100 p-4 text-sm leading-6 text-taupe-700">
              <p className="font-semibold text-ink">备注</p>
              <p className="mt-1 whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {qrUrl && (
              <Link href={`/booking-confirmation?token=${qrToken}`} className="rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50">
                查看预约 QR
              </Link>
            )}
            {canManage && (
              <Link href={`/book?reschedule=${booking.id}`} className="rounded-full border border-gold-400/70 px-5 py-3 text-sm font-semibold text-sage-800">
                修改预约
              </Link>
            )}
            {canManage && <CancelBookingButton bookingId={booking.id} />}
          </div>

          <div className="mt-5 rounded-2xl border border-taupe-200/70 bg-cream-50 p-4">
            <p className="text-sm font-semibold text-ink">WhatsApp 预约 / 咨询</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BOOKING_CONTACTS.map((contact) => (
                <a
                  key={contact.key}
                  href={getWhatsAppUrl(contact.wa, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-sage-300 px-4 py-2 text-xs font-bold text-sage-700"
                >
                  {contact.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
