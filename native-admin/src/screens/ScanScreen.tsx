import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import StatusPill from "../components/StatusPill";
import { fetchMemberByQr } from "../features/scan/qr";
import { adjustCustomerPoints } from "../features/members/members.api";
import { useAuth } from "../app/AuthProvider";
import { useApp } from "../app/AppProvider";
import { getErrorMessage, logAppError } from "../lib/errors";
import { displayPoints } from "../lib/permissions";
import { formatDateTime } from "../lib/dates";
import { openWhatsApp } from "../lib/whatsapp";
import type { Booking, Customer } from "../lib/types";
import { colors, radius, shadow, spacing, typography } from "../theme";

type ScanResult = {
  token: string;
  customer: Customer;
  bookings: Booking[];
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const { profile } = useAuth();
  const { showToast } = useApp();

  async function start() {
    setError("");
    setResult(null);
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        setError("没有相机权限。请允许相机权限后再扫码。");
        return;
      }
    }
    setLocked(false);
    setScanning(true);
  }

  async function onBarcodeScanned(scan: BarcodeScanningResult) {
    if (locked) return;
    setLocked(true);
    setScanning(false);
    try {
      const found = await fetchMemberByQr(scan.data);
      setResult(found);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("扫码成功", "success");
    } catch (err) {
      logAppError("Native scan failed", err);
      setError(getErrorMessage(err, "Scan failed"));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function addPoints(delta: number) {
    if (!result?.customer || !profile) return;
    try {
      await adjustCustomerPoints(result.customer.id, delta, delta > 0 ? "earn" : "redeem", "Native QR scan", profile.userId);
      setResult((current) => {
        if (!current) return current;
        const nextPoints = displayPoints(current.customer) + delta;
        return {
          ...current,
          customer: { ...current.customer, points: nextPoints, points_balance: nextPoints },
        };
      });
      showToast("积分已更新", "success");
    } catch (err) {
      logAppError("Native scan points failed", err);
      setError(getErrorMessage(err, "Points update failed"));
    }
  }

  const customer = result?.customer ?? null;
  const latestBooking = result?.bookings?.[0] ?? null;

  return (
    <AppScreen title="扫码服务" subtitle="Native Camera QR">
      <AppCard tone="dark" eyebrow="Scan Desk" title="扫描会员二维码" subtitle="支持会员 QR、预约 QR 与完成体验 QR。">
        <AppButton onPress={start}>{scanning ? "扫描中" : "开始扫码"}</AppButton>
      </AppCard>

      {scanning ? (
        <View style={styles.cameraWrap}>
          <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={onBarcodeScanned} />
          <View style={styles.scanFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
        </View>
      ) : null}

      {error ? <ErrorState title="扫码失败" details={error} onRetry={start} /> : null}

      {customer ? (
        <AppCard title={customer.name || customer.phone || "会员"} subtitle={customer.email || customer.phone || ""}>
          <View style={styles.profileGrid}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricValue}>{displayPoints(customer)}</Text>
              <Text style={styles.metricLabel}>POINTS</Text>
            </View>
            <View style={styles.profileMeta}>
              <StatusPill label={customer.qr_token ? "QR Ready" : "QR Missing"} tone={customer.qr_token ? "success" : "warning"} />
              <StatusPill label={customer.role || "member"} />
            </View>
          </View>

          {latestBooking ? (
            <View style={styles.bookingPreview}>
              <Text style={styles.previewTitle}>最近预约</Text>
              <Text style={styles.previewText}>{latestBooking.package_name || latestBooking.package_code || latestBooking.package_type || "Package"}</Text>
              <Text style={styles.previewMuted}>{formatDateTime(latestBooking.booking_date, latestBooking.booking_time)}</Text>
              <StatusPill label={latestBooking.status} />
            </View>
          ) : null}

          <View style={styles.actions}>
            <AppButton onPress={() => addPoints(10)}>加 10 积分</AppButton>
            <AppButton tone="danger" onPress={() => addPoints(-10)}>扣 10 积分</AppButton>
            <AppButton tone="secondary" onPress={() => openWhatsApp(customer.phone).catch((err) => setError(getErrorMessage(err, "WhatsApp failed")))}>WhatsApp</AppButton>
            <AppButton tone="ghost" onPress={start}>重新扫描</AppButton>
          </View>
        </AppCard>
      ) : !scanning ? <EmptyState title="等待扫码" description="请扫描顾客会员中心、预约确认页或完成体验 QR Code。" /> : null}
    </AppScreen>
  );
}

const cornerBase = {
  position: "absolute" as const,
  width: 42,
  height: 42,
  borderColor: colors.champagne,
};

const styles = StyleSheet.create({
  cameraWrap: {
    height: 338,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.forest,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadow.lifted,
  },
  camera: { flex: 1 },
  scanFrame: {
    position: "absolute",
    left: 36,
    right: 36,
    top: 58,
    bottom: 58,
    borderRadius: radius.lg,
  },
  cornerTopLeft: { ...cornerBase, left: 0, top: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.md },
  cornerTopRight: { ...cornerBase, right: 0, top: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.md },
  cornerBottomLeft: { ...cornerBase, left: 0, bottom: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.md },
  cornerBottomRight: { ...cornerBase, right: 0, bottom: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.md },
  profileGrid: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  metricBlock: {
    minWidth: 112,
    borderRadius: radius.lg,
    backgroundColor: colors.forestMist,
    padding: spacing.md,
    alignItems: "center",
  },
  metricValue: { color: colors.forest, fontSize: 34, fontWeight: "900" },
  metricLabel: { ...typography.eyebrow, color: colors.muted },
  profileMeta: { alignItems: "flex-end", gap: spacing.xs },
  bookingPreview: { borderRadius: radius.md, backgroundColor: colors.cream, padding: spacing.md, gap: spacing.xs },
  previewTitle: { ...typography.eyebrow, color: colors.gold },
  previewText: { color: colors.forest, fontWeight: "900", fontSize: 15 },
  previewMuted: { color: colors.muted, lineHeight: 20 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
