import { supabase } from "../../lib/supabase";
import type { PointsTransaction } from "../../lib/types";

export async function fetchPointsTransactions() {
  const { data, error } = await supabase.from("points_transactions").select("*").order("created_at", { ascending: false }).limit(120);
  if (error) throw error;
  return (data ?? []) as PointsTransaction[];
}
