import { Modal, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import AppButton from "./AppButton";

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "确认",
  danger,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <AppButton tone={danger ? "danger" : "primary"} loading={loading} onPress={onConfirm}>{confirmLabel}</AppButton>
            <AppButton tone="secondary" onPress={onCancel}>取消</AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.28)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  title: { color: colors.forest, fontSize: 20, fontWeight: "900" },
  message: { color: colors.muted, lineHeight: 20 },
  actions: { gap: spacing.sm },
});
