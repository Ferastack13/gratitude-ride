import { colors, radii, shadows } from "@/constants/theme";
import { formatCurrency, shortAddress } from "@/lib/format";
import type { Delivery } from "@/lib/deliveries";
import { distanceKm } from "@/lib/geo";
import { estimateEtaMinutes, formatEta } from "@/lib/eta";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const OFFER_SECONDS = 25;

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

  const meta = useMemo(() => {
    if (!order?.pickup_lat || !order?.delivery_lat) {
      return { km: 0, eta: "—" };
    }
    const km = distanceKm(
      { lat: order.pickup_lat, lng: order.pickup_lng! },
      { lat: order.delivery_lat, lng: order.delivery_lng! }
    );
    return { km, eta: formatEta(estimateEtaMinutes(km, "pending")) };
  }, [order]);

  if (!order) return null;

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.handle} />
          <View style={styles.timerTrack}>
            <Animated.View style={[styles.timerFill, { width }]} />
          </View>

          <View style={styles.topMeta}>
            <Text style={styles.eyebrow}>New trip request · {left}s</Text>
            <Text style={styles.fee}>{formatCurrency(order.estimated_fee)}</Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>
                {meta.km ? `${meta.km.toFixed(1)} km` : "—"}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{meta.eta}</Text>
              <Text style={styles.statLabel}>ETA</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{order.city}</Text>
              <Text style={styles.statLabel}>Area</Text>
            </View>
          </View>

          <View style={styles.route}>
            <View style={styles.routeRow}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.addr} numberOfLines={2}>
                  {shortAddress(order.pickup_address)}
                </Text>
              </View>
            </View>
            <View style={styles.rail} />
            <View style={styles.routeRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>Drop-off</Text>
                <Text style={styles.addr} numberOfLines={2}>
                  {shortAddress(order.delivery_address)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.decline} onPress={onDecline}>
              <Ionicons name="close" size={20} color={colors.dark} />
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
            <Pressable
              style={styles.accept}
              onPress={onAccept}
              disabled={accepting}
            >
              <Text style={styles.acceptText}>
                {accepting ? "Accepting…" : "Accept trip"}
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
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
    gap: 12,
    ...shadows.float,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  timerTrack: {
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  timerFill: { height: "100%", backgroundColor: colors.primary },
  topMeta: { gap: 2 },
  eyebrow: {
    color: colors.muted,
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  fee: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -1,
  },
  stats: { flexDirection: "row", gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
  },
  statVal: { fontWeight: "900", color: colors.dark, fontSize: 14 },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2, fontWeight: "600" },
  route: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  rail: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  addr: { color: colors.dark, fontWeight: "700", fontSize: 14, marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  decline: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  declineText: { fontWeight: "800", color: colors.dark },
  accept: {
    flex: 1.6,
    minHeight: 54,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  acceptText: { fontWeight: "900", color: colors.white, fontSize: 16 },
});
