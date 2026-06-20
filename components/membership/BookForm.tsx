"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/member/actions";
import type { PackageType } from "@/lib/supabase/types";

const PACKAGES: { type: PackageType; name: string; price: string; desc: string }[] = [
  { type: "RM49", name: "摸香状态测试体验", price: "RM49", desc: "Scent Intuition State Test" },
  { type: "RM129", name: "专属特调精油方案", price: "RM129", desc: "Custom Essential Oil Blend Plan" },
];

export default function BookForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<PackageType>("RM49");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await createBooking(selected);
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      setDone(true);
      router.refresh();
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sage-300 bg-sage-50 p-6 text-center">
        <p className="font-serif text-lg font-semibold text-sage-700">
          预约已提交 · Booking submitted
        </p>
        <p className="mt-2 text-sm text-taupe-600">
          我们会尽快通过 WhatsApp 与你确认时间。状态：待确认 (pending)。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {PACKAGES.map((p) => (
          <button
            key={p.type}
            type="button"
            onClick={() => setSelected(p.type)}
            className={`rounded-2xl border p-5 text-left transition-colors ${
              selected === p.type
                ? "border-sage-600 bg-sage-50 ring-1 ring-sage-600"
                : "border-taupe-200/70 bg-cream-50 hover:border-sage-400"
            }`}
          >
            <div className="font-serif text-xl font-semibold text-sage-700">{p.price}</div>
            <div className="mt-1 font-medium text-ink">{p.name}</div>
            <div className="text-sm text-taupe-500">{p.desc}</div>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full rounded-full bg-sage-700 px-6 py-3 text-base font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:opacity-60"
      >
        {loading ? "提交中…" : `提交预约 · Book ${selected}`}
      </button>
    </div>
  );
}
