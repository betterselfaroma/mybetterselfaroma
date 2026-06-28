"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelMemberBooking } from "@/app/member/actions";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    const confirmed = window.confirm("确认取消这个预约吗？\nCancel this booking?");
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await cancelMemberBooking(bookingId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancel}
        disabled={isPending}
        className="rounded-full border border-taupe-300 px-4 py-2 text-xs font-bold text-taupe-700 transition hover:border-sage-600 hover:text-sage-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "取消中..." : "取消预约"}
      </button>
      {error && <p className="mt-1 max-w-56 text-xs text-red-600">{error}</p>}
    </div>
  );
}
