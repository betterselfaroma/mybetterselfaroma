import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchRewardProducts, saveRewardProduct, setRewardProductActive } from "../lib/admin";
import { describeError, logError } from "../lib/errors";
import type { OperatorProfile, RewardProduct } from "../lib/types";

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
  const [products, setProducts] = useState<RewardProduct[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setProducts(await fetchRewardProducts());
    } catch (err) {
      logError("Load mobile reward products failed", err);
      setError(describeError(err, "Rewards products could not be loaded"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
      setForm(EMPTY_FORM);
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
      await load();
    } catch (err) {
      logError("Toggle mobile reward product failed", err);
      setError(describeError(err, "Reward product status could not be updated"));
    }
  }

  return (
    <section className="page-stack">
      <div className="page-title">
        <span>Rewards Products</span>
        <h1>积分商品管理</h1>
        <p>管理会员可兑换商品、积分、库存和上下架状态。图片上传请优先使用网页版 Admin。</p>
      </div>

      <form className="filter-card" onSubmit={submit}>
        <input placeholder="商品名称" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <textarea placeholder="商品说明" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input placeholder="图片链接 Image URL" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} />
        <div className="two-col">
          <input type="number" min="1" placeholder="所需积分" value={form.points_cost} onChange={(event) => setForm({ ...form, points_cost: event.target.value })} />
          <input type="number" min="0" placeholder="库存" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
        </div>
        <div className="two-col">
          <input type="number" placeholder="排序" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} />
          <label className="check-row">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            上架 Active
          </label>
        </div>
        <div className="two-col">
          <button className="primary-button full" type="submit" disabled={saving}>
            {saving ? "保存中..." : editing ? "保存商品" : "新增商品"}
          </button>
          {editing && (
            <button className="text-button" type="button" onClick={() => setForm(EMPTY_FORM)}>
              取消编辑
            </button>
          )}
        </div>
      </form>

      {notice && <p className="success-box">{notice}</p>}
      {error && <p className="error-box">{error}</p>}
      {loading ? <div className="empty-state">正在加载积分商品...</div> : products.length === 0 ? <div className="empty-state">暂无积分商品</div> : null}

      {products.map((product) => (
        <article className="data-card" key={product.id}>
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
        </article>
      ))}
    </section>
  );
}
