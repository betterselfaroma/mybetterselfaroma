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

export default async function RewardsPage() {
  const customer = await requireMember();
  const supabase = createServerSupabase();

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

  if (productsRes.error) throw productsRes.error;
  if (redemptionsRes.error) throw redemptionsRes.error;

  const products = (productsRes.data ?? []) as RewardProduct[];
  const redemptions = (redemptionsRes.data ?? []) as RedemptionRow[];
  const productMap = new Map(products.map((product) => [product.id, product]));
  const pointsBalance = Number(customer.points_balance ?? customer.points ?? 0);

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
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 17l-5.6 3 1.6-6.3-5-4.2 6.5-.5L12 3Z" /></svg>
        </span>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">可兑换积分商品 · Rewards Products</h2>
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
          Points can be used to redeem selected rewards. Final redemption terms are subject to store confirmation. Points are not cash and cannot be withdrawn.
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">已兑换记录 · Redemption history</h2>
        {redemptions.length === 0 && <div className="mt-4"><EmptyState>暂无兑换记录</EmptyState></div>}
        <ul className="mt-4 divide-y divide-taupe-200/60">
          {redemptions.map((redemption) => {
            const product = redemption.product_id ? productMap.get(redemption.product_id) : null;
            const points = Number(redemption.points_cost ?? redemption.points_used ?? 0);

            return (
              <li key={redemption.id} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-taupe-700">
                  {fmtDate(redemption.created_at)} · {product?.name || "Reward"} · −{points} pts
                </span>
                <Badge status={redemption.status}>{REDEMPTION_STATUS_LABEL[redemption.status] ?? redemption.status}</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
