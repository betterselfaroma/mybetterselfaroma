export type ToastTone = "success" | "error" | "warning";

export default function AppToast({
  toast,
  onClose,
}: {
  toast: { tone: ToastTone; message: string } | null;
  onClose: () => void;
}) {
  if (!toast) return null;
  return (
    <button type="button" className={["app-toast", toast.tone].join(" ")} onClick={onClose}>
      {toast.message}
    </button>
  );
}
