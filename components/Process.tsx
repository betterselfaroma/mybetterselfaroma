"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const stepIcons = [
  // 01 book — calendar
  <svg key="cal" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4" />
  </svg>,
  // 02 scent test — bottle
  <svg key="bottle" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 3h5M10 3v3l-1.6 2.4A3 3 0 0 0 8 10.1V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8.9a3 3 0 0 0-.4-1.7L14 6V3" />
    <path d="M8 12h8" />
  </svg>,
  // 03 reading — eye
  <svg key="eye" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>,
  // 04 blend — flask drop
  <svg key="blend" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3h4M10.5 3v5L6.6 15a3 3 0 0 0 2.7 4.4h5.4a3 3 0 0 0 2.7-4.4L13.5 8V3" />
    <path d="M8 14.5c2 .8 6 .8 8 0" />
  </svg>,
];

export default function Process() {
  const { t } = useLanguage();

  return (
    <section id="process" className="scroll-mt-24 bg-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading title={t.process.title} intro={t.process.intro} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map((step, i) => (
            <div key={step.num} className="rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 p-7 text-center shadow-soft">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                {stepIcons[i]}
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 font-serif text-sm font-semibold text-ink shadow-sm">
                  {step.num}
                </span>
              </div>
              <h3 className="mt-5 font-serif text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-taupe-600">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
