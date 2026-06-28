import { useEffect, useRef, useState } from "react";
import BookingCard from "../components/BookingCard";
import MemberCard from "../components/MemberCard";
import { adjustMemberPoints, fetchMemberByQr } from "../lib/admin";
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
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await fetchMemberByQr(token);
      setResult(data);
    } catch (err) {
      logError("Load scanned member failed", err);
      setError(describeError(err, "?????"));
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
      setError(describeError(err, "???????,?????"));
    }
  }

  async function adjust(customerId: string, points: number, type: TransactionType, reason: string) {
    setNotice("");
    setError("");
    try {
      await adjustMemberPoints(customerId, points, type, reason, profile.userId);
      setNotice("积分已更新");
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
    <section className="page-stack">
      <div className="hero-card scan-hero">
        <span>Scan Member QR</span>
        <h1>扫码服务</h1>
        <p>点击按钮后才会请求摄像头权限。</p>
      </div>

      <div className="scanner-card">
        <div id="qr-reader" />
        {!scanning ? (
          <button className="primary-button full" type="button" onClick={startScanner}>开始扫码</button>
        ) : (
          <button className="outline-button full" type="button" onClick={stopScanner}>停止扫码</button>
        )}
        <button className="text-button" type="button" onClick={() => {
          setResult(null);
          setError("");
          setNotice("");
        }}>重新扫描</button>
      </div>

      {loading && <div className="empty-state">正在读取会员…</div>}
      {notice && <p className="success-box">{notice}</p>}
      {error && <p className="error-box">{error}</p>}

      {result && (
        <>
          <MemberCard customer={result.customer} onAdjust={adjust} />
          <div className="section-head"><h2>最近预约</h2></div>
          {result.bookings.length === 0 ? <div className="empty-state">暂无预约记录</div> : result.bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
        </>
      )}
    </section>
  );
}
