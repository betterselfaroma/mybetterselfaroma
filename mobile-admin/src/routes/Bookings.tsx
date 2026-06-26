import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";
import { fetchBookings, setBookingStatus, todayInMalaysia } from "../lib/admin";
import type { Booking, BookingStatus, OperatorProfile } from "../lib/types";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function Bookings({ profile }: { profile: OperatorProfile }) {
  const [q, setQ] = useState("");
  const [date, setDate] = useState(todayInMalaysia());
  const [status, setStatus] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBookings(await fetchBookings({ q, date, status }));
    } catch (err) {
      console.error("Load mobile bookings failed:", err);
      setError(err instanceof Error ? err.message : "Bookings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeStatus(bookingId: string, nextStatus: BookingStatus) {
    setNotice("");
    try {
      await setBookingStatus(bookingId, nextStatus, profile.userId);
      setNotice("预约状态已更新");
      await load();
    } catch (err) {
      console.error("Mobile booking status update failed:", err);
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  return (
    <section className="page-stack">
      <div className="page-title">
        <span>Bookings</span>
        <h1>预约管理</h1>
        <p>使用 booking_date / booking_time 查询。</p>
      </div>

      <div className="filter-card">
        <input placeholder="搜索电话 / 名字" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="two-col">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <button className="primary-button full" onClick={load} disabled={loading}>{loading ? "加载中…" : "筛选"}</button>
      </div>

      {notice && <p className="success-box">{notice}</p>}
      {error && <p className="error-box">{error}</p>}
      {loading ? <div className="empty-state">正在加载预约…</div> : bookings.length === 0 ? <div className="empty-state">没有符合条件的预约</div> : null}
      {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} onStatus={changeStatus} />)}
    </section>
  );
}
