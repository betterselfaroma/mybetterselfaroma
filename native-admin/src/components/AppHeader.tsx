import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export default function AppHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandMark}>
        <Text style={styles.brandText}>香</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 74,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.forest,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { color: colors.forest, fontWeight: "900", fontSize: 19 },
  copy: { flex: 1 },
  title: { color: colors.ivory, fontSize: 21, fontWeight: "800" },
  subtitle: { color: "rgba(255, 250, 240, 0.76)", fontSize: 12, marginTop: 2 },
});
