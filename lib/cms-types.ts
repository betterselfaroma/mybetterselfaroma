export type CmsJson = Record<string, unknown>;

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  keywords?: string | null;
  published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CmsSection = {
  id: string;
  page_slug: string;
  section_key: string;
  section_type: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  data?: CmsJson | null;
  sort_order?: number | null;
  visible?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MediaAsset = {
  id: string;
  file_name?: string | null;
  file_path?: string | null;
  public_url?: string | null;
  alt_text?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  uploaded_by?: string | null;
  created_at?: string | null;
};

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: CmsJson | null;
  updated_at?: string | null;
};

export type PublicCmsPayload = {
  page: CmsPage | null;
  sections: CmsSection[];
  settings: Record<string, CmsJson>;
};
