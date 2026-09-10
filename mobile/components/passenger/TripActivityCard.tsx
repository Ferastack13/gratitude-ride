import { Badge } from "@/components/ui/Badge";
import { colors, typography } from "@/constants/theme";
import type { Delivery } from "@/lib/deliveries";
import {
  formatCurrency,
  formatStatus,
  shortAddress,
  statusTone,
} from "@/lib/format";
import { rideTypeFromNotes } from "@/lib/ride-matching";
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
        styles.row,
        active && styles.rowActive,
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={{ flex: 1, gap: 4 }}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowActive: {
    backgroundColor: colors.primarySoft,
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  route: { ...typography.bodyStrong, fontSize: 14 },
  meta: { ...typography.supporting, fontSize: 12 },
});
