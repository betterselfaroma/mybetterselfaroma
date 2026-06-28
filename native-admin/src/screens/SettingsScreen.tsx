import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import { useAuth } from "../app/AuthProvider";
import { colors } from "../theme";
import { Text } from "react-native";

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { profile, logout } = useAuth();
  return (
    <AppScreen title="设置" subtitle="Settings">
      <AppCard title="当前账号" subtitle={profile?.email ?? "Admin"}>
        <Text style={{ color: colors.forest }}>Role: {profile?.customer?.role ?? "unknown"}</Text>
      </AppCard>
      <AppCard title="管理功能">
        <AppButton tone="secondary" onPress={() => navigation.navigate("Rewards")}>积分商品管理</AppButton>
        <AppButton tone="secondary" onPress={() => navigation.navigate("Cms")}>CMS 内容管理</AppButton>
      </AppCard>
      <AppCard title="安全">
        <AppButton tone="danger" onPress={logout}>退出登录</AppButton>
      </AppCard>
    </AppScreen>
  );
}
