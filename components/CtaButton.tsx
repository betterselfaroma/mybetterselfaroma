"use client";

import { useWhatsApp } from "./WhatsAppDialog";

type Variant = "primary" | "secondary" | "light";

const styles: Record<Variant, string> = {
  primary:
    "bg-sage-700 text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 hover:bg-sage-800 hover:shadow-lift focus-visible:outline-sage-700",
  secondary:
    "border border-sage-300 bg-cream-50/70 text-sage-700 backdrop-blur-sm hover:border-sage-500 hover:bg-sage-50 hover:shadow-soft focus-visible:outline-sage-500",
  light:
    "bg-cream-50 text-sage-800 shadow-soft hover:bg-cream-200 hover:shadow-lift focus-visible:outline-cream-200",
};

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1.05em] w-[1.05em]"
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export default function CtaButton({
  label,
  variant = "primary",
  className = "",
  withIcon = true,
}: {
  label: string;
  variant?: Variant;
  className?: string;
  withIcon?: boolean;
}) {
  const { openChooser } = useWhatsApp();

  return (
    <button
      type="button"
      onClick={openChooser}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${styles[variant]} ${className}`}
    >
      {withIcon && <WhatsAppIcon />}
      <span>{label}</span>
    </button>
  );
}
