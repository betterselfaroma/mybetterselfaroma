"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

/**
 * Keeps the document <title> and meta description in sync with the active
 * language. (Static defaults are still provided by the server in layout.tsx.)
 */
export default function MetaUpdater() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t.meta.description);
  }, [t]);

  return null;
}
