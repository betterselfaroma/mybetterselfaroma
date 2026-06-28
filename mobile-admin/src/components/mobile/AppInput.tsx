export default function AppInput({
  label,
  error,
  helper,
  clearable,
  onClear,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helper?: string;
  clearable?: boolean;
  onClear?: () => void;
}) {
  return (
    <label className="app-field">
      {label && <span>{label}</span>}
      <div className="app-field-control">
        <input {...props} />
        {clearable && props.value ? (
          <button type="button" className="field-clear" onClick={onClear}>
            ×
          </button>
        ) : null}
      </div>
      {helper && !error && <small>{helper}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
