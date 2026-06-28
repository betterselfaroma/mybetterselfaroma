import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import AppSelect from "../components/AppSelect";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import StatusPill from "../components/StatusPill";
import { fetchBookings } from "../features/bookings/bookings.api";
import { todayInMalaysia, formatDateTime } from "../lib/dates";
import { getErrorMessage, logAppError } from "../lib/errors";
import { openWhatsApp } from "../lib/whatsapp";
import type { Booking } from "../lib/types";
import { colors, spacing } from "../theme";

const STATUS_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function BookingsScreen({ navigation }: { navigation: any }) {
  const [q, setQ] = useState("");
  const [date, setDate] = useState(todayInMalaysia());
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setRows(await fetchBookings({ q, date, status }));
    } catch (err) {
      logAppError("Native bookings load failed", err);
      setError(getErrorMessage(err, "Bookings load failed"));
    } finally {
      setLoading(false);
    }
  }, [q, date, status]);

  useEffect(() => {
    const timer = setTimeout(load, 220);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <AppScreen title="预约管理" subtitle="Bookings" scroll={false}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            <AppInput label="搜索电话" value={q} onChangeText={setQ} />
            <AppInput label="日期" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
            <AppSelect label="状态" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
            {error ? <ErrorState title="Bookings load failed" details={error} onRetry={load} /> : null}
          </View>
        }
        ListEmptyComponent={loading ? <LoadingState text="正在加载预约..." /> : <EmptyState title="没有预约" description="换一个日期、状态或电话试试看。" />}
        renderItem={({ item }) => (
          <AppCard title={item.contact || "未填写电话"} subtitle={`${item.package_name || item.package_code || item.package_type || "Package"} · ${formatDateTime(item.booking_date, item.booking_time)}`}>
            <View style={styles.metaRow}>
              <StatusPill label={item.status} />
              <Text style={styles.price}>{Number(item.amount ?? 0) ? `RM${item.amount}` : "RM -"}</Text>
            </View>
            {item.notes ? <Text style={styles.muted}>备注：{item.notes}</Text> : null}
            <View style={styles.actions}>
              <AppButton tone="secondary" onPress={() => navigation.navigate("BookingDetail", { booking: item })}>详情</AppButton>
              <AppButton tone="ghost" onPress={() => openWhatsApp(item.contact).catch((err) => setError(getErrorMessage(err, "WhatsApp failed")))}>WhatsApp</AppButton>
            </View>
          </AppCard>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: 118, gap: spacing.md },
  filters: { gap: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  price: { color: colors.forest, fontWeight: "900" },
  muted: { color: colors.muted, lineHeight: 20 },
});
