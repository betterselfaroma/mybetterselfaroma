import type { Metadata } from "next";

/**
 * /design-preview — STATIC visual preview of the approved homepage design.
 *
 * This page is fully self-contained: it does NOT import or modify the live
 * homepage, components, Supabase, membership, referral/points/TNG PIN, or any
 * business logic. It exists only so the approved visual direction can be
 * reviewed in isolation before any migration to the real homepage.
 *
 * Approved palette:
 *   Deep Green #1F3D2E · Sage Green #6B8E75 · Warm Cream #F7F3E8
 *   Soft Beige #EFE7DA · Gold #C8A96E
 */

export const metadata: Metadata = {
  title: "Design Preview · 香气读懂你的心 / Scent Knows You",
  robots: { index: false, follow: false },
};

const WA_DISPLAY = "0124761919";
const WA_LINK = "https://wa.me/60124761919";

/* ----------------------------------------------------------------- icons -- */
function LeafIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0-7 5-12 14-12 0 7-5 12-14 12Z" />
      <path d="M5 19c3.5-3.5 6.5-5.5 10-7" />
    </svg>
  );
}
function PersonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
function BottleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 3h5M10 3v3l-1.6 2.4A3 3 0 0 0 8 10.1V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8.9a3 3 0 0 0-.4-1.7L14 6V3" />
      <path d="M8 12h8" />
    </svg>
  );
}
function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function HeartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </svg>
  );
}
function InfoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}
function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Z" />
    </svg>
  );
}
function Sprig({ className = "h-6 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 28" className={className} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M6 14h60" />
      <path d="M40 14c5-4 12-5 20-4-3 6-10 8-20 4Z" />
      <path d="M40 14c-5-4-12-5-20-4 3 6 10 8 20 4Z" />
      <circle cx="70" cy="14" r="2.5" />
    </svg>
  );
}
function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="4" />
      <path d="M24 20c0-7 3-12 0-16-3 4 0 9 0 16Z" />
      <path d="M24 28c0 7 3 12 0 16-3-4 0-9 0-16Z" />
      <path d="M20 24c-7 0-12 3-16 0 4-3 9 0 16 0Z" />
      <path d="M28 24c7 0 12 3 16 0-4-3-9 0-16 0Z" />
      <path d="M21 21l-9-9M27 21l9-9M21 27l-9 9M27 27l9 9" />
    </svg>
  );
}

const NAV = ["核心理念", "28 种精油库", "体验方案", "体验流程", "会员计划", "关于我们", "常见问题"];

const TRUST = [
  { icon: <BottleIcon className="h-5 w-5" />, a: "28 种精油", b: "专业香气库" },
  { icon: <PersonIcon className="h-5 w-5" />, a: "1 对 1", b: "状态引导" },
  { icon: <BottleIcon className="h-5 w-5" />, a: "专属配方", b: "贴近当下" },
];

const VALUES = [
  { icon: <LeafIcon className="h-5 w-5" />, title: "温柔无压力", desc: "尊重感受，不强迫分析" },
  { icon: <ShieldIcon className="h-5 w-5" />, title: "安全温和", desc: "专业稀释配方，安心使用" },
  { icon: <HeartIcon className="h-5 w-5" />, title: "专属陪伴", desc: "一瓶香气，每天支持你" },
  { icon: <InfoIcon className="h-5 w-5" />, title: "非医疗承诺", desc: "不替代诊断或治疗" },
];

const PALETTE = [
  { name: "Deep Green", hex: "#1F3D2E" },
  { name: "Sage Green", hex: "#6B8E75" },
  { name: "Warm Cream", hex: "#F7F3E8" },
  { name: "Soft Beige", hex: "#EFE7DA" },
  { name: "Gold", hex: "#C8A96E" },
];

const MODELS = [
  { img: "/images/package-rm129-custom-oil.webp", cn: "专属滚珠精油", en: "Roller Bottle" },
  { img: "/images/package-rm49-aroma-check.webp", cn: "摸香测试", en: "Aroma Check" },
  { img: "/images/hero-aroma-selfcare.webp", cn: "生活场景", en: "Lifestyle Scene" },
  { img: "/images/ritual-evening-journal.webp", cn: "每日仪式", en: "Daily Ritual" },
];

/* --------------------------------------------------------------- the page -- */
export default function DesignPreview() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] font-sans text-[#33402F]">
      {/* review banner */}
      <div className="bg-[#C8A96E] px-4 py-1.5 text-center text-xs font-medium text-[#1F3D2E]">
        DESIGN PREVIEW · 仅供审核 · 未应用到正式首页 / not yet applied to the live homepage
      </div>

      {/* 1 — announcement bar */}
      <div className="bg-[#1F3D2E] text-[#F7F3E8]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="inline-flex items-center gap-2 text-center text-xs sm:text-sm">
            <span className="text-[#C8A96E]">✦</span>
            推荐朋友，获得 RM10 TNG PIN + 会员积分
          </span>
          <a href="#" className="hidden flex-none rounded-full border border-[#F7F3E8]/30 px-3 py-0.5 text-xs font-medium transition-colors hover:bg-[#F7F3E8]/10 sm:inline-block">
            了解更多
          </a>
        </div>
      </div>

      {/* 2 — header */}
      <header className="sticky top-0 z-40 border-b border-[#EFE7DA] bg-[#F7F3E8]/90 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-[#1F3D2E]"><BrandMark className="h-10 w-10" /></span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-semibold text-[#1F3D2E]">香气读懂你的心</span>
              <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#C8A96E]">Scent Knows You</span>
            </span>
          </div>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 xl:flex">
            {NAV.map((n) => (
              <span key={n} className="text-sm font-medium text-[#556357]">{n}</span>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="flex items-center gap-1.5 text-sm text-[#556357]">
              <span className="font-medium text-[#1F3D2E]">中文</span>
              <span className="text-[#C8B9A6]">/</span>
              <span>EN</span>
            </span>
            <span className="text-sm font-medium text-[#556357]">登录</span>
            <span className="rounded-full bg-[#1F3D2E] px-4 py-2 text-sm font-medium text-[#F7F3E8] shadow-sm">注册会员</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1F3D2E]/30 bg-white px-4 py-2 text-sm font-medium text-[#1F3D2E]">
              <WhatsAppIcon className="h-4 w-4" />WhatsApp 预约
            </span>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-sm font-medium text-[#1F3D2E]">中文</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EFE7DA] text-[#1F3D2E]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </span>
          </div>
        </div>
      </header>

      {/* 4–8 — hero */}
      <section className="relative overflow-hidden">
        {/* botanical wash */}
        <svg aria-hidden="true" className="pointer-events-none absolute -left-10 top-10 hidden h-[28rem] w-[28rem] text-[#6B8E75]/15 lg:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M20 180C60 140 90 120 120 60" />
          <path d="M70 120c-6-18-3-34 6-50 12 14 12 34-6 50Z" />
          <path d="M95 95c14-12 30-15 48-12-10 16-30 22-48 12Z" />
        </svg>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
          {/* left */}
          <div>
            <div className="flex items-center gap-3 text-[#C8A96E]">
              <Sprig className="h-5 w-12" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">一场 10–30 分钟的温柔体验</span>
              <Sprig className="h-5 w-12 -scale-x-100" />
            </div>

            <h1 className="mt-6 font-serif text-[2.4rem] font-semibold leading-[1.2] text-[#1F3D2E] sm:text-[2.7rem] lg:text-[2.6rem]">
              解析潜意识最深渴望，
              <br />
              引导你找到跨越困境的<span className="text-[#C8A96E]">解方</span>。
            </h1>

            <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-[#556357] sm:text-lg">
              通过摸香测试，了解你当下的精神状态、生活状态与内心需要，再为你调配一瓶真正贴近自己的专属精油。
            </p>

            <p className="mt-5 max-w-[34rem] border-l-2 border-[#C8A96E]/70 pl-4 text-sm italic leading-relaxed text-[#A98A52]">
              不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
              {TRUST.map((p) => (
                <li key={p.a} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFE7DA] text-[#6B8E75]">{p.icon}</span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold text-[#1F3D2E]">{p.a}</span>
                    <span className="block text-xs text-[#556357]">{p.b}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={WA_LINK} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F3D2E] px-7 py-3.5 text-base font-medium text-[#F7F3E8] shadow-md transition-transform hover:-translate-y-0.5">
                <WhatsAppIcon className="h-[1.05em] w-[1.05em]" />预约 RM60 摸香测试
              </a>
              <a href={WA_LINK} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3D2E]/30 bg-white px-7 py-3.5 text-base font-medium text-[#1F3D2E] transition-colors hover:border-[#1F3D2E]/60">
                了解 RM150 专属特调
              </a>
            </div>

            <div className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-[#C8A96E]/40 bg-[#EFE7DA] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#C8A96E] text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </span>
                <span className="text-sm font-medium leading-relaxed text-[#556357]">
                  已体验 RM60 摸香测试，当天加 RM90，即可获得专属特调精油方案。
                </span>
              </div>
              <span className="flex-none self-start whitespace-nowrap rounded-full bg-white px-3.5 py-1 text-sm font-semibold text-[#1F3D2E] shadow-sm ring-1 ring-[#C8A96E]/30 sm:self-auto">
                RM60 + RM90 = RM150
              </span>
            </div>
          </div>

          {/* right — single clean lifestyle/product image */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-[#C8A96E]/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 shadow-[0_40px_90px_-45px_rgba(31,61,46,0.55)] ring-1 ring-[#EFE7DA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-aroma-selfcare.webp"
                alt="女性在自然光下闻香并记录状态，桌上有滚珠精油、笔记本与植物"
                className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F3D2E]/25 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* value strip */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-y-6 rounded-[2rem] border border-[#EFE7DA] bg-white/70 p-7 shadow-sm sm:grid-cols-2 sm:p-9 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <div key={v.title} className={`flex items-start gap-4 ${i < VALUES.length - 1 ? "lg:border-r lg:border-[#EFE7DA] lg:pr-6" : ""}`}>
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-[#EFE7DA] text-[#6B8E75]">{v.icon}</span>
              <div>
                <p className="font-serif text-base font-semibold text-[#1F3D2E]">{v.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#556357]">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== design system reference board ===================== */}
      <section className="border-t border-[#EFE7DA] bg-[#EFE7DA]/50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C8A96E]">Design System Reference</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#1F3D2E]">设计系统参考</h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* 9 — mobile preview phone mockup */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#556357]">Mobile Preview</p>
              <div className="mx-auto w-[300px] rounded-[2.5rem] border-[6px] border-[#1F3D2E] bg-[#F7F3E8] p-2 shadow-xl">
                <div className="overflow-hidden rounded-[2rem]">
                  <div className="bg-[#1F3D2E] px-3 py-1.5 text-center text-[0.6rem] text-[#F7F3E8]">推荐朋友，获得 RM10 TNG PIN + 会员积分</div>
                  <div className="flex items-center justify-between border-b border-[#EFE7DA] bg-[#F7F3E8] px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#1F3D2E]"><BrandMark className="h-6 w-6" /></span>
                      <span className="font-serif text-xs font-semibold text-[#1F3D2E]">香气读懂你的心</span>
                    </span>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1F3D2E]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                  </div>
                  <div className="bg-[#F7F3E8] px-4 py-5">
                    <span className="text-[0.55rem] font-medium uppercase tracking-[0.18em] text-[#C8A96E]">一场 10–30 分钟的温柔体验</span>
                    <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-[#1F3D2E]">
                      解析潜意识最深渴望，引导你找到跨越困境的<span className="text-[#C8A96E]">解方</span>。
                    </h3>
                    <p className="mt-2 text-[0.7rem] leading-relaxed text-[#556357]">通过摸香测试，了解你当下的精神状态、生活状态与内心需要，再为你调配一瓶真正贴近自己的专属精油。</p>
                    <p className="mt-2 border-l-2 border-[#C8A96E]/70 pl-2 text-[0.62rem] italic text-[#A98A52]">不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。</p>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.6rem] text-[#556357]">
                      <span>· 28 种精油专业香气库</span>
                      <span>· 1 对 1 状态引导</span>
                    </div>
                    <div className="mt-3 rounded-full bg-[#1F3D2E] px-3 py-2 text-center text-[0.7rem] font-medium text-[#F7F3E8]">预约 RM60 摸香测试</div>
                    <div className="mt-2 rounded-full border border-[#1F3D2E]/30 bg-white px-3 py-2 text-center text-[0.7rem] font-medium text-[#1F3D2E]">了解 RM150 专属特调</div>
                    <div className="mt-3 rounded-xl bg-[#EFE7DA] px-3 py-2 text-[0.58rem] text-[#556357]">
                      已体验 RM60 摸香测试，当天加 RM90… <span className="font-semibold text-[#1F3D2E]">RM60 + RM90 = RM150</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* right column of reference cards */}
            <div className="space-y-8">
              {/* 13 — colors + typography */}
              <div className="rounded-2xl border border-[#EFE7DA] bg-white/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#556357]">Design System</p>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="mb-3 text-sm font-medium text-[#1F3D2E]">Colors</p>
                    <div className="flex flex-wrap gap-4">
                      {PALETTE.map((c) => (
                        <div key={c.hex} className="text-center">
                          <span className="block h-14 w-14 rounded-2xl border border-black/5 shadow-sm" style={{ backgroundColor: c.hex }} />
                          <span className="mt-1.5 block text-[0.68rem] font-medium text-[#1F3D2E]">{c.name}</span>
                          <span className="block text-[0.62rem] text-[#8A9384]">{c.hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium text-[#1F3D2E]">Typography</p>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-4xl font-semibold text-[#1F3D2E]">Aa</span>
                        <span className="text-[0.7rem] leading-tight text-[#556357]">Noto Serif SC<br />Playfair Display</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-semibold text-[#1F3D2E]">Aa</span>
                        <span className="text-[0.7rem] leading-tight text-[#556357]">Noto Sans SC<br />Inter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 10 — product models */}
              <div className="rounded-2xl border border-[#EFE7DA] bg-white/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#556357]">Product Models</p>
                <p className="mt-1 text-xs text-[#8A9384]">磨砂滚珠瓶 · 淡黄色精油 · 香槟/玫瑰金盖</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {MODELS.map((m) => (
                    <div key={m.cn} className="overflow-hidden rounded-xl border border-[#EFE7DA] bg-[#F7F3E8]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.img} alt={m.cn} className="aspect-square w-full object-cover" />
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-[#1F3D2E]">{m.cn}</p>
                        <p className="text-[0.62rem] text-[#8A9384]">{m.en}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 11 — icon style + 12 — botanical */}
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#EFE7DA] bg-white/80 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#556357]">Icon Style</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-[#6B8E75]">
                    {[<LeafIcon key="l" />, <PersonIcon key="p" />, <BottleIcon key="b" />, <ShieldIcon key="s" />, <HeartIcon key="h" />, <InfoIcon key="i" />].map((ic, idx) => (
                      <span key={idx} className="flex h-12 w-12 items-center justify-center rounded-full border border-[#EFE7DA] bg-[#F7F3E8]">{ic}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#EFE7DA] bg-white/80 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#556357]">Botanical Elements</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3 text-[#C8A96E]">
                    <Sprig className="h-7 w-20" />
                    <Sprig className="h-7 w-20 -scale-x-100" />
                    <Sprig className="h-7 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-[#1F3D2E] text-[#F7F3E8]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm sm:flex-row sm:px-6 sm:text-left">
          <span className="font-serif text-base font-semibold">香气读懂你的心 · Scent Knows You</span>
          <span className="text-[#F7F3E8]/70">专属配方 · 贴近当下 · 温柔陪伴</span>
          <a href={WA_LINK} className="inline-flex items-center gap-2 text-[#F7F3E8]/90 hover:text-[#F7F3E8]">
            <WhatsAppIcon className="h-4 w-4" />WhatsApp: {WA_DISPLAY} / 60124761919
          </a>
        </div>
      </footer>
    </div>
  );
}
