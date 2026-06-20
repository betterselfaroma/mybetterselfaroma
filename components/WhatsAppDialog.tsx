"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLanguage, whatsappHref } from "@/lib/i18n";

interface WhatsAppContextValue {
  openChooser: () => void;
}

const WhatsAppContext = createContext<WhatsAppContextValue | null>(null);

export function useWhatsApp(): WhatsAppContextValue {
  const ctx = useContext(WhatsAppContext);
  if (!ctx) {
    throw new Error("useWhatsApp must be used within a <WhatsAppProvider>");
  }
  return ctx;
}

function WaIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

function ChooserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.whatsapp.chooseTitle}
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 p-6 shadow-card sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-taupe-500 transition-colors hover:bg-cream-200 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-cream-50">
            <WaIcon className="h-6 w-6" />
          </span>
          <h3 className="font-serif text-xl font-semibold text-ink">
            {t.whatsapp.chooseTitle}
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-taupe-600">
          {t.whatsapp.chooseHint}
        </p>

        <div className="mt-5 space-y-3">
          {t.whatsapp.contacts.map((c) => (
            <a
              key={c.number}
              href={whatsappHref(c.number, t.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-between gap-4 rounded-2xl border border-taupe-200/70 bg-cream-100 px-5 py-4 transition-colors hover:border-sage-400 hover:bg-sage-50"
            >
              <span className="min-w-0">
                <span className="block font-serif text-lg font-semibold text-ink">
                  {c.name}
                </span>
                <span className="block text-sm text-taupe-500">
                  {c.role} · {c.display}
                </span>
              </span>
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#25D366] text-cream-50 shadow-sm">
                <WaIcon className="h-6 w-6" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openChooser = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <WhatsAppContext.Provider value={{ openChooser }}>
      {children}
      <ChooserModal open={open} onClose={close} />
    </WhatsAppContext.Provider>
  );
}
