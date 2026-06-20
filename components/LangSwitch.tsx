"use client";

import { useLanguage } from "@/lib/i18n";

/**
 * Segmented 中文 / EN switcher. Designed to stay clearly visible and
 * tappable on mobile as well as desktop.
 */
export default function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  const base =
    "min-w-[2.75rem] rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200";
  const active = "bg-sage-600 text-cream-50 shadow-sm";
  const inactive = "text-taupe-600 hover:text-sage-700";

  return (
    <div
      role="group"
      aria-label={t.langSwitch.label}
      className={`inline-flex items-center gap-1 rounded-full border border-taupe-200 bg-cream-50/90 p-1 backdrop-blur ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`${base} ${lang === "zh" ? active : inactive}`}
      >
        {t.langSwitch.zh}
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${base} ${lang === "en" ? active : inactive}`}
      >
        {t.langSwitch.en}
      </button>
    </div>
  );
}
