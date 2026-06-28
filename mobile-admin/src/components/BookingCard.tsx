import { displayPackage } from "../lib/admin";
import { toWhatsAppUrl } from "../lib/whatsapp";
import { openExternalUrl } from "../app/NativeBridge";
import type { Booking, BookingStatus } from "../lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

export default function BookingCard({
  booking,
  onStatus,
}: {
  booking: Booking;
  onStatus?: (bookingId: string, status: BookingStatus) => void;
}) {
  const phone = booking.contact;
  const wa = toWhatsAppUrl(phone);
  return (
    <article className="data-card">
      <div className="card-row">
        <div>
          <h3>{phone || "未填写电话"}</h3>
          <p>{displayPackage(booking)}</p>
        </div>
        <span className={`status-pill ${booking.status}`}>{STATUS_LABEL[booking.status] ?? booking.status}</span>
      </div>
      <div className="info-grid">
        <span><small>套餐</small>{displayPackage(booking)}</span>
        <span><small>金额</small>RM{booking.amount ?? "-"}</span>
        <span><small>日期</small>{booking.booking_date ?? "-"}</span>
        <span><small>时间</small>{booking.booking_time ?? "-"}</span>
      </div>
      {booking.notes && <p className="note">{booking.notes}</p>}
      <div className="action-row">
        {wa && (
          <a
            className="outline-button"
            href={wa}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.preventDefault();
              openExternalUrl(wa);
            }}
          >
            WhatsApp
          </a>
        )}
        {onStatus && (
          <>
            <button type="button" className="outline-button" onClick={() => onStatus(booking.id, "confirmed")}>Confirm</button>
            <button type="button" className="primary-button small" onClick={() => onStatus(booking.id, "completed")}>Complete</button>
            <button type="button" className="outline-button" onClick={() => onStatus(booking.id, "cancelled")}>Cancel</button>
          </>
        )}
      </div>
    </article>
  );
}
