"use client";

import { useLanguage } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const ICONS = [
  // 非医疗 — shield check
  <svg key="s" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg>,
  // 专业调配师 1 对 1 — person
  <svg key="p" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>,
  // 天然精油 — leaf
  <svg key="l" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-7 5-12 14-12 0 7-5 12-14 12Z" /><path d="M5 19c3.5-3.5 6.5-5.5 10-7" /></svg>,
  // 尊重隐私 — lock
  <svg key="k" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>,
];

export default function Assurance() {
  const { t } = useLanguage();

  return (
    <section id="assurance" className="scroll-mt-24 bg-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading title={t.assurance.title} />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.assurance.items.map((item, i) => (
            <div
              key={item}
              className="flex items-start gap-3.5 rounded-2xl border border-taupe-200/60 bg-cream-50 p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-cream-200 text-sage-600 ring-1 ring-taupe-200/60">
                {ICONS[i % ICONS.length]}
              </span>
              <span className="text-[15px] font-medium leading-relaxed text-taupe-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
