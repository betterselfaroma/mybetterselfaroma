"use client";

import { useLanguage } from "@/lib/i18n";

export default function UpgradeBar() {
  const { t, lang } = useLanguage();
  const addOnLabel = lang === "zh" ? "加购价" : "add-on";

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative flex flex-col items-center gap-7 overflow-hidden rounded-[1.75rem] border border-gold-400/50 bg-gradient-to-r from-gold-300/30 via-cream-200 to-sage-100/60 p-6 shadow-soft sm:flex-row sm:justify-between sm:p-8">
          <div className="aura -right-6 -top-10 h-40 w-40 bg-gold-300/30" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gold-sheen text-ink shadow-lift ring-1 ring-cream-50/40">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9h16v3H4zM5 12h14v8H5zM12 9v11" />
                <path d="M12 9C9 9 8 5 10 4c1.5-.8 2 2 2 5 0-3 .5-5.8 2-5 2 1 1 5-2 5Z" />
              </svg>
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-ink sm:text-xl">
                {t.upgrade.text}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-taupe-600">
                {t.upgrade.sub}
              </p>
            </div>
          </div>

          {/* RM60 → +RM90 (add-on) → RM150 flow */}
          <div className="relative flex flex-none items-center gap-2.5 text-sm font-semibold">
            <span className="rounded-full bg-cream-50 px-4 py-2 text-sage-700 shadow-sm ring-1 ring-taupe-200/60">RM60</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-taupe-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            <span className="flex flex-col items-center">
              <span className="rounded-full bg-gold-sheen px-4 py-2 text-ink shadow-sm ring-1 ring-cream-50/40">+RM90</span>
              <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-wider text-taupe-500">{addOnLabel}</span>
            </span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-taupe-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            <span className="rounded-full bg-sage-700 px-4 py-2 text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40">RM150</span>
          </div>
        </div>
      </div>
    </section>
  );
}
