import { Card, Badge, EmptyState, PageTitle } from "@/components/membership/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, REDEMPTION_STATUS_LABEL } from "@/lib/membership-format";
import { localWhatsappToWaMe } from "@/lib/admin-mobile";
import {
  saveRewardProduct,
  setRedemptionStatus,
  setRewardProductActive,
} from "@/app/admin/actions";
import type { Customer, Reward, RewardProduct, RewardRedemption } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { notice?: string; error?: string };
};

type RedemptionRow = RewardRedemption & {
  product_id?: string | null;
  reward_id?: string | null;
  points_cost?: number | null;
  points_used: number;
};

function noticeMessage(code: string) {
  switch (code) {
    case "product_saved":
      return "积分商品已保存 · Reward product saved";
    case "product_active":
      return "商品已上架 · Product activated";
    case "product_inactive":
      return "商品已下架 · Product hidden";
    case "redemption_updated":
      return "兑换记录已更新 · Redemption updated";
    default:
      return code;
  }
}

function StatusButton({
  id,
  status,
  label,
}: {
  id: string;
  status: "approved" | "completed" | "cancelled";
  label: string;
}) {
  return (
    <form action={setRedemptionStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="return_to" value="/admin/rewards" />
      <button className="min-h-10 rounded-full border border-sage-300 px-3 text-xs font-semibold text-sage-700 hover:border-sage-700">
        {label}
      </button>
    </form>
  );
}

function ProductForm({ product }: { product?: RewardProduct }) {
  const isEditing = Boolean(product);

  return (
    <form action={saveRewardProduct} encType="multipart/form-data" className="grid gap-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      {product?.image_url && <input type="hidden" name="existing_image_url" value={product.image_url} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
          产品名称 · Name
          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm text-ink outline-none focus:border-sage-500"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
          积分 · Points
          <input
            name="points_cost"
            required
            min={1}
            type="number"
            defaultValue={product?.points_cost ?? 100}
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm text-ink outline-none focus:border-sage-500"
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
        产品说明 · Description
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm text-ink outline-none focus:border-sage-500"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
          库存 · Stock
          <input
            name="stock"
            required
            min={0}
            type="number"
            defaultValue={product?.stock ?? 0}
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm text-ink outline-none focus:border-sage-500"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
          排序 · Sort
          <input
            name="sort_order"
            type="number"
            defaultValue={product?.sort_order ?? 0}
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm text-ink outline-none focus:border-sage-500"
          />
        </label>
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm font-medium text-taupe-700">
          <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
          上架 · Active
        </label>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
          上传图片 · Upload image
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="min-h-12 rounded-2xl border border-dashed border-taupe-300 bg-cream-50 px-4 py-3 text-sm text-taupe-700 file:mr-3 file:rounded-full file:border-0 file:bg-sage-700 file:px-3 file:py-1.5 file:text-cream-50"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-taupe-700">
          或图片链接 · Image URL
          <input
            name="image_url"
            type="url"
            defaultValue={product?.image_url ?? ""}
            placeholder="https://..."
            className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm text-ink outline-none focus:border-sage-500"
          />
        </label>
      </div>

      <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50 shadow-sm hover:bg-sage-900">
        {isEditing ? "保存商品 · Save Product" : "新增商品 · Add Product"}
      </button>
    </form>
  );
}

export default async function AdminRewardsPage({ searchParams }: PageProps) {
  const notice = searchParams?.notice ?? "";
  const actionError = searchParams?.error ?? "";
  const supabase = createAdminClient();

  let error = "";
  let products: RewardProduct[] = [];
  let redemptions: RedemptionRow[] = [];
  let customers: Pick<Customer, "id" | "name" | "phone" | "email">[] = [];
  let legacyRewards: Pick<Reward, "id" | "name_cn" | "name_en">[] = [];

  try {
    const [productsRes, redemptionsRes, customersRes, rewardsRes] = await Promise.all([
      supabase
        .from("reward_products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("reward_redemptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(160),
      supabase.from("customers").select("id,name,phone,email"),
      supabase.from("rewards").select("id,name_cn,name_en"),
    ]);

    if (productsRes.error) throw productsRes.error;
    if (redemptionsRes.error) throw redemptionsRes.error;
    if (customersRes.error) throw customersRes.error;
    if (rewardsRes.error) throw rewardsRes.error;

    products = (productsRes.data ?? []) as RewardProduct[];
    redemptions = (redemptionsRes.data ?? []) as RedemptionRow[];
    customers = (customersRes.data ?? []) as Pick<Customer, "id" | "name" | "phone" | "email">[];
    legacyRewards = (rewardsRes.data ?? []) as Pick<Reward, "id" | "name_cn" | "name_en">[];
  } catch (loadError) {
    console.error("Load reward products failed:", loadError);
    error = loadError instanceof Error ? loadError.message : "Reward products could not be loaded.";
  }

  const redemptionCount = new Map<string, number>();
  for (const redemption of redemptions) {
    if (!redemption.product_id) continue;
    redemptionCount.set(redemption.product_id, (redemptionCount.get(redemption.product_id) ?? 0) + 1);
  }
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  const productMap = new Map(products.map((product) => [product.id, product]));
  const legacyRewardMap = new Map(legacyRewards.map((reward) => [reward.id, reward]));

  return (
    <div className="space-y-6">
      <PageTitle title="积分商品 · Rewards Products" subtitle="管理会员可用积分兑换的商品、库存与兑换记录。" />

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{noticeMessage(notice)}</div>}

      <Card className="rounded-[1.65rem] border-gold-300/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <h2 className="font-serif text-xl font-semibold text-ink">新增积分商品 · Add Reward Product</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          上传 JPG / PNG / WebP，单张图片最多 5MB。图片会保存到 Supabase Storage 的 reward-products bucket。
        </p>
        <div className="mt-5">
          <ProductForm />
        </div>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-semibold text-ink">商品列表 · Products</h2>
          <span className="rounded-full bg-cream-50 px-3 py-1 text-xs font-semibold text-taupe-600 ring-1 ring-taupe-200">
            {products.length} items
          </span>
        </div>

        {products.length === 0 ? (
          <Card><EmptyState>暂无积分商品 · No reward products yet</EmptyState></Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <Card key={product.id} className="rounded-[1.65rem]">
                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-100 ring-1 ring-taupe-200/70">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-xs text-taupe-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-ink">{product.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-taupe-600">{product.description || "No description"}</p>
                      </div>
                      <Badge status={product.active ? "completed" : "cancelled"}>{product.active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-2xl bg-cream-100 p-3"><dt className="text-taupe-500">积分</dt><dd className="font-semibold text-sage-700">{product.points_cost}</dd></div>
                      <div className="rounded-2xl bg-cream-100 p-3"><dt className="text-taupe-500">库存</dt><dd className="font-semibold text-ink">{product.stock}</dd></div>
                      <div className="rounded-2xl bg-cream-100 p-3"><dt className="text-taupe-500">已兑换</dt><dd className="font-semibold text-ink">{redemptionCount.get(product.id) ?? 0}</dd></div>
                    </dl>
                    <form action={setRewardProductActive} className="mt-4">
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="active" value={product.active ? "false" : "true"} />
                      <button className="min-h-10 rounded-full border border-sage-300 px-4 text-sm font-semibold text-sage-700 hover:border-sage-700">
                        {product.active ? "下架商品 · Deactivate" : "上架商品 · Activate"}
                      </button>
                    </form>
                  </div>
                </div>

                <details className="mt-5 rounded-2xl border border-taupe-200 bg-cream-100/70 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-sage-800">编辑商品 · Edit product</summary>
                  <div className="mt-4">
                    <ProductForm product={product} />
                  </div>
                </details>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="rounded-[1.65rem]">
        <h2 className="font-serif text-xl font-semibold text-ink">兑换记录 · Redemptions</h2>
        {redemptions.length === 0 ? (
          <div className="mt-4"><EmptyState>暂无兑换记录 · No redemption requests</EmptyState></div>
        ) : (
          <div className="mt-4 space-y-3">
            {redemptions.map((redemption) => {
              const customer = customerMap.get(redemption.customer_id);
              const product = redemption.product_id ? productMap.get(redemption.product_id) : null;
              const legacyReward = redemption.reward_id ? legacyRewardMap.get(redemption.reward_id) : null;
              const title = product?.name || legacyReward?.name_cn || legacyReward?.name_en || redemption.notes || "Reward";
              const waHref = localWhatsappToWaMe(customer?.phone ?? null);
              const points = Number(redemption.points_cost ?? redemption.points_used ?? 0);

              return (
                <div key={redemption.id} className="rounded-2xl border border-taupe-200/70 bg-cream-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-sm text-taupe-600">
                        {customer?.name || "Member"} · {customer?.phone || customer?.email || "No contact"}
                      </p>
                      <p className="mt-1 text-xs text-taupe-500">{fmtDate(redemption.created_at)} · -{points} pts</p>
                    </div>
                    <Badge status={redemption.status}>{REDEMPTION_STATUS_LABEL[redemption.status] ?? redemption.status}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {waHref && (
                      <a href={waHref} target="_blank" rel="noopener noreferrer" className="min-h-10 rounded-full bg-sage-700 px-4 py-2 text-xs font-semibold text-cream-50">
                        WhatsApp
                      </a>
                    )}
                    {redemption.status !== "completed" && redemption.status !== "cancelled" && (
                      <>
                        {redemption.status === "pending" && <StatusButton id={redemption.id} status="approved" label="Approve" />}
                        <StatusButton id={redemption.id} status="completed" label="Complete" />
                        <StatusButton id={redemption.id} status="cancelled" label="Cancel / Refund" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
