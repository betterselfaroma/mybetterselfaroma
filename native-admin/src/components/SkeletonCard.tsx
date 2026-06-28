import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.lineLarge} />
      <View style={styles.line} />
      <View style={styles.lineSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.ivory, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  lineLarge: { height: 24, width: "46%", backgroundColor: "rgba(47,93,70,0.12)", borderRadius: radius.pill },
  line: { height: 14, width: "82%", backgroundColor: "rgba(47,93,70,0.1)", borderRadius: radius.pill },
  lineSmall: { height: 14, width: "60%", backgroundColor: "rgba(47,93,70,0.1)", borderRadius: radius.pill },
});
