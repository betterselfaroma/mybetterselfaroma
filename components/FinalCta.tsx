"use client";

import { useLanguage } from "@/lib/i18n";
import CtaButton from "./CtaButton";

export default function FinalCta() {
  const { t } = useLanguage();

  return (
    <section className="bg-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[2rem] bg-sage-800 p-8 shadow-card sm:p-12 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sage-700/60 blur-3xl" />
          <div className="absolute -bottom-12 left-1/3 h-56 w-56 rounded-full bg-gold-500/15 blur-3xl" />

          {/* Copy */}
          <div className="relative lg:col-span-8">
            <span className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400/60" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-300">
                Better Self Aroma
              </span>
            </span>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-cream-50 sm:text-4xl">
              {t.finalCta.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-100/85 sm:text-lg">
              {t.finalCta.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaButton label={t.finalCta.ctaPrimary} variant="light" />
              <CtaButton
                label={t.finalCta.ctaSecondary}
                variant="secondary"
                withIcon={false}
                className="border-sage-300/60 bg-transparent text-cream-50 hover:border-cream-50 hover:bg-sage-700/50"
              />
            </div>
          </div>

          {/* Product image */}
          <div className="relative lg:col-span-4">
            <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-[1.5rem] border border-cream-50/15 shadow-soft sm:w-52 lg:w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.finalCta.image}
                alt={t.finalCta.imageAlt}
                width={600}
                height={600}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
