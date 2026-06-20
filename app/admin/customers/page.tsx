import { createAdminClient } from "@/lib/supabase/admin";
import { Card, PageTitle } from "@/components/membership/ui";
import { fmtDate } from "@/lib/membership-format";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  const customers = data ?? [];

  return (
    <div className="space-y-6">
      <PageTitle title="顾客" subtitle={`Customers · ${customers.length} total`} />
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-taupe-400">
            <tr className="border-b border-taupe-200/60">
              <th className="py-2 pr-4">姓名</th>
              <th className="py-2 pr-4">电话</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">推荐码</th>
              <th className="py-2 pr-4">来源码</th>
              <th className="py-2 pr-4">积分</th>
              <th className="py-2">注册日期</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-taupe-200/40">
                <td className="py-3 pr-4 font-medium text-ink">{c.name || "—"}</td>
                <td className="py-3 pr-4 text-taupe-600">{c.phone || "—"}</td>
                <td className="py-3 pr-4 text-taupe-600">{c.email}</td>
                <td className="py-3 pr-4 font-mono text-xs text-sage-700">{c.referral_code}</td>
                <td className="py-3 pr-4 font-mono text-xs text-taupe-500">{c.referred_by_code || "—"}</td>
                <td className="py-3 pr-4 font-semibold text-sage-700">{c.points_balance}</td>
                <td className="py-3 text-taupe-500">{fmtDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
