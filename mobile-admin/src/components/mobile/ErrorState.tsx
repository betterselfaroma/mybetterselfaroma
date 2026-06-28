import AppButton from "./AppButton";

export default function ErrorState({
  title = "载入失败",
  message,
  details,
  actionLabel = "重试",
  onRetry,
}: {
  title?: string;
  message: string;
  details?: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state">
      <strong>{title}</strong>
      <p>{message}</p>
      {details && (
        <details>
          <summary>查看技术错误</summary>
          <code>{details}</code>
        </details>
      )}
      {onRetry && <AppButton tone="secondary" onClick={onRetry}>{actionLabel}</AppButton>}
      <a className="outline-button" href="https://wa.me/60124761919" target="_blank" rel="noreferrer">
        WhatsApp 联系我们
      </a>
    </div>
  );
}
