"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function WhyNotOrdinary() {
  const { t } = useLanguage();

  return (
    <section id="why" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading title={t.why.title} intro={t.why.subtitle} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.cards.map((card) => (
            <article
              key={card.num}
              className="flex flex-col overflow-hidden rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 shadow-soft transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  width={1254}
                  height={940}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute left-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/95 font-serif text-base font-semibold text-gold-600 shadow-sm">
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
