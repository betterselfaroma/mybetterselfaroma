import { displayPoints } from "../lib/admin";
import { toWhatsAppUrl } from "../lib/whatsapp";
import { openExternalUrl } from "../app/NativeBridge";
import type { Customer, TransactionType } from "../lib/types";

export default function MemberCard({
  customer,
  onAdjust,
  onGenerateQr,
}: {
  customer: Customer;
  onAdjust?: (customerId: string, points: number, type: TransactionType, reason: string) => void;
  onGenerateQr?: (customerId: string) => void;
}) {
  const wa = toWhatsAppUrl(customer.phone);
  return (
    <article className="data-card">
      <div className="card-row">
        <div>
          <h3>{customer.name || "Member"}</h3>
          <p>{customer.phone || customer.email || "-"}</p>
        </div>
        <div className="points-badge">
          <strong>{displayPoints(customer)}</strong>
          <span>pts</span>
        </div>
      </div>
      <div className="info-grid">
        <span><small>QR Token</small>{customer.qr_token ? "Ready" : "Missing"}</span>
        <span><small>角色</small>{customer.role ?? (customer.is_admin ? "admin" : "member")}</span>
        <span><small>推荐码</small>{customer.referral_code || "-"}</span>
        <span><small>加入</small>{customer.created_at?.slice(0, 10) ?? "-"}</span>
      </div>
      <div className="action-row">
        {wa && (
          <a
            className="primary-button small"
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
        {!customer.qr_token && onGenerateQr && (
          <button type="button" className="outline-button" onClick={() => onGenerateQr(customer.id)}>
            生成 QR Token
          </button>
        )}
        {onAdjust && (
          <>
            <button type="button" className="outline-button" onClick={() => onAdjust(customer.id, 10, "earn", "Mobile admin reward")}>+10</button>
            <button type="button" className="outline-button" onClick={() => onAdjust(customer.id, -10, "redeem", "Mobile admin redeem")}>-10</button>
          </>
        )}
      </div>
    </article>
  );
}
