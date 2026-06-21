"use client";

import { useLanguage } from "@/lib/i18n";

const icons = [
  // gentle / leaf
  <svg key="leaf" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19c0-7 5-12 14-12 0 7-5 12-14 12Z" />
    <path d="M5 19c3.5-3.5 6.5-5.5 10-7" />
  </svg>,
  // safe / shield-check
  <svg key="shield" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>,
  // companion / heart
  <svg key="heart" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  </svg>,
  // not medical / info
  <svg key="info" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>,
];

export default function SafetyStrip() {
  const { t } = useLanguage();

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10">
        <div className="grid gap-x-6 gap-y-6 rounded-[2rem] border border-taupe-200/60 bg-cream-50/90 p-6 shadow-soft backdrop-blur-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {t.trust.items.map((item, i) => (
            <div
              key={item.title}
              className={`group flex items-start gap-3.5 ${
                i < t.trust.items.length - 1 ? "lg:border-r lg:border-taupe-200/50 lg:pr-6" : ""
              }`}
            >
              <span className="mt-0.5 flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-sage-100 text-sage-600 ring-1 ring-sage-200/60 transition-colors group-hover:bg-sage-600 group-hover:text-cream-50">
                {icons[i]}
              </span>
              <div>
                <p className="font-serif text-base font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-taupe-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
