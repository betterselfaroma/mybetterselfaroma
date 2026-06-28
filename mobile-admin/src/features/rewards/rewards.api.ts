import { fetchRewardProducts as fetchProducts, fetchRewardRedemptions as fetchRedemptions, saveRewardProduct, setRewardProductActive } from "../../lib/admin";
import { isMissingTableError, missingMigrationMessage } from "../../lib/errors";

export async function fetchRewardProducts() {
  try {
    return await fetchProducts();
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error(missingMigrationMessage("积分商品 reward_products", "supabase/migrations/0011_reward_products.sql"));
    }
    throw error;
  }
}

export async function fetchRewardRedemptions() {
  try {
    return await fetchRedemptions();
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error(missingMigrationMessage("积分兑换 reward_redemptions", "supabase/migrations/0011_reward_products.sql"));
    }
    throw error;
  }
}

export { saveRewardProduct, setRewardProductActive };
