import Link from "next/link";
import { Card, EmptyState, PageTitle } from "@/components/membership/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { moveCmsSection, saveCmsSection, setCmsSectionVisible } from "@/app/admin/cms-actions";
import type { CmsPage, CmsSection } from "@/lib/cms-types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { page?: string; notice?: string; error?: string };
};

const PAGE_LABELS: Record<string, string> = {
  home: "首页 Home",
  about: "关于 About",
  services: "服务 Services",
  member: "会员 Member",
  booking: "预约 Booking",
};

function jsonText(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function linesValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

function faqText(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => recordValue(item))
        .map((item) => `${stringValue(item.q)} | ${stringValue(item.a)}`)
        .filter((line) => line.trim() !== "|")
        .join("\n")
    : "";
}

function resultMessage(message?: string) {
  if (!message) return "";
  return decodeURIComponent(message);
}

function TemplateQuickFields({ section }: { section?: CmsSection }) {
  const data = recordValue(section?.data);
  const zh = recordValue(data.zh);
  const en = recordValue(data.en);
  const type = section?.section_type ?? "content";
  const packages = Array.isArray(data.packages) ? data.packages.map((item) => recordValue(item)) : [];

  if (type === "hero") {
    return (
      <div className="rounded-2xl border border-gold-300/40 bg-gold-300/10 p-4">
        <p className="text-sm font-semibold text-sage-900">Hero 快捷编辑</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
            中文标题分行
            <textarea name="hero_zh_title_lines" rows={3} defaultValue={linesValue(zh.titleLines)} className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
            English title lines
            <textarea name="hero_en_title_lines" rows={3} defaultValue={linesValue(en.titleLines)} className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          </label>
          <input name="hero_zh_eyebrow" defaultValue={stringValue(zh.eyebrow)} placeholder="中文 eyebrow" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <input name="hero_en_eyebrow" defaultValue={stringValue(en.eyebrow)} placeholder="English eyebrow" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <input name="hero_en_subtitle" defaultValue={stringValue(en.subtitle)} placeholder="English subtitle" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <input name="hero_en_primaryCta" defaultValue={stringValue(en.primaryCta)} placeholder="English primary CTA" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <input name="hero_zh_secondaryCta" defaultValue={stringValue(zh.secondaryCta)} placeholder="中文 secondary CTA" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <input name="hero_en_secondaryCta" defaultValue={stringValue(en.secondaryCta)} placeholder="English secondary CTA" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </div>
      </div>
    );
  }

  if (type === "faq") {
    return (
      <div className="rounded-2xl border border-gold-300/40 bg-gold-300/10 p-4">
        <p className="text-sm font-semibold text-sage-900">FAQ 快捷编辑</p>
        <p className="mt-1 text-xs text-taupe-600">每行一个问题，格式：问题 | 答案</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <textarea name="faq_items_text" rows={7} defaultValue={faqText(data.items)} className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          <textarea name="faq_en_items_text" rows={7} defaultValue={faqText(en.items)} className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
        </div>
      </div>
    );
  }

  if (type === "cta") {
    return (
      <div className="rounded-2xl border border-gold-300/40 bg-gold-300/10 p-4">
        <p className="text-sm font-semibold text-sage-900">CTA 快捷编辑</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <textarea name="cta_zh_lines" rows={4} defaultValue={linesValue(zh.lines)} placeholder="中文标题，每行一段" className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          <textarea name="cta_en_lines" rows={4} defaultValue={linesValue(en.lines)} placeholder="English title, one line each" className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
          <input name="cta_zh_secondary" defaultValue={stringValue(zh.secondary)} placeholder="中文 WhatsApp 按钮" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <input name="cta_en_primary" defaultValue={stringValue(en.primary)} placeholder="English primary button" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </div>
      </div>
    );
  }

  if (type === "packages") {
    return (
      <div className="rounded-2xl border border-gold-300/40 bg-gold-300/10 p-4">
        <p className="text-sm font-semibold text-sage-900">套餐快捷编辑</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {[0, 1].map((index) => {
            const pkg = packages[index] ?? {};
            return (
              <div key={index} className="grid gap-2 rounded-2xl border border-taupe-200 bg-cream-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Package {index + 1}</p>
                <input name={`package_${index}_name`} defaultValue={stringValue(pkg.name)} placeholder="名称" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
                <input name={`package_${index}_price`} defaultValue={stringValue(pkg.price)} placeholder="价格，例如 RM60" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
                <textarea name={`package_${index}_description`} rows={3} defaultValue={stringValue(pkg.description)} placeholder="说明" className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
                <input name={`package_${index}_image_url`} defaultValue={stringValue(pkg.image_url)} placeholder="图片 URL" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
                <label className="flex items-center gap-2 text-sm font-semibold text-taupe-700">
                  <input name={`package_${index}_visible`} type="checkbox" defaultChecked={pkg.visible !== false} />
                  显示
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function SectionForm({ section, pageSlug }: { section?: CmsSection; pageSlug: string }) {
  return (
    <form action={saveCmsSection} className="grid gap-4">
      <input type="hidden" name="return_to" value={`/admin/content?page=${pageSlug}`} />
      {section?.id && <input type="hidden" name="id" value={section.id} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Page
          <input name="page_slug" required defaultValue={section?.page_slug ?? pageSlug} className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Section Key
          <input name="section_key" required defaultValue={section?.section_key ?? ""} placeholder="hero" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Type
          <input name="section_type" required defaultValue={section?.section_type ?? "content"} placeholder="hero / faq / cta" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Title
          <input name="title" defaultValue={section?.title ?? ""} className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Subtitle
          <input name="subtitle" defaultValue={section?.subtitle ?? ""} className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
        Body
        <textarea name="body" rows={4} defaultValue={section?.body ?? ""} className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 text-sm" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Image URL
          <input name="image_url" defaultValue={section?.image_url ?? ""} placeholder="/scent-knows-you-assets/..." className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Button URL
          <input name="button_url" defaultValue={section?.button_url ?? ""} placeholder="#packages or /register" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Button Text
          <input name="button_text" defaultValue={section?.button_text ?? ""} className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
          Sort
          <input name="sort_order" type="number" defaultValue={section?.sort_order ?? 0} className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm font-semibold text-taupe-700">
          <input name="visible" type="checkbox" defaultChecked={section?.visible ?? true} />
          Visible
        </label>
      </div>

      {section?.image_url && (
        <div className="overflow-hidden rounded-2xl border border-taupe-200 bg-cream-100">
          <img src={section.image_url} alt={section.title ?? section.section_key} className="max-h-60 w-full object-cover" />
        </div>
      )}

      <TemplateQuickFields section={section} />

      <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
        Advanced data JSON
        <textarea name="data" rows={10} defaultValue={jsonText(section?.data)} className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 font-mono text-xs" />
      </label>

      <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50 hover:bg-sage-900">
        保存区块 · Save Section
      </button>
    </form>
  );
}

function SectionActions({ section, pageSlug }: { section: CmsSection; pageSlug: string }) {
  const returnTo = `/admin/content?page=${pageSlug}`;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <form action={moveCmsSection}>
        <input type="hidden" name="return_to" value={returnTo} />
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="sort_order" value={section.sort_order ?? 0} />
        <input type="hidden" name="direction" value="up" />
        <button className="rounded-full border border-taupe-300 px-3 py-2 text-xs font-semibold text-taupe-700">上移</button>
      </form>
      <form action={moveCmsSection}>
        <input type="hidden" name="return_to" value={returnTo} />
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="sort_order" value={section.sort_order ?? 0} />
        <input type="hidden" name="direction" value="down" />
        <button className="rounded-full border border-taupe-300 px-3 py-2 text-xs font-semibold text-taupe-700">下移</button>
      </form>
      <form action={setCmsSectionVisible}>
        <input type="hidden" name="return_to" value={returnTo} />
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="visible" value={section.visible ? "false" : "true"} />
        <button className="rounded-full border border-taupe-300 px-3 py-2 text-xs font-semibold text-taupe-700">
          {section.visible ? "隐藏 Hide" : "显示 Show"}
        </button>
      </form>
    </div>
  );
}

export default async function AdminContentPage({ searchParams }: PageProps) {
  const pageSlug = searchParams?.page ?? "home";
  const supabase = createAdminClient();
  const [pagesRes, sectionsRes] = await Promise.all([
    supabase.from("site_pages").select("*").order("slug", { ascending: true }),
    supabase
      .from("page_sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .order("sort_order", { ascending: true })
      .order("section_key", { ascending: true }),
  ]);

  const pages = (pagesRes.data ?? []) as CmsPage[];
  const sections = (sectionsRes.data ?? []) as CmsSection[];
  const notice = resultMessage(searchParams?.notice);
  const error = resultMessage(searchParams?.error || pagesRes.error?.message || sectionsRes.error?.message);

  return (
    <div className="space-y-6">
      <PageTitle title="内容管理 · Content" subtitle="模板区块编辑器：编辑文字、图片、按钮、排序和 JSON 数据，不做复杂拖拉 builder。" />

      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{notice}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card className="rounded-[1.65rem]">
        <div className="flex flex-wrap gap-2">
          {(pages.length ? pages : Object.entries(PAGE_LABELS).map(([slug, title]) => ({ slug, title } as CmsPage))).map((page) => (
            <Link
              key={page.slug}
              href={`/admin/content?page=${page.slug}`}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold ring-1",
                page.slug === pageSlug
                  ? "bg-sage-800 text-cream-50 ring-sage-800"
                  : "bg-cream-100 text-taupe-700 ring-taupe-200 hover:ring-sage-400",
              ].join(" ")}
            >
              {PAGE_LABELS[page.slug] ?? page.title}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="rounded-[1.65rem] border-gold-300/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <h2 className="font-serif text-xl font-semibold text-ink">新增区块 · Add Section</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">如果 section_key 已存在，会更新同一个区块。</p>
        <div className="mt-5">
          <SectionForm pageSlug={pageSlug} />
        </div>
      </Card>

      {sections.length === 0 ? (
        <Card><EmptyState>暂无区块。请先运行 CMS migration seed，或手动新增区块。</EmptyState></Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="rounded-[1.65rem]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">{section.section_key} · {section.section_type}</p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{section.title || "Untitled section"}</h2>
                  <p className="mt-1 text-sm leading-6 text-taupe-600">{section.subtitle || section.body || "No preview text"}</p>
                </div>
                <span className={["rounded-full px-3 py-1 text-xs font-semibold", section.visible ? "bg-sage-100 text-sage-700" : "bg-taupe-200 text-taupe-700"].join(" ")}>
                  {section.visible ? "Visible" : "Hidden"} · #{section.sort_order ?? 0}
                </span>
              </div>
              <SectionActions section={section} pageSlug={pageSlug} />
              <details className="mt-5 rounded-2xl border border-taupe-200 bg-cream-100/70 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-sage-800">编辑区块 · Edit section</summary>
                <div className="mt-4">
                  <SectionForm section={section} pageSlug={pageSlug} />
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
