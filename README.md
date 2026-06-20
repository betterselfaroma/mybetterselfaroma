# 闻见更好的自己 · Better Self Aroma

A gentle, premium **bilingual (中文 / English)** single-page landing site built with
**Next.js 14 (App Router)** + **Tailwind CSS**.

**Positioning:** a scent-intuition test (摸香测试) reads your current mental and life
state, then we blend one of 28 essential oils into a custom aroma made for you.

- Default language: **中文** (switchable to **EN** from the header — clearly visible on mobile too).
- All copy lives in a **local dictionary** — no Google Translate or any external translation service.
- CTAs open **WhatsApp** with a language-matched pre-filled message.

## Page sections (in order)

Header · Hero (title + 3 trust points + RM49/RM129 CTAs + RM80 upgrade reminder) ·
Value strip (4 points) · Why Not Ordinary Oil (4 image cards) · 28-Oil Aroma Library ·
Packages (RM49 light / **RM129 dark-green, highlighted**) · **Upgrade bar** (RM49 → +RM80 → RM129) ·
Process (4 steps) · Daily Ritual band · FAQ (2-col) · Final CTA (dark band) · Footer · floating WhatsApp.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm run start
```

## Structure

| Path | Purpose |
| --- | --- |
| `data/content.ts` | All bilingual copy (`zh` / `en`) — the single source of truth. |
| `lib/i18n.ts` | Language types, React context, hooks (`useLanguage`, `useT`), and the `whatsappHref` helper. |
| `components/LanguageProvider.tsx` | Holds active language, persists to `localStorage`, syncs `<html lang>`. |
| `components/LangSwitch.tsx` | The `中文 / EN` segmented toggle (used in the header). |
| `components/*` | Section components (Hero, SafetyStrip, WhyNotOrdinary, AromaLibrary, Packages, UpgradeBar, Process, Ritual, Faq, FinalCta, Footer) + floating WhatsApp button. |
| `app/page.tsx` | Assembles all sections. |
| `tailwind.config.ts` | Brand palette (cream / sage / taupe / gold, deep-green footer) and fonts. |
| `public/images/` | Real photos: `hero-aroma-selfcare`, `package-rm49-aroma-check`, `package-rm129-custom-oil`, `ritual-evening-journal` (WebP) + `aroma-library-28-oils.png`. `*-state-card.svg` placeholders are kept but unused. |
| `docs/` | Reference docs from the design packs (image prompts, master prompts, design summaries). |

## Customize

- **Edit text** → `data/content.ts` (both languages side by side).
- **WhatsApp numbers** → `whatsapp.contacts` in `data/content.ts` (two contacts; every booking
  button opens a chooser so visitors pick which person to message). International format, e.g. `60144761919`.
- **WhatsApp messages** → `whatsappMessage` field in `data/content.ts` (separate `zh` / `en`).
- **Colors / fonts** → `tailwind.config.ts` and `app/globals.css`.
- **Images** → real photos live in `public/images/` (`hero-aroma-selfcare`, `package-rm49-aroma-check`,
  `package-rm129-custom-oil`, `ritual-evening-journal`). The `IMG` map at the top of `data/content.ts`
  controls which photo each section uses — only 4 photos exist, so some are reused. Drop in new photos
  with the same filenames (hero & ritual 4:5, packages 1:1) to replace them.

## Notes

- Fonts (Cormorant Garamond + Noto Serif/Sans SC) load from Google Fonts; Latin text uses the
  elegant serif while CJK falls back to Noto Serif SC within the same heading.
- This is a wellness / lifestyle experience — no medical or counselling claims are made anywhere in the copy.

## Membership / referral / points system (Supabase)

Optional full-stack membership area: email/password auth, per-member referral
codes, the **RM10 TNG PIN** referral reward, a points ledger, redemptions, and an
admin backoffice. It is **off until Supabase env vars are set** — the marketing
site runs fine without it, and member/admin routes show a "not configured" notice.

- **Setup:** `docs/MEMBERSHIP-SETUP.md` (create project → run migration → set env → deploy).
- **Schema + logic:** `supabase/migrations/0001_membership.sql` (tables, RLS, award triggers, seed rewards).
- **Code:** `lib/supabase/*` (clients/auth), `middleware.ts` (route protection),
  `app/{login,register,book,member,admin}/*`, landing block in `components/Referral.tsx`.
- **Env:** see `.env.example`. The `service_role` key is server-only; awarding runs in DB triggers.
