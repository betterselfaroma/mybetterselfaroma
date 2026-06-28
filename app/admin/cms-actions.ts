"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/get-error-message";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

const SITE_MEDIA_BUCKET = "site-media";
const SITE_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SITE_MEDIA_BYTES = 5 * 1024 * 1024;

function safeReturnTo(rawValue: FormDataEntryValue | null, fallback: string) {
  const raw = String(rawValue ?? "").trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function withResult(path: string, type: "notice" | "error", message: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(type, message);
  return pathname + "?" + params.toString();
}

function numberFromForm(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

function parseJsonObject(value: string): Record<string, unknown> {
  const trimmed = value.trim();
  if (!trimmed) return {};
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Data JSON must be an object.");
  }
  return parsed as Record<string, unknown>;
}

function textLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseFaqText(value: FormDataEntryValue | null) {
  return textLines(value)
    .map((line) => {
      const [q, ...answerParts] = line.split("|");
      const a = answerParts.join("|").trim();
      return q?.trim() && a ? { q: q.trim(), a } : null;
    })
    .filter((item): item is { q: string; a: string } => Boolean(item));
}

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

function mergeTemplateData(
  sectionType: string,
  formData: FormData,
  baseData: Record<string, unknown>,
  packageImageOverrides: Record<number, string> = {},
) {
  const data = { ...baseData };
  const zh = { ...(typeof data.zh === "object" && data.zh && !Array.isArray(data.zh) ? data.zh as Record<string, unknown> : {}) };
  const en = { ...(typeof data.en === "object" && data.en && !Array.isArray(data.en) ? data.en as Record<string, unknown> : {}) };

  if (sectionType === "hero") {
    const zhLines = textLines(formData.get("hero_zh_title_lines"));
    const enLines = textLines(formData.get("hero_en_title_lines"));
    if (zhLines.length) zh.titleLines = zhLines;
    if (enLines.length) en.titleLines = enLines;
    for (const key of ["eyebrow", "secondaryCta", "safety"]) {
      const zhValue = optionalString(formData, `hero_zh_${key}`);
      const enValue = optionalString(formData, `hero_en_${key}`);
      if (zhValue) zh[key] = zhValue;
      if (enValue) en[key] = enValue;
    }
    for (const key of ["subtitle", "body", "primaryCta"]) {
      const enValue = optionalString(formData, `hero_en_${key}`);
      if (enValue) en[key] = enValue;
    }
  }

  if (sectionType === "faq") {
    const zhFaq = parseFaqText(formData.get("faq_items_text"));
    const enFaq = parseFaqText(formData.get("faq_en_items_text"));
    if (zhFaq.length) data.items = zhFaq;
    if (enFaq.length) en.items = enFaq;
  }

  if (sectionType === "cta") {
    const zhLines = textLines(formData.get("cta_zh_lines"));
    const enLines = textLines(formData.get("cta_en_lines"));
    if (zhLines.length) zh.lines = zhLines;
    if (enLines.length) en.lines = enLines;
    const zhSecondary = optionalString(formData, "cta_zh_secondary");
    const enPrimary = optionalString(formData, "cta_en_primary");
    const enSecondary = optionalString(formData, "cta_en_secondary");
    if (zhSecondary) zh.secondary = zhSecondary;
    if (enPrimary) en.primary = enPrimary;
    if (enSecondary) en.secondary = enSecondary;
  }

  if (sectionType === "packages") {
    const packages = [0, 1].map((index) => ({
      code: index === 0 ? "scent_test" : "custom_blend",
      name: optionalString(formData, `package_${index}_name`) ?? "",
      price: optionalString(formData, `package_${index}_price`) ?? "",
      description: optionalString(formData, `package_${index}_description`) ?? "",
      image_url: packageImageOverrides[index] ?? optionalString(formData, `package_${index}_image_url`) ?? "",
      visible: formData.get(`package_${index}_visible`) === "on",
      sort_order: index + 1,
    })).filter((pkg) => pkg.name || pkg.price || pkg.description || pkg.image_url);
    if (packages.length) data.packages = packages;
  }

  if (Object.keys(zh).length) data.zh = zh;
  if (Object.keys(en).length) data.en = en;
  return data;
}

async function audit(action: string, targetTable: string, targetId: string | null, details: Record<string, unknown>) {
  const supabase = createAdminClient();
  await supabase.from("admin_audit_logs").insert({
    admin_user_id: details.admin_user_id ?? null,
    action,
    target_table: targetTable,
    target_id: targetId,
    details,
  });
}

async function uploadSiteMediaFile(file: File) {
  if (!SITE_MEDIA_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG or WebP images are allowed.");
  }
  if (file.size > MAX_SITE_MEDIA_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const supabase = createAdminClient();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || `media.${extension}`;
  const filePath = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${randomBytes(6).toString("hex")}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).upload(filePath, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw error;
  const { data } = supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(filePath);

  return {
    fileName: file.name,
    filePath,
    publicUrl: data.publicUrl,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

type UploadedSiteMedia = Awaited<ReturnType<typeof uploadSiteMediaFile>>;

async function saveUploadedMediaAsset(
  uploaded: UploadedSiteMedia,
  adminUserId: string,
  altText: string | null,
  auditAction = "cms_upload_media",
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      file_name: uploaded.fileName,
      file_path: uploaded.filePath,
      public_url: uploaded.publicUrl,
      alt_text: altText,
      mime_type: uploaded.mimeType,
      size_bytes: uploaded.sizeBytes,
      uploaded_by: adminUserId,
    })
    .select("id")
    .single();

  if (error) throw error;
  await audit(auditAction, "media_assets", data.id, {
    admin_user_id: adminUserId,
    file_path: uploaded.filePath,
    size_bytes: uploaded.sizeBytes,
  });
  return data.id as string;
}

export async function saveCmsSection(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/content");
  const id = String(formData.get("id") ?? "").trim();
  const pageSlug = String(formData.get("page_slug") ?? "").trim() || "home";
  const sectionKey = String(formData.get("section_key") ?? "").trim();
  const sectionType = String(formData.get("section_type") ?? "").trim() || "content";

  try {
    if (!sectionKey) throw new Error("Section key is required.");

    const supabase = createAdminClient();
    const sectionImageFile = formData.get("image_file");
    const packageImageOverrides: Record<number, string> = {};
    let imageUrl = String(formData.get("image_url") ?? "").trim() || null;

    if (isUploadFile(sectionImageFile)) {
      const uploaded = await uploadSiteMediaFile(sectionImageFile);
      await saveUploadedMediaAsset(
        uploaded,
        adminUser.id,
        String(formData.get("title") ?? "").trim() || sectionKey,
        "cms_upload_section_image",
      );
      imageUrl = uploaded.publicUrl;
    }

    if (sectionType === "packages") {
      for (const index of [0, 1]) {
        const packageImageFile = formData.get(`package_${index}_image_file`);
        if (!isUploadFile(packageImageFile)) continue;
        const uploaded = await uploadSiteMediaFile(packageImageFile);
        await saveUploadedMediaAsset(
          uploaded,
          adminUser.id,
          String(formData.get(`package_${index}_name`) ?? "").trim() || `Package ${index + 1}`,
          "cms_upload_package_image",
        );
        packageImageOverrides[index] = uploaded.publicUrl;
      }
    }

    const payload = {
      page_slug: pageSlug,
      section_key: sectionKey,
      section_type: sectionType,
      title: String(formData.get("title") ?? "").trim() || null,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      body: String(formData.get("body") ?? "").trim() || null,
      image_url: imageUrl,
      button_text: String(formData.get("button_text") ?? "").trim() || null,
      button_url: String(formData.get("button_url") ?? "").trim() || null,
      data: mergeTemplateData(
        sectionType,
        formData,
        parseJsonObject(String(formData.get("data") ?? "")),
        packageImageOverrides,
      ),
      sort_order: numberFromForm(formData.get("sort_order")),
      visible: formData.get("visible") === "on" || formData.get("visible") === "true",
      updated_at: new Date().toISOString(),
    };

    const result = id
      ? await supabase.from("page_sections").update(payload).eq("id", id).select("id").single()
      : await supabase.from("page_sections").upsert(payload, { onConflict: "page_slug,section_key" }).select("id").single();

    if (result.error) throw result.error;

    await audit("cms_update_section", "page_sections", result.data.id, {
      admin_user_id: adminUser.id,
      page_slug: pageSlug,
      section_key: sectionKey,
      section_type: sectionType,
    });
  } catch (error) {
    console.error("Save CMS section failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect(withResult(returnTo, "notice", "Section saved."));
}

export async function setCmsSectionVisible(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/content");
  const id = String(formData.get("id") ?? "").trim();
  const visible = String(formData.get("visible") ?? "") === "true";

  try {
    if (!id) throw new Error("Section id is required.");
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("page_sections")
      .update({ visible, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await audit("cms_update_section", "page_sections", id, { admin_user_id: adminUser.id, visible });
  } catch (error) {
    console.error("Toggle CMS section failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect(withResult(returnTo, "notice", "Section visibility updated."));
}

export async function moveCmsSection(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/content");
  const id = String(formData.get("id") ?? "").trim();
  const current = numberFromForm(formData.get("sort_order"));
  const direction = String(formData.get("direction") ?? "");
  const nextOrder = current + (direction === "up" ? -10 : 10);

  try {
    if (!id) throw new Error("Section id is required.");
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("page_sections")
      .update({ sort_order: nextOrder, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await audit("cms_update_section", "page_sections", id, { admin_user_id: adminUser.id, sort_order: nextOrder });
  } catch (error) {
    console.error("Move CMS section failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect(withResult(returnTo, "notice", "Section order updated."));
}

export async function uploadCmsMedia(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/media");

  try {
    const file = formData.get("file");
    if (!isUploadFile(file)) throw new Error("Please choose an image to upload.");
    const altText = String(formData.get("alt_text") ?? "").trim() || null;
    const uploaded = await uploadSiteMediaFile(file);
    await saveUploadedMediaAsset(uploaded, adminUser.id, altText);
  } catch (error) {
    console.error("Upload CMS media failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/admin/media");
  redirect(withResult(returnTo, "notice", "Image uploaded."));
}

export async function updateCmsMedia(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/media");
  const id = String(formData.get("id") ?? "").trim();

  try {
    if (!id) throw new Error("Media id is required.");
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("media_assets")
      .update({ alt_text: String(formData.get("alt_text") ?? "").trim() || null })
      .eq("id", id);
    if (error) throw error;
    await audit("cms_update_media", "media_assets", id, { admin_user_id: adminUser.id });
  } catch (error) {
    console.error("Update CMS media failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/admin/media");
  redirect(withResult(returnTo, "notice", "Image updated."));
}

export async function deleteCmsMedia(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/media");
  const id = String(formData.get("id") ?? "").trim();
  const filePath = String(formData.get("file_path") ?? "").trim();

  try {
    if (!id) throw new Error("Media id is required.");
    const supabase = createAdminClient();
    if (filePath) {
      const { error: storageError } = await supabase.storage.from(SITE_MEDIA_BUCKET).remove([filePath]);
      if (storageError) console.error("Delete site media object failed:", storageError);
    }
    const { error } = await supabase.from("media_assets").delete().eq("id", id);
    if (error) throw error;
    await audit("cms_delete_media", "media_assets", id, { admin_user_id: adminUser.id, file_path: filePath });
  } catch (error) {
    console.error("Delete CMS media failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/admin/media");
  redirect(withResult(returnTo, "notice", "Image deleted."));
}

export async function saveSiteSettings(formData: FormData) {
  const adminUser = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("return_to"), "/admin/settings/site");

  const keys = [
    "brand_name",
    "tagline",
    "whatsapp_number",
    "email",
    "address",
    "business_hours",
    "instagram_url",
    "facebook_url",
    "tiktok_url",
    "default_seo_title",
    "default_seo_description",
    "default_og_image",
  ];

  try {
    const supabase = createAdminClient();
    const rows = keys.map((key) => ({
      setting_key: key,
      setting_value: parseJsonObject(String(formData.get(key) ?? "{}")),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "setting_key" });
    if (error) throw error;
    await audit("cms_update_settings", "site_settings", null, { admin_user_id: adminUser.id, keys });
  } catch (error) {
    console.error("Save site settings failed:", error);
    redirect(withResult(returnTo, "error", getErrorMessage(error)));
  }

  revalidatePath("/");
  revalidatePath("/admin/settings/site");
  redirect(withResult(returnTo, "notice", "Site settings saved."));
}
