"use client";

import { useLanguage } from "@/lib/i18n";
import CtaButton from "./CtaButton";

/** Elegant muted-gold botanical stem used as ambient line art in the hero. */
function BotanicalLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 240"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M60 236C60 180 60 120 60 10" />
      <path d="M60 64C40 56 28 44 22 24c22 4 34 16 38 40Z" />
      <path d="M60 96c20-8 32-20 38-40-22 4-34 16-38 40Z" />
      <path d="M60 138c-20-8-32-20-38-40 22 4 34 16 38 40Z" />
      <path d="M60 172c20-8 32-20 38-40-22 4-34 16-38 40Z" />
      <circle cx="60" cy="9" r="5" />
    </svg>
  );
}

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

  // Feather a rectangular product photo into the scene (no hard card edge).
  const featherMask = {
    WebkitMaskImage:
      "radial-gradient(120% 120% at 52% 42%, #000 56%, transparent 100%)",
    maskImage:
      "radial-gradient(120% 120% at 52% 42%, #000 56%, transparent 100%)",
  } as const;

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-cream-50"
    >
      {/* Desktop: full-bleed lifestyle scene on the right, blended into cream */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] lg:block" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.hero.image} alt="" className="h-full w-full object-cover object-[center_32%]" />
        {/* feather the left edge into the cream text area */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-100/55 to-transparent" />
        {/* feather top + bottom into the page */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream-100 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cream-50 via-cream-50/50 to-transparent" />
        {/* warm light */}
        <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-gold-300/30 blur-3xl" />
      </div>

      {/* Ambient light + botanical line art */}
      <div className="aura -left-24 top-24 h-72 w-72 bg-sage-200/30 animate-pulse-soft" />
      <BotanicalLines className="pointer-events-none absolute left-[40%] top-20 hidden h-96 w-56 text-gold-400/30 lg:block" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:min-h-[640px] lg:grid-cols-2 lg:gap-6 lg:pb-28 lg:pt-24">
        {/* Left — copy */}
        <div className="lg:max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-cream-50/85 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-sage-700 shadow-sm backdrop-blur-sm">
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

          <p className="mt-6 max-w-[540px] text-base leading-relaxed text-taupe-600 sm:text-lg">
            {t.hero.subtitle}
          </p>

          <p className="mt-5 max-w-[540px] border-l-2 border-gold-400/70 pl-4 text-sm italic leading-relaxed text-taupe-500">
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
          <div className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-gold-400/50 bg-gold-300/15 px-5 py-3.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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

        {/* Right — desktop product foreground (over the blended scene) */}
        <div className="relative hidden lg:block lg:h-full lg:min-h-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.packages.b.image}
            alt={t.packages.b.imageAlt}
            className="absolute bottom-2 right-0 w-[88%] max-w-[30rem] drop-shadow-[0_40px_60px_rgba(44,55,36,0.35)]"
            style={featherMask}
          />
        </div>

        {/* Mobile — one clean blended image */}
        <div className="relative overflow-hidden rounded-[2rem] border border-cream-50/70 shadow-glow ring-1 ring-taupe-200/40 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.hero.image}
            alt={t.hero.imageAlt}
            width={1122}
            height={1402}
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
