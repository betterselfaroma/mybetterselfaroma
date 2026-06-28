import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import ErrorState from "../components/ErrorState";
import { useApp } from "../app/AppProvider";
import { useAuth } from "../app/AuthProvider";
import { adjustCustomerPoints, generateCustomerQrToken } from "../features/members/members.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import { displayPoints } from "../lib/permissions";
import { openWhatsApp } from "../lib/whatsapp";
import type { Customer } from "../lib/types";
import { colors, spacing } from "../theme";

export default function MemberDetailScreen({ route, navigation }: { route: { params: { customer: Customer } }; navigation: any }) {
  const customer = route.params.customer;
  const [delta, setDelta] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { showToast } = useApp();

  async function adjust(points: number) {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      await adjustCustomerPoints(customer.id, points, points > 0 ? "earn" : "redeem", points > 0 ? "Native admin reward" : "Native admin redeem", profile.userId);
      showToast("积分已更新", "success");
      navigation.goBack();
    } catch (err) {
      logAppError("Native member detail points failed", err);
      setError(getErrorMessage(err, "Points update failed"));
    } finally {
      setLoading(false);
    }
  }

  async function createQr() {
    if (!profile) return;
    try {
      await generateCustomerQrToken(customer.id, profile.userId);
      showToast("QR Token 已生成", "success");
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err, "QR token generation failed"));
    }
  }

  return (
    <AppScreen title="会员详情" subtitle={customer.name || customer.phone || "Member"}>
      <AppCard title={customer.name || "未命名会员"} subtitle={customer.email || customer.phone || ""}>
        <Text style={styles.row}>电话：{customer.phone || "未填写"}</Text>
        <Text style={styles.row}>积分：{displayPoints(customer)}</Text>
        <Text style={styles.row}>角色：{customer.role || "member"}</Text>
        <Text style={[styles.row, !customer.qr_token && styles.warn]}>QR：{customer.qr_token || "Missing"}</Text>
      </AppCard>
      {error ? <ErrorState title="会员操作失败" details={error} /> : null}
      <AppCard title="积分调整">
        <View style={styles.actions}>
          <AppButton loading={loading} onPress={() => adjust(10)}>加 10 积分</AppButton>
          <AppButton loading={loading} tone="secondary" onPress={() => adjust(50)}>加 50 积分</AppButton>
          <AppButton loading={loading} tone="danger" onPress={() => adjust(-10)}>扣 10 积分</AppButton>
        </View>
        <AppInput label="自定义积分" keyboardType="numeric" value={delta} onChangeText={setDelta} placeholder="例如 30 或 -20" />
        <AppButton loading={loading} onPress={() => adjust(Number(delta))}>提交自定义调整</AppButton>
      </AppCard>
      {!customer.qr_token ? <AppButton onPress={createQr}>生成 QR Token</AppButton> : null}
      <AppButton tone="secondary" onPress={() => openWhatsApp(customer.phone).catch((err) => setError(getErrorMessage(err, "WhatsApp failed")))}>WhatsApp 联系</AppButton>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: { color: colors.forest, lineHeight: 22 },
  warn: { color: colors.danger },
  actions: { gap: spacing.sm },
});
