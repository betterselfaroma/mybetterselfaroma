import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";
import StatCard from "../components/StatCard";
import AppCard from "../components/mobile/AppCard";
import AppPage from "../components/mobile/AppPage";
import AppButton from "../components/mobile/AppButton";
import ErrorState from "../components/mobile/ErrorState";
import LoadingState from "../components/mobile/LoadingState";
import { fetchDashboardOverview } from "../features/dashboard/dashboard.api";
import { describeError, logError } from "../lib/errors";
import type { DashboardOverview, OperatorProfile } from "../lib/types";
import type { RouteKey } from ".";

export default function Dashboard({
  onNavigate,
  profile,
}: {
  onNavigate: (route: RouteKey) => void;
  profile: OperatorProfile;
}) {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchDashboardOverview()
      .then((stats) => {
        if (!cancelled) setData(stats);
      })
      .catch((err) => {
        logError("Load mobile dashboard failed", err);
        if (!cancelled) setError(describeError(err, "Dashboard could not be loaded"));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) return <LoadingState text="正在读取今日后台…" />;

  return (
    <AppPage eyebrow="Admin Dashboard" title="今日后台" description={profile.email ?? "Admin"} hero>
      <AppCard>
        <div className="dashboard-top-actions">
          <div>
            <h3>手机后台</h3>
            <p>预约、会员、扫码与积分的快速入口。</p>
          </div>
          <AppButton onClick={() => onNavigate("scan")}>扫会员 QR</AppButton>
        </div>
      </AppCard>

      {error && (
        <ErrorState
          title="Dashboard could not be loaded"
          message="首页资料暂时无法读取。"
          details={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {data && (
        <>
          <div className="stats-grid">
            <StatCard label="今日预约" value={data.metrics.todayBookings.value} hint={data.metrics.todayBookings.error || "Today" } />
            <StatCard label="待确认" value={data.metrics.pendingBookings.value} hint={data.metrics.pendingBookings.error || "Pending"} />
            <StatCard label="新增会员" value={data.metrics.todayMembers.value} hint={data.metrics.todayMembers.error || "New"} />
            <StatCard label="总会员" value={data.metrics.totalMembers.value} hint={data.metrics.totalMembers.error || "Members"} />
            <StatCard label="今日积分" value={data.metrics.todayPointsIssued.value} hint={data.metrics.todayPointsIssued.error || "Issued"} />
          </div>

          <div className="quick-grid">
            <button className="quick-action primary" onClick={() => onNavigate("scan")}>扫会员 QR<span>Scan member</span></button>
            <button className="quick-action" onClick={() => onNavigate("bookings")}>今日预约<span>Bookings</span></button>
            <button className="quick-action" onClick={() => onNavigate("members")}>搜索会员<span>Members</span></button>
            <button className="quick-action" onClick={() => onNavigate("points")}>积分记录<span>Points</span></button>
            <button className="quick-action" onClick={() => onNavigate("rewards")}>积分商品<span>Rewards</span></button>
          </div>

          {data.errors.length > 0 && (
            <ErrorState
              title="部分统计读取失败"
              message="Dashboard 继续可用，失败的统计已显示为 0。"
              details={data.errors.join("\n")}
            />
          )}

          <div className="section-head">
            <h2>今日预约</h2>
            <button onClick={() => onNavigate("bookings")}>全部</button>
          </div>
          {data.todayBookings.length === 0 ? (
            <div className="empty-state">今天暂无预约</div>
          ) : (
            data.todayBookings.slice(0, 4).map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </>
      )}
    </AppPage>
  );
}
