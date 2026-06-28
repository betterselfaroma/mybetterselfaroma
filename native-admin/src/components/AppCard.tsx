import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius, shadow, spacing, typography } from "../theme";

export default function AppCard({
  title,
  subtitle,
  children,
  tone = "plain",
  eyebrow,
  style,
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  tone?: "plain" | "dark" | "gold" | "mist";
  eyebrow?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, tone === "dark" && styles.dark, tone === "gold" && styles.gold, tone === "mist" && styles.mist, style]}>
      {eyebrow ? <Text style={[styles.eyebrow, tone !== "plain" && styles.lightSubtitle]}>{eyebrow}</Text> : null}
      {title ? <Text style={[styles.title, tone !== "plain" && styles.lightTitle]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, tone !== "plain" && styles.lightSubtitle]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg + 2,
    gap: spacing.md,
    ...shadow.soft,
  },
  dark: { backgroundColor: colors.forestDeep, borderColor: colors.forestDeep },
  gold: { backgroundColor: colors.champagne, borderColor: "rgba(200,169,104,0.34)" },
  mist: { backgroundColor: colors.forestMist, borderColor: "rgba(47,93,70,0.1)" },
  eyebrow: { ...typography.eyebrow, color: colors.gold },
  title: { color: colors.forest, fontSize: 18, fontWeight: "900" },
  subtitle: { color: colors.muted, lineHeight: 21 },
  lightTitle: { color: colors.ivory },
  lightSubtitle: { color: "rgba(255,250,240,0.78)" },
});
