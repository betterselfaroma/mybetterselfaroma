"use client";

import { useState, useTransition } from "react";
import { updateMemberProfile } from "@/app/member/actions";

export default function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string | null;
  phone: string | null;
  email: string | null;
}) {
  const [displayName, setDisplayName] = useState(name ?? "");
  const [whatsapp, setWhatsapp] = useState(phone ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateMemberProfile({
        name: displayName,
        phone: whatsapp,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setMessage("资料已更新 · Profile updated");
    });
  }

  return (
    <form id="member-profile" onSubmit={submit} className="scroll-mt-28 rounded-[1.5rem] border border-taupe-200/70 bg-cream-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Profile</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink">会员资料 · Member Profile</h2>
          <p className="mt-2 text-sm leading-6 text-taupe-600">
            更新姓名和 WhatsApp 电话，预约联系会优先使用这里的资料。
          </p>
        </div>
        {email && (
          <span className="rounded-full bg-cream-100 px-3 py-1.5 text-xs font-medium text-taupe-600">
            {email}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-taupe-500">Name</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-taupe-200 bg-cream-100 px-4 text-sm text-ink outline-none transition focus:border-sage-500 focus:bg-cream-50"
            placeholder="你的姓名"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-taupe-500">WhatsApp</span>
          <input
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-taupe-200 bg-cream-100 px-4 text-sm text-ink outline-none transition focus:border-sage-500 focus:bg-cream-50"
            placeholder="0123456789"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-12 rounded-full bg-sage-700 px-6 text-sm font-semibold text-cream-50 transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "保存中 · Saving..." : "保存资料 · Save Profile"}
        </button>
        <div className="min-h-5 text-sm">
          {message && <span className="font-medium text-sage-700">{message}</span>}
          {error && <span className="font-medium text-red-600">{error}</span>}
        </div>
      </div>
    </form>
  );
}
