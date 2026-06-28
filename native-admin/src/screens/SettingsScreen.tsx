import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import StatusPill from "../components/StatusPill";
import { useAuth } from "../app/AuthProvider";
import { colors, radius, shadow, spacing, typography } from "../theme";

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { profile, logout } = useAuth();

  return (
    <AppScreen title="设置" subtitle="Settings">
      <AppCard tone="dark" eyebrow="Admin App" title="后台设置" subtitle="内容、权限和系统工具集中在这里，Dashboard 只保留日常操作。">
        <View style={styles.row}>
          <Text style={styles.darkLabel}>当前账号</Text>
          <Text style={styles.darkValue}>{profile?.email ?? "Admin"}</Text>
        </View>
        <View style={styles.darkDivider} />
        <View style={styles.row}>
          <Text style={styles.darkLabel}>Role</Text>
          <StatusPill label={profile?.customer?.role ?? "unknown"} />
        </View>
      </AppCard>

      <SettingsGroup eyebrow="Website" title="网站内容" subtitle="首页文案、CMS 区块和品牌内容入口只放在设置页。">
        <SettingsAction title="CMS 内容管理" subtitle="编辑首页区块文字与基础内容" onPress={() => navigation.navigate("Cms")} />
        <Text style={styles.hint}>图片上传与素材删除请使用网页版 Admin 的 Settings → Media，避免手机误删素材。</Text>
      </SettingsGroup>

      <SettingsGroup eyebrow="Operations" title="运营工具" subtitle="不常用的管理入口集中放置，保持首页简洁。">
        <SettingsAction title="积分商品管理" subtitle="Rewards Products / 商品与兑换" onPress={() => navigation.navigate("Rewards")} />
        <SettingsAction title="扫码服务" subtitle="扫描会员 QR、加扣积分与确认预约" onPress={() => navigation.navigate("Scan")} />
      </SettingsGroup>

      <SettingsGroup eyebrow="App Care" title="App 维护" subtitle="如果手机仍显示旧内容，先清除缓存或重新登录。">
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>缓存提示</Text>
          <Text style={styles.tipText}>Android: Settings → Apps → Scent Admin → Storage & cache → Clear storage。</Text>
        </View>
      </SettingsGroup>

      <AppCard eyebrow="Security" title="安全退出">
        <Text style={styles.copy}>退出后需要重新登录 admin / staff 账号。</Text>
        <AppButton tone="danger" onPress={logout}>退出登录</AppButton>
      </AppCard>
    </AppScreen>
  );
}

function SettingsGroup({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <AppCard eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <View style={styles.group}>{children}</View>
    </AppCard>
  );
}

function SettingsAction({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.action}>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <AppButton tone="secondary" onPress={onPress}>打开</AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  darkLabel: { ...typography.eyebrow, color: "rgba(255,253,248,0.68)" },
  darkValue: { color: colors.ivory, fontWeight: "900", maxWidth: "64%", textAlign: "right" },
  darkDivider: { height: 1, backgroundColor: "rgba(255,253,248,0.16)", marginVertical: spacing.sm },
  copy: { color: colors.muted, lineHeight: 20 },
  group: { gap: spacing.sm, marginTop: spacing.sm },
  action: {
    borderRadius: radius.lg,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.soft,
  },
  actionText: { gap: 4 },
  actionTitle: { color: colors.forest, fontSize: 16, fontWeight: "900" },
  actionSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  hint: { color: colors.mutedSoft, fontSize: 12, lineHeight: 18 },
  tipBox: {
    borderRadius: radius.md,
    backgroundColor: colors.forestMist,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tipTitle: { color: colors.forest, fontWeight: "900", marginBottom: 4 },
  tipText: { color: colors.muted, lineHeight: 20 },
});
