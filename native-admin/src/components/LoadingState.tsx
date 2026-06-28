import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export default function LoadingState({ text = "正在加载..." }: { text?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.forest} size="large" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 220, alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.cream },
  text: { color: colors.muted, fontWeight: "700" },
});
