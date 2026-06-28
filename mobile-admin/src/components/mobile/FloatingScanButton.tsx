import type { RouteKey } from "../../routes";

export default function FloatingScanButton({ onNavigate }: { onNavigate: (route: RouteKey) => void }) {
  return (
    <button className="floating-scan-button" type="button" onClick={() => onNavigate("scan")}>
      扫码
    </button>
  );
}
