import { Text, View, StyleSheet } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import StatusPill from "../components/StatusPill";
import { useAuth } from "../app/AuthProvider";
import { colors, spacing } from "../theme";

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { profile, logout } = useAuth();
  return (
    <AppScreen title="设置" subtitle="Settings">
      <AppCard eyebrow="Account" title="当前账号" subtitle={profile?.email ?? "Admin"}>
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <StatusPill label={profile?.customer?.role ?? "unknown"} />
        </View>
      </AppCard>

      <AppCard eyebrow="Tools" title="管理功能" subtitle="常用后台工具集中在这里。">
        <AppButton tone="secondary" onPress={() => navigation.navigate("Rewards")}>积分商品管理</AppButton>
        <AppButton tone="secondary" onPress={() => navigation.navigate("Cms")}>CMS 内容管理</AppButton>
      </AppCard>

      <AppCard eyebrow="Security" title="安全">
        <Text style={styles.copy}>退出后需要重新登录 admin / staff 账号。</Text>
        <AppButton tone="danger" onPress={logout}>退出登录</AppButton>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  label: { color: colors.muted, fontWeight: "900" },
  copy: { color: colors.muted, lineHeight: 20 },
});
