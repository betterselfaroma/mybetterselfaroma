import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge, PageTitle } from "@/components/membership/ui";
import { BOOKING_STATUS_LABEL, fmtDate, pkgLabel } from "@/lib/membership-format";
import { setBookingStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default async function AdminBookings() {
  const supabase = createAdminClient();
  const [bookingsRes, customersRes] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("id,name,email"),
  ]);
  const bookings = bookingsRes.data ?? [];
  const custMap = new Map((customersRes.data ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageTitle
        title="预约"
        subtitle="Bookings · 把状态改为 completed 即自动发放购买积分并生成推荐奖励（若符合条件）。"
      />
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-taupe-400">
            <tr className="border-b border-taupe-200/60">
              <th className="py-2 pr-4">顾客</th>
              <th className="py-2 pr-4">套餐</th>
              <th className="py-2 pr-4">日期</th>
              <th className="py-2 pr-4">状态</th>
              <th className="py-2">修改状态</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const c = custMap.get(b.customer_id);
              return (
                <tr key={b.id} className="border-b border-taupe-200/40">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{c?.name || "—"}</div>
                    <div className="text-xs text-taupe-500">{c?.email}</div>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-sage-700">{pkgLabel(b.package_type)}</td>
                  <td className="py-3 pr-4 text-taupe-500">{fmtDate(b.created_at)}</td>
                  <td className="py-3 pr-4">
                    <Badge status={b.status}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge>
                  </td>
                  <td className="py-3">
                    <form action={setBookingStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <select
                        name="status"
                        defaultValue={b.status}
                        className="rounded-lg border border-taupe-200 bg-cream-50 px-2 py-1 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="rounded-lg bg-sage-700 px-3 py-1 text-xs font-medium text-cream-50 hover:bg-sage-800">
                        更新
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
