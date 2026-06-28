import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export type SelectOption = {
  label: string;
  value: string;
};

export default function AppSelect({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.options}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.option, active && styles.active]}>
              <Text style={[styles.optionText, active && styles.activeText]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.forest, fontWeight: "800" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  option: {
    minHeight: 42,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.ivory,
  },
  active: { backgroundColor: colors.forest, borderColor: colors.forest },
  optionText: { color: colors.forest, fontWeight: "700" },
  activeText: { color: colors.ivory },
});
