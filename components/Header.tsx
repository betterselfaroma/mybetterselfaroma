"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import LangSwitch from "./LangSwitch";
import { useWhatsApp } from "./WhatsAppDialog";

export default function Header() {
  const { t } = useLanguage();
  const { openChooser } = useWhatsApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-taupe-200/70 bg-cream-100/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 lg:py-4">
        {/* Brand */}
        <a href="#top" className="group flex flex-none items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-600 text-cream-50 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
              <path d="M12 12c0-2.5 1-4.5 3-6" />
            </svg>
          </span>
          <span className="hidden font-serif text-lg font-semibold leading-none text-ink sm:inline lg:text-xl">
            {t.nav.brand}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {t.nav.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-medium text-taupe-600 transition-colors hover:text-sage-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions — language switch + member entries always visible (incl. mobile) */}
        <div className="flex flex-none items-center gap-1.5 sm:gap-2.5">
          <LangSwitch />
          <Link
            href="/login"
            className="px-1 text-sm font-medium text-taupe-600 transition-colors hover:text-sage-700"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-sage-300 px-2.5 py-1.5 text-xs font-medium text-sage-700 transition-colors hover:border-sage-500 hover:bg-sage-50 sm:px-3.5 sm:text-sm"
          >
            {t.nav.register}
          </Link>
          <button
            type="button"
            onClick={openChooser}
            aria-label={t.nav.cta}
            className="inline-flex items-center gap-1.5 rounded-full bg-sage-600 px-2.5 py-2 text-cream-50 shadow-sm transition-colors hover:bg-sage-700 sm:px-4"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Z" />
            </svg>
            <span className="hidden text-sm font-medium sm:inline">{t.nav.cta}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
