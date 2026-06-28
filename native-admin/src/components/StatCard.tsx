import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function StatCard({ label, value, error }: { label: string; value: number | string; error?: string }) {
  return (
    <View style={[styles.card, error && styles.error]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {error ? <Text numberOfLines={3} style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: "46%", backgroundColor: colors.ivory, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  error: { backgroundColor: "#fff3ef", borderColor: "rgba(159,58,56,0.2)" },
  value: { color: colors.forest, fontSize: 28, fontWeight: "900" },
  label: { color: colors.muted, fontWeight: "700", marginTop: 2 },
  errorText: { color: colors.danger, fontSize: 11, marginTop: 6 },
});
