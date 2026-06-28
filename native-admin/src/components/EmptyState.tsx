import { StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";
import AppButton from "./AppButton";

export default function EmptyState({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? <AppButton tone="secondary" onPress={onAction}>{actionLabel}</AppButton> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadow.soft },
  title: { color: colors.forest, fontSize: 17, fontWeight: "900", textAlign: "center" },
  description: { color: colors.muted, textAlign: "center", lineHeight: 20 },
});
