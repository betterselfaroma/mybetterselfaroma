import { hapticTap } from "../../app/NativeBridge";

type ButtonTone = "primary" | "secondary" | "danger" | "ghost";

export default function AppButton({
  tone = "primary",
  loading = false,
  full = false,
  children,
  className = "",
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  loading?: boolean;
  full?: boolean;
}) {
  const toneClass =
    tone === "primary"
      ? "primary-button"
      : tone === "secondary"
        ? "outline-button"
        : tone === "danger"
          ? "danger-button"
          : "ghost-button";

  return (
    <button
      {...props}
      className={[toneClass, full ? "full" : "", className].filter(Boolean).join(" ")}
      disabled={props.disabled || loading}
      onClick={(event) => {
        hapticTap();
        onClick?.(event);
      }}
    >
      {loading ? "处理中..." : children}
    </button>
  );
}
