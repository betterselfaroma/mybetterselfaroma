import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { homeCopy } from "@/data/home-copy";
import { getPublicCmsPayload } from "@/lib/cms";

export const dynamic = "force-dynamic";

function settingValue(settings: Record<string, Record<string, unknown>>, key: string, fallback: string) {
  const value = settings[key]?.value;
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublicCmsPayload("home");
  const title = cms.page?.seo_title || settingValue(cms.settings, "default_seo_title", "香气读懂你的心 · Scent Knows You");
  const description = cms.page?.seo_description || settingValue(cms.settings, "default_seo_description", homeCopy.zh.hero.subtitle);
  const ogImage = cms.page?.og_image_url || settingValue(cms.settings, "default_og_image", "/scent-knows-you-assets/01_homepage_hero_scene.png");
  const keywords = cms.page?.keywords
    ? cms.page.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)
    : ["香气读懂你的心", "Scent Knows You", "摸香测试", "精油", "aromatherapy"];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const cms = await getPublicCmsPayload("home");
  return <HomeClient initialCms={cms} />;
}
