"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function WhyNotOrdinary() {
  const { t, lang } = useLanguage();

  return (
    <section id="why" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow={lang === "zh" ? "核心理念" : "Our Concept"}
          title={t.why.title}
          intro={t.why.subtitle}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.cards.map((card) => (
            <article
              key={card.num}
              className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-sage-300 hover:shadow-card"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  width={1254}
                  height={940}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 to-transparent" />
                <span className="absolute left-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/95 font-serif text-base font-semibold text-gold-600 shadow-sm ring-1 ring-gold-400/30">
                  {card.num}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-lg font-semibold text-ink">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-taupe-600">
                  {card.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
