import { Card, EmptyState } from "@/components/membership/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate } from "@/lib/membership-format";
import { BOOKING_STABLE_SELECT, bookingDateLabel, bookingPackageLabel, localWhatsappToWaMe } from "@/lib/admin-mobile";
import { adjustPoints, setCustomerRole } from "../actions";
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
      supabase
        .from("customers")
        .select("id,auth_user_id,email,name,phone,referral_code,points_balance,created_at,qr_token,role,is_admin")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("bookings")
        .select(BOOKING_STABLE_SELECT)
        .order("created_at", { ascending: false })
        .limit(220),
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
    if (booking.user_id && !bookingMap.has(booking.user_id)) bookingMap.set(booking.user_id, booking);
  }

  const filtered = customers.filter((customer) => {
    if (!q) return true;
    return [customer.name, customer.phone, customer.email, customer.referral_code]
      .some((value) => (value ?? "").toLowerCase().includes(q));
  });
  const noticeText =
    notice === "role_updated"
      ? "会员权限已更新 · Member role updated"
      : notice
        ? "积分已更新 · Points updated"
        : "";

  return (
    <div className="space-y-5">
      <div className="rounded-[1.65rem] bg-cream-50/90 p-5 shadow-[0_20px_58px_-38px_rgba(82,67,47,0.5)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-600">Members</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">会员管理</h1>
        <p className="mt-2 text-sm leading-6 text-taupe-600">{filtered.length} 位会员显示中，可快速搜索、联系和调整积分。</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
      {noticeText && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{noticeText}</div>}

      <Card className="rounded-[1.65rem]">
        <form action="/admin/members" className="grid gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索名字 / 电话 · Search name or phone"
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm outline-none focus:border-sage-500"
          />
          <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50">搜索 · Search</button>
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
              <Card key={customer.id} className="rounded-[1.65rem]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-ink">{customer.name || "Member"}</h2>
                    <p className="mt-1 text-sm text-taupe-600">{customer.phone || customer.email}</p>
                  </div>
                  <div className="rounded-2xl bg-sage-800 px-3 py-2 text-right text-cream-50">
                    <p className="font-serif text-2xl font-semibold">{customer.points_balance}</p>
                    <p className="text-[11px] text-cream-100/75">pts</p>
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
                    最近预约：{bookingPackageLabel(latestBooking)} · {bookingDateLabel(latestBooking)} · {latestBooking.status}
                  </p>
                )}

                <form action={setCustomerRole} className="mt-4 rounded-2xl border border-gold-300/40 bg-gold-300/10 p-4">
                  <input type="hidden" name="customer_id" value={customer.id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-gold-700">
                    权限设置 · Role
                  </label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <select
                      name="role"
                      defaultValue={customer.is_admin ? "admin" : customer.role ?? "member"}
                      className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-3 text-sm text-ink outline-none focus:border-sage-500"
                    >
                      <option value="member">会员 · Member</option>
                      <option value="staff">店员 · Staff</option>
                      <option value="admin">管理员 · Admin</option>
                    </select>
                    <button className="min-h-11 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50 hover:bg-sage-900">
                      保存权限
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-taupe-600">
                    Admin 可进入后台并分配其他会员权限；Staff 可使用后台工作功能。
                  </p>
                </form>

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
