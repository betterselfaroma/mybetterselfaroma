"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createBooking, rescheduleMemberBooking } from "@/app/member/actions";
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

type BookingNotice = {
  tone: "success" | "error";
  title: string;
  message: string;
};

type RescheduleBooking = {
  id: string;
  packageType: PackageType;
  bookingDate: string;
  bookingTime: string;
  contact: string;
  notes: string;
};

const PACKAGES = Object.entries(BOOKING_PACKAGES).map(([type, config]) => ({
  type: type as PackageType,
  ...config,
}));

export default function BookForm({
  defaultPhone = "",
  rescheduleBooking = null,
}: {
  defaultPhone?: string;
  rescheduleBooking?: RescheduleBooking | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<PackageType>(rescheduleBooking?.packageType ?? "scent_test");
  const [date, setDate] = useState(rescheduleBooking?.bookingDate ?? todayInSingapore());
  const [time, setTime] = useState(rescheduleBooking?.bookingTime ?? "10:00");
  const [phone, setPhone] = useState(rescheduleBooking?.contact ?? defaultPhone);
  const [notes, setNotes] = useState(rescheduleBooking?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<BookingSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<BookingNotice | null>(null);

  const timeOptions = useMemo(() => getTimeOptionsForPackage(selected), [selected]);
  const selectedPackage = BOOKING_PACKAGES[selected];
  const isRescheduling = Boolean(rescheduleBooking);

  function showError(message: string) {
    setError(message);
    setNotice({
      tone: "error",
      title: "预约未完成 · Booking not completed",
      message,
    });
  }

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
      showError("Please choose a valid package.");
      return;
    }

    if (!date) {
      showError("Please choose a booking date.");
      return;
    }

    if (!time) {
      showError("Please choose a booking time.");
      return;
    }

    if (!phone.trim()) {
      showError("Please enter your WhatsApp or phone number.");
      return;
    }

    if (!Number.isFinite(amount)) {
      showError("Invalid package amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        packageType: selected,
        bookingDate: date,
        bookingTime: time,
        phone,
        notes,
      };

      const result = rescheduleBooking
        ? await rescheduleMemberBooking({
            bookingId: rescheduleBooking.id,
            ...payload,
          })
        : await createBooking(payload);

      if (result?.error) {
        console.error("Booking failed:", result.error);
        showError(result.error);
        if ("loginUrl" in result && typeof result.loginUrl === "string") {
          window.setTimeout(() => router.replace(result.loginUrl as string), 600);
        }
        return;
      }

      if (result?.booking) {
        setSuccess(result.booking);
        setNotice({
          tone: "success",
          title: isRescheduling ? "预约已更新 · Booking updated" : "预约已提交 · Booking submitted",
          message: isRescheduling
            ? "新的预约时间已保存。请保留页面上的 QR Code，体验当天出示给工作人员确认。"
            : "你的预约已经成功提交。请保留页面上的 QR Code，体验当天出示给工作人员确认。",
        });
        setNotes("");
        router.refresh();
      }
    } catch (err) {
      console.error("Booking failed:", err);
      showError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const noticeDialog = notice ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-notice-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-cream-50/70 bg-cream-50 shadow-[0_24px_70px_rgba(31,61,46,0.28)]">
        <div className={notice.tone === "success" ? "h-1.5 bg-sage-700" : "h-1.5 bg-red-500"} />
        <div className="p-6 text-center sm:p-7">
          <div
            className={
              notice.tone === "success"
                ? "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-700 text-cream-50 shadow-lg shadow-sage-700/20"
                : "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-lg shadow-red-500/10"
            }
          >
            {notice.tone === "success" ? (
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v5" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            )}
          </div>
          <h3 id="booking-notice-title" className="mt-5 font-serif text-2xl font-semibold text-ink">
            {notice.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-taupe-600">{notice.message}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className={
              notice.tone === "success"
                ? "mt-6 inline-flex w-full items-center justify-center rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
                : "mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
            }
          >
            {notice.tone === "success" ? "查看预约 QR Code · View QR Code" : "我知道了 · Got it"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
      <>
        {noticeDialog}
        <div className="rounded-[1.65rem] border border-sage-300 bg-sage-50 p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-cream-50">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4 4L19 7" />
          </svg>
        </span>
        <p className="mt-4 font-serif text-2xl font-semibold text-sage-800">
          {isRescheduling ? "预约已更新 · Booking Updated" : "预约成功 · Booking Confirmed"}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-taupe-600">
          {isRescheduling
            ? "预约时间已更新。请保存此 QR Code，体验当天可出示给工作人员确认。"
            : "预约成功。请保存此 QR Code，体验当天可出示给工作人员确认。"}
          <br />
          {isRescheduling
            ? "Booking updated. Please save this QR Code and show it to our team on your visit."
            : "Booking confirmed. Please save this QR Code and show it to our team on your visit."}
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr] lg:text-left">
          <div className="mx-auto rounded-2xl border border-taupe-200 bg-cream-50 p-4 shadow-sm lg:mx-0">
            <QRCodeSVG value={success.bookingUrl} size={210} level="M" includeMargin bgColor="#FBF9F2" fgColor="#1F3D2E" />
          </div>
          <div className="rounded-2xl bg-cream-50 p-5 text-sm text-taupe-700">
            <div className="font-semibold text-ink">预约 QR Code · Booking QR Code</div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-taupe-500">预约编号 · Booking ID</dt>
                <dd className="break-all font-medium text-ink">{success.id}</dd>
              </div>
              <div>
                <dt className="text-taupe-500">项目 · Package</dt>
                <dd className="font-medium text-sage-700">{success.packageLabel}</dd>
              </div>
              <div>
                <dt className="text-taupe-500">日期 · Date</dt>
                <dd>{success.date}</dd>
              </div>
              <div>
                <dt className="text-taupe-500">时间 · Time</dt>
                <dd>{success.time}</dd>
              </div>
            </dl>
            <p className="mt-4 break-all rounded-xl bg-cream-100 px-3 py-2 font-mono text-xs text-taupe-500">
              {success.bookingUrl}
            </p>
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
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              if (isRescheduling) router.replace("/book");
            }}
            className="inline-flex items-center justify-center rounded-full border border-taupe-300 bg-transparent px-6 py-3 text-sm font-medium text-taupe-700 transition-colors hover:border-sage-500 hover:text-sage-700"
          >
            {isRescheduling ? "新增预约 · New booking" : "继续预约 · Book another"}
          </button>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      {noticeDialog}
      <div className="space-y-6">
      {isRescheduling && (
        <div className="rounded-[1.5rem] border border-gold-300/60 bg-gold-300/15 p-4 text-sm leading-6 text-taupe-700">
          正在修改现有预约。提交后会更新同一笔预约，不会新增一笔。
        </div>
      )}

      <div className="rounded-[1.5rem] border border-sage-700/15 bg-cream-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
          {isRescheduling ? "Reschedule Summary" : "Booking Summary"}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-cream-100 px-4 py-3">
            <div className="text-xs text-taupe-500">套餐</div>
            <div className="mt-1 font-semibold text-ink">{selectedPackage.label}</div>
            <div className="text-sm font-medium text-sage-700">RM{selectedPackage.amount}</div>
          </div>
          <div className="rounded-2xl bg-cream-100 px-4 py-3">
            <div className="text-xs text-taupe-500">日期</div>
            <div className="mt-1 font-semibold text-ink">{date || "-"}</div>
          </div>
          <div className="rounded-2xl bg-cream-100 px-4 py-3">
            <div className="text-xs text-taupe-500">时间</div>
            <div className="mt-1 font-semibold text-ink">{time || "-"}</div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">选择体验套餐</h2>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">Step 1</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.type}
              type="button"
              onClick={() => selectPackage(pkg.type)}
              className={
                selected === pkg.type
                  ? "rounded-2xl border border-sage-600 bg-sage-50 p-5 text-left ring-1 ring-sage-600"
                  : "rounded-2xl border border-taupe-200/70 bg-cream-50 p-5 text-left transition-colors hover:border-sage-400"
              }
            >
              <div className="font-serif text-xl font-semibold text-sage-700">RM{pkg.amount}</div>
              <div className="mt-1 font-medium text-ink">{pkg.label}</div>
              <div className="mt-1 text-sm text-taupe-500">{pkg.durationMinutes} minutes</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">选择日期与联系方式</h2>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">Step 2</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-taupe-700">日期 · Date</span>
            <input
              type="date"
              required
              min={todayInSingapore()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-taupe-700">时间 · Time</span>
            <select
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
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
              onChange={(event) => setPhone(event.target.value)}
              placeholder="012-345 6789"
              className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">备注</h2>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">Step 3</span>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-taupe-700">备注 · Notes（可选）</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="想了解的状态、同行人数或其他备注"
            className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-sage-500 focus:outline-none"
          />
        </label>
      </section>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading || !date || !time || !phone.trim()}
        className="w-full rounded-full bg-sage-700 px-6 py-3.5 text-base font-medium text-cream-50 transition-colors hover:bg-sage-800 disabled:opacity-60"
      >
        {loading
          ? isRescheduling ? "更新中... · Updating..." : "确认中... · Confirming..."
          : isRescheduling ? "确认改期 · Update Booking" : "确认预约 · Confirm Booking"}
      </button>
      </div>
    </>
  );
}
