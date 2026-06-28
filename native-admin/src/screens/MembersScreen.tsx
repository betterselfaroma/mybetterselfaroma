import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { fetchMembers, generateCustomerQrToken, adjustCustomerPoints } from "../features/members/members.api";
import { useApp } from "../app/AppProvider";
import { useAuth } from "../app/AuthProvider";
import { displayPoints } from "../lib/permissions";
import { getErrorMessage, logAppError } from "../lib/errors";
import { openWhatsApp } from "../lib/whatsapp";
import type { Customer } from "../lib/types";
import { colors, spacing } from "../theme";

export default function MembersScreen({ navigation }: { navigation: any }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile } = useAuth();
  const { showToast } = useApp();

  const load = useCallback(async () => {
    setError("");
    try {
      setRows(await fetchMembers(q));
    } catch (err) {
      logAppError("Native members load failed", err);
      setError(getErrorMessage(err, "Members load failed"));
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(load, 220);
    return () => clearTimeout(timer);
  }, [load]);

  async function quickPoints(customer: Customer, delta: number) {
    if (!profile) return;
    try {
      await adjustCustomerPoints(customer.id, delta, delta > 0 ? "earn" : "redeem", delta > 0 ? "Native admin reward" : "Native admin redeem", profile.userId);
      showToast("积分已更新", "success");
      await load();
    } catch (err) {
      logAppError("Native member points failed", err);
      setError(getErrorMessage(err, "Points update failed"));
    }
  }

  async function createQr(customer: Customer) {
    if (!profile) return;
    try {
      await generateCustomerQrToken(customer.id, profile.userId);
      showToast("QR Token 已生成", "success");
      await load();
    } catch (err) {
      logAppError("Native QR token generation failed", err);
      setError(getErrorMessage(err, "QR token generation failed"));
    }
  }

  return (
    <AppScreen title="会员管理" subtitle="Members" scroll={false}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            <AppInput label="搜索会员" value={q} onChangeText={setQ} placeholder="名字 / 电话 / Email" />
            {error ? <ErrorState title="Members load failed" details={error} onRetry={load} /> : null}
          </View>
        }
        ListEmptyComponent={loading ? <LoadingState text="正在加载会员..." /> : <EmptyState title="没有会员" />}
        renderItem={({ item }) => (
          <AppCard title={item.name || item.phone || "未命名会员"} subtitle={item.email || item.phone || "No contact"}>
            <Text style={styles.row}>积分：{displayPoints(item)}</Text>
            <Text style={[styles.row, !item.qr_token && styles.warn]}>QR Token：{item.qr_token ? "Ready" : "Missing"}</Text>
            <View style={styles.actions}>
              <AppButton tone="secondary" onPress={() => navigation.navigate("MemberDetail", { customer: item })}>详情</AppButton>
              <AppButton tone="secondary" onPress={() => quickPoints(item, 10)}>+10</AppButton>
              <AppButton tone="ghost" onPress={() => quickPoints(item, -10)}>-10</AppButton>
            </View>
            {!item.qr_token ? <AppButton onPress={() => createQr(item)}>生成 QR Token</AppButton> : null}
            <AppButton tone="ghost" onPress={() => openWhatsApp(item.phone).catch((err) => setError(getErrorMessage(err, "WhatsApp failed")))}>WhatsApp</AppButton>
          </AppCard>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: 110, gap: spacing.md },
  filters: { gap: spacing.md },
  row: { color: colors.forest, lineHeight: 22 },
  warn: { color: colors.danger },
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
});
