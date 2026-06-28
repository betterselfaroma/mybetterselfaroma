import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import AppButton from "./AppButton";

export default function ErrorState({ title = "读取失败", message, details, onRetry }: { title?: string; message?: string; details?: string; onRetry?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {details ? <Text selectable style={styles.details}>{details}</Text> : null}
      {onRetry ? <AppButton tone="secondary" onPress={onRetry}>重新尝试</AppButton> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(159,58,56,0.22)", backgroundColor: colors.dangerSoft, gap: spacing.sm },
  title: { color: colors.danger, fontSize: 16, fontWeight: "900" },
  message: { color: colors.forest, lineHeight: 20 },
  details: { color: colors.danger, fontSize: 12, lineHeight: 18 },
});
