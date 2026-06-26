import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOperatorAccess, getUser, isStaffOrAdminAccess, requireMember } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { Badge, Card } from "@/components/membership/ui";
import { BOOKING_STATUS_LABEL } from "@/lib/membership-format";
import { bookingPackageLabel } from "@/lib/admin-mobile";
import {
  BOOKING_CONTACTS,
  formatSingaporeDate,
  formatSingaporeTimeRange,
  getBookingEnd,
  getBookingStart,
  stripLegacyBookingQrToken,
} from "@/lib/booking-config";
import { setBookingStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function MessageCard({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-h-screen bg-cream-100 px-4 py-14 text-ink sm:px-6">
      <div className="mx-auto max-w-xl">
        <Card>
          <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-taupe-600">{body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/member" className="rounded-full bg-sage-700 px-5 py-3 text-center text-sm font-semibold text-cream-50 hover:bg-sage-800">
              会员中心 · Member Center
            </Link>
            <Link href="/" className="rounded-full border border-sage-700/30 px-5 py-3 text-center text-sm font-semibold text-sage-800 hover:border-sage-700">
              返回主页 · Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

function isMissingBookingQrColumn(message: string) {
  return message.includes("booking_qr_token")
    || message.includes("Could not find the 'booking_qr_token' column")
    || message.includes("column bookings.booking_qr_token does not exist");
}

async function loadBookingByToken(supabase: ReturnType<typeof createAdminClient>, token: string) {
  const byColumn = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_qr_token", token)
    .maybeSingle();

  if (!byColumn.error) return byColumn;
  if (!isMissingBookingQrColumn(byColumn.error.message)) return byColumn;

  return supabase
    .from("bookings")
    .select("*")
    .ilike("notes", "%[booking_qr_token:" + token + "]%")
    .maybeSingle();
}

function StatusButton({ id, status, label, returnTo, primary }: { id: string; status: string; label: string; returnTo: string; primary?: boolean }) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="return_to" value={returnTo} />
      <button
        className={
          primary
            ? "rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-sage-800"
            : "rounded-full border border-taupe-300 px-4 py-2 text-sm font-semibold text-taupe-700 hover:border-sage-500 hover:text-sage-700"
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams?: { token?: string; notice?: string; error?: string };
}) {
  if (!isSupabaseConfigured) return <NotConfigured />;

  const token = typeof searchParams?.token === "string" ? searchParams.token.trim() : "";
  if (!token) {
    return <MessageCard title="预约 QR Code 无效" body="This booking QR Code is invalid." />;
  }

  const user = await getUser();
  if (!user) {
    const next = `/booking-confirmation?token=${encodeURIComponent(token)}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  let isAdmin = false;
  try {
    const access = await getOperatorAccess(user.id);
    isAdmin = isStaffOrAdminAccess(user.email, access);
  } catch (error) {
    console.error("Booking confirmation operator check failed:", error);
  }
  const supabase = createAdminClient();
  const { data: booking } = await loadBookingByToken(supabase, token);

  if (!booking) {
    return <MessageCard title="找不到预约记录" body="We could not find this booking record." />;
  }

  let canView = isAdmin;
  if (!isAdmin) {
    const customer = await requireMember();
    canView = booking.user_id === customer.id;
  }

  if (!canView) {
    return <MessageCard title="无法查看此预约" body="You can only view your own booking details." />;
  }

  const start = getBookingStart(booking) ?? booking.created_at;
  const end = getBookingEnd(booking);
  const date = formatSingaporeDate(start);
  const time = formatSingaporeTimeRange(start, end);
  const returnTo = `/booking-confirmation?token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-14 text-ink sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          {searchParams?.error && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {searchParams.error}
            </p>
          )}
          {searchParams?.notice && (
            <p className="mb-4 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
              操作已完成 · Action completed
            </p>
          )}
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">Booking QR Code</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="font-serif text-3xl font-semibold text-ink">预约确认 · Booking Confirmation</h1>
            <Badge status={booking.status}>{BOOKING_STATUS_LABEL[booking.status] ?? booking.status}</Badge>
          </div>

          <dl className="mt-7 grid gap-4 rounded-2xl bg-cream-100 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-taupe-500">预约编号 · Booking ID</dt>
              <dd className="mt-1 break-all font-semibold text-ink">{booking.id}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">顾客 · Customer</dt>
              <dd className="mt-1 font-semibold text-ink">{booking.contact || "-"}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">项目 · Package</dt>
              <dd className="mt-1 font-semibold text-sage-700">{bookingPackageLabel(booking)}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">WhatsApp / 电话 · Contact</dt>
              <dd className="mt-1 font-semibold text-ink">{booking.contact || "-"}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">日期 · Date</dt>
              <dd className="mt-1 font-semibold text-ink">{date}</dd>
            </div>
            <div>
              <dt className="text-taupe-500">时间 · Time</dt>
              <dd className="mt-1 font-semibold text-ink">{time}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-taupe-500">WhatsApp 预约 / 咨询 · Booking / Inquiry</dt>
              <dd className="mt-1 text-taupe-700">
                {BOOKING_CONTACTS.map((contact) => `${contact.label}: ${contact.display}`).join(" · ")}
              </dd>
            </div>
            {stripLegacyBookingQrToken(booking.notes) && (
              <div className="sm:col-span-2">
                <dt className="text-taupe-500">备注 · Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-taupe-700">{stripLegacyBookingQrToken(booking.notes)}</dd>
              </div>
            )}
          </dl>

          {isAdmin && (
            <div className="mt-7 rounded-2xl border border-gold-300/50 bg-gold-300/10 p-5">
              <h2 className="font-serif text-lg font-semibold text-ink">Admin Actions</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusButton id={booking.id} status="confirmed" label="Mark as confirmed" returnTo={returnTo} />
                <StatusButton id={booking.id} status="completed" label="Mark as completed" returnTo={returnTo} primary />
                <StatusButton id={booking.id} status="cancelled" label="Cancel booking" returnTo={returnTo} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
