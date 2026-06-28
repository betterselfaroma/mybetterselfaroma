import { CMS_SECTION_SELECT } from "../../lib/admin";
import { isMissingTableError, missingMigrationMessage } from "../../lib/errors";
import { supabase } from "../../lib/supabase";
import type { CmsSection, SiteSetting } from "../../lib/types";

export async function fetchCmsOverview() {
  const [settingsRes, sectionsRes] = await Promise.all([
    supabase.from("site_settings").select("id,setting_key,setting_value,updated_at").order("setting_key", { ascending: true }),
    supabase.from("page_sections").select(CMS_SECTION_SELECT).eq("page_slug", "home").order("sort_order", { ascending: true }).limit(60),
  ]);

  if (settingsRes.error) {
    if (isMissingTableError(settingsRes.error)) throw new Error(missingMigrationMessage("CMS 内容", "supabase/migrations/0014_admin_cms.sql"));
    throw settingsRes.error;
  }
  if (sectionsRes.error) {
    if (isMissingTableError(sectionsRes.error)) throw new Error(missingMigrationMessage("CMS 内容", "supabase/migrations/0014_admin_cms.sql"));
    throw sectionsRes.error;
  }

  return {
    settings: (settingsRes.data ?? []) as SiteSetting[],
    sections: (sectionsRes.data ?? []) as CmsSection[],
  };
}

export async function saveCmsSection(input: Partial<CmsSection> & { id: string }) {
  const { error } = await supabase.from("page_sections").update({
    title: input.title?.trim() || null,
    subtitle: input.subtitle?.trim() || null,
    body: input.body?.trim() || null,
    image_url: input.image_url?.trim() || null,
    button_text: input.button_text?.trim() || null,
    button_url: input.button_url?.trim() || null,
    visible: input.visible ?? true,
    updated_at: new Date().toISOString(),
  }).eq("id", input.id);
  if (error) throw error;
}
