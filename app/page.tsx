"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { homeCopy } from "@/data/home-copy";

const WHATSAPP = "https://wa.me/60124761919";
const ASSETS = "/scent-knows-you-assets";

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "gift":
      return (
        <svg {...common}>
          <path d="M20 12v8H4v-8" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 1 1 2.2-3.7L12 7Z" />
          <path d="M12 7h4.5a2.5 2.5 0 1 0-2.2-3.7L12 7Z" />
        </svg>
      );
    case "oil":
      return (
        <svg {...common}>
          <path d="M9 3h6" />
          <path d="M10 3v4l-2 3v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9l-2-3V3" />
          <path d="M9 13h6" />
        </svg>
      );
    case "person":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c0-7 5-12 14-12 0 9-5 13-11 13a4 4 0 0 1-3-1Z" />
          <path d="M9 17c2.4-3 4.7-4.8 8-5.7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.1 2.8 7.5 7 9 4.2-1.5 7-4.9 7-9V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.2-9.1-8.2C1.4 9 2.9 6 5.8 6c1.9 0 3.2 1.1 4.2 2.8C11 7.1 12.3 6 14.2 6c2.9 0 4.4 3 2.9 5.8C19 15.8 12 20 12 20Z" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 9.7 3.7 3.7 0 0 1 17.5 17H7Z" />
          <path d="M10 21c.5-.8.9-1.5 1.2-2.2M14.5 21c.3-.8.7-1.5 1.2-2.2" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
          <path d="m6.6 6.6 3 3M14.4 14.4l3 3M17.4 6.6l-3 3M9.6 14.4l-3 3" />
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

function BrandMark({ alt, className = "text-sage-900" }: { alt: string; className?: string }) {
  return (
    <span className={`flex h-11 w-11 flex-none items-center justify-center ${className}`} aria-label={alt}>
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="3.5" />
        <path d="M24 20.5c0-6 2.6-10.5 0-14-2.6 3.5 0 8 0 14Z" />
        <path d="M24 27.5c0 6 2.6 10.5 0 14-2.6-3.5 0-8 0-14Z" />
        <path d="M20.5 24c-6 0-10.5 2.6-14 0 3.5-2.6 8 0 14 0Z" />
        <path d="M27.5 24c6 0 10.5 2.6 14 0-3.5-2.6-8 0-14 0Z" />
        <path d="M21.2 21.2l-7-7M26.8 21.2l7-7M21.2 26.8l-7 7M26.8 26.8l7 7" />
      </svg>
    </span>
  );
}

function HomeLangSwitch() {
  const { lang, setLang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <div
      role="group"
      aria-label={c.langSwitch.label}
      className="inline-flex items-center gap-1 rounded-full border border-taupe-200 bg-cream-50/90 p-1 shadow-sm"
    >
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`min-w-12 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${lang === "zh" ? "bg-sage-800 text-cream-50" : "text-taupe-600 hover:text-sage-800"}`}
      >
        {c.langSwitch.zh}
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`min-w-12 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${lang === "en" ? "bg-sage-800 text-cream-50" : "text-taupe-600 hover:text-sage-800"}`}
      >
        {c.langSwitch.en}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4 text-center">
      <span className="hidden h-px w-14 bg-gold-400 sm:block" />
      <span className="text-gold-600">
        <Icon name="spark" className="h-4 w-4" />
      </span>
      <h2 className="font-serif text-3xl font-semibold leading-tight text-sage-900 sm:text-4xl">{children}</h2>
      <span className="text-gold-600">
        <Icon name="spark" className="h-4 w-4" />
      </span>
      <span className="hidden h-px w-14 bg-gold-400 sm:block" />
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-taupe-700">
      <span className="mt-1 flex h-4 w-4 flex-none items-center justify-center rounded-full border border-gold-500 text-gold-600">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2.2 6.2 2.2 2.2 5-5" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

function TopReferralBar() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <div className="bg-sage-900 text-cream-50">
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs sm:text-sm">
        <span className="text-gold-300">
          <Icon name="gift" className="h-4 w-4" />
        </span>
        <span className="text-cream-50/90">{c.topBar.text}</span>
        <a href="#referral" className="rounded-full border border-cream-50/25 px-3 py-0.5 font-medium text-cream-50 hover:border-gold-300 hover:text-gold-300">
          {c.topBar.cta}
        </a>
      </div>
    </div>
  );
}

function Header() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-taupe-200/70 bg-cream-50/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <a href="#hero" className="flex flex-none items-center gap-3">
          <BrandMark alt={c.brand.markAlt} />
          <span className="leading-none">
            <span className="block font-serif text-lg font-semibold text-sage-900">{c.brand.zh}</span>
            <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-sage-800">{c.brand.en}</span>
          </span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {c.nav.links.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="text-sm font-medium text-taupe-700 transition-colors hover:text-sage-900">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden flex-none items-center gap-2.5 lg:flex">
          <HomeLangSwitch />
          <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-taupe-700 hover:text-sage-900">
            {c.nav.login}
          </Link>
          <Link href="/register" className="rounded-full bg-sage-800 px-4 py-2 text-sm font-medium text-cream-50 shadow-soft hover:bg-sage-900">
            {c.nav.register}
          </Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-sage-800/30 bg-cream-50 px-4 py-2 text-sm font-medium text-sage-900 hover:border-sage-800">
            <Icon name="whatsapp" className="h-4 w-4" />
            {c.nav.whatsapp}
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <HomeLangSwitch />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-taupe-200 bg-cream-50 text-sage-900"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-taupe-200 bg-cream-50 px-4 py-4 lg:hidden">
          <nav className="mx-auto flex max-w-[1220px] flex-col gap-1">
            {c.nav.links.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-medium text-taupe-700 hover:bg-cream-100">
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px bg-taupe-200" />
            <Link href="/register" onClick={() => setOpen(false)} className="rounded-full bg-sage-800 px-5 py-3 text-center text-sm font-semibold text-cream-50">
              {c.nav.register}
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-sage-800/25 px-5 py-3 text-center text-sm font-semibold text-sage-900">
              {c.nav.login}
            </Link>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
              <Icon name="whatsapp" className="h-4 w-4" />
              {c.nav.whatsapp}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section id="hero" className="relative overflow-hidden border-b border-taupe-200/70">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#FBF9F2_0%,rgba(251,249,242,0.96)_38%,rgba(251,249,242,0.5)_60%,rgba(251,249,242,0)_100%)]" />
      <div className="mx-auto grid max-w-[1220px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.45fr_0.55fr] lg:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-semibold text-gold-600">{c.hero.eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] text-sage-900 sm:text-5xl lg:text-[4.25rem]">
            {c.hero.titleLines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </h1>
          <p className="mt-5 text-lg font-semibold leading-relaxed text-gold-600">{c.hero.subtitle}</p>
          <p className="mt-4 text-base leading-8 text-taupe-700">{c.hero.body}</p>
          <p className="mt-5 flex items-start gap-2 text-sm leading-7 text-taupe-600">
            <span className="mt-1 text-gold-600">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            {c.hero.safety}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-900 px-7 py-3.5 text-base font-semibold text-cream-50 shadow-lift hover:bg-sage-800">
              <Icon name="whatsapp" className="h-5 w-5" />
              {c.hero.primaryCta}
            </a>
            <a href="#packages" className="inline-flex items-center justify-center rounded-full border border-sage-800/35 bg-cream-50/80 px-7 py-3.5 text-base font-semibold text-sage-900 hover:border-sage-900">
              {c.hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative z-0 min-h-[420px] overflow-hidden rounded-[28px] border border-taupe-200 shadow-card lg:min-h-[430px]">
          <Image
            src={`${ASSETS}/01_hero_scene_1280x860.png`}
            alt={c.hero.imageAlt}
            fill
            priority
            quality={100}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-cream-50/80 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function ValueStrip() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];
  const icons = ["oil", "person", "leaf", "shield"];

  return (
    <section className="-mt-8 relative z-20 px-4 sm:px-6">
      <div className="mx-auto grid max-w-[1080px] overflow-hidden rounded-2xl border border-taupe-200 bg-cream-50 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        {c.valueStrip.map((item, i) => (
          <div key={item} className="flex items-center gap-4 border-b border-taupe-200 px-6 py-5 sm:border-r lg:border-b-0 last:border-r-0">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gold-300/35 text-sage-900">
              <Icon name={icons[i]} className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold leading-snug text-taupe-700">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Discover() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];
  const icons = ["heart", "cloud", "shield"];

  return (
    <section id="concept" className="scroll-mt-24 px-4 py-14 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-[1220px]">
        <SectionTitle>{c.discover.title}</SectionTitle>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {c.discover.cards.map((card, i) => (
            <article key={card.title} className="min-h-[340px] overflow-hidden rounded-2xl border border-taupe-200 bg-cream-50 shadow-soft">
              <div className="relative h-[230px] w-full">
                <Image src={card.image} alt={card.imageAlt} fill quality={100} sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="relative p-6">
                <span className="absolute -top-8 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-gold-300 bg-cream-50 text-gold-600 shadow-soft">
                  <Icon name={icons[i]} className="h-5 w-5" />
                </span>
                <h3 className="font-serif text-2xl font-semibold text-sage-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-taupe-700">{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OilLibrary() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section id="oil-library" className="scroll-mt-24 border-y border-taupe-200 bg-cream-100/65 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[0.46fr_0.54fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">{c.oilLibrary.eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-sage-900 sm:text-4xl">{c.oilLibrary.title}</h2>
          <p className="mt-5 text-base leading-8 text-taupe-700">{c.oilLibrary.body}</p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {c.oilLibrary.points.map((point) => (
              <CheckItem key={point}>{point}</CheckItem>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-taupe-200 shadow-card lg:min-h-[360px]">
          <Image
            src={`${ASSETS}/06_scent_cards_materials_900x560.png`}
            alt={c.oilLibrary.imageAlt}
            fill
            quality={100}
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Process() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section id="process" className="scroll-mt-24 border-y border-taupe-200 bg-cream-100/70 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[0.48fr_0.52fr]">
        <div>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-sage-900 sm:text-4xl">{c.process.title}</h2>
          <p className="mt-5 text-base leading-8 text-taupe-700">{c.process.body}</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {c.process.steps.map((step) => (
              <li key={step.n} className="relative rounded-2xl bg-cream-50 p-4 shadow-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-900 text-sm font-semibold text-cream-50">{step.n}</span>
                <h3 className="mt-4 font-serif text-lg font-semibold text-sage-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-taupe-700">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-taupe-200 shadow-card lg:min-h-[340px]">
          <Image
            src={`${ASSETS}/05_scent_test_process_1100x560.png`}
            alt={c.process.imageAlt}
            fill
            quality={100}
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, recommended, includesLabel }: { pkg: typeof homeCopy.zh.packages.rm60; recommended?: string; includesLabel: string }) {
  const highlight = Boolean(recommended);

  return (
    <article className={`relative flex min-h-[390px] flex-col overflow-hidden rounded-2xl border bg-cream-50 shadow-soft ${highlight ? "border-gold-500" : "border-taupe-200"}`}>
      {recommended && (
        <span className="absolute left-0 top-0 z-10 rounded-br-2xl bg-gold-500 px-4 py-2 text-sm font-semibold text-cream-50">{recommended}</span>
      )}
      <div className="relative h-[240px] w-full sm:h-[260px]">
        <Image src={pkg.image} alt={pkg.imageAlt} fill quality={100} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <h3 className="max-w-[18rem] font-serif text-2xl font-semibold leading-tight text-sage-900">{pkg.title}</h3>
          <span className={`rounded-full px-4 py-1.5 font-serif text-xl font-semibold ${highlight ? "bg-gold-500 text-cream-50" : "bg-sage-900 text-cream-50"}`}>
            {pkg.price}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-taupe-700">{pkg.desc}</p>
        <p className="mt-4 text-sm font-semibold text-sage-900">{includesLabel}</p>
        <ul className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {pkg.includes.map((item) => (
            <CheckItem key={item}>{item}</CheckItem>
          ))}
        </ul>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-soft ${highlight ? "bg-gold-500 text-cream-50 hover:bg-gold-600" : "bg-sage-900 text-cream-50 hover:bg-sage-800"}`}>
          <Icon name="whatsapp" className="h-4 w-4" />
          {pkg.cta}
        </a>
      </div>
    </article>
  );
}

function Packages() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section id="packages" className="scroll-mt-24 px-4 py-14 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-[1220px]">
        <SectionTitle>{c.packages.title}</SectionTitle>
        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <PackageCard pkg={c.packages.rm60} includesLabel={c.packages.includesLabel} />
          <PackageCard pkg={c.packages.rm150} includesLabel={c.packages.includesLabel} recommended={c.packages.recommended} />
        </div>
        <div className="mx-auto mt-6 flex max-w-[760px] flex-col items-center justify-center gap-3 rounded-2xl border border-gold-300 bg-gold-300/20 px-5 py-4 text-center sm:flex-row">
          <span className="text-sm leading-6 text-taupe-700">{c.upgrade.text}</span>
          <span className="rounded-full bg-sage-900 px-4 py-1.5 text-sm font-semibold text-cream-50">{c.upgrade.formula}</span>
        </div>
      </div>
    </section>
  );
}

function LowerCards() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section id="referral" className="scroll-mt-24 border-y border-taupe-200 bg-cream-100/70 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-[1220px] gap-6 lg:grid-cols-3">
        <article className="overflow-hidden rounded-2xl border border-taupe-200 bg-cream-50 shadow-soft">
          <div className="relative h-44">
            <Image src={`${ASSETS}/09_painpoints_portrait_640x520.png`} alt={c.lower.pain.imageAlt} fill quality={100} sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
          </div>
          <div className="p-6">
            <h3 className="font-serif text-xl font-semibold leading-tight text-sage-900">{c.lower.pain.title}</h3>
            <ul className="mt-4 space-y-2">
              {c.lower.pain.items.map((item) => <CheckItem key={item}>{item}</CheckItem>)}
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-taupe-200 bg-cream-50 p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-300/35 text-sage-900">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          <h3 className="mt-5 font-serif text-xl font-semibold leading-tight text-sage-900">{c.lower.safety.title}</h3>
          <ul className="mt-5 space-y-3">
            {c.lower.safety.items.map((item) => <CheckItem key={item}>{item}</CheckItem>)}
          </ul>
        </article>

        <article className="relative overflow-hidden rounded-2xl bg-forest-depth p-6 text-cream-50 shadow-card">
          <div className="absolute -right-12 -top-5 h-56 w-56 opacity-95 lg:-right-16 lg:top-0 lg:h-64 lg:w-64">
            <Image src={`${ASSETS}/10_referral_reward_640x520.png`} alt={c.lower.referral.imageAlt} fill quality={100} sizes="260px" className="object-contain" />
          </div>
          <div className="relative z-10 max-w-[72%] lg:max-w-none lg:pr-36">
            <h3 className="font-serif text-xl font-semibold leading-tight">{c.lower.referral.title}</h3>
            <p className="mt-4 text-sm leading-7 text-cream-50/85">{c.lower.referral.body}</p>
            <Link href="/register" className="mt-6 inline-flex rounded-full bg-cream-50 px-5 py-3 text-sm font-semibold text-sage-900 shadow-soft hover:bg-cream-200">
              {c.lower.referral.cta}
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

function Faq() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-[900px]">
        <SectionTitle>{c.faq.title}</SectionTitle>
        <div className="mt-9 divide-y divide-taupe-200 overflow-hidden rounded-2xl border border-taupe-200 bg-cream-50 shadow-soft">
          {c.faq.items.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-serif text-lg font-semibold text-sage-900">
                {item.q}
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gold-300/35 text-gold-600 transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-taupe-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <section className="bg-sage-900 px-4 py-12 text-cream-50 sm:px-6 lg:py-16">
      <div className="relative mx-auto flex min-h-[320px] max-w-[1800px] items-center justify-center overflow-hidden rounded-[28px] border border-cream-50/10 shadow-lift lg:min-h-[350px]">
        <Image
          src={`${ASSETS}/13_final_cta_dark_overlay_1800x520.png`}
          alt={c.finalCta.imageAlt}
          fill
          quality={100}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-sage-900/20" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-12 text-center">
          <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {c.finalCta.lines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-base font-semibold text-sage-900 shadow-soft hover:bg-cream-200">
              <Icon name="whatsapp" className="h-5 w-5" />
              {c.finalCta.primary}
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/50 bg-sage-900/20 px-7 py-3.5 text-base font-semibold text-cream-50 backdrop-blur-sm hover:bg-cream-50/10">
              <Icon name="whatsapp" className="h-5 w-5" />
              {c.finalCta.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { lang } = useLanguage();
  const c = homeCopy[lang];

  return (
    <footer className="bg-sage-900 text-cream-50/80">
      <div className="mx-auto grid max-w-[1220px] gap-8 px-4 py-9 sm:px-6 lg:grid-cols-[1.25fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark alt={c.brand.markAlt} className="text-cream-50" />
            <span>
              <span className="block font-serif text-lg font-semibold text-cream-50">{c.brand.zh}</span>
              <span className="mt-1 block text-[0.62rem] font-semibold tracking-[0.22em] text-gold-300">{c.brand.en}</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-cream-50/70">{c.finalCta.lines.join(" ")}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cream-50">{c.footer.explore}</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/register" className="hover:text-gold-300">{c.nav.register}</Link>
            <Link href="/member" className="hover:text-gold-300">{c.footer.member}</Link>
            <Link href="/admin" className="hover:text-gold-300">{c.footer.admin}</Link>
            <Link href="/login" className="hover:text-gold-300">{c.nav.login}</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cream-50">{c.footer.whatsapp}</h3>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-start gap-2 text-sm text-cream-50 hover:text-gold-300">
            <Icon name="whatsapp" className="h-5 w-5" />
            <span className="space-y-1">
              {c.footer.contactLines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </span>
          </a>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-cream-50/65">
            {c.footer.badges.map((badge) => <li key={badge}>{badge}</li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-50/10 px-4 py-4 text-center text-xs text-cream-50/55 sm:px-6">
        {c.footer.copyright}
      </div>
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-card transition-transform hover:scale-105">
        <Icon name="whatsapp" className="h-6 w-6" />
        <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
      </a>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream-50 text-ink">
      <TopReferralBar />
      <Header />
      <main>
        <Hero />
        <ValueStrip />
        <Discover />
        <OilLibrary />
        <Process />
        <Packages />
        <LowerCards />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
