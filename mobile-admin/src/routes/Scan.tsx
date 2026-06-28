import { useEffect, useRef, useState } from "react";
import BookingCard from "../components/BookingCard";
import MemberCard from "../components/MemberCard";
import AppButton from "../components/mobile/AppButton";
import AppCard from "../components/mobile/AppCard";
import AppPage from "../components/mobile/AppPage";
import EmptyState from "../components/mobile/EmptyState";
import ErrorState from "../components/mobile/ErrorState";
import LoadingState from "../components/mobile/LoadingState";
import { hapticSuccess, hapticWarning } from "../app/NativeBridge";
import { useApp } from "../app/AppProvider";
import { adjustMemberPoints, fetchMemberByQr } from "../features/scan/scan.api";
import { describeError, logError } from "../lib/errors";
import { parseQrToken } from "../lib/qr";
import type { Booking, Customer, OperatorProfile, TransactionType } from "../lib/types";

type ScanResult = {
  token: string;
  customer: Customer;
  bookings: Booking[];
};

export default function Scan({ profile, initialToken }: { profile: OperatorProfile; initialToken?: string }) {
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void | Promise<void> } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [notice, setNotice] = useState("");
  const { showToast } = useApp();

  async function stopScanner() {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    } catch (err) {
      logError("Stop QR scanner failed", err);
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  }

  async function loadToken(raw: string) {
    const token = parseQrToken(raw);
    if (!token) {
      setError("二维码无效");
      hapticWarning();
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await fetchMemberByQr(token);
      setResult(data);
      showToast("会员已读取");
      hapticSuccess();
    } catch (err) {
      logError("Load scanned member failed", err);
      setError(describeError(err, "找不到会员或会员资料无法读取"));
      hapticWarning();
    } finally {
      setLoading(false);
    }
  }

  async function startScanner() {
    setError("");
    setNotice("");
    setResult(null);
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText: string) => {
          await stopScanner();
          await loadToken(decodedText);
        },
        () => undefined,
      );
    } catch (err) {
      logError("Start QR scanner failed", err);
      setScanning(false);
      setError(describeError(err, "无法打开摄像头，请确认已允许相机权限，并使用 HTTPS 或手机 App"));
      hapticWarning();
    }
  }

  async function adjust(customerId: string, points: number, type: TransactionType, reason: string) {
    setNotice("");
    setError("");
    try {
      await adjustMemberPoints(customerId, points, type, reason, profile.userId);
      setNotice("积分已更新");
      showToast("积分已更新");
      hapticSuccess();
      if (result) await loadToken(result.token);
    } catch (err) {
      logError("Scanned member points update failed", err);
      setError(describeError(err, "Points update failed"));
    }
  }

  useEffect(() => {
    if (initialToken) loadToken(initialToken);
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  return (
    <AppPage eyebrow="Scan Member QR" title="扫码服务" description="点击按钮后才会请求摄像头权限。" hero>

      <AppCard className="scanner-card">
        <p className="muted">用于扫描顾客会员 QR，读取会员资料、积分和最近预约。</p>
        <div id="qr-reader" />
        {!scanning ? (
          <AppButton full type="button" onClick={startScanner}>开始扫码</AppButton>
        ) : (
          <AppButton tone="secondary" full type="button" onClick={stopScanner}>停止扫码</AppButton>
        )}
        <button className="text-button" type="button" onClick={() => {
          setResult(null);
          setError("");
          setNotice("");
        }}>重新扫描</button>
      </AppCard>

      {loading && <LoadingState text="正在读取会员…" />}
      {notice && <p className="success-box">{notice}</p>}
      {error && <ErrorState message="扫码读取失败。" details={error} onRetry={() => setError("")} />}

      {result && (
        <>
          <MemberCard customer={result.customer} onAdjust={adjust} />
          <div className="section-head"><h2>最近预约</h2></div>
          {result.bookings.length === 0 ? <EmptyState title="暂无预约记录" /> : result.bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
        </>
      )}
    </AppPage>
  );
}
