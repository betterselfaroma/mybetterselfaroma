import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";
import LoadingScreen from "../components/LoadingScreen";
import StatCard from "../components/StatCard";
import { fetchDashboard } from "../lib/admin";
import type { DashboardStats } from "../lib/types";
import type { RouteKey } from ".";

export default function Dashboard({ onNavigate }: { onNavigate: (route: RouteKey) => void }) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchDashboard()
      .then((stats) => {
        if (!cancelled) setData(stats);
      })
      .catch((err) => {
        console.error("Load mobile dashboard failed:", err);
        if (!cancelled) setError(err instanceof Error ? err.message : "Dashboard could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) return <LoadingScreen text="正在读取今日后台…" />;

  return (
    <section className="page-stack">
      <div className="hero-card">
        <span>Admin Dashboard</span>
        <h1>今日后台</h1>
        <p>快速处理预约、扫码与会员积分。</p>
      </div>

      {error && <p className="error-box">{error}</p>}

      {data && (
        <>
          <div className="stats-grid">
            <StatCard label="今日预约" value={data.todayBookingsCount} hint="Today" />
            <StatCard label="待确认" value={data.pendingBookingsCount} hint="Pending" />
            <StatCard label="新增会员" value={data.todayMembersCount} hint="New" />
            <StatCard label="总会员" value={data.totalMembersCount} hint="Members" />
            <StatCard label="今日积分" value={data.todayPointsIssued} hint="Issued" />
          </div>

          <div className="quick-grid">
            <button className="quick-action primary" onClick={() => onNavigate("scan")}>扫会员 QR<span>Scan member</span></button>
            <button className="quick-action" onClick={() => onNavigate("bookings")}>今日预约<span>Bookings</span></button>
            <button className="quick-action" onClick={() => onNavigate("members")}>搜索会员<span>Members</span></button>
            <button className="quick-action" onClick={() => onNavigate("points")}>积分记录<span>Points</span></button>
          </div>

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
    </section>
  );
}
