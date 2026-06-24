"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";
import { homeCopy } from "@/data/home-copy";

const WHATSAPP = "https://wa.me/60124761919";
const ASSETS = "/scent-knows-you-assets";

/* ----------------------------------------------------------------- icons */

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "library":
      return (
        <svg {...common}>
          <path d="M4 5v15M9 5v15M14 6l4 14M4 8h5M4 13h5M9.5 9.5l4.2-1.2" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z" />
          <path d="M9 11h6M9 14h4" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.3-9.2-8.4C1.3 8.9 2.8 6 5.7 6c1.9 0 3.2 1.2 3.8 2.3l.5.9.5-.9C11.1 7.2 12.4 6 14.3 6c2.9 0 4.4 2.9 2.9 5.6C19 15.7 12 20 12 20Z" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16 9.5a3.5 3.5 0 0 1 .5 6.97" />
          <path d="M10 21c.4-1 .9-1.7 1.4-2.4M14 20c.2-.8.6-1.5 1.1-2.1" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c0-7 5-12 14-12 0 9-5 13-11 13a4 4 0 0 1-3-1Z" />
          <path d="M9 17c2.5-3 4.5-4.5 8-5.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
        </svg>
      );
    default:
      return null;
  }
}

/* ----------------------------------------------------------- small atoms */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{children}</h2>
      <span className="mt-4 flex items-center gap-2 text-gold-500">
        <span className="h-px w-8 bg-gold-400/70" />
        <Icon name="spark" className="h-4 w-4" />
        <span className="h-px w-8 bg-gold-400/70" />
      </span>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-taupe-600">
      <span className="mt-0.5 flex-none text-sage-600">
        <Icon name="check" className="h-4 w-4" />
      </span>
      <span>{children}</span>
    </li>
  );
}

/* --------------------------------------------------------------- header */

function SiteHeader() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-taupe-200/60 bg-cream-50/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:py-4">
        {/* brand */}
        <a href="#hero" className="flex flex-none items-center gap-2.5">
          <span className="flex h-10 w-10 flex-none items-center justify-center text-sage-800">
            <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="3.5" />
              <path d="M24 20.5c0-6 2.6-10.5 0-14-2.6 3.5 0 8 0 14Z" />
              <path d="M24 27.5c0 6 2.6 10.5 0 14-2.6-3.5 0-8 0-14Z" />
              <path d="M20.5 24c-6 0-10.5 2.6-14 0 3.5-2.6 8 0 14 0Z" />
              <path d="M27.5 24c6 0 10.5 2.6 14 0-3.5-2.6-8 0-14 0Z" />
              <path d="M21.2 21.2l-7-7M26.8 21.2l7-7M21.2 26.8l-7 7M26.8 26.8l7 7" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base font-semibold text-ink sm:text-lg">{c.brand.zh}</span>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
              {c.brand.en}
            </span>
          </span>
        </a>

        {/* desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {c.nav.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="relative whitespace-nowrap text-sm font-medium text-taupe-600 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold-500 after:transition-all after:duration-300 hover:text-sage-800 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* desktop actions */}
        <div className="hidden flex-none items-center gap-2.5 lg:flex">
          <LangSwitch />
          <Link href="/login" className="px-1 text-sm font-medium text-taupe-600 transition-colors hover:text-sage-700">
            {c.nav.login}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-sage-700 px-4 py-2 text-sm font-medium text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 transition-all hover:-translate-y-0.5 hover:bg-sage-800"
          >
            {c.nav.register}
          </Link>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-sage-300 bg-cream-50/70 px-4 py-2 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500 hover:bg-sage-50"
          >
            <Icon name="whatsapp" className="h-4 w-4" />
            {c.nav.whatsapp}
          </a>
        </div>

        {/* mobile actions */}
        <div className="flex flex-none items-center gap-1.5 lg:hidden">
          <LangSwitch />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-taupe-200 bg-cream-50/80 text-ink transition-colors hover:border-sage-400"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="lg:hidden">
          <div className="mx-3 mb-3 overflow-hidden rounded-3xl border border-taupe-200/70 bg-cream-50/95 p-5 shadow-card backdrop-blur-xl">
            <nav className="flex flex-col">
              {c.nav.links.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-taupe-700 transition-colors hover:bg-sage-50 hover:text-sage-800"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="my-4 hairline" />
            <div className="flex flex-col gap-2.5">
              <Link href="/register" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-full bg-sage-700 px-5 py-3 text-sm font-medium text-cream-50 shadow-soft">
                {c.nav.register}
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-full border border-sage-300 bg-cream-50 px-5 py-3 text-sm font-medium text-sage-700">
                {c.nav.login}
              </Link>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-cream-50 shadow-soft">
                <Icon name="whatsapp" className="h-4 w-4" />
                {c.nav.whatsapp}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ----------------------------------------------------------------- page */

export default function Home() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  const valueIcons = ["library", "chat", "compass", "shield"];
  const conceptIcons = ["heart", "cloud", "leaf"];
  const conceptImages = [
    { src: "02_what_card_inner_desire_hand", w: 134, h: 174 },
    { src: "03_what_card_current_worry", w: 112, h: 181 },
    { src: "04_what_card_scent_direction_bottles", w: 149, h: 185 },
  ];

  return (
    <div className="overflow-x-hidden bg-cream-50 text-ink">
      {/* 1 · top referral bar */}
      <div className="bg-sage-900 text-cream-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs sm:text-sm">
          <span className="text-gold-400">
            <Icon name="spark" className="h-4 w-4" />
          </span>
          <span className="text-cream-50/90">{c.referralBar.text}</span>
          <a href="#referral" className="font-semibold text-gold-300 underline-offset-4 hover:underline">
            {c.referralBar.cta}
          </a>
        </div>
      </div>

      {/* 2 · header */}
      <SiteHeader />

      {/* 3 · hero */}
      <section id="hero" className="relative scroll-mt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_36rem_at_15%_-10%,rgba(201,169,110,0.16),transparent_60%),radial-gradient(48rem_34rem_at_100%_0%,rgba(164,190,152,0.18),transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">{c.kicker}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-taupe-200 bg-cream-50/70 px-4 py-1.5 text-xs font-medium text-taupe-600 sm:text-sm">
              <Icon name="spark" className="h-4 w-4 text-gold-500" />
              {c.hero.eyebrow}
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {c.hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 text-lg font-medium text-gold-600">{c.hero.goldSubtitle}</p>
            <p className="mt-4 text-base leading-relaxed text-taupe-600">{c.hero.body}</p>
            <p className="mt-5 flex items-start gap-2 text-sm text-taupe-500">
              <span className="mt-0.5 flex-none text-sage-500">
                <Icon name="shield" className="h-4 w-4" />
              </span>
              {c.hero.safety}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-7 py-3.5 text-base font-medium text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 transition-all hover:-translate-y-0.5 hover:bg-sage-800"
              >
                <Icon name="whatsapp" className="h-5 w-5" />
                {c.hero.primaryCta}
              </a>
              <a
                href="#packages"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sage-300 bg-cream-50/70 px-7 py-3.5 text-base font-medium text-sage-700 transition-all hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50"
              >
                {c.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-taupe-200/70 shadow-card">
              <Image
                src={`${ASSETS}/01_hero_scene.png`}
                alt={c.hero.imageAlt}
                width={520}
                height={328}
                priority
                quality={100}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -bottom-5 -left-5 hidden h-24 w-24 rounded-3xl border border-gold-300/60 bg-gold-300/10 sm:block" />
          </div>
        </div>
      </section>

      {/* 4 · value strip */}
      <section className="border-y border-taupe-200/60 bg-cream-100/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:gap-4">
          {c.valueStrip.map((item, i) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-taupe-200/60 bg-cream-50 px-4 py-3.5 shadow-soft">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-50 text-sage-700">
                <Icon name={valueIcons[i]} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium leading-snug text-taupe-700">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5 · concept — what will you discover */}
      <section id="concept" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading>{c.concept.title}</SectionHeading>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {c.concept.cards.map((card, i) => (
              <article key={card.title} className="flex flex-col items-center rounded-3xl border border-taupe-200/70 bg-cream-50 p-7 text-center shadow-soft transition-shadow hover:shadow-card">
                <div className="aspect-[3/4] w-full max-w-[176px] overflow-hidden rounded-2xl border border-taupe-200/70 shadow-soft">
                  <Image
                    src={`${ASSETS}/${conceptImages[i].src}.png`}
                    alt={card.title}
                    width={conceptImages[i].w}
                    height={conceptImages[i].h}
                    quality={100}
                    sizes="200px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="mt-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-700">
                  <Icon name={conceptIcons[i]} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-taupe-600">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · process — what is a scent test */}
      <section id="process" className="scroll-mt-24 border-y border-taupe-200/60 bg-cream-100/50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{c.process.title}</h2>
            <div className="mt-5 space-y-2">
              {c.process.intro.map((p) => (
                <p key={p} className="text-base leading-relaxed text-taupe-600">{p}</p>
              ))}
            </div>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {c.process.steps.map((step) => (
                <li key={step.n} className="flex gap-3 rounded-2xl border border-taupe-200/60 bg-cream-50 p-4 shadow-soft">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sage-700 text-sm font-semibold text-cream-50">
                    {step.n}
                  </span>
                  <span>
                    <span className="block font-serif text-base font-semibold text-ink">{step.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-taupe-600">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-taupe-200/70 shadow-card">
            <Image
              src={`${ASSETS}/05_what_is_test_visual.png`}
              alt={c.process.title}
              width={534}
              height={176}
              quality={100}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7 · packages */}
      <section id="packages" className="scroll-mt-24 border-y border-taupe-200/60 bg-cream-100/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading>{c.packages.title}</SectionHeading>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* RM60 */}
            <article className="flex flex-col overflow-hidden rounded-3xl border border-taupe-200/70 bg-cream-50 shadow-soft">
              <div className="flex items-center gap-5 border-b border-taupe-200/60 p-6">
                <div className="h-28 w-24 flex-none overflow-hidden rounded-2xl border border-taupe-200/70 shadow-soft">
                  <Image
                    src={`${ASSETS}/06_package_rm60_image.png`}
                    alt={c.packages.rm60.title}
                    width={142}
                    height={239}
                    quality={100}
                    sizes="120px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl font-semibold text-ink">{c.packages.rm60.title}</h3>
                  <span className="mt-1 block font-serif text-2xl font-semibold text-sage-700">{c.packages.rm60.price}</span>
                  <p className="mt-2 text-sm leading-relaxed text-taupe-600">{c.packages.rm60.desc}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="text-sm font-semibold text-ink">{c.packages.includesLabel}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c.packages.rm60.includes.map((item) => (
                    <CheckItem key={item}>{item}</CheckItem>
                  ))}
                </ul>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3.5 text-base font-medium text-cream-50 shadow-soft ring-1 ring-inset ring-sage-600/40 transition-all hover:-translate-y-0.5 hover:bg-sage-800"
                >
                  <Icon name="whatsapp" className="h-5 w-5" />
                  {c.packages.rm60.cta}
                </a>
              </div>
            </article>

            {/* RM150 — recommended */}
            <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-gold-400/70 bg-cream-50 shadow-card">
              <span className="absolute right-6 top-6 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-cream-50 shadow-soft">
                {c.packages.recommended}
              </span>
              <div className="flex items-center gap-5 border-b border-taupe-200/60 bg-gold-300/15 p-6">
                <div className="h-28 w-24 flex-none overflow-hidden rounded-2xl border border-gold-300/70 shadow-soft">
                  <Image
                    src={`${ASSETS}/07_package_rm150_image.png`}
                    alt={c.packages.rm150.title}
                    width={165}
                    height={222}
                    quality={100}
                    sizes="120px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 pr-16">
                  <h3 className="font-serif text-2xl font-semibold text-ink">{c.packages.rm150.title}</h3>
                  <span className="mt-1 block font-serif text-2xl font-semibold text-gold-600">{c.packages.rm150.price}</span>
                  <p className="mt-2 text-sm leading-relaxed text-taupe-600">{c.packages.rm150.desc}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="text-sm font-semibold text-ink">{c.packages.includesLabel}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c.packages.rm150.includes.map((item) => (
                    <CheckItem key={item}>{item}</CheckItem>
                  ))}
                </ul>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-base font-medium text-cream-50 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-gold-600"
                >
                  <Icon name="whatsapp" className="h-5 w-5" />
                  {c.packages.rm150.cta}
                </a>
              </div>
            </article>
          </div>

          {/* upgrade bar */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-gold-300/70 bg-gold-300/10 px-6 py-5 text-center sm:flex-row sm:gap-5">
            <span className="text-sm leading-relaxed text-taupe-700">{c.upgrade.text}</span>
            <span className="whitespace-nowrap rounded-full bg-sage-800 px-4 py-1.5 text-sm font-semibold text-cream-50">
              {c.upgrade.formula}
            </span>
          </div>

          {/* RM150 detail · personal scent ritual guide */}
          <details className="group mt-6 overflow-hidden rounded-3xl border border-gold-300/70 bg-cream-50 shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 sm:px-8">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold-300/20 text-gold-600">
                  <Icon name="leaf" className="h-5 w-5" />
                </span>
                <span className="font-serif text-lg font-semibold text-ink">{c.ritualGuide.title}</span>
              </span>
              <span className="flex-none text-gold-600 transition-transform duration-200 group-open:rotate-45">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <div className="border-t border-taupe-200/60 px-6 py-7 sm:px-8">
              <p className="max-w-3xl text-sm leading-relaxed text-taupe-600">{c.ritualGuide.intro}</p>
              <div className="mt-7 grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="font-serif text-base font-semibold text-ink">{c.ritualGuide.ritualTitle}</h4>
                  <ol className="mt-4 space-y-3">
                    {c.ritualGuide.steps.map((step, i) => (
                      <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-taupe-600">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sage-700 text-xs font-semibold text-cream-50">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-ink">{c.ritualGuide.momentsTitle}</h4>
                  <ul className="mt-4 space-y-3">
                    {c.ritualGuide.moments.map((moment) => (
                      <li key={moment} className="flex items-start gap-2.5 text-sm leading-relaxed text-taupe-600">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold-400" />
                        {moment}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-7 rounded-2xl bg-sage-50 px-5 py-5 text-center">
                <p className="font-serif text-base font-medium text-sage-800">{c.ritualGuide.brandEn}</p>
                <p className="mt-1 text-sm text-taupe-600">{c.ritualGuide.brandZh}</p>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* 9 · faq */}
      <section id="faq" className="scroll-mt-24">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading>{c.faq.title}</SectionHeading>
          <div className="mt-10 divide-y divide-taupe-200/70 overflow-hidden rounded-3xl border border-taupe-200/70 bg-cream-50 shadow-soft">
            {c.faq.items.map((item) => (
              <details key={item.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-ink">
                  {item.q}
                  <span className="flex-none text-sage-600 transition-transform duration-200 group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-taupe-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · lower three cards (referral) */}
      <section id="referral" className="scroll-mt-24 border-t border-taupe-200/60 bg-cream-100/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:py-20">
          {/* feelings */}
          <article className="rounded-3xl border border-taupe-200/70 bg-cream-50 p-7 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="h-20 w-16 flex-none overflow-hidden rounded-xl border border-taupe-200/70 shadow-soft">
                <Image
                  src={`${ASSETS}/08_lower_painpoints_portrait.png`}
                  alt={c.lower.feelings.title}
                  width={104}
                  height={148}
                  quality={100}
                  sizes="80px"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xl font-semibold text-ink">{c.lower.feelings.title}</h3>
            </div>
            <ul className="mt-5 space-y-2.5">
              {c.lower.feelings.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-taupe-600">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          {/* safety */}
          <article className="rounded-3xl border border-taupe-200/70 bg-cream-50 p-7 shadow-soft">
            <h3 className="font-serif text-xl font-semibold text-ink">{c.lower.safety.title}</h3>
            <ul className="mt-5 space-y-2.5">
              {c.lower.safety.items.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </article>

          {/* referral reward */}
          <article className="flex flex-col rounded-3xl border border-sage-700 bg-forest-depth p-7 text-cream-50 shadow-card">
            <div className="h-24 w-28 overflow-hidden rounded-2xl border border-cream-50/15 shadow-soft">
              <Image
                src={`${ASSETS}/09_lower_referral_envelope.png`}
                alt={c.lower.referral.title}
                width={165}
                height={172}
                quality={100}
                sizes="120px"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-5 font-serif text-xl font-semibold">{c.lower.referral.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-cream-50/85">{c.lower.referral.body}</p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-cream-50 px-5 py-3 text-sm font-semibold text-sage-800 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-cream-200"
            >
              {c.lower.referral.cta}
            </Link>
          </article>
        </div>
      </section>

      {/* 11 · final cta */}
      <section className="relative bg-forest-depth text-cream-50">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 lg:py-20">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-snug sm:text-4xl">
              {c.finalCta.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-base font-medium text-sage-800 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-cream-200"
              >
                <Icon name="whatsapp" className="h-5 w-5" />
                {c.finalCta.primary}
              </a>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/40 px-7 py-3.5 text-base font-medium text-cream-50 transition-all hover:-translate-y-0.5 hover:bg-cream-50/10"
              >
                {c.finalCta.secondary}
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { src: "10_footer_candle_left", w: 250, h: 56 },
              { src: "11_footer_bottles_center", w: 107, h: 60 },
              { src: "12_footer_notebook_right", w: 192, h: 50 },
            ].map((img) => (
              <Image
                key={img.src}
                src={`${ASSETS}/${img.src}.png`}
                alt=""
                width={img.w}
                height={img.h}
                quality={100}
                sizes="240px"
                className="h-16 w-auto rounded-xl border border-cream-50/15 object-cover shadow-lift sm:h-[4.5rem]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 12 · footer */}
      <footer className="bg-sage-900 text-cream-50/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-cream-50 hover:text-gold-300">
              <Icon name="whatsapp" className="h-5 w-5" />
              {c.footer.whatsapp}
              <span className="text-cream-50/70">· {c.footer.phones}</span>
            </a>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-cream-50/70">
              {c.footer.badges.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="hairline opacity-30" />
          <p className="text-xs text-cream-50/60">{c.footer.copyright}</p>
        </div>
      </footer>

      {/* floating whatsapp */}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-cream-50 shadow-card transition-transform duration-200 hover:scale-105 sm:bottom-6 sm:right-6"
      >
        <Icon name="whatsapp" className="h-6 w-6" />
        <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
