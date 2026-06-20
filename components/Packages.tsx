"use client";

import { useLanguage } from "@/lib/i18n";
import type { PackageContent } from "@/data/content";
import SectionHeading from "./SectionHeading";
import CtaButton from "./CtaButton";

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PackageCard({ pkg, sep }: { pkg: PackageContent; sep: string }) {
  const highlight = pkg.highlight;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-4xl ${
        highlight
          ? "bg-sage-800 text-cream-50 shadow-card ring-1 ring-sage-700 lg:scale-[1.02]"
          : "border border-taupe-200/70 bg-cream-50 text-ink shadow-soft"
      }`}
    >
      {/* Banner image */}
      <div className="relative aspect-square w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image}
          alt={pkg.imageAlt}
          width={1254}
          height={1254}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {pkg.badge && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-gold-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ink shadow-sm">
            {pkg.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-8 sm:p-9">
      <h3
        className={`font-serif text-2xl font-semibold ${
          highlight ? "text-cream-50" : "text-ink"
        }`}
      >
        {pkg.name}
      </h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span
          className={`font-serif text-4xl font-bold ${
            highlight ? "text-gold-300" : "text-sage-700"
          }`}
        >
          {pkg.price}
        </span>
      </div>

      <p
        className={`mt-4 text-sm leading-relaxed ${
          highlight ? "text-sage-100" : "text-taupe-500"
        }`}
      >
        <span className="font-semibold">
          {pkg.suitableLabel}
          {sep}
        </span>
        {pkg.suitable}
      </p>

      <div
        className={`my-6 h-px w-full ${
          highlight ? "bg-sage-600" : "bg-taupe-200/70"
        }`}
      />

      <p
        className={`text-xs font-semibold uppercase tracking-[0.16em] ${
          highlight ? "text-sage-200" : "text-taupe-400"
        }`}
      >
        {pkg.includesLabel}
      </p>
      <ul className="mt-4 space-y-3">
        {pkg.includes.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                highlight ? "bg-gold-400/30 text-gold-300" : "bg-sage-100 text-sage-600"
              }`}
            >
              <CheckIcon className="h-3 w-3" />
            </span>
            <span
              className={`text-[15px] leading-relaxed ${
                highlight ? "text-cream-100" : "text-taupe-700"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>

      {pkg.ritualGuide && (
        <details
          className={`group mt-6 rounded-2xl border ${
            highlight ? "border-sage-600 bg-sage-900/30" : "border-taupe-200/70 bg-cream-100/60"
          }`}
        >
          <summary
            className={`flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold ${
              highlight ? "text-gold-300" : "text-sage-700"
            }`}
          >
            {pkg.ritualGuide.label}
            <ChevronIcon className="h-4 w-4 flex-none transition-transform duration-200 group-open:rotate-180" />
          </summary>

          <div
            className={`space-y-5 px-4 pb-5 text-[15px] leading-relaxed ${
              highlight ? "text-cream-100" : "text-taupe-700"
            }`}
          >
            <p>{pkg.ritualGuide.intro}</p>

            <div>
              <p className={`font-semibold ${highlight ? "text-cream-50" : "text-ink"}`}>
                {pkg.ritualGuide.ritualTitle}
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 marker:font-semibold">
                {pkg.ritualGuide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <p className={`font-semibold ${highlight ? "text-cream-50" : "text-ink"}`}>
                {pkg.ritualGuide.momentsTitle}
              </p>
              <ul className="mt-2 space-y-1.5">
                {pkg.ritualGuide.moments.map((moment) => (
                  <li key={moment} className="flex items-start gap-2.5">
                    <span className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${highlight ? "bg-gold-300" : "bg-sage-500"}`} />
                    {moment}
                  </li>
                ))}
              </ul>
            </div>

            <p className={`border-t pt-4 font-serif italic ${highlight ? "border-sage-600 text-gold-200" : "border-taupe-200/70 text-sage-700"}`}>
              {pkg.ritualGuide.brandLine}
            </p>
          </div>
        </details>
      )}

      <div className="mt-auto pt-8">
        <CtaButton
          label={pkg.button}
          variant={highlight ? "light" : "primary"}
          className="w-full"
        />
      </div>
      </div>
    </div>
  );
}

export default function Packages() {
  const { t, lang } = useLanguage();
  const sep = lang === "zh" ? "：" : ": ";

  return (
    <section id="packages" className="scroll-mt-24 bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading title={t.packages.title} intro={t.packages.intro} />

        <div className="mt-14 grid gap-7 lg:grid-cols-2">
          <PackageCard pkg={t.packages.a} sep={sep} />
          <PackageCard pkg={t.packages.b} sep={sep} />
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-full border border-taupe-200/60 bg-cream-100/70 px-6 py-4">
          {t.packages.trust.map((item) => (
            <span key={item} className="flex items-center gap-2 text-sm font-medium text-taupe-600">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4 4L19 7" />
                </svg>
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
