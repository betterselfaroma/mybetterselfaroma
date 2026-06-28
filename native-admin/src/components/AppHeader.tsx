import { StyleSheet, Text, View } from "react-native";
import { colors, shadow, spacing, typography } from "../theme";

export default function AppHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandMark}>
        <View style={styles.leafLeft} />
        <View style={styles.leafRight} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Scent Admin</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 88,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.forestDeep,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadow.soft,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.champagne,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  leafLeft: {
    width: 18,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.forest,
    position: "absolute",
    left: 14,
    top: 11,
    transform: [{ rotate: "-28deg" }],
  },
  leafRight: {
    width: 14,
    height: 22,
    borderRadius: 12,
    backgroundColor: colors.gold,
    position: "absolute",
    right: 12,
    bottom: 11,
    transform: [{ rotate: "32deg" }],
  },
  copy: { flex: 1 },
  eyebrow: { ...typography.eyebrow, color: "rgba(255,250,240,0.66)", marginBottom: 3 },
  title: { color: colors.ivory, fontSize: 22, fontWeight: "900" },
  subtitle: { color: "rgba(255,250,240,0.76)", fontSize: 13, marginTop: 2 },
  right: { alignItems: "flex-end" },
});
