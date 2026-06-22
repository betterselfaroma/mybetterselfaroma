"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
  toast,
  className = "",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  /** Optional message shown as a floating toast on successful copy. */
  toast?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      if (toast) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2200);
      }
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`inline-flex items-center gap-2 rounded-full bg-sage-700 px-5 py-2.5 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800 ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {copied ? (
            <path d="M5 12.5l4 4L19 7" />
          ) : (
            <>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </>
          )}
        </svg>
        {copied ? copiedLabel : label}
      </button>

      {toast && showToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-sage-900 px-5 py-2.5 text-sm font-medium text-cream-50 shadow-card"
        >
          {toast}
        </div>
      )}
    </>
  );
}
