import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { fetchDashboardOverview } from "../features/dashboard/dashboard.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import { formatDateTime } from "../lib/dates";
import type { DashboardOverview } from "../lib/types";
import { colors, spacing } from "../theme";

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setData(await fetchDashboardOverview());
    } catch (err) {
      logAppError("Native dashboard load failed", err);
      setError(getErrorMessage(err, "Dashboard load failed"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!data && !error) return <LoadingState text="正在读取今日后台..." />;

  return (
    <AppScreen title="今日后台" subtitle="Dashboard" scroll={false}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} contentContainerStyle={styles.content}>
        <AppCard tone="dark" title="手机后台" subtitle="预约、会员、扫码与积分的快速入口。">
          <View style={styles.quickRow}>
            <AppButton onPress={() => navigation.navigate("Scan")}>扫会员 QR</AppButton>
            <AppButton tone="secondary" onPress={() => navigation.navigate("Bookings")}>今日预约</AppButton>
          </View>
        </AppCard>
        {error ? <ErrorState title="Dashboard load failed" details={error} onRetry={load} /> : null}
        {data ? (
          <>
            <View style={styles.stats}>
              <StatCard label="今日预约" value={data.metrics.todayBookings.value} error={data.metrics.todayBookings.error} />
              <StatCard label="待确认" value={data.metrics.pendingBookings.value} error={data.metrics.pendingBookings.error} />
              <StatCard label="新增会员" value={data.metrics.todayMembers.value} error={data.metrics.todayMembers.error} />
              <StatCard label="总会员" value={data.metrics.totalMembers.value} error={data.metrics.totalMembers.error} />
              <StatCard label="今日积分" value={data.metrics.todayPointsIssued.value} error={data.metrics.todayPointsIssued.error} />
            </View>
            {data.errors.length ? <ErrorState title="部分统计读取失败" message="Dashboard 继续可用，失败卡片显示为 0。" details={data.errors.join("\n")} /> : null}
            <AppCard title="快捷操作">
              <View style={styles.actionGrid}>
                <AppButton tone="secondary" onPress={() => navigation.navigate("Scan")}>扫会员 QR</AppButton>
                <AppButton tone="secondary" onPress={() => navigation.navigate("Bookings")}>预约列表</AppButton>
                <AppButton tone="secondary" onPress={() => navigation.navigate("Members")}>搜索会员</AppButton>
                <AppButton tone="secondary" onPress={() => navigation.navigate("Rewards")}>积分商品</AppButton>
                <AppButton tone="secondary" onPress={() => navigation.navigate("Cms")}>内容管理</AppButton>
              </View>
            </AppCard>
            <Text style={styles.sectionTitle}>今日预约</Text>
            {data.todayBookings.length === 0 ? <EmptyState title="今天暂无预约" /> : data.todayBookings.slice(0, 4).map((booking) => (
              <AppCard key={booking.id} title={booking.contact || "未填写电话"} subtitle={`${booking.package_name || booking.package_code || booking.package_type || "Package"} · ${formatDateTime(booking.booking_date, booking.booking_time)}`}>
                <Text style={styles.muted}>状态：{booking.status}</Text>
              </AppCard>
            ))}
          </>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 110, gap: spacing.md },
  quickRow: { flexDirection: "row", gap: spacing.sm },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actionGrid: { gap: spacing.sm },
  sectionTitle: { color: colors.forest, fontSize: 20, fontWeight: "900" },
  muted: { color: colors.muted },
});
