import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import ErrorState from "../components/ErrorState";
import { useAuth } from "../app/AuthProvider";
import type { OperatorProfile } from "../lib/types";

export default function NoPermissionScreen({ profile, authError }: { profile?: OperatorProfile | null; authError?: string }) {
  const { logout } = useAuth();
  return (
    <AppScreen title="无权限" subtitle={profile?.email ?? "Admin App"}>
      <ErrorState
        title="此账号不能进入 Admin"
        message="Native Admin App 只允许 customers.role = admin / staff 或 is_admin = true 的账号进入。"
        details={authError || (!profile?.customer ? "找不到 customers profile。请先在 Supabase 建立此账号的客户资料并设置权限。" : "当前账号是普通会员。")}
      />
      <AppCard title="下一步">
        <AppButton tone="secondary" onPress={logout}>退出登录</AppButton>
      </AppCard>
    </AppScreen>
  );
}
