import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function AppInput({ label, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor="rgba(23,57,42,0.45)" {...props} style={[styles.input, props.style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.forest, fontWeight: "800" },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.ivory,
    color: colors.forest,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
});
