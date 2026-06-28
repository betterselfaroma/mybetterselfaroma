import AppButton from "./AppButton";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state app-empty-state">
      <div className="empty-icon">—</div>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {actionLabel && onAction && <AppButton tone="secondary" onClick={onAction}>{actionLabel}</AppButton>}
    </div>
  );
}
