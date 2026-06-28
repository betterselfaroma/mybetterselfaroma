import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, shadow } from "../theme";

export default function AppButton({
  children,
  onPress,
  tone = "primary",
  loading,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === "secondary" && styles.secondary,
        tone === "danger" && styles.danger,
        tone === "ghost" && styles.ghost,
        (pressed || disabled || loading) && styles.dim,
      ]}
    >
      {loading ? <ActivityIndicator color={tone === "primary" || tone === "danger" ? colors.ivory : colors.forest} /> : <Text style={[styles.text, tone !== "primary" && tone !== "danger" && styles.darkText]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    ...shadow.soft,
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, shadowOpacity: 0 },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: "transparent", shadowOpacity: 0 },
  dim: { opacity: 0.72 },
  text: { color: colors.ivory, fontWeight: "900", fontSize: 15 },
  darkText: { color: colors.forest },
});
