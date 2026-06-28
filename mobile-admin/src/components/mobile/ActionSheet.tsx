export type SheetAction = {
  label: string;
  danger?: boolean;
  onSelect: () => void;
};

export default function ActionSheet({
  open,
  title,
  actions,
  onCancel,
}: {
  open: boolean;
  title: string;
  actions: SheetAction[];
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <div className="bottom-sheet">
        <span className="sheet-handle" />
        <h3>{title}</h3>
        <div className="sheet-action-list">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={action.danger ? "sheet-action danger" : "sheet-action"}
              onClick={action.onSelect}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className="sheet-action muted" onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  );
}
