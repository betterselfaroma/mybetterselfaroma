import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge, PageTitle, EmptyState } from "@/components/membership/ui";
import { BOOKING_STATUS_LABEL, fmtDate, pkgLabel } from "@/lib/membership-format";
import { setBookingStatus } from "../actions";

export const dynamic = "force-dynamic";

function StatusBtn({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "rounded-lg bg-sage-700 px-3 py-1 text-xs font-medium text-cream-50 hover:bg-sage-800"
            : "rounded-lg border border-taupe-300 px-3 py-1 text-xs font-medium text-taupe-700 hover:border-sage-400 hover:text-sage-700"
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminBookings() {
  const supabase = createAdminClient();
  const [bookingsRes, customersRes] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("id,name,email,phone"),
  ]);
  const bookings = bookingsRes.data ?? [];
  const custMap = new Map((customersRes.data ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageTitle
        title="预约"
        subtitle="Bookings · 把状态改为「完成」即自动发放购买积分并生成推荐奖励（已完成的不会重复发放）。"
      />
      <Card className="overflow-x-auto">
        {bookings.length === 0 ? (
          <EmptyState>暂无预约记录</EmptyState>
        ) : (
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-taupe-400">
              <tr className="border-b border-taupe-200/60">
                <th className="py-2 pr-4">顾客 · Customer</th>
                <th className="py-2 pr-4">联系 · Contact</th>
                <th className="py-2 pr-4">套餐 · Package</th>
                <th className="py-2 pr-4">预约日期 · Date</th>
                <th className="py-2 pr-4">提交 · Created</th>
                <th className="py-2 pr-4">状态 · Status</th>
                <th className="py-2">操作 · Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const c = custMap.get(b.customer_id);
                const isOpen = b.status === "pending" || b.status === "confirmed";
                return (
                  <tr key={b.id} className="border-b border-taupe-200/40 align-top">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-ink">{c?.name || "—"}</div>
                      <div className="text-xs text-taupe-500">{c?.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-taupe-600">{c?.phone || "—"}</td>
                    <td className="py-3 pr-4 font-semibold text-sage-700">{pkgLabel(b.package_type)}</td>
                    <td className="py-3 pr-4 text-taupe-500">{fmtDate(b.booking_date)}</td>
                    <td className="py-3 pr-4 text-taupe-500">{fmtDate(b.created_at)}</td>
                    <td className="py-3 pr-4">
                      <Badge status={b.status}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge>
                    </td>
                    <td className="py-3">
                      {isOpen ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {b.status === "pending" && (
                            <StatusBtn id={b.id} status="confirmed" label="确认 · Confirm" />
                          )}
                          <StatusBtn id={b.id} status="completed" label="完成 · Complete" primary />
                          <StatusBtn id={b.id} status="cancelled" label="取消 · Cancel" />
                        </div>
                      ) : (
                        <span className="text-xs text-taupe-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
