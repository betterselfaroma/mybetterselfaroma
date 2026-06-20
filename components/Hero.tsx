"use client";

import { useLanguage } from "@/lib/i18n";
import CtaButton from "./CtaButton";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-cream-50">
      <div className="absolute -left-24 top-28 -z-0 h-72 w-72 rounded-full bg-sage-200/30 blur-3xl" />
      <div className="absolute -right-20 top-40 -z-0 h-80 w-80 rounded-full bg-gold-300/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-20 lg:pt-44">
        {/* Copy */}
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-cream-50/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-sage-700">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.15] text-ink sm:text-5xl lg:text-[3.4rem]">
            {t.hero.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-taupe-600 sm:text-lg">
            {t.hero.subtitle}
          </p>

          <p className="mt-4 max-w-xl text-sm italic leading-relaxed text-taupe-500">
            {t.hero.note}
          </p>

          {/* Trust points */}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {t.hero.trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm font-medium text-taupe-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4 4L19 7" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton label={t.hero.ctaPrimary} variant="primary" />
            <CtaButton label={t.hero.ctaSecondary} variant="secondary" withIcon={false} />
          </div>

          {/* Upgrade reminder */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-gold-400/50 bg-gold-300/20 px-5 py-2.5">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold-500 text-cream-50">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
            <span className="text-sm font-medium text-taupe-700">
              {t.hero.upgradeReminder}
            </span>
          </div>
        </div>

        {/* Visual */}
        <div className="mt-12 lg:col-span-6 lg:mt-0">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-3 -z-10 rounded-[2.4rem] bg-sage-100/60" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-taupe-200/60 bg-cream-100 shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.hero.image}
                alt={t.hero.imageAlt}
                width={1122}
                height={1402}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
