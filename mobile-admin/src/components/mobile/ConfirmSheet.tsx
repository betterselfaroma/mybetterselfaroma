import AppButton from "./AppButton";

export default function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = "确认",
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <div className="bottom-sheet">
        <span className="sheet-handle" />
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="sheet-actions">
          <AppButton tone={danger ? "danger" : "primary"} loading={loading} onClick={onConfirm}>{confirmLabel}</AppButton>
          <AppButton tone="secondary" onClick={onCancel}>取消</AppButton>
        </div>
      </div>
    </div>
  );
}
