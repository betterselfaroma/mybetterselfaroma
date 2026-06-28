export default function AppTextarea({
  label,
  error,
  helper,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helper?: string;
}) {
  return (
    <label className="app-field">
      {label && <span>{label}</span>}
      <textarea {...props} />
      {helper && !error && <small>{helper}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
