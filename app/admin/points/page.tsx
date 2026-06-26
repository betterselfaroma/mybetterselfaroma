import { Card, EmptyState, PageTitle } from "@/components/membership/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate } from "@/lib/membership-format";
import { adjustPoints } from "../actions";
import type { Customer, PointsTransaction } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { notice?: string; error?: string };
};

export default async function AdminPointsPage({ searchParams }: PageProps) {
  let error = "";
  let transactions: PointsTransaction[] = [];
  let customers: Customer[] = [];
  const notice = searchParams?.notice ?? "";
  const actionError = searchParams?.error ?? "";

  try {
    const supabase = createAdminClient();
    const [transactionsRes, customersRes] = await Promise.all([
      supabase.from("points_transactions").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("customers").select("*").order("name"),
    ]);
    if (transactionsRes.error) throw new Error(transactionsRes.error.message);
    if (customersRes.error) throw new Error(customersRes.error.message);
    transactions = (transactionsRes.data ?? []) as PointsTransaction[];
    customers = (customersRes.data ?? []) as Customer[];
  } catch (loadError) {
    console.error("Load admin points failed:", loadError);
    error = loadError instanceof Error ? loadError.message : "Points records could not be loaded.";
  }

  const customerByAnyId = new Map<string, Customer>();
  for (const customer of customers) {
    customerByAnyId.set(customer.id, customer);
    if (customer.auth_user_id) customerByAnyId.set(customer.auth_user_id, customer);
  }

  return (
    <div className="space-y-5">
      <PageTitle title="积分 · Points" subtitle="points_transactions · 手机积分流水" />

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">积分已更新 · Points updated</div>}

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">手动调整积分</h2>
        <form action={adjustPoints} className="mt-4 grid gap-3">
          <input type="hidden" name="transaction_type" value="adjust" />
          <input type="hidden" name="return_to" value="/admin/points" />
          <select name="customer_id" required className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm">
            <option value="">选择会员 · Member</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name || customer.email}</option>
            ))}
          </select>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <input name="points" type="number" required placeholder="±points" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
            <input name="description" placeholder="Reason" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          </div>
          <button className="min-h-12 rounded-full bg-sage-700 px-5 text-sm font-semibold text-cream-50">写入 · Save</button>
        </form>
      </Card>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <Card><EmptyState>暂无积分流水 · No point transactions</EmptyState></Card>
        ) : (
          transactions.map((entry) => {
            const customer = entry.user_id ? customerByAnyId.get(entry.user_id) : null;
            return (
              <Card key={entry.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{customer?.name || customer?.email || entry.user_id || "Unknown member"}</p>
                    <p className="mt-1 text-sm text-taupe-600">{entry.reason || "-"}</p>
                    <p className="mt-1 text-xs text-taupe-500">{fmtDate(entry.created_at)} · {entry.type}</p>
                  </div>
                  <span className={`font-serif text-2xl font-semibold ${entry.points >= 0 ? "text-sage-700" : "text-red-600"}`}>
                    {entry.points >= 0 ? "+" : ""}{entry.points}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
