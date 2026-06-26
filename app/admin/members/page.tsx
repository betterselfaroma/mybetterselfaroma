import { Card, EmptyState, PageTitle } from "@/components/membership/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, pkgLabel } from "@/lib/membership-format";
import { bookingDateLabel, localWhatsappToWaMe } from "@/lib/admin-mobile";
import { adjustPoints } from "../actions";
import type { Booking, Customer } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { q?: string; notice?: string; error?: string };
};

function PointButton({ customerId, points, label, returnTo }: { customerId: string; points: number; label: string; returnTo: string }) {
  return (
    <form action={adjustPoints}>
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="points" value={points} />
      <input type="hidden" name="transaction_type" value={points > 0 ? "earn" : "redeem"} />
      <input type="hidden" name="description" value={points > 0 ? "Admin mobile reward" : "Admin mobile redeem"} />
      <input type="hidden" name="return_to" value={returnTo} />
      <button className="min-h-11 rounded-full border border-sage-300 px-4 py-2 text-sm font-semibold text-sage-700 hover:border-sage-600">
        {label}
      </button>
    </form>
  );
}

export default async function AdminMembersPage({ searchParams }: PageProps) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const notice = searchParams?.notice ?? "";
  const actionError = searchParams?.error ?? "";
  const returnTo = `/admin/members?${new URLSearchParams({ q }).toString()}`;
  let error = "";
  let customers: Customer[] = [];
  let bookings: Booking[] = [];

  try {
    const supabase = createAdminClient();
    const [customersRes, bookingsRes] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    if (customersRes.error) throw new Error(customersRes.error.message);
    if (bookingsRes.error) throw new Error(bookingsRes.error.message);
    customers = (customersRes.data ?? []) as Customer[];
    bookings = (bookingsRes.data ?? []) as Booking[];
  } catch (loadError) {
    console.error("Load admin members failed:", loadError);
    error = loadError instanceof Error ? loadError.message : "Members could not be loaded.";
  }

  const bookingMap = new Map<string, Booking>();
  for (const booking of bookings) {
    if (booking.customer_id && !bookingMap.has(booking.customer_id)) bookingMap.set(booking.customer_id, booking);
  }

  const filtered = customers.filter((customer) => {
    if (!q) return true;
    return [customer.name, customer.phone, customer.email, customer.referral_code]
      .some((value) => (value ?? "").toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5">
      <PageTitle title="会员 · Members" subtitle={`会员管理 · ${filtered.length} shown`} />

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">积分已更新 · Points updated</div>}

      <Card>
        <form action="/admin/members" className="grid gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索名字 / 电话 · Search name or phone"
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
          />
          <button className="min-h-12 rounded-full bg-sage-700 px-5 text-sm font-semibold text-cream-50">搜索 · Search</button>
        </form>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><EmptyState>找不到会员 · No members found</EmptyState></Card>
        ) : (
          filtered.map((customer) => {
            const latestBooking = bookingMap.get(customer.id);
            const waHref = localWhatsappToWaMe(customer.phone);
            return (
              <Card key={customer.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-ink">{customer.name || "Member"}</h2>
                    <p className="mt-1 text-sm text-taupe-600">{customer.phone || customer.email}</p>
                  </div>
                  <div className="rounded-2xl bg-sage-100 px-3 py-2 text-right">
                    <p className="font-serif text-2xl font-semibold text-sage-700">{customer.points_balance}</p>
                    <p className="text-[11px] text-sage-700">pts</p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-taupe-500">加入日期</dt><dd>{fmtDate(customer.created_at)}</dd></div>
                  <div><dt className="text-taupe-500">QR token</dt><dd className={customer.qr_token ? "text-sage-700" : "text-red-600"}>{customer.qr_token ? "Ready" : "Missing"}</dd></div>
                  <div><dt className="text-taupe-500">推荐码</dt><dd className="font-mono text-xs">{customer.referral_code}</dd></div>
                  <div><dt className="text-taupe-500">角色</dt><dd>{customer.role ?? (customer.is_admin ? "admin" : "member")}</dd></div>
                </dl>

                {latestBooking && (
                  <p className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-sm text-taupe-700">
                    最近预约：{pkgLabel(latestBooking.package_type)} · {bookingDateLabel(latestBooking)} · {latestBooking.status}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" className="min-h-11 rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50">WhatsApp</a>}
                  <PointButton customerId={customer.id} points={10} label="+10" returnTo={returnTo} />
                  <PointButton customerId={customer.id} points={50} label="+50" returnTo={returnTo} />
                  <PointButton customerId={customer.id} points={-10} label="-10" returnTo={returnTo} />
                </div>

                <form action={adjustPoints} className="mt-4 grid gap-2 sm:grid-cols-[100px_1fr_auto]">
                  <input type="hidden" name="customer_id" value={customer.id} />
                  <input type="hidden" name="transaction_type" value="adjust" />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <input name="points" type="number" required placeholder="±" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-3 text-sm" />
                  <input name="description" placeholder="Reason" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-3 text-sm" />
                  <button className="min-h-11 rounded-full border border-sage-300 px-4 text-sm font-semibold text-sage-700">自定义</button>
                </form>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
