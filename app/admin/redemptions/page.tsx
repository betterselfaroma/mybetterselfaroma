import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Badge, PageTitle } from "@/components/membership/ui";
import { REDEMPTION_STATUS_LABEL, fmtDate } from "@/lib/membership-format";
import { setRedemptionStatus } from "../actions";

export const dynamic = "force-dynamic";

function ActionButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setRedemptionStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-lg border border-taupe-300 px-3 py-1 text-xs font-medium text-taupe-700 hover:border-sage-400 hover:text-sage-700">
        {label}
      </button>
    </form>
  );
}

export default async function AdminRedemptions() {
  const supabase = createAdminClient();
  const [redRes, customersRes, rewardsRes] = await Promise.all([
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("id,name,email"),
    supabase.from("rewards").select("id,name_cn,name_en"),
  ]);
  const redemptions = redRes.data ?? [];
  const custMap = new Map((customersRes.data ?? []).map((c) => [c.id, c]));
  const rewardMap = new Map((rewardsRes.data ?? []).map((r) => [r.id, r]));

  return (
    <div className="space-y-6">
      <PageTitle title="积分兑换" subtitle="Redemptions · 审核顾客的积分兑换请求。" />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-taupe-400">
            <tr className="border-b border-taupe-200/60">
              <th className="py-2 pr-4">顾客</th>
              <th className="py-2 pr-4">奖励</th>
              <th className="py-2 pr-4">积分</th>
              <th className="py-2 pr-4">状态</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-taupe-500">暂无兑换请求。</td></tr>
            )}
            {redemptions.map((r) => {
              const c = custMap.get(r.customer_id);
              const reward = rewardMap.get(r.reward_id);
              return (
                <tr key={r.id} className="border-b border-taupe-200/40">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink">{c?.name || "—"}</div>
                    <div className="text-xs text-taupe-500">{fmtDate(r.created_at)}</div>
                  </td>
                  <td className="py-3 pr-4 text-taupe-700">{reward?.name_cn || reward?.name_en || "—"}</td>
                  <td className="py-3 pr-4 font-semibold text-sage-700">−{r.points_used}</td>
                  <td className="py-3 pr-4">
                    <Badge status={r.status}>{REDEMPTION_STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </td>
                  <td className="py-3">
                    {r.status === "completed" || r.status === "cancelled" ? (
                      <span className="text-xs text-taupe-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {r.status === "pending" && <ActionButton id={r.id} status="approved" label="Approve" />}
                        <ActionButton id={r.id} status="completed" label="Complete" />
                        <ActionButton id={r.id} status="cancelled" label="Cancel (refund)" />
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
