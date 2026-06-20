"use client";

import { useLanguage } from "@/lib/i18n";

export default function UpgradeBar() {
  const { t } = useLanguage();

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-[1.75rem] border border-gold-400/50 bg-gradient-to-r from-gold-300/30 via-cream-200 to-sage-100/60 p-6 sm:flex-row sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gold-500 text-cream-50 shadow-sm">
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

          {/* RM49 → +RM80 → RM129 flow */}
          <div className="flex flex-none items-center gap-2.5 text-sm font-semibold">
            <span className="rounded-full bg-cream-50 px-4 py-2 text-sage-700 shadow-sm">RM49</span>
            <span className="flex items-center gap-1 text-taupe-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              +RM80
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
            <span className="rounded-full bg-sage-700 px-4 py-2 text-cream-50 shadow-sm">RM129</span>
          </div>
        </div>
      </div>
    </section>
  );
}
