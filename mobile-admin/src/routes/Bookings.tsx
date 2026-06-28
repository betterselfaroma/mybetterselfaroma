import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";
import AppInput from "../components/mobile/AppInput";
import AppPage from "../components/mobile/AppPage";
import AppSelect from "../components/mobile/AppSelect";
import ConfirmSheet from "../components/mobile/ConfirmSheet";
import EmptyState from "../components/mobile/EmptyState";
import ErrorState from "../components/mobile/ErrorState";
import LoadingState from "../components/mobile/LoadingState";
import { fetchBookings, setBookingStatus, todayInMalaysia } from "../features/bookings/bookings.api";
import { describeError, logError } from "../lib/errors";
import type { Booking, BookingStatus, OperatorProfile } from "../lib/types";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function Bookings({ profile }: { profile: OperatorProfile }) {
  const [q, setQ] = useState("");
  const [date, setDate] = useState(todayInMalaysia());
  const [status, setStatus] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: BookingStatus } | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBookings(await fetchBookings({ q, date, status }));
    } catch (err) {
      logError("Load mobile bookings failed", err);
      setError(describeError(err, "Bookings load failed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 260);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, date, status]);

  async function changeStatus(bookingId: string, nextStatus: BookingStatus) {
    setNotice("");
    setStatusLoading(true);
    try {
      await setBookingStatus(bookingId, nextStatus, profile.userId);
      setNotice("预约状态已更新");
      setPendingStatus(null);
      await load();
    } catch (err) {
      logError("Mobile booking status update failed", err);
      setError(describeError(err, "Update failed"));
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <AppPage eyebrow="Bookings" title="预约管理" description="按电话、日期和状态处理预约。">

      <div className="filter-card">
        <AppInput label="搜索" placeholder="搜索电话 / 备注" value={q} clearable onClear={() => setQ("")} onChange={(e) => setQ(e.target.value)} />
        <div className="two-col">
          <AppInput label="日期" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <AppSelect label="状态" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </AppSelect>
        </div>
      </div>

      {notice && <p className="success-box">{notice}</p>}
      {error && <ErrorState message="预约列表暂时无法读取。" details={error} onRetry={load} />}
      {loading ? <LoadingState text="正在加载预约…" /> : bookings.length === 0 ? <EmptyState title="没有符合条件的预约" description="试试更换日期或状态。" /> : null}
      {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} onStatus={(id, nextStatus) => setPendingStatus({ id, status: nextStatus })} />)}
      <ConfirmSheet
        open={Boolean(pendingStatus)}
        title="确认更新预约状态？"
        message={pendingStatus ? `将预约状态改为 ${pendingStatus.status}` : ""}
        confirmLabel="确认更新"
        danger={pendingStatus?.status === "cancelled"}
        loading={statusLoading}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => pendingStatus && changeStatus(pendingStatus.id, pendingStatus.status)}
      />
    </AppPage>
  );
}
