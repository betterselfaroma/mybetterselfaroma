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
  const { t, lang } = useLanguage();
  const codeLabel = lang === "zh" ? "专属推荐码" : "Your referral code";
  const sampleLabel = lang === "zh" ? "示例" : "sample";
  const pointsLabel = lang === "zh" ? "会员积分" : "member points";

  return (
    <section id="referral" className="bg-cream-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-gold-400/40 bg-gradient-to-br from-sage-50 via-cream-100 to-gold-300/25 p-7 shadow-soft sm:p-12">
          <div className="aura -right-10 -top-10 h-48 w-48 bg-gold-300/25" />
          <div className="aura -bottom-12 -left-10 h-48 w-48 bg-sage-200/30" />

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/60 bg-cream-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {t.referral.badge}
            </span>

            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-[2rem] font-semibold leading-[1.15] text-ink sm:text-[2.6rem]">
              {t.referral.title}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-taupe-600">
              {t.referral.body}
            </p>
          </div>

          <div className="relative mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* Membership card mockup */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="aura inset-3 bg-gold-300/25" />
              <div className="relative overflow-hidden rounded-[1.5rem] bg-forest-depth p-6 text-cream-50 shadow-glow ring-1 ring-gold-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50/10 ring-1 ring-cream-50/25">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-300" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21c4-2.5 6-5.5 6-9a6 6 0 0 0-12 0c0 3.5 2 6.5 6 9Z" />
                        <path d="M12 12c0-2.5 1-4.5 3-6" />
                      </svg>
                    </span>
                    <span className="font-serif text-sm font-semibold tracking-wide">Scent Knows You</span>
                  </div>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-cream-200/70">
                    Member
                  </span>
                </div>

                <div className="mt-7">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream-200/60">
                    {codeLabel}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold tracking-[0.28em] text-gold-200">
                      AURA28
                    </span>
                    <span className="rounded-full bg-cream-50/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-cream-200/60 ring-1 ring-cream-50/15">
                      {sampleLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-sheen px-3 py-1.5 text-xs font-bold text-ink shadow-sm">
                    RM10 TNG PIN
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-1.5 text-xs font-semibold text-cream-100 ring-1 ring-cream-50/20">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold-300" fill="currentColor"><path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 16.8 7.1 18.8l1.3-5.6L4 9.4l5.8-.5L12 3Z" /></svg>
                    + {pointsLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3.5">
              {t.referral.steps.map((step, i) => (
                <div
                  key={step.num}
                  className="flex items-center gap-4 rounded-2xl border border-taupe-200/60 bg-cream-50/90 px-5 py-4 shadow-sm"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600">
                    {stepIcons[i]}
                  </span>
                  <div>
                    <span className="font-serif text-xs font-semibold text-gold-600">{step.num}</span>
                    <p className="text-[15px] font-medium leading-snug text-ink">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA + fine print */}
          <div className="relative mt-10 flex flex-col items-center">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-7 py-3.5 text-base font-medium text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 transition-all hover:-translate-y-0.5 hover:bg-sage-800"
              >
                {t.referral.ctaPrimary}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sage-300 bg-cream-50/70 px-7 py-3.5 text-base font-medium text-sage-700 transition-colors hover:border-sage-500 hover:bg-sage-50"
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
