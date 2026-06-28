import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function AppCard({
  title,
  subtitle,
  children,
  tone = "plain",
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  tone?: "plain" | "dark" | "gold";
}) {
  return (
    <View style={[styles.card, tone === "dark" && styles.dark, tone === "gold" && styles.gold]}>
      {title ? <Text style={[styles.title, tone !== "plain" && styles.lightTitle]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, tone !== "plain" && styles.lightSubtitle]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ivory,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  dark: { backgroundColor: colors.forest, borderColor: colors.forest },
  gold: { backgroundColor: "#efe3c4", borderColor: "rgba(200,169,104,0.34)" },
  title: { color: colors.forest, fontSize: 17, fontWeight: "800" },
  subtitle: { color: colors.muted, lineHeight: 20 },
  lightTitle: { color: colors.ivory },
  lightSubtitle: { color: "rgba(255,250,240,0.78)" },
});
