import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { fetchMemberByQr } from "../features/scan/qr";
import { adjustCustomerPoints } from "../features/members/members.api";
import { useAuth } from "../app/AuthProvider";
import { useApp } from "../app/AppProvider";
import { getErrorMessage, logAppError } from "../lib/errors";
import { displayPoints } from "../lib/permissions";
import { openWhatsApp } from "../lib/whatsapp";
import type { Customer } from "../lib/types";
import { colors, radius, spacing } from "../theme";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [locked, setLocked] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const { profile } = useAuth();
  const { showToast } = useApp();

  async function start() {
    setError("");
    setCustomer(null);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError("没有相机权限。请允许相机权限后再扫码。");
        return;
      }
    }
    setLocked(false);
    setScanning(true);
  }

  async function onBarcodeScanned(result: BarcodeScanningResult) {
    if (locked) return;
    setLocked(true);
    setScanning(false);
    try {
      const found = await fetchMemberByQr(result.data);
      setCustomer(found.customer);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("扫码成功", "success");
    } catch (err) {
      logAppError("Native scan failed", err);
      setError(getErrorMessage(err, "Scan failed"));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function addPoints(delta: number) {
    if (!customer || !profile) return;
    try {
      await adjustCustomerPoints(customer.id, delta, delta > 0 ? "earn" : "redeem", "Native QR scan", profile.userId);
      showToast("积分已更新", "success");
    } catch (err) {
      setError(getErrorMessage(err, "Points update failed"));
    }
  }

  return (
    <AppScreen title="扫码服务" subtitle="Native Camera QR">
      <AppCard tone="dark" title="扫描会员二维码" subtitle="点击开始后才会请求相机权限。">
        <AppButton onPress={start}>开始扫码</AppButton>
      </AppCard>
      {scanning ? (
        <View style={styles.cameraWrap}>
          <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={onBarcodeScanned} />
        </View>
      ) : null}
      {error ? <ErrorState title="扫码失败" details={error} onRetry={start} /> : null}
      {customer ? (
        <AppCard title={customer.name || customer.phone || "会员"} subtitle={customer.email || customer.phone || ""}>
          <Text style={styles.row}>积分：{displayPoints(customer)}</Text>
          <Text style={styles.row}>QR：{customer.qr_token || "Missing"}</Text>
          <View style={styles.actions}>
            <AppButton onPress={() => addPoints(10)}>加 10 积分</AppButton>
            <AppButton tone="danger" onPress={() => addPoints(-10)}>扣 10 积分</AppButton>
            <AppButton tone="secondary" onPress={() => openWhatsApp(customer.phone).catch((err) => setError(getErrorMessage(err, "WhatsApp failed")))}>WhatsApp</AppButton>
            <AppButton tone="ghost" onPress={start}>重新扫描</AppButton>
          </View>
        </AppCard>
      ) : !scanning ? <EmptyState title="等待扫码" description="扫描顾客会员中心的 QR Code。" /> : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cameraWrap: { height: 320, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.forest },
  camera: { flex: 1 },
  row: { color: colors.forest, lineHeight: 22 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
