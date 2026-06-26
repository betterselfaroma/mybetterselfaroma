import { useEffect, useState } from "react";
import { fetchPointsTransactions } from "../lib/admin";
import type { PointsTransaction } from "../lib/types";

export default function Points() {
  const [rows, setRows] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPointsTransactions()
      .then(setRows)
      .catch((err) => {
        console.error("Load mobile points failed:", err);
        setError(err instanceof Error ? err.message : "Points could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-stack">
      <div className="page-title">
        <span>Points</span>
        <h1>积分记录</h1>
        <p>查看 points_transactions 最新记录。</p>
      </div>
      {error && <p className="error-box">{error}</p>}
      {loading ? <div className="empty-state">正在加载积分记录…</div> : rows.length === 0 ? <div className="empty-state">暂无积分记录</div> : null}
      {rows.map((row) => (
        <article className="data-card" key={row.id}>
          <div className="card-row">
            <div>
              <h3>{row.type}</h3>
              <p>{row.reason || row.description || "Points transaction"}</p>
            </div>
            <div className="points-badge"><strong>{row.points}</strong><span>pts</span></div>
          </div>
          <p className="muted">{row.created_at ? new Date(row.created_at).toLocaleString() : "-"}</p>
        </article>
      ))}
    </section>
  );
}
