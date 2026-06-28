import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, radius, shadow } from "../theme";

export default function AppButton({
  children,
  onPress,
  tone = "primary",
  loading,
  disabled,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
        style,
      ]}
    >
      {tone === "primary" ? <View pointerEvents="none" style={styles.primarySheen} /> : null}
      {loading ? (
        <ActivityIndicator color={tone === "primary" || tone === "danger" ? colors.ivory : colors.forest} />
      ) : (
        <Text style={[styles.text, tone !== "primary" && tone !== "danger" && styles.darkText, textStyle]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.forestDeep,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    overflow: "hidden",
    ...shadow.lifted,
  },
  primarySheen: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "42%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ skewX: "-16deg" }],
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, shadowOpacity: 0, elevation: 0 },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: "transparent", shadowOpacity: 0, elevation: 0 },
  dim: { opacity: 0.72 },
  text: { color: colors.ivory, fontWeight: "900", fontSize: 15, letterSpacing: 0.2 },
  darkText: { color: colors.forestDeep },
});
