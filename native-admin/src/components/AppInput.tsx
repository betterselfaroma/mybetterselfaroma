import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";

export default function AppInput({ label, ...props }: TextInputProps & { label?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="rgba(30,71,59,0.42)"
        {...props}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        style={[styles.input, focused && styles.inputFocused, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  label: { color: colors.forestDeep, fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },
  input: {
    minHeight: 58,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.ivory,
    color: colors.forestDeep,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    fontWeight: "600",
  },
  inputFocused: {
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface,
    ...shadow.glow,
  },
});
