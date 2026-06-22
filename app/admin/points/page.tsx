import { createAdminClient } from "@/lib/supabase/admin";
import { Card, PageTitle, EmptyState } from "@/components/membership/ui";
import { LEDGER_LABEL, fmtDate } from "@/lib/membership-format";
import { adjustPoints } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPoints() {
  const supabase = createAdminClient();
  const [ledgerRes, customersRes] = await Promise.all([
    supabase.from("points_ledger").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("customers").select("id,name,email").order("name"),
  ]);
  const ledger = ledgerRes.data ?? [];
  const customers = customersRes.data ?? [];
  const custMap = new Map(customers.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageTitle title="积分" subtitle="Points ledger · 每次增减都会写入记录，可追踪来源。" />

      <Card>
        <h2 className="font-serif text-lg font-semibold text-ink">手动调整积分 · Manual adjustment</h2>
        <form action={adjustPoints} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_2fr_auto]">
          <select name="customer_id" required className="rounded-lg border border-taupe-200 bg-cream-50 px-3 py-2 text-sm">
            <option value="">选择顾客 · Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.email}</option>
            ))}
          </select>
          <input name="points" type="number" required placeholder="±points" className="w-28 rounded-lg border border-taupe-200 bg-cream-50 px-3 py-2 text-sm" />
          <input name="description" placeholder="原因 · Reason" className="rounded-lg border border-taupe-200 bg-cream-50 px-3 py-2 text-sm" />
          <button className="rounded-lg bg-sage-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-sage-800">写入</button>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        {ledger.length === 0 && <EmptyState>暂无积分记录</EmptyState>}
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-taupe-400">
            <tr className="border-b border-taupe-200/60">
              <th className="py-2 pr-4">顾客</th>
              <th className="py-2 pr-4">积分</th>
              <th className="py-2 pr-4">类型</th>
              <th className="py-2 pr-4">说明</th>
              <th className="py-2">日期</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((e) => {
              const c = custMap.get(e.customer_id);
              return (
                <tr key={e.id} className="border-b border-taupe-200/40">
                  <td className="py-3 pr-4 text-taupe-700">{c?.name || c?.email || "—"}</td>
                  <td className={`py-3 pr-4 font-semibold ${e.points >= 0 ? "text-sage-700" : "text-red-600"}`}>
                    {e.points >= 0 ? "+" : ""}{e.points}
                  </td>
                  <td className="py-3 pr-4 text-taupe-600">{LEDGER_LABEL[e.type] ?? e.type}</td>
                  <td className="py-3 pr-4 text-taupe-500">{e.description || "—"}</td>
                  <td className="py-3 text-taupe-500">{fmtDate(e.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
