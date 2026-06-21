"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import LangSwitch from "./LangSwitch";
import { useWhatsApp } from "./WhatsAppDialog";

function BrandMark() {
  return (
    <span className="flex h-11 w-11 flex-none items-center justify-center text-sage-900">
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="3.5" />
        <path d="M24 20.5c0-6 2.6-10.5 0-14-2.6 3.5 0 8 0 14Z" />
        <path d="M24 27.5c0 6 2.6 10.5 0 14-2.6-3.5 0-8 0-14Z" />
        <path d="M20.5 24c-6 0-10.5 2.6-14 0 3.5-2.6 8 0 14 0Z" />
        <path d="M27.5 24c6 0 10.5 2.6 14 0-3.5-2.6-8 0-14 0Z" />
        <path d="M21.2 21.2l-7-7M26.8 21.2l7-7M21.2 26.8l-7 7M26.8 26.8l7 7" />
      </svg>
    </span>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const { openChooser } = useWhatsApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-taupe-200/60 bg-cream-50/90 shadow-[0_10px_40px_-28px_rgba(60,74,48,0.5)] backdrop-blur-xl"
          : "border-b border-taupe-200/50 bg-cream-50/80 backdrop-blur-md"
      }`}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3.5 sm:gap-3 sm:px-6 lg:py-5">
        {/* Brand — bilingual lockup */}
        <a href="#top" className="group flex flex-none items-center gap-2.5">
          <BrandMark />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-serif text-lg font-semibold text-ink lg:text-xl">
              香气读懂你的心
            </span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
              Scent Knows You
            </span>
          </span>
        </a>

        {/* Desktop nav — centered, in-flow so it never overlaps the actions */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex">
          {t.nav.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="relative whitespace-nowrap text-sm font-medium text-taupe-600 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold-500 after:transition-all after:duration-300 hover:text-sage-800 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden flex-none items-center gap-2.5 xl:flex">
          <LangSwitch />
          <Link
            href="/login"
            className="px-1 text-sm font-medium text-taupe-600 transition-colors hover:text-sage-700"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-sage-700 px-4 py-2 text-sm font-medium text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 transition-all hover:-translate-y-0.5 hover:bg-sage-800"
          >
            {t.nav.register}
          </Link>
          <button
            type="button"
            onClick={openChooser}
            aria-label={t.nav.cta}
            className="inline-flex items-center gap-1.5 rounded-full border border-sage-300 bg-cream-50/70 px-4 py-2 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500 hover:bg-sage-50"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Z" />
            </svg>
            {t.nav.cta}
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex flex-none items-center gap-1.5 xl:hidden">
          <LangSwitch />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-taupe-200 bg-cream-50/80 text-ink backdrop-blur transition-colors hover:border-sage-400"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="xl:hidden">
          <div className="mx-3 mb-3 overflow-hidden rounded-3xl border border-taupe-200/70 bg-cream-50/95 p-5 shadow-card backdrop-blur-xl">
            <nav className="flex flex-col">
              {t.nav.links.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-taupe-700 transition-colors hover:bg-sage-50 hover:text-sage-800"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="my-4 hairline" />

            <div className="flex flex-col gap-2.5">
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-sage-700 px-5 py-3 text-sm font-medium text-cream-50 shadow-soft"
              >
                {t.nav.register}
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-sage-300 bg-cream-50 px-5 py-3 text-sm font-medium text-sage-700"
              >
                {t.nav.login}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openChooser();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-cream-50 shadow-soft"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Z" />
                </svg>
                {t.nav.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
