import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import ErrorState from "../components/ErrorState";
import { useApp } from "../app/AppProvider";
import { useAuth } from "../app/AuthProvider";
import { colors, shadow, spacing, typography } from "../theme";

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
    <AppScreen scroll={false} showHeader={false} showTopBand={false} contentStyle={styles.screen}>
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />

      <View style={styles.brandBlock}>
        <Text style={styles.adminLabel}>SCENT ADMIN</Text>
        <Text style={styles.brandName}>香气读懂你的心</Text>
        <View style={styles.brandLine} />
      </View>

      <View style={styles.markWrap}>
        <View style={styles.mark}>
          <View style={styles.markRing} />
          <View style={styles.leafMain} />
          <View style={styles.leafAccent} />
          <View style={styles.scentArcTop} />
          <View style={styles.scentArcBottom} />
        </View>
      </View>

      <AppCard style={styles.loginCard}>
        <View style={styles.cardHeading}>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.welcomeZh}>欢迎回来</Text>
          <Text style={styles.accessText}>Admin & Staff access only · 仅限管理员与店员账号使用</Text>
        </View>

        {!hasConfig ? (
          <ErrorState title="环境变量缺失" details="请设置 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY。" />
        ) : null}

        <View style={styles.formStack}>
          <AppInput
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="admin@scentknowsyou.com"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />
          <AppInput
            label="Password"
            secureTextEntry
            textContentType="password"
            placeholder="输入管理员密码"
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </View>

        {error ? <ErrorState title="登录失败" details={error} /> : null}

        <AppButton loading={loading} onPress={submit} style={styles.loginButton} textStyle={styles.loginButtonText}>
          登录 Admin App  →
        </AppButton>

        <Text style={styles.securityNote}>Protected workspace for appointments, members, scan and rewards.</Text>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    justifyContent: "center",
    backgroundColor: colors.cream,
    gap: spacing.lg,
  },
  orbTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(200,174,106,0.16)",
    top: -96,
    right: -108,
  },
  orbBottom: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(30,71,59,0.08)",
    bottom: -132,
    left: -136,
  },
  brandBlock: {
    alignItems: "center",
    gap: 8,
    marginTop: -10,
  },
  adminLabel: {
    ...typography.eyebrow,
    color: colors.gold,
    letterSpacing: 3.4,
    fontSize: 10,
  },
  brandName: {
    color: colors.forestDeep,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  brandLine: {
    width: 48,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.8,
    marginTop: 4,
  },
  markWrap: {
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: -2,
  },
  mark: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: colors.forestDeep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...shadow.lifted,
  },
  markRing: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(246,241,232,0.5)",
  },
  leafMain: {
    width: 26,
    height: 42,
    borderRadius: 24,
    backgroundColor: colors.ivory,
    position: "absolute",
    left: 27,
    top: 19,
    transform: [{ rotate: "-18deg" }],
  },
  leafAccent: {
    width: 19,
    height: 32,
    borderRadius: 20,
    backgroundColor: colors.gold,
    position: "absolute",
    right: 24,
    bottom: 20,
    transform: [{ rotate: "34deg" }],
  },
  scentArcTop: {
    position: "absolute",
    width: 48,
    height: 48,
    borderTopWidth: 3,
    borderColor: colors.gold,
    borderRadius: 24,
    top: 20,
  },
  scentArcBottom: {
    position: "absolute",
    width: 36,
    height: 36,
    borderBottomWidth: 3,
    borderColor: colors.gold,
    borderRadius: 18,
    bottom: 13,
  },
  loginCard: {
    padding: 24,
    gap: 18,
    borderColor: "rgba(200,174,106,0.24)",
    backgroundColor: "rgba(255,253,248,0.96)",
    shadowOpacity: 0.12,
  },
  cardHeading: {
    gap: 5,
    marginBottom: 2,
  },
  welcome: {
    color: colors.forestDeep,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  welcomeZh: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: "800",
  },
  accessText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  formStack: {
    gap: 14,
  },
  loginButton: {
    minHeight: 58,
    marginTop: 2,
  },
  loginButtonText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  securityNote: {
    color: colors.mutedSoft,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },
});
