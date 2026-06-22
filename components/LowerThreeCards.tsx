"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

function Check({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4 4L19 7" />
    </svg>
  );
}

export default function LowerThreeCards() {
  const { t, lang } = useLanguage();
  const pointsLabel = lang === "zh" ? "会员积分" : "member points";

  return (
    <section id="referral" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1 — suitable feelings */}
          <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 shadow-soft">
            <div className="relative h-40 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ritual-evening-journal.webp"
                alt="女性在柔和光线下安静地觉察自己的状态"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/35 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <h3 className="font-serif text-lg font-semibold leading-snug text-ink">{t.feelings.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {t.feelings.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-taupe-700">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600">
                      <Check />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2 — safety / assurance */}
          <div className="flex flex-col rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 p-7 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg>
            </span>
            <h3 className="mt-5 font-serif text-lg font-semibold text-ink">{t.assurance.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {t.assurance.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-taupe-700">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600">
                    <Check />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3 — member referral reward */}
          <div className="flex flex-col rounded-[1.5rem] border border-gold-400/40 bg-gradient-to-br from-gold-300/20 via-cream-50 to-cream-50 p-7 shadow-soft">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/60 bg-cream-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {t.referral.badge}
            </span>
            <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{t.referral.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-taupe-600">{t.referral.body}</p>

            {/* TNG PIN voucher mockup */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-forest-depth p-4 text-cream-50 ring-1 ring-gold-400/30">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold-sheen text-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 16.8 7.1 18.8l1.3-5.6L4 9.4l5.8-.5L12 3Z" /></svg>
              </span>
              <div className="leading-tight">
                <p className="font-serif text-base font-bold text-gold-200">RM10 TNG PIN</p>
                <p className="text-[0.7rem] text-cream-200/80">+ {pointsLabel}</p>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-3 text-sm font-medium text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 transition-all hover:-translate-y-0.5 hover:bg-sage-800"
              >
                {t.referral.ctaPrimary}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <p className="mt-3 text-[0.7rem] leading-relaxed text-taupe-500">{t.referral.finePrint}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
