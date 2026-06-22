"use client";

import { useLanguage } from "@/lib/i18n";

/**
 * Slim forest-green referral announcement bar shown above the header.
 * Display-only: it links to the existing #referral section and reuses the
 * referral copy. No referral / points / TNG PIN logic is touched here.
 */
export default function AnnouncementBar() {
  const { t, lang } = useLanguage();
  const learnMore = lang === "zh" ? "了解更多" : "Learn more";

  return (
    <div className="relative z-40 bg-forest-depth text-cream-100">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2 sm:px-6">
        <span className="inline-flex items-center gap-2 text-center text-xs sm:text-sm">
          <span className="h-1.5 w-1.5 flex-none rounded-full bg-gold-400" />
          <span className="font-medium">{t.announcement}</span>
        </span>
        <a
          href="#referral"
          className="hidden flex-none rounded-full border border-cream-50/30 px-3 py-0.5 text-xs font-medium text-cream-50 transition-colors hover:bg-cream-50/10 sm:inline-flex"
        >
          {learnMore}
        </a>
      </div>
    </div>
  );
}
