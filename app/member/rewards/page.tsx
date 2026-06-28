import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { Card, Badge, PageTitle, EmptyState } from "@/components/membership/ui";
import RedeemButton from "@/components/membership/RedeemButton";
import { REDEMPTION_STATUS_LABEL, fmtDate } from "@/lib/membership-format";
import type { RewardProduct, RewardRedemption } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type RedemptionRow = RewardRedemption & {
  product_id?: string | null;
  points_cost?: number | null;
  points_used: number;
};

type PageProps = {
  searchParams?: {
    status?: string;
  };
};

const REDEMPTION_FILTERS = [
  { value: "all", label: "全部 · All" },
  { value: "pending", label: "待审核 · Pending" },
  { value: "approved", label: "已批准 · Approved" },
  { value: "completed", label: "已完成 · Completed" },
  { value: "cancelled", label: "已取消 · Cancelled" },
];

const VALID_REDEMPTION_STATUS = new Set(REDEMPTION_FILTERS.map((filter) => filter.value));

export default async function RewardsPage({ searchParams }: PageProps) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const selectedStatus = VALID_REDEMPTION_STATUS.has(searchParams?.status ?? "")
    ? searchParams?.status ?? "all"
    : "all";

  const [productsRes, redemptionsRes] = await Promise.all([
    supabase
      .from("reward_products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("points_cost", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("reward_redemptions")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false }),
  ]);

  if (productsRes.error) {
    console.error("Load member reward products failed:", productsRes.error);
  }

  if (redemptionsRes.error) {
    console.error("Load member reward redemptions failed:", redemptionsRes.error);
  }

  const products = (productsRes.error ? [] : productsRes.data ?? []) as RewardProduct[];
  const redemptions = (redemptionsRes.error ? [] : redemptionsRes.data ?? []) as RedemptionRow[];
  const productsError = productsRes.error?.message ?? null;
  const redemptionsError = redemptionsRes.error?.message ?? null;
  const productMap = new Map(products.map((product) => [product.id, product]));
  const pointsBalance = Number(customer.points_balance ?? customer.points ?? 0);
  const filteredRedemptions = selectedStatus === "all"
    ? redemptions
    : redemptions.filter((redemption) => redemption.status === selectedStatus);
  const redemptionCount = (status: string) => (
    status === "all"
      ? redemptions.length
      : redemptions.filter((redemption) => redemption.status === status).length
  );

  return (
    <div className="space-y-8">
      <PageTitle title="积分兑换" subtitle="Rewards · 用积分兑换指定商品与体验礼遇" />

      <Card className="flex items-center justify-between border-gold-400/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <div>
          <p className="text-sm text-taupe-500">当前积分 · Your points</p>
          <p className="font-serif text-4xl font-bold text-sage-700">
            {pointsBalance} <span className="text-base font-medium">pts</span>
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 17l-5.6 3 1.6-6.3-5-4.2 6.5-.5L12 3Z" />
          </svg>
        </span>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">可兑换积分商品 · Rewards Products</h2>
        {productsError && (
          <div className="mt-4 rounded-2xl border border-gold-300/60 bg-gold-300/15 p-4 text-sm leading-6 text-taupe-700">
            积分商品暂时无法载入：{productsError}
          </div>
        )}
        {products.length === 0 && <div className="mt-4"><EmptyState>暂无可兑换积分商品</EmptyState></div>}
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {products.map((product) => {
            const pointsCost = Number(product.points_cost ?? 0);
            const stock = Number(product.stock ?? 0);
            const enough = pointsBalance >= pointsCost;
            const inStock = stock > 0;
            const disabledLabel = !inStock ? "已换完" : "积分不足";

            return (
              <li key={product.id} className="overflow-hidden rounded-[1.45rem] border border-taupe-200/60 bg-cream-100">
                <div className="aspect-[4/3] bg-cream-200">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-taupe-500">No image</div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-semibold text-ink">{product.name}</p>
                    {product.description && <p className="mt-1 text-sm leading-6 text-taupe-600">{product.description}</p>}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-2xl font-semibold text-sage-700">{pointsCost} pts</p>
                      <p className="text-xs text-taupe-500">Stock: {stock}</p>
                    </div>
                    <RedeemButton productId={product.id} disabled={!enough || !inStock} disabledLabel={disabledLabel} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-taupe-500">
          积分可用于兑换指定商品与体验礼遇，最终兑换规则以店内确认为准。积分不可提现，不等同现金。
          Points can be used to redeem selected rewards. Final redemption terms are subject to store confirmation.
        </p>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">已兑换记录 · Redemption history</h2>
            <p className="mt-1 text-sm text-taupe-600">按处理状态快速查看兑换进度。</p>
          </div>
          <Link href="/member/points" className="rounded-full border border-sage-300 px-4 py-2 text-sm font-semibold text-sage-700">
            积分明细
          </Link>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {REDEMPTION_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/member/rewards" : `/member/rewards?status=${filter.value}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                selectedStatus === filter.value
                  ? "bg-sage-700 text-cream-50"
                  : "border border-taupe-200 bg-cream-50 text-sage-700"
              }`}
            >
              {filter.label} ({redemptionCount(filter.value)})
            </Link>
          ))}
        </div>
        {redemptionsError && (
          <div className="mt-4 rounded-2xl border border-gold-300/60 bg-gold-300/15 p-4 text-sm leading-6 text-taupe-700">
            兑换记录暂时无法载入：{redemptionsError}
          </div>
        )}
        {filteredRedemptions.length === 0 && <div className="mt-4"><EmptyState>暂无符合条件的兑换记录</EmptyState></div>}
        <ul className="mt-4 grid gap-3 md:block md:divide-y md:divide-taupe-200/60">
          {filteredRedemptions.map((redemption) => {
            const product = redemption.product_id ? productMap.get(redemption.product_id) : null;
            const points = Number(redemption.points_cost ?? redemption.points_used ?? 0);

            return (
              <li key={redemption.id} className="rounded-2xl border border-taupe-200/70 bg-cream-100 md:rounded-none md:border-0 md:bg-transparent">
                <Link href={`/member/rewards/${redemption.id}`} className="flex items-center justify-between gap-3 px-4 py-3 md:px-0">
                  <span className="text-sm text-taupe-700">
                    {fmtDate(redemption.created_at)} · {product?.name || "Reward"} · −{points} pts
                  </span>
                  <Badge status={redemption.status}>{REDEMPTION_STATUS_LABEL[redemption.status] ?? redemption.status}</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
