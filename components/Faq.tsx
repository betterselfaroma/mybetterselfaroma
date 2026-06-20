"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function Faq() {
  const { t, lang } = useLanguage();

  return (
    <section id="faq" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading title={t.faq.title} intro={t.faq.intro} />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {t.faq.items.map((item, i) => (
            <details
              key={`${lang}-${i}`}
              className="group h-fit rounded-2xl border border-taupe-200/70 bg-cream-50 px-5 py-1 shadow-sm transition-colors open:border-sage-300 sm:px-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-serif text-lg font-semibold text-ink marker:hidden">
                <span>{item.q}</span>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600 transition-transform duration-300 group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pr-8 text-[15px] leading-relaxed text-taupe-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
