import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import ErrorState from "../components/ErrorState";
import { useApp } from "../app/AppProvider";
import { useAuth } from "../app/AuthProvider";
import { colors, spacing } from "../theme";

export default function LoginScreen({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const { login, loading, hasConfig } = useAuth();
  const { showToast } = useApp();

  async function submit() {
    setError("");
    if (!email.trim() || !password) {
      setError("请输入 Email 和密码。");
      return;
    }
    try {
      await login(email, password);
      showToast("登录成功", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AppScreen title="香气读懂你的心" subtitle="Native Admin App">
      <View style={styles.hero}>
        <Text style={styles.mark}>香</Text>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.copy}>原生手机后台 · 预约、会员、扫码与积分管理</Text>
      </View>
      <AppCard>
        {!hasConfig ? <ErrorState title="环境变量缺失" details="请设置 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY。" /> : null}
        <AppInput label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <AppInput label="密码" secureTextEntry value={password} onChangeText={setPassword} />
        {error ? <ErrorState title="登录失败" details={error} /> : null}
        <AppButton loading={loading} onPress={submit}>登录 Admin App</AppButton>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl },
  mark: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.gold, color: colors.forest, textAlign: "center", lineHeight: 76, fontSize: 34, fontWeight: "900" },
  title: { color: colors.forest, fontSize: 28, fontWeight: "900" },
  copy: { color: colors.muted, textAlign: "center" },
});
