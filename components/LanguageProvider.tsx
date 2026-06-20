"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { content } from "@/data/content";
import {
  DEFAULT_LANG,
  LanguageContext,
  STORAGE_KEY,
  normalizeLang,
  type Lang,
} from "@/lib/i18n";

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always start from the default language so server and first client
  // render match; the stored preference is applied after mount.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = normalizeLang(
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null,
    );
    if (stored !== lang) {
      setLangState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang> and the stored preference in sync.
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(
    () => setLangState((prev) => (prev === "zh" ? "en" : "zh")),
    [],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t: content[lang] }),
    [lang, setLang, toggleLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}
