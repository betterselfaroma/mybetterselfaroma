import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

type Tone = "neutral" | "success" | "warning" | "danger" | "gold";

function toneFor(value?: string | null): Tone {
  const normalized = (value ?? "").toLowerCase();
  if (["confirmed", "completed", "active", "ready", "admin", "staff"].includes(normalized)) return "success";
  if (["pending", "missing", "member"].includes(normalized)) return "warning";
  if (["cancelled", "error", "failed"].includes(normalized)) return "danger";
  if (["earn", "reward"].includes(normalized)) return "gold";
  return "neutral";
}

export default function StatusPill({ label, tone }: { label: string; tone?: Tone }) {
  const resolvedTone = tone ?? toneFor(label);
  return (
    <View style={[styles.pill, styles[resolvedTone]]}>
      <Text style={[styles.text, resolvedTone === "danger" && styles.dangerText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  neutral: { backgroundColor: colors.forestMist, borderColor: colors.border },
  success: { backgroundColor: colors.successSoft, borderColor: "rgba(47,111,78,0.18)" },
  warning: { backgroundColor: colors.champagne, borderColor: "rgba(200,169,104,0.22)" },
  danger: { backgroundColor: colors.dangerSoft, borderColor: "rgba(159,58,56,0.22)" },
  gold: { backgroundColor: colors.champagne, borderColor: "rgba(200,169,104,0.28)" },
  text: { color: colors.forest, fontSize: 12, fontWeight: "900" },
  dangerText: { color: colors.danger },
});
