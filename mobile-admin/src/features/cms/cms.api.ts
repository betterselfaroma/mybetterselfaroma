import { fetchMobileCmsOverview as fetchOverview, saveMobileCmsSectionText, saveMobileSiteSetting } from "../../lib/admin";
import { isMissingTableError, missingMigrationMessage } from "../../lib/errors";

export async function fetchMobileCmsOverview() {
  try {
    return await fetchOverview();
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error(missingMigrationMessage("CMS site_pages / page_sections / site_settings", "supabase/migrations/0014_admin_cms.sql"));
    }
    throw error;
  }
}

export { saveMobileCmsSectionText, saveMobileSiteSetting };
