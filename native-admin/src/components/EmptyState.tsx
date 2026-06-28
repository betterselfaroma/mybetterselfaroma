import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";
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
  wrap: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.ivory, alignItems: "center", gap: spacing.sm },
  title: { color: colors.forest, fontSize: 17, fontWeight: "800", textAlign: "center" },
  description: { color: colors.muted, textAlign: "center", lineHeight: 20 },
});
