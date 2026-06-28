import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export type ActionSheetItem = {
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

export default function ActionSheet({ visible, title, items, onClose }: { visible: boolean; title: string; items: ActionSheetItem[]; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {items.map((item) => (
            <Pressable
              key={item.label}
              style={styles.item}
              onPress={() => {
                onClose();
                item.onPress();
              }}
            >
              <Text style={[styles.label, item.destructive && styles.destructive]}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>取消</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.28)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.md, gap: spacing.xs },
  title: { color: colors.muted, fontWeight: "800", textAlign: "center", marginBottom: spacing.sm },
  item: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.ivory, alignItems: "center", justifyContent: "center" },
  label: { color: colors.forest, fontSize: 16, fontWeight: "800" },
  destructive: { color: colors.danger },
  cancel: { minHeight: 52, alignItems: "center", justifyContent: "center" },
  cancelText: { color: colors.muted, fontWeight: "800" },
});
