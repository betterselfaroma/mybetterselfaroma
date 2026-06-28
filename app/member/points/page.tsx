import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageTitle, Stat } from "@/components/membership/ui";
import { LEDGER_LABEL, fmtDate } from "@/lib/membership-format";
import type { PointsLedgerEntry, PointsTransaction } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    type?: string;
  };
};

type ActivityKind = "earn" | "redeem" | "adjust";

type LedgerRecord = PointsLedgerEntry & {
  source: "ledger";
};

type TransactionRecord = PointsTransaction & {
  source: "transaction";
};

const FILTERS = [
  { value: "all", label: "全部 · All" },
  { value: "earn", label: "获得 · Earned" },
  { value: "redeem", label: "使用 · Used" },
  { value: "adjust", label: "调整 · Adjusted" },
];

function transactionOwnerFilter(customerId: string, authUserId?: string | null) {
  const filters = [`user_id.eq.${customerId}`];
  if (authUserId) filters.push(`user_id.eq.${authUserId}`);
  return filters.join(",");
}

function pointsKind(points: number, type?: string | null): ActivityKind {
  if (type === "adjust" || type === "manual_adjustment") return "adjust";
  if (type === "redeem" || points < 0) return "redeem";
  return "earn";
}

function toneForKind(kind: ActivityKind) {
  if (kind === "earn") return "completed";
  if (kind === "redeem") return "cancelled";
  return "pending";
}

function labelForKind(kind: ActivityKind) {
  if (kind === "earn") return "获得 · Earned";
  if (kind === "redeem") return "使用 · Used";
  return "调整 · Adjusted";
}

function matchesFilter(points: number, type: string | null | undefined, filter: string) {
  if (filter === "all") return true;
  return pointsKind(points, type) === filter;
}

function sumPositive(records: Array<{ points: number }>) {
  return records.reduce((total, record) => total + Math.max(Number(record.points ?? 0), 0), 0);
}

function sumNegative(records: Array<{ points: number }>) {
  return Math.abs(records.reduce((total, record) => total + Math.min(Number(record.points ?? 0), 0), 0));
}

function ActivityRow({
  record,
}: {
  record: LedgerRecord | TransactionRecord;
}) {
  const points = Number(record.points ?? 0);
  const type = record.source === "ledger" ? record.type : record.type;
  const kind = pointsKind(points, type);
  const title = record.source === "ledger"
    ? LEDGER_LABEL[record.type] ?? record.type
    : record.reason || labelForKind(kind);
  const description = record.source === "ledger"
    ? record.description
    : record.reason;

  return (
    <li className="rounded-2xl border border-taupe-200/70 bg-cream-100 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-1 text-xs text-taupe-500">{fmtDate(record.created_at)}</p>
          {description && description !== title && (
            <p className="mt-2 text-sm leading-6 text-taupe-600">{description}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className={`font-serif text-2xl font-semibold ${points >= 0 ? "text-sage-700" : "text-taupe-600"}`}>
            {points >= 0 ? "+" : ""}{points}
          </p>
          <Badge status={toneForKind(kind)}>{labelForKind(kind)}</Badge>
        </div>
      </div>
    </li>
  );
}

export default async function MemberPointsPage({ searchParams }: PageProps) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const filter = FILTERS.some((item) => item.value === searchParams?.type) ? searchParams?.type ?? "all" : "all";

  const [ledgerRes, transactionsRes] = await Promise.all([
    supabase
      .from("points_ledger")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("points_transactions")
      .select("*")
      .or(transactionOwnerFilter(customer.id, customer.auth_user_id))
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (ledgerRes.error) console.error("Load member points ledger failed:", ledgerRes.error);
  if (transactionsRes.error) console.error("Load member points transactions failed:", transactionsRes.error);

  const ledger = (ledgerRes.error ? [] : ledgerRes.data ?? []).map((record) => ({
    ...(record as PointsLedgerEntry),
    source: "ledger" as const,
  }));
  const transactions = (transactionsRes.error ? [] : transactionsRes.data ?? []).map((record) => ({
    ...(record as PointsTransaction),
    source: "transaction" as const,
  }));

  const primaryRecords = ledger.length > 0 ? ledger : transactions;
  const filteredPrimary = primaryRecords.filter((record) => matchesFilter(record.points, record.type, filter));
  const filteredTransactions = transactions.filter((record) => matchesFilter(record.points, record.type, filter));
  const balance = Number(customer.points_balance ?? customer.points ?? 0);
  const earned = sumPositive(primaryRecords);
  const used = sumNegative(primaryRecords);
  const adjusted = primaryRecords.filter((record) => pointsKind(record.points, record.type) === "adjust").length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="积分明细"
        subtitle="Points History · 查看积分获得、使用与后台调整记录。"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="当前积分 · Balance" value={balance} />
        <Stat label="累计获得 · Earned" value={`+${earned}`} />
        <Stat label="累计使用 · Used" value={`−${used}`} />
        <Stat label="后台调整 · Adjust" value={adjusted} />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Link
              key={item.value}
              href={item.value === "all" ? "/member/points" : `/member/points?type=${item.value}`}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                filter === item.value
                  ? "bg-sage-700 text-cream-50"
                  : "border border-taupe-200 bg-cream-50 text-sage-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Card>

      {(ledgerRes.error || transactionsRes.error) && (
        <Card className="border-gold-300/60 bg-gold-300/15">
          <p className="text-sm font-semibold text-ink">部分积分记录暂时无法载入</p>
          <div className="mt-2 space-y-1 text-sm leading-6 text-taupe-700">
            {ledgerRes.error && <p>积分记录：{ledgerRes.error.message}</p>}
            {transactionsRes.error && <p>后台流水：{transactionsRes.error.message}</p>}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">积分记录 · Points Ledger</h2>
            <p className="mt-1 text-sm text-taupe-600">
              {ledger.length > 0 ? "这里显示会员积分主记录。" : "如果主记录为空，将显示后台积分流水作为参考。"}
            </p>
          </div>
          <Link href="/member/rewards" className="hidden rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 sm:inline-flex">
            积分兑换
          </Link>
        </div>

        {filteredPrimary.length === 0 ? (
          <div className="mt-4">
            <EmptyState>暂无符合条件的积分记录 · No matching points activity</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {filteredPrimary.map((record) => (
              <ActivityRow key={`${record.source}-${record.id}`} record={record} />
            ))}
          </ul>
        )}
      </Card>

      {transactions.length > 0 && ledger.length > 0 && (
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">后台操作流水 · Admin Transactions</h2>
          <p className="mt-1 text-sm text-taupe-600">
            这部分用于查看店员或后台操作留下的积分流水，方便核对。
          </p>
          <ul className="mt-4 grid gap-3">
            {filteredTransactions.length === 0 ? (
              <EmptyState>暂无符合条件的后台流水</EmptyState>
            ) : (
              filteredTransactions.map((record) => (
                <ActivityRow key={`transaction-extra-${record.id}`} record={record} />
              ))
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
