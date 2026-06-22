"use client";

import { useLanguage } from "@/lib/i18n";

export default function Process() {
  const { t, lang } = useLanguage();
  const eyebrow = lang === "zh" ? "体验流程" : "How it works";

  return (
    <section id="process" className="scroll-mt-24 bg-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left — heading + steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">{eyebrow}</p>
            <h2 className="mt-3 font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.6rem]">
              {t.process.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-taupe-600">
              {t.process.intro}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.process.steps.map((step) => (
                <div
                  key={step.num}
                  className="flex items-start gap-3.5 rounded-2xl border border-taupe-200/60 bg-cream-50 p-5 shadow-sm"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-700 font-serif text-base font-semibold text-cream-50">
                    {step.num}
                  </span>
                  <div>
                    <p className="font-serif text-base font-semibold text-ink">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-taupe-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — scent-test product visual */}
          <div className="relative">
            <div className="aura -inset-4 bg-gold-300/20" />
            <div className="relative overflow-hidden rounded-[2rem] border border-cream-50/70 shadow-glow ring-1 ring-taupe-200/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/package-rm49-aroma-check.webp"
                alt="摸香测试中的香气卡、笔记与磨砂滚珠精油"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/25 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
