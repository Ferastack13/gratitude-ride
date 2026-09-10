import { Badge } from "@/components/ui/Badge";
import { colors, radii, shadows } from "@/constants/theme";
import type { Delivery } from "@/lib/deliveries";
import {
  formatCurrency,
  formatStatus,
  shortAddress,
  statusTone,
} from "@/lib/format";
import { rideTypeFromNotes } from "@/lib/ride-matching";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ACTIVE = new Set(["pending", "accepted", "picked_up", "in_transit"]);

type Props = {
  delivery: Delivery;
  onPress: () => void;
};

export function TripActivityCard({ delivery, onPress }: Props) {
  const active = ACTIVE.has(delivery.status);
  const when = delivery.created_at
    ? new Date(delivery.created_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.badgeIcon, active && styles.badgeIconOn]}>
          <Ionicons
            name={active ? "navigate" : "checkmark-circle"}
            size={18}
            color={active ? colors.primary : colors.success}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.route} numberOfLines={1}>
            {shortAddress(delivery.pickup_address)} →{" "}
            {shortAddress(delivery.delivery_address)}
          </Text>
          <Text style={styles.meta}>
            {rideTypeFromNotes(delivery.notes)} ·{" "}
            {formatCurrency(delivery.estimated_fee)}
            {when ? ` · ${when}` : ""}
          </Text>
        </View>
        <Badge
          label={formatStatus(delivery.status)}
          tone={statusTone(delivery.status)}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.card,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIconOn: { backgroundColor: colors.white },
  route: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12, fontWeight: "600", marginTop: 3 },
});
