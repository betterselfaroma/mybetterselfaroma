"use client";

import { useLanguage, whatsappHref } from "@/lib/i18n";
import { useWhatsApp } from "./WhatsAppDialog";

export default function Footer() {
  const { t, lang } = useLanguage();
  const { openChooser } = useWhatsApp();
  const sep = lang === "zh" ? "：" : ": ";

  return (
    <footer className="bg-sage-900 text-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 text-cream-50 ring-1 ring-cream-50/15">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
                  <path d="M12 12c0-2.5 1-4.5 3-6" />
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-serif text-lg font-semibold text-cream-50">香气读懂你的心</span>
                <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold-300">
                  Scent Knows You
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/70">
              {t.footer.subtitle}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-200/60">
              {t.footer.exploreLabel}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {t.nav.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="text-sm text-cream-200/80 transition-colors hover:text-cream-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-200/60">
              {t.footer.contactLabel}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {t.whatsapp.contacts.map((c) => (
                <li key={c.number} className="text-sm">
                  <a
                    href={whatsappHref(c.number, t.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream-200/80 transition-colors hover:text-cream-50"
                  >
                    <span className="text-cream-200/55">WhatsApp · {c.name}</span>
                    <span className="px-1.5 text-cream-200/40">·</span>
                    {c.display}
                  </a>
                </li>
              ))}
              {t.footer.contacts.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm text-cream-200/80">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-cream-50/10 text-cream-200/80 ring-1 ring-cream-50/10">
                    {c.label.toLowerCase() === "instagram" ? (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                    )}
                  </span>
                  <span className="text-cream-200/55">{c.label}</span>
                  <span className="text-cream-200/40">·</span>
                  {c.value}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={openChooser}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-sage-600 px-5 py-2.5 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-500"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.5 11.86c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
              </svg>
              WhatsApp
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 rounded-2xl bg-cream-50/5 p-5 text-sm leading-relaxed text-cream-200/60">
          <span className="font-semibold text-cream-200/80">
            {t.footer.disclaimerLabel}
            {sep}
          </span>
          {t.footer.disclaimer}
        </div>

        <div className="mt-8 border-t border-cream-50/10 pt-6 text-center text-xs text-cream-200/50">
          © {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
