"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const CARD_ICONS = [
  // 内心真正的渴望 — heart
  <svg key="d" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" /></svg>,
  // 现在困住你的烦恼 — stuck / pause in circle
  <svg key="w" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></svg>,
  // 适合你的香气方向 — compass
  <svg key="c" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" /></svg>,
];

export default function WhatYouSee() {
  const { t } = useLanguage();

  return (
    <section id="why" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading title={t.whatYouSee.title} />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {t.whatYouSee.cards.map((c, i) => (
            <article
              key={c.title}
              className="group flex flex-col rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-sage-300 hover:shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60 transition-colors group-hover:bg-sage-700 group-hover:text-cream-50">
                {CARD_ICONS[i % CARD_ICONS.length]}
              </span>
              <h3 className="mt-5 font-serif text-xl font-semibold text-ink">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-taupe-600">{c.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
