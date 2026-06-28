import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { CmsPage, CmsSection, MediaAsset, PublicCmsPayload, SiteSetting } from "@/lib/cms-types";

const PAGE_SELECT = "id,slug,title,seo_title,seo_description,og_image_url,keywords,published,created_at,updated_at";
const SECTION_SELECT = "id,page_slug,section_key,section_type,title,subtitle,body,image_url,button_text,button_url,data,sort_order,visible,created_at,updated_at";
const MEDIA_SELECT = "id,file_name,file_path,public_url,alt_text,mime_type,size_bytes,uploaded_by,created_at";
const SETTING_SELECT = "id,setting_key,setting_value,updated_at";

function settingsRecord(settings: SiteSetting[]) {
  return settings.reduce<Record<string, Record<string, unknown>>>((acc, setting) => {
    acc[setting.setting_key] = setting.setting_value ?? {};
    return acc;
  }, {});
}

export async function getSiteSettings() {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select(SETTING_SELECT)
      .order("setting_key", { ascending: true });

    if (error) throw error;
    return settingsRecord((data ?? []) as SiteSetting[]);
  } catch (error) {
    console.error("Load CMS site settings failed:", error);
    return {};
  }
}

export async function getPageSections(pageSlug: string) {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("page_sections")
      .select(SECTION_SELECT)
      .eq("page_slug", pageSlug)
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .order("section_key", { ascending: true });

    if (error) throw error;
    return (data ?? []) as CmsSection[];
  } catch (error) {
    console.error("Load CMS page sections failed:", error);
    return [];
  }
}

export async function getSection(pageSlug: string, sectionKey: string) {
  const sections = await getPageSections(pageSlug);
  return sections.find((section) => section.section_key === sectionKey) ?? null;
}

export async function getMediaAssets(search = "") {
  try {
    const supabase = createServerSupabase();
    let query = supabase
      .from("media_assets")
      .select(MEDIA_SELECT)
      .order("created_at", { ascending: false })
      .limit(200);

    const needle = search.trim();
    if (needle) {
      query = query.or(`file_name.ilike.%${needle}%,alt_text.ilike.%${needle}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as MediaAsset[];
  } catch (error) {
    console.error("Load CMS media assets failed:", error);
    return [];
  }
}

export async function getPublicCmsPayload(pageSlug: string): Promise<PublicCmsPayload> {
  const supabase = createServerSupabase();

  try {
    const [pageRes, sectionsRes, settingsRes] = await Promise.all([
      supabase
        .from("site_pages")
        .select(PAGE_SELECT)
        .eq("slug", pageSlug)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("page_sections")
        .select(SECTION_SELECT)
        .eq("page_slug", pageSlug)
        .eq("visible", true)
        .order("sort_order", { ascending: true })
        .order("section_key", { ascending: true }),
      supabase
        .from("site_settings")
        .select(SETTING_SELECT)
        .order("setting_key", { ascending: true }),
    ]);

    if (pageRes.error) throw pageRes.error;
    if (sectionsRes.error) throw sectionsRes.error;
    if (settingsRes.error) throw settingsRes.error;

    return {
      page: (pageRes.data as CmsPage | null) ?? null,
      sections: (sectionsRes.data ?? []) as CmsSection[],
      settings: settingsRecord((settingsRes.data ?? []) as SiteSetting[]),
    };
  } catch (error) {
    console.error("Load public CMS payload failed:", error);
    return { page: null, sections: [], settings: {} };
  }
}
