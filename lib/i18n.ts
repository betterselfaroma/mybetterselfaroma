"use client";

import { createContext, useContext } from "react";
import { content, type Content } from "@/data/content";

/** Supported languages. Default is Chinese. */
export type Lang = "zh" | "en";

export const LANGS: Lang[] = ["zh", "en"];
export const DEFAULT_LANG: Lang = "zh";
export const STORAGE_KEY = "bsa-lang";

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Dictionary for the currently active language. */
  t: Content;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Access the active language and its full dictionary. */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}

/** Shortcut to the active dictionary only. */
export function useT(): Content {
  return useLanguage().t;
}

/** Read a dictionary directly (handy for non-hook contexts). */
export function dict(lang: Lang): Content {
  return content[lang];
}

/**
 * Build a WhatsApp click-to-chat link to a specific number with a pre-filled
 * message. Uses local strings — never an external translation service.
 */
export function whatsappHref(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function normalizeLang(value: string | null | undefined): Lang {
  return value === "en" ? "en" : "zh";
}
