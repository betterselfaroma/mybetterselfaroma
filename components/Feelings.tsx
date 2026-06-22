"use client";

import { useLanguage } from "@/lib/i18n";

export default function Feelings() {
  const { t } = useLanguage();

  return (
    <section id="feelings" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Image */}
          <div className="relative order-last lg:order-first">
            <div className="aura -inset-4 bg-sage-200/30" />
            <div className="relative overflow-hidden rounded-[2rem] border border-cream-50/70 shadow-glow ring-1 ring-taupe-200/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ritual-evening-journal.webp"
                alt="女性在柔和光线下安静地觉察自己的状态"
                className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 to-transparent" />
            </div>
          </div>

          {/* List */}
          <div>
            <h2 className="font-serif text-[2rem] font-semibold leading-snug text-ink sm:text-[2.4rem]">
              {t.feelings.title}
            </h2>
            <ul className="mt-8 space-y-3.5">
              {t.feelings.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-taupe-200/60 bg-cream-50 px-5 py-3.5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-sage-100 text-sage-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4 4L19 7" /></svg>
                  </span>
                  <span className="text-[15px] leading-relaxed text-taupe-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
