import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme";

export default function Toast({ toast, onClose }: { toast: { message: string; tone: "success" | "error" | "info" } | null; onClose: () => void }) {
  if (!toast) return null;
  return (
    <Pressable onPress={onClose} style={[styles.toast, toast.tone === "error" && styles.error, toast.tone === "success" && styles.success]}>
      <Text style={styles.text}>{toast.message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 92,
    zIndex: 99,
    borderRadius: radius.lg,
    backgroundColor: colors.forest,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  error: { backgroundColor: colors.danger },
  success: { backgroundColor: colors.success },
  text: { color: colors.ivory, fontWeight: "800", textAlign: "center" },
});
