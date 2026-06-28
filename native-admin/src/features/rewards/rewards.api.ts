import * as Crypto from "expo-crypto";
import { REWARD_PRODUCT_SELECT } from "../../lib/admin";
import { isMissingTableError, missingMigrationMessage } from "../../lib/errors";
import { supabase } from "../../lib/supabase";
import type { RewardProduct } from "../../lib/types";

export async function fetchRewardProducts() {
  const { data, error } = await supabase.from("reward_products").select(REWARD_PRODUCT_SELECT).order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(200);
  if (error) {
    if (isMissingTableError(error)) throw new Error(missingMigrationMessage("积分商品", "supabase/migrations/0011_reward_products.sql"));
    throw error;
  }
  return (data ?? []) as RewardProduct[];
}

export async function saveRewardProduct(input: {
  id?: string;
  name: string;
  description?: string;
  image_url?: string;
  points_cost: number;
  stock: number;
  active: boolean;
  sort_order?: number;
  operatorUserId: string;
}) {
  if (!input.name.trim()) throw new Error("商品名称必填");
  const payload = {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    image_url: input.image_url?.trim() || null,
    points_cost: input.points_cost,
    stock: input.stock,
    active: input.active,
    sort_order: input.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };
  const result = input.id
    ? await supabase.from("reward_products").update(payload).eq("id", input.id)
    : await supabase.from("reward_products").insert({ ...payload, created_by: input.operatorUserId });
  if (result.error) throw result.error;
}

export async function uploadRewardProductImage(uri: string, mimeType = "image/jpeg") {
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) throw new Error("只支持 jpg/png/webp 图片");
  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${Crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("reward-products").upload(path, blob, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("reward-products").getPublicUrl(path);
  return data.publicUrl;
}
