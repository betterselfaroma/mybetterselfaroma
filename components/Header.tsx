"use client";

import { useEffect, useState } from "react";
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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:py-4">
        {/* Brand */}
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-600 text-cream-50 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
              <path d="M12 12c0-2.5 1-4.5 3-6" />
            </svg>
          </span>
          <span className="font-serif text-lg font-semibold leading-none text-ink sm:text-xl">
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

        {/* Actions — language switch always visible incl. mobile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LangSwitch />
          <button
            type="button"
            onClick={openChooser}
            className="hidden rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-cream-50 shadow-sm transition-colors hover:bg-sage-700 sm:inline-flex"
          >
            {t.nav.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
