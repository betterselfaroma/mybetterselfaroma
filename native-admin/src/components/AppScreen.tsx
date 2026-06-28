import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import AppHeader from "./AppHeader";

export default function AppScreen({
  title,
  subtitle,
  children,
  scroll = true,
  right,
  showHeader = true,
  showTopBand = true,
  contentStyle,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  right?: React.ReactNode;
  showHeader?: boolean;
  showTopBand?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {showTopBand ? <View style={styles.topBand} /> : null}
        {showHeader && title ? <AppHeader title={title} subtitle={subtitle} right={right} /> : null}
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  topBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 168,
    backgroundColor: colors.forestDeep,
  },
  content: { padding: spacing.md, paddingBottom: 110, gap: spacing.md },
});
