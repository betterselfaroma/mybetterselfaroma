import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { fetchRewardProducts } from "../features/rewards/rewards.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import type { RewardProduct } from "../lib/types";
import { colors, radius, spacing } from "../theme";

export default function RewardsScreen({ navigation }: { navigation: any }) {
  const [rows, setRows] = useState<RewardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setRows(await fetchRewardProducts());
    } catch (err) {
      logAppError("Native rewards load failed", err);
      setError(getErrorMessage(err, "Rewards load failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen title="积分商品" subtitle="Rewards" scroll={false} right={<AppButton tone="secondary" onPress={() => navigation.navigate("RewardForm")}>新增</AppButton>}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={error ? <ErrorState title="Rewards load failed" details={error} onRetry={load} /> : null}
        ListEmptyComponent={loading ? <LoadingState text="正在加载积分商品..." /> : <EmptyState title="没有积分商品" description="可以新增第一件积分兑换商品。" />}
        renderItem={({ item }) => (
          <AppCard title={item.name} subtitle={`${item.points_cost} points · stock ${item.stock}`}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
            <Text style={styles.row}>{item.description || "无说明"}</Text>
            <Text style={styles.row}>状态：{item.active ? "Active" : "Hidden"}</Text>
            <AppButton tone="secondary" onPress={() => navigation.navigate("RewardForm", { product: item })}>编辑</AppButton>
          </AppCard>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: 110, gap: spacing.md },
  image: { height: 160, borderRadius: radius.md, backgroundColor: colors.cream },
  row: { color: colors.muted, lineHeight: 20 },
});
