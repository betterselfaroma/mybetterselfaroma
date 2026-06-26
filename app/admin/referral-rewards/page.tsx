import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge, PageTitle } from "@/components/membership/ui";
import { REWARD_STATUS_LABEL, fmtDate, pkgLabel } from "@/lib/membership-format";
import { approveReward, issueReward, cancelReward } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminReferralRewards() {
  const supabase = createAdminClient();
  const [rewardsRes, customersRes, bookingsRes] = await Promise.all([
    supabase.from("referral_rewards").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("id,name,email"),
    supabase.from("bookings").select("id,package_name,package_code"),
  ]);
  const rewards = rewardsRes.data ?? [];
  const custMap = new Map((customersRes.data ?? []).map((c) => [c.id, c]));
  const bookMap = new Map((bookingsRes.data ?? []).map((b) => [b.id, b]));

  return (
    <div className="space-y-6">
      <PageTitle
        title="推荐奖励"
        subtitle="Referral rewards · TNG PIN 由你手动填写并发放，不会自动发放。"
      />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-taupe-400">
            <tr className="border-b border-taupe-200/60">
              <th className="py-2 pr-4">推荐人</th>
              <th className="py-2 pr-4">被推荐人</th>
              <th className="py-2 pr-4">套餐</th>
              <th className="py-2 pr-4">状态</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-taupe-500">暂无推荐奖励。</td></tr>
            )}
            {rewards.map((r) => {
              const referrer = custMap.get(r.referrer_customer_id);
              const referred = custMap.get(r.referred_customer_id);
              const booking = bookMap.get(r.booking_id);
              const pkg = booking?.package_name || (booking?.package_code ? pkgLabel(booking.package_code) : "-");
              return (
                <tr key={r.id} className="border-b border-taupe-200/40 align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{referrer?.name || "—"}</div>
                    <div className="text-xs text-taupe-500">{referrer?.email}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{referred?.name || "—"}</div>
                    <div className="text-xs text-taupe-500">{fmtDate(r.created_at)}</div>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-sage-700">{pkg}</td>
                  <td className="py-3 pr-4">
                    <Badge status={r.status}>{REWARD_STATUS_LABEL[r.status] ?? r.status}</Badge>
                    {r.tng_pin_code && (
                      <div className="mt-1 font-mono text-xs text-sage-700">{r.tng_pin_code}</div>
                    )}
                    {r.issued_at && (
                      <div className="mt-1 text-xs text-taupe-500">发放 · Issued {fmtDate(r.issued_at)}</div>
                    )}
                  </td>
                  <td className="py-3">
                    {r.status === "cancelled" || r.status === "issued" ? (
                      <span className="text-xs text-taupe-400">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {r.status === "pending" && (
                          <form action={approveReward}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="rounded-lg border border-sage-400 px-3 py-1 text-xs font-medium text-sage-700 hover:bg-sage-50">
                              Approve
                            </button>
                          </form>
                        )}
                        <form action={issueReward} className="flex items-center gap-1.5">
                          <input type="hidden" name="id" value={r.id} />
                          <input
                            name="tng_pin_code"
                            placeholder="TNG PIN"
                            className="w-28 rounded-lg border border-taupe-200 bg-cream-50 px-2 py-1 text-xs"
                          />
                          <button className="rounded-lg bg-sage-700 px-3 py-1 text-xs font-medium text-cream-50 hover:bg-sage-800">
                            Mark issued
                          </button>
                        </form>
                        <form action={cancelReward}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="rounded-lg border border-taupe-300 px-3 py-1 text-xs font-medium text-taupe-600 hover:bg-taupe-100">
                            Cancel
                          </button>
                        </form>
                      </div>
                    )}
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
