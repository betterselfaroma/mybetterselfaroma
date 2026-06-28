import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import { fetchDashboardOverview } from "../features/dashboard/dashboard.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import { formatDateTime } from "../lib/dates";
import type { DashboardOverview } from "../lib/types";
import { colors, radius, shadow, spacing, typography } from "../theme";

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
        <AppCard tone="dark" eyebrow="Command Center" title="手机后台" subtitle="预约、会员、扫码与积分的核心入口。">
          <View style={styles.heroActions}>
            <AppButton onPress={() => navigation.navigate("Scan")}>扫会员 QR</AppButton>
            <AppButton tone="secondary" onPress={() => navigation.navigate("Bookings")}>查看预约</AppButton>
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

            <View style={styles.actionGrid}>
              <ActionTile title="扫码服务" subtitle="会员 QR / 预约 QR" onPress={() => navigation.navigate("Scan")} accent />
              <ActionTile title="预约列表" subtitle="确认、完成、取消" onPress={() => navigation.navigate("Bookings")} />
              <ActionTile title="会员搜索" subtitle="积分与 QR token" onPress={() => navigation.navigate("Members")} />
              <ActionTile title="积分商品" subtitle="Rewards Products" onPress={() => navigation.navigate("Rewards")} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>今日预约</Text>
              <StatusPill label={`${data.todayBookings.length} records`} tone="neutral" />
            </View>

            {data.todayBookings.length === 0 ? <EmptyState title="今天暂无预约" description="新的预约会自动出现在这里。" /> : data.todayBookings.slice(0, 4).map((booking) => (
              <AppCard key={booking.id} title={booking.contact || "未填写电话"} subtitle={`${booking.package_name || booking.package_code || booking.package_type || "Package"} · ${formatDateTime(booking.booking_date, booking.booking_time)}`}>
                <View style={styles.bookingMeta}>
                  <StatusPill label={booking.status} />
                  <Text style={styles.muted}>{booking.notes || "No notes"}</Text>
                </View>
              </AppCard>
            ))}
          </>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function ActionTile({ title, subtitle, onPress, accent }: { title: string; subtitle: string; onPress: () => void; accent?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, accent && styles.tileAccent, pressed && styles.tilePressed]}>
      <Text style={[styles.tileTitle, accent && styles.tileTitleAccent]}>{title}</Text>
      <Text style={[styles.tileSubtitle, accent && styles.tileSubtitleAccent]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 118, gap: spacing.md },
  heroActions: { flexDirection: "row", gap: spacing.sm },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tile: {
    width: "48%",
    minHeight: 92,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
    ...shadow.soft,
  },
  tileAccent: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  tilePressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  tileTitle: { color: colors.forest, fontSize: 16, fontWeight: "900" },
  tileTitleAccent: { color: colors.ivory },
  tileSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: spacing.xs },
  tileSubtitleAccent: { color: "rgba(255,250,240,0.72)" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  sectionTitle: { color: colors.forest, fontSize: 20, fontWeight: "900" },
  bookingMeta: { gap: spacing.sm },
  muted: { ...typography.eyebrow, color: colors.mutedSoft },
});
