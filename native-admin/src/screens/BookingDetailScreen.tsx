import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppScreen from "../components/AppScreen";
import ConfirmModal from "../components/ConfirmModal";
import ErrorState from "../components/ErrorState";
import { useApp } from "../app/AppProvider";
import { useAuth } from "../app/AuthProvider";
import { setBookingStatus } from "../features/bookings/bookings.api";
import { formatDateTime } from "../lib/dates";
import { getErrorMessage, logAppError } from "../lib/errors";
import { openWhatsApp } from "../lib/whatsapp";
import type { Booking, BookingStatus } from "../lib/types";
import { colors, spacing } from "../theme";

export default function BookingDetailScreen({ route, navigation }: { route: { params: { booking: Booking } }; navigation: any }) {
  const booking = route.params.booking;
  const { profile } = useAuth();
  const { showToast } = useApp();
  const [pending, setPending] = useState<BookingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus() {
    if (!pending || !profile) return;
    setLoading(true);
    setError("");
    try {
      await setBookingStatus(booking.id, pending, profile.userId);
      showToast("预约状态已更新", "success");
      navigation.goBack();
    } catch (err) {
      logAppError("Native booking status failed", err);
      setError(getErrorMessage(err, "Booking update failed"));
    } finally {
      setLoading(false);
      setPending(null);
    }
  }

  return (
    <AppScreen title="预约详情" subtitle={booking.contact || "Booking"}>
      <AppCard title={booking.contact || "未填写电话"} subtitle={formatDateTime(booking.booking_date, booking.booking_time)}>
        <Text style={styles.row}>套餐：{booking.package_name || booking.package_code || booking.package_type || "Package"}</Text>
        <Text style={styles.row}>金额：RM{booking.amount ?? 0}</Text>
        <Text style={styles.row}>状态：{booking.status}</Text>
        <Text style={styles.row}>备注：{booking.notes || "无"}</Text>
      </AppCard>
      {error ? <ErrorState title="Booking update failed" details={error} /> : null}
      <View style={styles.actions}>
        <AppButton onPress={() => setPending("confirmed")}>Confirm</AppButton>
        <AppButton onPress={() => setPending("completed")}>Complete</AppButton>
        <AppButton tone="danger" onPress={() => setPending("cancelled")}>Cancel</AppButton>
        <AppButton tone="secondary" onPress={() => openWhatsApp(booking.contact).catch((err) => setError(getErrorMessage(err, "WhatsApp failed")))}>WhatsApp</AppButton>
      </View>
      <ConfirmModal visible={Boolean(pending)} title="确认更新预约状态？" message={pending ? `将状态改为 ${pending}` : ""} confirmLabel="确认更新" danger={pending === "cancelled"} loading={loading} onCancel={() => setPending(null)} onConfirm={updateStatus} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: { color: colors.forest, lineHeight: 22 },
  actions: { gap: spacing.sm },
});
