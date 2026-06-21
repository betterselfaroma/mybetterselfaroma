"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

/** breath · wrist · heart · pause — the four cues of the daily scent ritual. */
const pointIcons = [
  // breath
  <svg key="breath" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h9a3 3 0 1 0-3-3" />
    <path d="M3 14h13a3 3 0 1 1-3 3" />
  </svg>,
  // wrist (droplet on pulse)
  <svg key="wrist" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c3 4 5 6.5 5 9.5A5 5 0 0 1 7 12.5C7 9.5 9 7 12 3Z" />
    <path d="M5 20h14" />
  </svg>,
  // heart
  <svg key="heart" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  </svg>,
  // pause
  <svg key="pause" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9v6M14 9v6" />
  </svg>,
];

function SunriseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18h16M6 18a6 6 0 0 1 12 0M12 3v3M5 8l1.5 1.5M19 8l-1.5 1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
    </svg>
  );
}

export default function Ritual() {
  const { t, lang } = useLanguage();
  const guide = t.packages.b.ritualGuide;
  const morningLabel = lang === "zh" ? "晨间" : "Morning";
  const nightLabel = lang === "zh" ? "夜晚" : "Night";

  return (
    <section id="ritual" className="relative scroll-mt-24 overflow-hidden bg-cream-100">
      <div className="aura -left-16 top-24 h-72 w-72 bg-sage-200/30" />
      <div className="aura -right-16 bottom-10 h-72 w-72 bg-gold-300/20" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow={guide?.title}
          title={t.ritual.title}
          intro={guide?.intro ?? t.ritual.content}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Image */}
          <div className="relative overflow-hidden rounded-[2rem] border border-cream-50/60 shadow-glow ring-1 ring-taupe-200/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.ritual.image}
              alt={t.ritual.imageAlt}
              width={1122}
              height={1402}
              className="h-full min-h-[20rem] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sage-900/80 via-sage-900/25 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2">
              {t.ritual.points.map((point, i) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/30 bg-cream-50/15 px-3 py-1.5 text-xs font-medium text-cream-50 backdrop-blur-sm"
                >
                  <span className="text-gold-300">{pointIcons[i % pointIcons.length]}</span>
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* Guide card */}
          <div className="flex flex-col rounded-[2rem] border border-taupe-200/60 bg-cream-50 p-7 shadow-card sm:p-9">
            {/* Four ritual cues */}
            <div className="grid grid-cols-2 gap-3.5">
              {t.ritual.points.map((point, i) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-2xl border border-taupe-200/60 bg-cream-100/70 px-4 py-3.5"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600">
                    {pointIcons[i % pointIcons.length]}
                  </span>
                  <span className="text-sm font-medium text-taupe-700">{point}</span>
                </div>
              ))}
            </div>

            {/* Morning / Night modules */}
            {guide?.moments && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-br from-gold-300/25 to-cream-100 p-4 ring-1 ring-gold-400/30">
                  <div className="flex items-center gap-2 text-gold-600">
                    <SunriseIcon />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">{morningLabel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-taupe-700">{guide.moments[0]}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-sage-800 to-sage-900 p-4 text-cream-100 ring-1 ring-sage-600/50">
                  <div className="flex items-center gap-2 text-gold-300">
                    <MoonIcon />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">{nightLabel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-cream-100/90">
                    {guide.moments[2] ?? guide.moments[guide.moments.length - 1]}
                  </p>
                </div>
              </div>
            )}

            {/* Brand line */}
            {guide?.brandLine && (
              <p className="mt-6 border-t border-taupe-200/70 pt-5 font-serif text-lg italic text-sage-700">
                {guide.brandLine}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
