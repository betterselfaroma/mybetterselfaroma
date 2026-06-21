"use client";

import { useLanguage } from "@/lib/i18n";
import CtaButton from "./CtaButton";

/** Subtle botanical line-art used as ambient decoration in the hero. */
function BotanicalLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 320"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M100 312V70" />
      <path d="M100 150c0-26 16-44 44-50-2 28-18 46-44 50Z" />
      <path d="M100 196c0-26-16-44-44-50 2 28 18 46 44 50Z" />
      <path d="M100 120c0-22 14-36 38-42-2 24-16 40-38 42Z" />
      <path d="M100 100c0-22-14-36-38-42 2 24 16 40 38 42Z" />
      <circle cx="100" cy="58" r="9" />
    </svg>
  );
}

const badgeIcons = [
  // 28 oils — leaf
  <svg key="leaf" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19c0-7 5-12 14-12 0 7-5 12-14 12Z" />
    <path d="M5 19c3.5-3.5 6.5-5.5 10-7" />
  </svg>,
  // 1-to-1 guidance — people
  <svg key="people" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M20.5 20a5.5 5.5 0 0 0-3-4.9" />
  </svg>,
  // custom blend — droplet
  <svg key="drop" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c3 4 5 6.5 5 9.5A5 5 0 0 1 7 12.5C7 9.5 9 7 12 3Z" />
  </svg>,
];

export default function Hero() {
  const { t } = useLanguage();

  // RM60 + RM90 = RM150 — derived from prices so it never drifts from content.
  const testN = Number(t.packages.a.price.replace(/\D/g, ""));
  const totalN = Number(t.packages.b.price.replace(/\D/g, ""));
  const upgradeFormula =
    Number.isFinite(testN) && Number.isFinite(totalN) && totalN > testN
      ? `${t.packages.a.price} + RM${totalN - testN} = ${t.packages.b.price}`
      : null;

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-cream-50"
    >
      {/* Ambient lighting */}
      <div className="aura -left-24 top-28 h-72 w-72 bg-sage-200/40 animate-pulse-soft" />
      <div className="aura -right-20 top-40 h-80 w-80 bg-gold-300/30 animate-pulse-soft" />
      <BotanicalLines className="pointer-events-none absolute right-6 top-24 hidden h-72 w-44 text-sage-300/40 lg:block" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-24 lg:pt-20">
        {/* Copy */}
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-cream-50/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-sage-700 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-6 font-serif text-[2.6rem] font-semibold leading-[1.12] text-ink sm:text-5xl lg:text-[3.5rem]">
            {t.hero.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-taupe-600 sm:text-lg">
            {t.hero.subtitle}
          </p>

          <p className="mt-4 max-w-xl border-l-2 border-gold-400/60 pl-4 text-sm italic leading-relaxed text-taupe-500">
            {t.hero.note}
          </p>

          {/* Trust points */}
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
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

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton label={t.hero.ctaPrimary} variant="primary" />
            <CtaButton label={t.hero.ctaSecondary} variant="secondary" withIcon={false} />
          </div>

          {/* Price entry chips (data-driven) */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            {[t.packages.a, t.packages.b].map((p) => (
              <span
                key={p.price}
                className="inline-flex items-center gap-2 rounded-full border border-taupe-200/70 bg-cream-50/80 px-3.5 py-1.5 text-sm text-taupe-700 shadow-sm backdrop-blur-sm"
              >
                <span className="font-serif text-base font-bold text-sage-700">{p.price}</span>
                <span className="text-taupe-500">{p.name}</span>
              </span>
            ))}
          </div>

          {/* Upgrade mini card */}
          <div className="mt-6 flex flex-col gap-2.5 rounded-2xl border border-gold-400/50 bg-gold-300/20 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold-500 text-cream-50">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
              <span className="text-sm font-medium text-taupe-700">
                {t.hero.upgradeReminder}
              </span>
            </div>
            {upgradeFormula && (
              <span className="flex-none self-start rounded-full bg-cream-50/90 px-3 py-1 text-sm font-semibold text-sage-700 shadow-sm ring-1 ring-gold-400/30 sm:self-auto">
                {upgradeFormula}
              </span>
            )}
          </div>
        </div>

        {/* Visual */}
        <div className="mt-12 lg:col-span-6 lg:mt-0">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="aura inset-2 -z-10 bg-gold-300/25" />
            <div className="absolute -inset-3 -z-10 rounded-[2.6rem] bg-gradient-to-br from-sage-100/70 to-cream-200/40" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.2rem] border border-cream-50/60 bg-cream-100 shadow-glow ring-1 ring-taupe-200/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.hero.image}
                alt={t.hero.imageAlt}
                width={1122}
                height={1402}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/25 via-transparent to-transparent" />

              {/* Vertical trust badges (desktop) */}
              <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
                {t.hero.trustPoints.map((point, i) => (
                  <div
                    key={point}
                    className="flex items-center gap-2 rounded-full border border-taupe-200/50 bg-cream-50/90 py-1.5 pl-1.5 pr-3 shadow-card backdrop-blur-sm"
                  >
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600">
                      {badgeIcons[i % badgeIcons.length]}
                    </span>
                    <span className="whitespace-nowrap text-[11px] font-medium text-taupe-700">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating product accent card */}
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-taupe-200/60 bg-cream-50/95 px-4 py-3 shadow-card backdrop-blur-sm sm:-left-6">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-700 text-cream-50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 3h5M10 3v3l-1.6 2.4A3 3 0 0 0 8 10.1V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8.9a3 3 0 0 0-.4-1.7L14 6V3" />
                  <path d="M8 12h8" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="font-serif text-lg font-bold text-sage-800">{t.packages.a.price}</p>
                <p className="text-[0.7rem] uppercase tracking-wider text-taupe-500">
                  {t.packages.a.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
