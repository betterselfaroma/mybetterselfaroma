import { Card, PageTitle } from "@/components/membership/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveSiteSettings } from "@/app/admin/cms-actions";
import type { SiteSetting } from "@/lib/cms-types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { notice?: string; error?: string };
};

const SETTING_FIELDS = [
  {
    key: "brand_name",
    label: "Brand Name",
    fallback: { zh: "香气读懂你的心", en: "Scent Knows You" },
  },
  {
    key: "tagline",
    label: "Tagline",
    fallback: { zh: "你现在真正需要的，也许不是一瓶精油，而是一次看见自己的机会。", en: "A chance to see yourself more clearly." },
  },
  {
    key: "whatsapp_number",
    label: "WhatsApp",
    fallback: { yaning: "0124761919", wenshan: "0177898668" },
  },
  { key: "email", label: "Email", fallback: { value: "scentknowsyou@gmail.com" } },
  { key: "address", label: "Address", fallback: { value: "" } },
  { key: "business_hours", label: "Business Hours", fallback: { value: "By appointment" } },
  { key: "instagram_url", label: "Instagram URL", fallback: { value: "" } },
  { key: "facebook_url", label: "Facebook URL", fallback: { value: "" } },
  { key: "tiktok_url", label: "TikTok URL", fallback: { value: "" } },
  { key: "default_seo_title", label: "Default SEO Title", fallback: { value: "香气读懂你的心 · Scent Knows You" } },
  { key: "default_seo_description", label: "Default SEO Description", fallback: { value: "一场温柔的摸香测试，帮助你看见内心真正需要的方向。" } },
  { key: "default_og_image", label: "Default OG Image", fallback: { value: "/scent-knows-you-assets/01_homepage_hero_scene.png" } },
];

function jsonText(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function resultMessage(message?: string) {
  if (!message) return "";
  return decodeURIComponent(message);
}

export default async function AdminSiteSettingsPage({ searchParams }: PageProps) {
  const supabase = createAdminClient();
  const { data, error: loadError } = await supabase
    .from("site_settings")
    .select("*")
    .order("setting_key", { ascending: true });

  const settings = new Map(((data ?? []) as SiteSetting[]).map((setting) => [setting.setting_key, setting.setting_value]));
  const notice = resultMessage(searchParams?.notice);
  const error = resultMessage(searchParams?.error || loadError?.message);

  return (
    <div className="space-y-6">
      <PageTitle title="网站设置 · Site Settings" subtitle="编辑品牌、联系方式、营业时间、社交链接和默认 SEO。保存为 JSON，方便后续扩展。" />

      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{notice}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card className="rounded-[1.65rem]">
        <form action={saveSiteSettings} className="grid gap-5">
          <input type="hidden" name="return_to" value="/admin/settings/site" />
          {SETTING_FIELDS.map((field) => (
            <label key={field.key} className="grid gap-1.5 text-sm font-semibold text-taupe-700">
              {field.label}
              <textarea
                name={field.key}
                rows={field.key === "tagline" || field.key.includes("description") ? 5 : 3}
                defaultValue={jsonText(settings.get(field.key) ?? field.fallback)}
                className="rounded-2xl border border-taupe-200 bg-cream-50 px-4 py-3 font-mono text-xs text-ink"
              />
            </label>
          ))}
          <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50 hover:bg-sage-900">
            保存网站设置 · Save Site Settings
          </button>
        </form>
      </Card>
    </div>
  );
}
