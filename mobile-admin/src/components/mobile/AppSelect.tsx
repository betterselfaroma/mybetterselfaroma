export default function AppSelect({
  label,
  error,
  helper,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helper?: string;
}) {
  return (
    <label className="app-field">
      {label && <span>{label}</span>}
      <select {...props}>{children}</select>
      {helper && !error && <small>{helper}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
