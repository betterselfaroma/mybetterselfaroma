"use client";

import { useLanguage } from "@/lib/i18n";
import CtaButton from "./CtaButton";

export default function Hero() {
  const { t } = useLanguage();

  // Elegant, controlled title: break at the Chinese comma on desktop only,
  // so it reads as two clean lines (and wraps naturally on mobile).
  const titleParts = t.hero.title.split("，");
  const hasTwoLines = titleParts.length > 1;

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
      {/* Soft ambient light only — no decorative clutter */}
      <div className="aura -left-24 top-24 h-72 w-72 bg-sage-200/35" />
      <div className="aura right-0 top-40 h-80 w-80 bg-gold-300/25" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[48fr_52fr] lg:gap-14 lg:pb-28 lg:pt-20">
        {/* Left — copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-cream-50/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-sage-700 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-7 font-serif text-[2.4rem] font-semibold leading-[1.2] text-ink sm:text-[2.6rem] lg:text-[2.5rem] xl:text-[2.6rem]">
            {hasTwoLines ? (
              <>
                {titleParts[0]}，<br className="hidden sm:block" />
                {titleParts.slice(1).join("，")}
              </>
            ) : (
              t.hero.title
            )}
          </h1>

          <p className="mt-6 max-w-[560px] text-base leading-relaxed text-taupe-600 sm:text-lg">
            {t.hero.subtitle}
          </p>

          <p className="mt-5 max-w-[560px] border-l-2 border-gold-400/70 pl-4 text-sm italic leading-relaxed text-taupe-500">
            {t.hero.note}
          </p>

          {/* Trust points — simple horizontal items */}
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {t.hero.trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm font-medium text-taupe-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-sage-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4 4L19 7" />
                </svg>
                {point}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton label={t.hero.ctaPrimary} variant="primary" />
            <CtaButton label={t.hero.ctaSecondary} variant="secondary" withIcon={false} />
          </div>

          {/* One clean upgrade bar */}
          <div className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-gold-400/50 bg-gold-300/15 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold-500 text-cream-50">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
              <span className="text-sm font-medium leading-relaxed text-taupe-700">
                {t.hero.upgradeReminder}
              </span>
            </div>
            {upgradeFormula && (
              <span className="flex-none self-start whitespace-nowrap rounded-full bg-cream-50/90 px-3.5 py-1 text-sm font-semibold text-sage-700 shadow-sm ring-1 ring-gold-400/30 sm:self-auto">
                {upgradeFormula}
              </span>
            )}
          </div>
        </div>

        {/* Right — one premium image panel */}
        <div className="relative">
          <div className="aura -inset-4 bg-gold-300/20" />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border border-cream-50/70 shadow-glow ring-1 ring-taupe-200/40 lg:aspect-auto lg:h-[38rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.hero.image}
              alt={t.hero.imageAlt}
              width={1122}
              height={1402}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Warm light wash so it reads as a studio scene, not a flat photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 via-transparent to-cream-50/10" />
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-gold-300/25" />
          </div>
        </div>
      </div>
    </section>
  );
}
