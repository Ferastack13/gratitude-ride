import { colors, radii } from "@/constants/theme";
import { formatCurrency, shortAddress } from "@/lib/format";
import type { Delivery } from "@/lib/deliveries";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const OFFER_SECONDS = 20;

/** Timed incoming job offer — Uber/Bolt driver request pattern for couriers. */
export function JobOfferModal({
  order,
  visible,
  onAccept,
  onDecline,
  accepting,
}: {
  order: Delivery | null;
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  accepting?: boolean;
}) {
  const [left, setLeft] = useState(OFFER_SECONDS);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible || !order) return;
    setLeft(OFFER_SECONDS);
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: OFFER_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    const tick = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          onDecline();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [visible, order?.id]);

  if (!order) return null;

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.timerTrack}>
            <Animated.View style={[styles.timerFill, { width }]} />
          </View>
          <Text style={styles.eyebrow}>New delivery · {left}s</Text>
          <Text style={styles.fee}>{formatCurrency(order.estimated_fee)}</Text>
          <Text style={styles.id}>{order.tracking_id}</Text>
          <View style={styles.route}>
            <View style={styles.row}>
              <Ionicons name="locate" size={16} color={colors.primary} />
              <Text style={styles.addr} numberOfLines={1}>
                {shortAddress(order.pickup_address)}
              </Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="flag" size={16} color={colors.secondaryDark} />
              <Text style={styles.addr} numberOfLines={1}>
                {shortAddress(order.delivery_address)}
              </Text>
            </View>
          </View>
          <Text style={styles.city}>{order.city} · upfront payout</Text>
          <View style={styles.actions}>
            <Pressable style={styles.decline} onPress={onDecline}>
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
            <Pressable
              style={styles.accept}
              onPress={onAccept}
              disabled={accepting}
            >
              <Text style={styles.acceptText}>
                {accepting ? "Accepting…" : "Accept"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 20,
    gap: 10,
  },
  timerTrack: {
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  timerFill: { height: "100%", backgroundColor: colors.primary },
  eyebrow: {
    color: colors.muted,
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  fee: { fontSize: 36, fontWeight: "900", color: colors.dark, letterSpacing: -1 },
  id: { fontFamily: "monospace", fontWeight: "800", color: colors.muted },
  route: { gap: 8, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  addr: { flex: 1, color: colors.dark, fontWeight: "600", fontSize: 14 },
  city: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  decline: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: { fontWeight: "800", color: colors.dark },
  accept: {
    flex: 1.4,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: { fontWeight: "800", color: colors.white, fontSize: 16 },
});
