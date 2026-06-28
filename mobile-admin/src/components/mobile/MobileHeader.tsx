import BrandMark from "../BrandMark";

export default function MobileHeader({
  title,
  subtitle,
  userEmail,
  onLogout,
}: {
  title?: string;
  subtitle?: string;
  userEmail?: string | null;
  onLogout: () => void;
}) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-brand">
        <BrandMark size="sm" />
        <div>
          <strong>{title ?? "香气读懂你的心"}</strong>
          <span>{subtitle ?? "Admin App"}</span>
        </div>
      </div>
      <div className="mobile-header-actions">
        {userEmail && <span className="mobile-user-pill">{userEmail}</span>}
        <button className="ghost-button compact" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
