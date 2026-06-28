import { useEffect, useState } from "react";
import AppCard from "../components/mobile/AppCard";
import AppPage from "../components/mobile/AppPage";
import EmptyState from "../components/mobile/EmptyState";
import ErrorState from "../components/mobile/ErrorState";
import LoadingState from "../components/mobile/LoadingState";
import { fetchPointsTransactions } from "../features/points/points.api";
import { describeError, logError } from "../lib/errors";
import type { PointsTransaction } from "../lib/types";

export default function Points() {
  const [rows, setRows] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPointsTransactions()
      .then(setRows)
      .catch((err) => {
        logError("Load mobile points failed", err);
        setError(describeError(err, "Points could not be loaded"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppPage eyebrow="Points" title="积分记录" description="查看 points_transactions 最新记录。">
      {error && <ErrorState message="积分记录暂时无法读取。" details={error} />}
      {loading ? <LoadingState text="正在加载积分记录…" /> : rows.length === 0 ? <EmptyState title="暂无积分记录" /> : null}
      {rows.map((row) => (
        <AppCard key={row.id}>
          <div className="card-row">
            <div>
              <h3>{row.type}</h3>
              <p>{row.reason || row.description || "Points transaction"}</p>
            </div>
            <div className="points-badge"><strong>{row.points}</strong><span>pts</span></div>
          </div>
          <p className="muted">{row.created_at ? new Date(row.created_at).toLocaleString() : "-"}</p>
        </AppCard>
      ))}
    </AppPage>
  );
}
