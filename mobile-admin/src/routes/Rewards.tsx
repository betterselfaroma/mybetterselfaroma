import { FormEvent, useEffect, useMemo, useState } from "react";
import AppButton from "../components/mobile/AppButton";
import AppCard from "../components/mobile/AppCard";
import AppInput from "../components/mobile/AppInput";
import AppPage from "../components/mobile/AppPage";
import AppTextarea from "../components/mobile/AppTextarea";
import EmptyState from "../components/mobile/EmptyState";
import ErrorState from "../components/mobile/ErrorState";
import LoadingState from "../components/mobile/LoadingState";
import { useApp } from "../app/AppProvider";
import { fetchRewardProducts, fetchRewardRedemptions, saveRewardProduct, setRewardProductActive } from "../features/rewards/rewards.api";
import { describeError, logError } from "../lib/errors";
import type { OperatorProfile, RewardProduct, RewardRedemption } from "../lib/types";

type FormState = {
  id?: string;
  name: string;
  description: string;
  image_url: string;
  points_cost: string;
  stock: string;
  sort_order: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  image_url: "",
  points_cost: "100",
  stock: "0",
  sort_order: "0",
  active: true,
};

function formFromProduct(product: RewardProduct): FormState {
  return {
    id: product.id,
    name: product.name ?? "",
    description: product.description ?? "",
    image_url: product.image_url ?? "",
    points_cost: String(product.points_cost ?? 100),
    stock: String(product.stock ?? 0),
    sort_order: String(product.sort_order ?? 0),
    active: product.active,
  };
}

export default function Rewards({ profile }: { profile: OperatorProfile }) {
  const [tab, setTab] = useState<"products" | "redemptions">("products");
  const [products, setProducts] = useState<RewardProduct[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { setPageDirty, showToast } = useApp();

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  function updateForm(next: Partial<FormState>) {
    setForm((current) => ({ ...current, ...next }));
    setPageDirty(true);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      if (tab === "products") {
        setProducts(await fetchRewardProducts());
      } else {
        setRedemptions(await fetchRewardRedemptions());
      }
    } catch (err) {
      logError("Load mobile reward products failed", err);
      setError(describeError(err, tab === "products" ? "Rewards products could not be loaded" : "Reward redemptions could not be loaded"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await saveRewardProduct({
        id: form.id,
        name: form.name,
        description: form.description,
        image_url: form.image_url,
        points_cost: Number(form.points_cost),
        stock: Number(form.stock),
        sort_order: Number(form.sort_order),
        active: form.active,
        operatorUserId: profile.userId,
      });
      setNotice(editing ? "商品已更新" : "商品已新增");
      showToast(editing ? "商品已更新" : "商品已新增");
      setForm(EMPTY_FORM);
      setPageDirty(false);
      await load();
    } catch (err) {
      logError("Save mobile reward product failed", err);
      setError(describeError(err, "Reward product could not be saved"));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(product: RewardProduct) {
    setError("");
    setNotice("");
    try {
      await setRewardProductActive(product.id, !product.active);
      setNotice(product.active ? "商品已下架" : "商品已上架");
      showToast(product.active ? "商品已下架" : "商品已上架");
      await load();
    } catch (err) {
      logError("Toggle mobile reward product failed", err);
      setError(describeError(err, "Reward product status could not be updated"));
    }
  }

  return (
    <AppPage eyebrow="Rewards Products" title="积分商品管理" description="商品、库存、积分和上下架状态。图片上传请优先使用网页版 Admin。">
      <div className="segmented-control">
        <button type="button" className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>商品管理</button>
        <button type="button" className={tab === "redemptions" ? "active" : ""} onClick={() => setTab("redemptions")}>兑换记录</button>
      </div>

      {tab === "products" && <form className="filter-card" onSubmit={submit}>
        <AppInput label="商品名称" placeholder="商品名称" value={form.name} onChange={(event) => updateForm({ name: event.target.value })} />
        <AppTextarea label="商品说明" placeholder="商品说明" rows={3} value={form.description} onChange={(event) => updateForm({ description: event.target.value })} />
        <AppInput label="图片链接" placeholder="Image URL" value={form.image_url} onChange={(event) => updateForm({ image_url: event.target.value })} />
        <div className="two-col">
          <AppInput label="所需积分" type="number" min="1" placeholder="所需积分" value={form.points_cost} onChange={(event) => updateForm({ points_cost: event.target.value })} />
          <AppInput label="库存" type="number" min="0" placeholder="库存" value={form.stock} onChange={(event) => updateForm({ stock: event.target.value })} />
        </div>
        <div className="two-col">
          <AppInput label="排序" type="number" placeholder="排序" value={form.sort_order} onChange={(event) => updateForm({ sort_order: event.target.value })} />
          <label className="check-row">
            <input type="checkbox" checked={form.active} onChange={(event) => updateForm({ active: event.target.checked })} />
            上架 Active
          </label>
        </div>
        <div className="two-col">
          <AppButton full type="submit" loading={saving}>
            {saving ? "保存中..." : editing ? "保存商品" : "新增商品"}
          </AppButton>
          {editing && (
            <button className="text-button" type="button" onClick={() => {
              setForm(EMPTY_FORM);
              setPageDirty(false);
            }}>
              取消编辑
            </button>
          )}
        </div>
      </form>}

      {notice && <p className="success-box">{notice}</p>}
      {error && <ErrorState message="积分商品暂时无法读取。" details={error} onRetry={load} />}
      {loading ? <LoadingState text="正在加载积分商品..." /> : tab === "products" && products.length === 0 ? <EmptyState title="暂无积分商品" description="可以先新增一个会员兑换商品。" /> : null}
      {!loading && tab === "redemptions" && redemptions.length === 0 ? <EmptyState title="暂无兑换记录" description="会员兑换商品后会显示在这里。" /> : null}

      {tab === "products" && products.map((product) => (
        <AppCard key={product.id}>
          <div className="card-row">
            <div>
              <h3>{product.name}</h3>
              <p>{product.description || "No description"}</p>
            </div>
            <span className={["status-pill", product.active ? "confirmed" : "cancelled"].join(" ")}>
              {product.active ? "Active" : "Inactive"}
            </span>
          </div>
          {product.image_url && <img className="reward-product-image" src={product.image_url} alt={product.name} />}
          <div className="info-grid">
            <span><small>Points</small>{product.points_cost} pts</span>
            <span><small>Stock</small>{product.stock}</span>
          </div>
          <div className="card-actions">
            <button className="text-button" type="button" onClick={() => setForm(formFromProduct(product))}>编辑</button>
            <button className="text-button" type="button" onClick={() => toggle(product)}>
              {product.active ? "下架" : "上架"}
            </button>
          </div>
        </AppCard>
      ))}
      {tab === "redemptions" && redemptions.map((row) => (
        <AppCard key={row.id} title={row.status ?? "pending"} subtitle={row.notes ?? "Reward redemption"}>
          <div className="info-grid">
            <span><small>Points</small>{row.points_cost ?? 0} pts</span>
            <span><small>Created</small>{row.created_at?.slice(0, 10) ?? "-"}</span>
            <span><small>Customer</small>{row.customer_id ?? "-"}</span>
            <span><small>Product</small>{row.product_id ?? "-"}</span>
          </div>
        </AppCard>
      ))}
    </AppPage>
  );
}
