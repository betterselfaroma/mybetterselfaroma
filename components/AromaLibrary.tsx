"use client";

import { useLanguage } from "@/lib/i18n";
import { useWhatsApp } from "./WhatsAppDialog";

const featureIcons = [
  // global sourcing
  <svg key="globe" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>,
  // bespoke blending
  <svg key="blend" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6M10 3v4l-3 8.5A3 3 0 0 0 9.8 20h4.4a3 3 0 0 0 2.8-4.5L14 7V3" />
    <path d="M8 14h8" />
  </svg>,
  // safe & gentle
  <svg key="shield" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>,
  // insight
  <svg key="insight" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.3 2.2h4.6c.2-1 .7-1.7 1.3-2.2A6 6 0 0 0 12 3Z" />
  </svg>,
];

export default function AromaLibrary() {
  const { t } = useLanguage();
  const { openChooser } = useWhatsApp();

  return (
    <section id="library" className="scroll-mt-24 bg-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="group relative">
            <div className="aura -inset-2 bg-gold-300/20" />
            <div className="absolute -inset-3 -z-10 rounded-[2.4rem] bg-sage-100/50" />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-cream-50/60 shadow-glow ring-1 ring-taupe-200/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.library.image}
                alt={t.library.imageAlt}
                width={1448}
                height={1086}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-sage-700/90 text-cream-50 shadow-soft backdrop-blur-sm">
                <span className="font-serif text-xl font-bold leading-none">28</span>
                <span className="text-[9px] uppercase tracking-wider">oils</span>
              </span>
            </div>
          </div>

          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/60 bg-cream-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              {t.library.badge}
            </span>

            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {t.library.title}
            </h2>

            <p className="mt-3 font-serif text-lg italic text-sage-700">
              {t.library.subtitle}
            </p>

            <p className="mt-4 text-base leading-relaxed text-taupe-600">
              {t.library.content}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {t.library.features.map((f, i) => (
                <div
                  key={f}
                  className="flex items-center gap-3 rounded-2xl border border-taupe-200/60 bg-cream-50/70 px-3.5 py-3 shadow-sm"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600 ring-1 ring-sage-200/60">
                    {featureIcons[i]}
                  </span>
                  <span className="text-sm font-medium text-taupe-700">{f}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={openChooser}
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-sage-300 bg-cream-50/60 px-7 py-3.5 text-base font-medium text-sage-700 transition-colors hover:border-sage-500 hover:bg-sage-50"
            >
              {t.library.cta}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
