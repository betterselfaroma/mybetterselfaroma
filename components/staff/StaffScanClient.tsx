"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import {
  adjustScannedMemberPoints,
  checkInScannedBooking,
  lookupMemberByQrToken,
  type StaffScanBooking,
  type StaffScanMember,
} from "@/app/staff/scan/actions";
import { Badge, EmptyState } from "@/components/membership/ui";

const READER_ID = "staff-member-qr-reader";

const PACKAGE_LABEL: Record<string, string> = {
  scent_test: "RM60 Scent Test",
  custom_blend: "RM150 Custom Blend",
  RM49: "RM60 Scent Test",
  RM129: "RM150 Custom Blend",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "待确认 · Pending",
  booked: "已预约 · Booked",
  confirmed: "已确认 · Confirmed",
  completed: "已完成 · Completed",
  cancelled: "已取消 · Cancelled",
  no_show: "未出席 · No-show",
};

function bookingTimeLabel(booking: StaffScanBooking) {
  return `${booking.booking_date ?? "-"} · ${booking.booking_time ?? "-"}`;
}

export default function StaffScanClient({ initialToken = "" }: { initialToken?: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lockedRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<StaffScanMember | null>(null);
  const [manualToken, setManualToken] = useState(initialToken);
  const [customPoints, setCustomPoints] = useState("10");
  const [customReason, setCustomReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      await scanner.stop();
    } catch {
      // stop() throws when the camera is already stopped.
    }

    try {
      scanner.clear();
    } catch {
      // clear() can fail if the reader element has already been removed.
    }

    scannerRef.current = null;
    setIsScanning(false);
  }, []);

  const lookup = useCallback(async (rawValue: string) => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await lookupMemberByQrToken(rawValue);
      if (!result.ok) {
        setMember(null);
        setError(result.error);
        return;
      }
      setMember(result.member);
      setManualToken(result.member.qr_token ?? rawValue);
      setNotice("扫码成功 · Member found");
    } catch (scanError) {
      console.error("Staff scan lookup failed:", scanError);
      setMember(null);
      setError(scanError instanceof Error ? scanError.message : "Scan lookup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDecoded = useCallback(async (decodedText: string) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    await stopScanner();
    await lookup(decodedText);
  }, [lookup, stopScanner]);

  const startScanner = useCallback(async () => {
    setError(null);
    setNotice(null);
    setMember(null);
    lockedRef.current = false;
    await stopScanner();

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1,
        },
        (decodedText) => {
          void handleDecoded(decodedText);
        },
        () => undefined,
      );
      setIsScanning(true);
    } catch (cameraError) {
      console.error("Open QR camera failed:", cameraError);
      setIsScanning(false);
      setError(cameraError instanceof Error ? cameraError.message : "Camera could not be opened");
    }
  }, [handleDecoded, stopScanner]);

  useEffect(() => {
    if (initialToken) {
      void lookup(initialToken);
    }

    return () => {
      void stopScanner();
    };
  }, [initialToken, lookup, stopScanner]);

  function runPointAdjustment(points: number, reason?: string, transactionType?: "earn" | "redeem" | "adjust") {
    if (!member) return;
    setError(null);
    setNotice(null);
    startTransition(() => {
      void (async () => {
        const result = await adjustScannedMemberPoints(member.id, points, reason, transactionType);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMember(result.member);
        setNotice(result.message ?? "积分已更新 · Points updated");
      })();
    });
  }

  function runCheckIn(bookingId: string) {
    if (!member) return;
    setError(null);
    setNotice(null);
    startTransition(() => {
      void (async () => {
        const result = await checkInScannedBooking(member.id, bookingId);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMember(result.member);
        setNotice(result.message ?? "预约已确认 · Booking checked in");
      })();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-taupe-200/60 bg-cream-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">摄像头扫描 · Camera Scan</h2>
            <p className="mt-1 text-sm text-taupe-600">部署后请使用 HTTPS：/admin/scan</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startScanner}
              disabled={isScanning || loading}
              className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-sage-800 disabled:opacity-60"
            >
              {isScanning ? "扫描中 · Scanning" : member ? "重新扫描 · Rescan" : "开始扫描 · Start"}
            </button>
            <button
              type="button"
              onClick={stopScanner}
              disabled={!isScanning}
              className="rounded-full border border-taupe-300 px-4 py-2 text-sm font-semibold text-taupe-700 hover:border-sage-500 disabled:opacity-50"
            >
              停止 · Stop
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-taupe-200 bg-cream-100">
          <div id={READER_ID} className="min-h-[320px] w-full" />
        </div>

        <div className="mt-5 grid gap-3">
          <label className="block text-sm font-medium text-taupe-700">
            手动输入 token / URL
            <input
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Paste member QR token or URL"
              className="mt-1.5 w-full rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500"
            />
          </label>
          <button
            type="button"
            onClick={() => lookup(manualToken)}
            disabled={!manualToken.trim() || loading}
            className="rounded-full border border-sage-300 px-4 py-2.5 text-sm font-semibold text-sage-700 hover:border-sage-600 disabled:opacity-50"
          >
            查询会员 · Lookup
          </button>
        </div>

        {(loading || isPending) && (
          <p className="mt-4 rounded-xl bg-cream-100 px-4 py-3 text-sm text-taupe-600">处理中 · Loading...</p>
        )}
        {notice && <p className="mt-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{notice}</p>}
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </section>

      <section className="rounded-2xl border border-taupe-200/60 bg-cream-50 p-5 shadow-sm">
        {!member ? (
          <EmptyState>扫描会员 QR Code 后，这里会显示会员资料、积分和最近预约。</EmptyState>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-taupe-500">会员资料 · Member Profile</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{member.name || "Member"}</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-taupe-500">WhatsApp / 电话</dt>
                  <dd className="font-medium text-ink">{member.phone || "-"}</dd>
                </div>
                <div>
                  <dt className="text-taupe-500">Email</dt>
                  <dd className="break-all font-medium text-ink">{member.email}</dd>
                </div>
                <div>
                  <dt className="text-taupe-500">当前积分 · Points</dt>
                  <dd className="font-serif text-2xl font-semibold text-sage-700">{member.points_balance}</dd>
                </div>
                <div>
                  <dt className="text-taupe-500">会员 ID / 推荐码</dt>
                  <dd className="font-medium text-ink">{member.referral_code}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-cream-100 p-4">
              <h3 className="font-serif text-lg font-semibold text-ink">积分操作 · Points Actions</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => runPointAdjustment(10, "Staff QR scan reward", "earn")} className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-sage-800">
                  +10
                </button>
                <button type="button" onClick={() => runPointAdjustment(50, "Staff QR scan reward", "earn")} className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-sage-800">
                  +50
                </button>
                <button type="button" onClick={() => runPointAdjustment(-10, "Staff QR scan redeem", "redeem")} className="rounded-full border border-taupe-300 px-4 py-2 text-sm font-semibold text-taupe-700 hover:border-sage-500">
                  -10
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                <input
                  type="number"
                  value={customPoints}
                  onChange={(event) => setCustomPoints(event.target.value)}
                  className="rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500"
                />
                <input
                  value={customReason}
                  onChange={(event) => setCustomReason(event.target.value)}
                  placeholder="Reason"
                  className="rounded-xl border border-taupe-200 bg-cream-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500"
                />
                <button
                  type="button"
                  onClick={() => runPointAdjustment(Number(customPoints), customReason, "adjust")}
                  className="rounded-full border border-sage-300 px-4 py-2 text-sm font-semibold text-sage-700 hover:border-sage-600"
                >
                  自定义调整 · Apply
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-ink">最近预约 · Recent Bookings</h3>
              {member.bookings.length === 0 ? (
                <div className="mt-3"><EmptyState>暂无预约记录 · No bookings yet</EmptyState></div>
              ) : (
                <ul className="mt-3 divide-y divide-taupe-200/60">
                  {member.bookings.map((booking) => {
                    const canCheckIn = !["completed", "cancelled"].includes(booking.status);
                    return (
                      <li key={booking.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-ink">
                            {booking.package_name || PACKAGE_LABEL[booking.package_code || ""] || booking.package_code || "Package"}
                          </p>
                          <p className="mt-1 text-sm text-taupe-600">{bookingTimeLabel(booking)}</p>
                          <div className="mt-2"><Badge status={booking.status}>{STATUS_LABEL[booking.status] ?? booking.status}</Badge></div>
                        </div>
                        {canCheckIn && (
                          <button
                            type="button"
                            onClick={() => runCheckIn(booking.id)}
                            className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-sage-800"
                          >
                            确认预约 · Check-in
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
