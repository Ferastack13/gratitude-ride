import { Badge } from "@/components/ui/Badge";
import { colors, radii } from "@/constants/theme";
import { formatCurrency, formatStatus, shortAddress, statusTone } from "@/lib/format";
import type { Delivery } from "@/lib/deliveries";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function DeliveryCard({
  delivery,
  onPress,
  feeLabel = "Fee",
}: {
  delivery: Pick<
    Delivery,
    | "id"
    | "tracking_id"
    | "status"
    | "pickup_address"
    | "delivery_address"
    | "estimated_fee"
    | "city"
  >;
  onPress?: () => void;
  feeLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && { opacity: 0.92 }]}
    >
      <View style={styles.top}>
        <Text style={styles.id}>{delivery.tracking_id}</Text>
        <Badge label={formatStatus(delivery.status)} tone={statusTone(delivery.status)} />
      </View>
      <View style={styles.route}>
        <View style={styles.pinRow}>
          <Ionicons name="locate" size={14} color={colors.primary} />
          <Text style={styles.addr} numberOfLines={1}>
            {shortAddress(delivery.pickup_address)}
          </Text>
        </View>
        <View style={styles.pinRow}>
          <Ionicons name="flag" size={14} color={colors.secondaryDark} />
          <Text style={styles.addr} numberOfLines={1}>
            {shortAddress(delivery.delivery_address)}
          </Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.city}>{delivery.city}</Text>
        <Text style={styles.fee}>
          {feeLabel} {formatCurrency(delivery.estimated_fee)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  id: {
    fontFamily: "monospace",
    fontWeight: "800",
    color: colors.dark,
    fontSize: 14,
  },
  route: { gap: 8 },
  pinRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addr: { flex: 1, color: colors.muted, fontSize: 13 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  city: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  fee: { color: colors.primary, fontWeight: "800", fontSize: 14 },
});
