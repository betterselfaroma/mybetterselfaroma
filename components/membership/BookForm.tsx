"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/member/actions";
import type { PackageType } from "@/lib/supabase/types";

const WA = "https://wa.me/60124761919";

const PACKAGES: {
  type: PackageType;
  name: string;
  price: string;
  desc: string;
  note?: string;
}[] = [
  {
    type: "scent_test",
    name: "摸香状态测试体验",
    price: "RM60",
    desc: "Scent Intuition Test Experience",
  },
  {
    type: "custom_blend",
    name: "专属特调精油方案",
    price: "RM150",
    desc: "Custom Essential Oil Blend Experience",
    note: "包含 RM60 摸香测试 + RM90 专属精油调配",
  },
];

export default function BookForm({ defaultPhone = "" }: { defaultPhone?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<PackageType>("scent_test");
  const selectedPrice = PACKAGES.find((p) => p.type === selected)?.price ?? "";
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const combinedNotes = [
      phone.trim() ? `WhatsApp/电话: ${phone.trim()}` : null,
      notes.trim() || null,
    ]
      .filter(Boolean)
      .join(" · ");
    const res = await createBooking({
      packageType: selected,
      bookingDate: date || null,
      notes: combinedNotes || null,
    });
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      setDone(true);
      router.refresh();
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sage-300 bg-sage-50 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-cream-50">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4 4L19 7" /></svg>
        </span>
        <p className="mt-4 font-serif text-xl font-semibold text-sage-700">预约已提交</p>
        <p className="mt-2 text-sm leading-relaxed text-taupe-600">
          我们会通过 WhatsApp 与你确认时间。
          <br />
          Booking submitted — we&apos;ll confirm the time with you on WhatsApp.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/member"
            className="inline-flex items-center justify-center rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
          >
            返回会员中心 · Back to portal
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-sage-300 bg-cream-50 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z" /></svg>
            WhatsApp 联系我们
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Package choice */}
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
            {p.note && <div className="mt-2 text-xs text-taupe-500">{p.note}</div>}
          </button>
        ))}
      </div>

      {/* Optional details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-taupe-700">预约日期 / 时间 · Date &amp; time（可选）</span>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-taupe-700">WhatsApp / 电话 · Contact</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="012-345 6789"
            className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-taupe-700">备注 · Notes（可选）</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="想了解的状态、偏好的时间段等"
          className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full rounded-full bg-sage-700 px-6 py-3.5 text-base font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:opacity-60"
      >
        {loading ? "提交中…" : `提交预约 · Book ${selectedPrice}`}
      </button>
    </div>
  );
}
