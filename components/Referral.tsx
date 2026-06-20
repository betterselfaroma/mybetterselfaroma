"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const stepIcons = [
  // share
  <svg key="share" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
  </svg>,
  // friend completes experience
  <svg key="check" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>,
  // reward / gift
  <svg key="gift" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9h16v3H4zM5 12h14v8H5zM12 9v11" />
    <path d="M12 9C9 9 8 5 10 4c1.5-.8 2 2 2 5 0-3 .5-5.8 2-5 2 1 1 5-2 5Z" />
  </svg>,
];

export default function Referral() {
  const { t } = useLanguage();

  return (
    <section id="referral" className="bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold-400/40 bg-gradient-to-br from-sage-50 via-cream-100 to-gold-300/25 p-8 shadow-soft sm:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-300/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-sage-200/30 blur-3xl" />

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/60 bg-cream-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {t.referral.badge}
            </span>

            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {t.referral.title}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-taupe-600">
              {t.referral.body}
            </p>
          </div>

          {/* 3-step flow */}
          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {t.referral.steps.map((step, i) => (
              <div
                key={step.num}
                className="flex h-full flex-col items-center rounded-2xl border border-taupe-200/60 bg-cream-50/90 px-5 py-6 text-center shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  {stepIcons[i]}
                </span>
                <span className="mt-3 font-serif text-sm font-semibold text-gold-600">
                  {step.num}
                </span>
                <p className="mt-1 text-[15px] font-medium leading-snug text-ink">
                  {step.title}
                </p>
              </div>
            ))}
          </div>

          {/* CTA + fine print */}
          <div className="relative mt-10 flex flex-col items-center">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-7 py-3.5 text-base font-medium text-cream-50 shadow-soft transition-colors hover:bg-sage-800"
              >
                {t.referral.ctaPrimary}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sage-300 bg-cream-50/60 px-7 py-3.5 text-base font-medium text-sage-700 transition-colors hover:border-sage-500 hover:bg-sage-50"
              >
                {t.referral.ctaSecondary}
              </Link>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-taupe-500">
              {t.referral.finePrint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
