"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemReward } from "@/app/member/actions";

export default function RedeemButton({
  rewardId,
  disabled,
}: {
  rewardId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function redeem() {
    setLoading(true);
    setError(null);
    const res = await redeemReward(rewardId);
    setLoading(false);
    if (res?.error) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={redeem}
        disabled={disabled || loading}
        className="rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "兑换中…" : disabled ? "积分不足" : "兑换 · Redeem"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
