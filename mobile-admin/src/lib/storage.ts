export const REWARD_PRODUCTS_BUCKET = "reward-products";

export function isSupportedRewardImageType(type: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(type);
}
