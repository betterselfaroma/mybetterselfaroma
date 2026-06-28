import Link from "next/link";
import { requireMember } from "@/lib/supabase/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { Badge, Card, PageTitle } from "@/components/membership/ui";
import { REDEMPTION_STATUS_LABEL, fmtDate } from "@/lib/membership-format";
import type { RewardProduct, RewardRedemption } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

type RedemptionRow = RewardRedemption & {
  product_id?: string | null;
  points_cost?: number | null;
};

export default async function MemberRewardDetailPage({ params }: PageProps) {
  const customer = await requireMember();
  const supabase = await createServerSupabase();
  const redemptionId = params.id;

  const redemptionRes = await supabase
    .from("reward_redemptions")
    .select("*")
    .eq("id", redemptionId)
    .eq("customer_id", customer.id)
    .maybeSingle();

  if (redemptionRes.error) {
    console.error("Load member redemption detail failed:", redemptionRes.error);
  }

  const redemption = (redemptionRes.data ?? null) as RedemptionRow | null;
  let product: RewardProduct | null = null;
  let productError = "";

  if (redemption?.product_id) {
    const productRes = await supabase
      .from("reward_products")
      .select("*")
      .eq("id", redemption.product_id)
      .maybeSingle();

    if (productRes.error) {
      console.error("Load member redemption product failed:", productRes.error);
      productError = productRes.error.message;
    } else {
      product = (productRes.data ?? null) as RewardProduct | null;
    }
  }

  if (redemptionRes.error) {
    return (
      <div className="space-y-6">
        <PageTitle title="兑换详情" subtitle="Reward Redemption Detail" />
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{redemptionRes.error.message}</p>
          <Link href="/member/rewards" className="mt-4 inline-flex rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50">
            返回积分兑换
          </Link>
        </Card>
      </div>
    );
  }

  if (!redemption) {
    return (
      <div className="space-y-6">
        <PageTitle title="兑换详情" subtitle="Reward Redemption Detail" />
        <Card>
          <p className="text-sm text-taupe-600">找不到这笔兑换记录，或它不属于当前会员。</p>
          <Link href="/member/rewards" className="mt-4 inline-flex rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50">
            返回积分兑换
          </Link>
        </Card>
      </div>
    );
  }

  const points = Number(redemption.points_cost ?? redemption.points_used ?? 0);

  return (
    <div className="space-y-6">
      <PageTitle title="兑换详情" subtitle="Reward Redemption Detail · 查看兑换状态与处理说明。" />

      <Card className="overflow-hidden p-0">
        {product?.image_url ? (
          <div className="aspect-[16/10] bg-cream-200">
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Reward</p>
              <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
                {product?.name || "Reward Redemption"}
              </h1>
              {product?.description && (
                <p className="mt-2 text-sm leading-6 text-taupe-600">{product.description}</p>
              )}
            </div>
            <Badge status={redemption.status}>
              {REDEMPTION_STATUS_LABEL[redemption.status] ?? redemption.status}
            </Badge>
          </div>

          {productError && (
            <div className="mt-4 rounded-2xl border border-gold-300/60 bg-gold-300/15 p-4 text-sm text-taupe-700">
              商品资料暂时无法载入：{productError}
            </div>
          )}

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">兑换积分</dt>
              <dd className="mt-1 font-serif text-2xl font-semibold text-sage-700">−{points} pts</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">提交日期</dt>
              <dd className="mt-1 font-semibold text-ink">{fmtDate(redemption.created_at)}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">当前状态</dt>
              <dd className="mt-1 font-semibold text-ink">{REDEMPTION_STATUS_LABEL[redemption.status] ?? redemption.status}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 px-4 py-3">
              <dt className="text-taupe-500">完成日期</dt>
              <dd className="mt-1 font-semibold text-ink">{redemption.completed_at ? fmtDate(redemption.completed_at) : "-"}</dd>
            </div>
          </dl>

          {(redemption.notes || redemption.admin_notes) && (
            <div className="mt-5 rounded-2xl bg-cream-100 p-4 text-sm leading-6 text-taupe-700">
              {redemption.notes && <p>{redemption.notes}</p>}
              {redemption.admin_notes && <p className="mt-2">{redemption.admin_notes}</p>}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-taupe-200/70 bg-cream-50 p-4 text-sm leading-6 text-taupe-600">
            兑换提交后，工作人员会在后台处理。若兑换被取消，积分会按规则退回。
          </div>

          <Link href="/member/rewards" className="mt-5 inline-flex rounded-full bg-sage-700 px-5 py-3 text-sm font-semibold text-cream-50">
            返回积分兑换
          </Link>
        </div>
      </Card>
    </div>
  );
}
