"use client";

import { useLanguage } from "@/lib/i18n";

export default function Ritual() {
  const { t } = useLanguage();

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] shadow-card">
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.ritual.image}
            alt={t.ritual.imageAlt}
            width={1122}
            height={1402}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Warm dark overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-sage-900/85 via-sage-900/70 to-sage-800/40" />

          <div className="relative max-w-xl px-7 py-16 sm:px-12 sm:py-20">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-300">
              Daily Ritual
            </span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-snug text-cream-50 sm:text-4xl sm:leading-snug">
              {t.ritual.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream-100/90 sm:text-lg">
              {t.ritual.content}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {t.ritual.points.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-2 rounded-full border border-cream-50/30 bg-cream-50/10 px-4 py-1.5 text-sm font-medium text-cream-50 backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
