"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createBooking } from "@/app/member/actions";
import {
  BOOKING_CONTACTS,
  BOOKING_PACKAGES,
  buildBookingWhatsAppText,
  getTimeOptionsForPackage,
  getWhatsAppUrl,
  todayInSingapore,
} from "@/lib/booking-config";
import type { PackageType } from "@/lib/supabase/types";

type BookingSuccess = {
  id: string;
  token: string;
  bookingUrl: string;
  packageLabel: string;
  date: string;
  time: string;
  notes: string | null;
  name: string | null;
  email: string | null;
};

const PACKAGES = Object.entries(BOOKING_PACKAGES).map(([type, config]) => ({
  type: type as PackageType,
  ...config,
}));

export default function BookForm({ defaultPhone = "" }: { defaultPhone?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<PackageType>("scent_test");
  const [date, setDate] = useState(todayInSingapore());
  const [time, setTime] = useState("10:00");
  const [phone, setPhone] = useState(defaultPhone);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<BookingSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timeOptions = useMemo(() => getTimeOptionsForPackage(selected), [selected]);

  function selectPackage(packageType: PackageType) {
    setSelected(packageType);
    const options = getTimeOptionsForPackage(packageType);
    if (!options.includes(time)) setTime(options[0] ?? "10:00");
  }

  async function submit() {
    if (loading) return;

    const packageConfig = BOOKING_PACKAGES[selected];
    const amount = Number(packageConfig?.amount);

    if (!selected || !packageConfig) {
      setError("Please choose a valid package.");
      return;
    }

    if (!date) {
      setError("Please choose a booking date.");
      return;
    }

    if (!time) {
      setError("Please choose a booking time.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your WhatsApp or phone number.");
      return;
    }

    if (!Number.isFinite(amount)) {
      setError("Invalid package amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createBooking({
        packageType: selected,
        bookingDate: date,
        bookingTime: time,
        phone,
        notes,
      });

      if (res?.error) {
        console.error("Booking failed:", res.error);
        setError(res.error);
        return;
      }

      if (res?.booking) {
        setSuccess(res.booking);
        setNotes("");
        router.refresh();
      }
    } catch (error) {
      console.error("Booking failed:", error);
      setError(error instanceof Error ? error.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const message = buildBookingWhatsAppText({
      name: success.name,
      email: success.email,
      packageLabel: success.packageLabel,
      date: success.date,
      time: success.time,
      bookingId: success.id,
      bookingQrUrl: success.bookingUrl,
      notes: success.notes,
    });

    return (
      <div className="rounded-2xl border border-sage-300 bg-sage-50 p-6 text-center sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-cream-50">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4 4L19 7" /></svg>
        </span>
        <p className="mt-4 font-serif text-2xl font-semibold text-sage-800">预约成功 · Booking Confirmed</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-taupe-600">
          预约成功。请保存此 QR Code，体验当天可出示给工作人员确认。
          <br />
          Booking confirmed. Please save this QR Code and show it to our team on your visit.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr] lg:text-left">
          <div className="mx-auto rounded-2xl border border-taupe-200 bg-cream-50 p-4 shadow-sm lg:mx-0">
            <QRCodeSVG value={success.bookingUrl} size={210} level="M" includeMargin bgColor="#FBF9F2" fgColor="#1F3D2E" />
          </div>
          <div className="rounded-2xl bg-cream-50 p-5 text-sm text-taupe-700">
            <div className="font-semibold text-ink">预约 QR Code · Booking QR Code</div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><dt className="text-taupe-500">预约编号 · Booking ID</dt><dd className="break-all font-medium text-ink">{success.id}</dd></div>
              <div><dt className="text-taupe-500">项目 · Package</dt><dd className="font-medium text-sage-700">{success.packageLabel}</dd></div>
              <div><dt className="text-taupe-500">日期 · Date</dt><dd>{success.date}</dd></div>
              <div><dt className="text-taupe-500">时间 · Time</dt><dd>{success.time}</dd></div>
            </dl>
            <p className="mt-4 break-all rounded-xl bg-cream-100 px-3 py-2 font-mono text-xs text-taupe-500">{success.bookingUrl}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          {BOOKING_CONTACTS.map((contact) => (
            <a
              key={contact.key}
              href={getWhatsAppUrl(contact.wa, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
            >
              发送预约到 WhatsApp · {contact.label}
            </a>
          ))}
          <Link
            href="/member"
            className="inline-flex items-center justify-center rounded-full border border-sage-300 bg-cream-50 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500"
          >
            返回会员中心 · Back to Member Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {PACKAGES.map((p) => (
          <button
            key={p.type}
            type="button"
            onClick={() => selectPackage(p.type)}
            className={
              selected === p.type
                ? "rounded-2xl border border-sage-600 bg-sage-50 p-5 text-left ring-1 ring-sage-600"
                : "rounded-2xl border border-taupe-200/70 bg-cream-50 p-5 text-left transition-colors hover:border-sage-400"
            }
          >
            <div className="font-serif text-xl font-semibold text-sage-700">RM{p.amount}</div>
            <div className="mt-1 font-medium text-ink">{p.label}</div>
            <div className="mt-1 text-sm text-taupe-500">{p.durationMinutes} minutes</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-taupe-700">日期 · Date</span>
          <input
            type="date"
            required
            min={todayInSingapore()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-taupe-700">时间 · Time</span>
          <select
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
          >
            {timeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
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
          placeholder="想了解的状态、同行人数或其他备注"
          className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
        />
      </label>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading || !date || !time || !phone.trim()}
        className="w-full rounded-full bg-sage-700 px-6 py-3.5 text-base font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:opacity-60"
      >
        {loading ? "确认中... · Confirming..." : "确认预约 · Confirm Booking"}
      </button>
    </div>
  );
}
