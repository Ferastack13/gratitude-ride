import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { colors, radii } from "@/constants/theme";
import type { Delivery } from "@/lib/deliveries";
import {
  formatCurrency,
  formatStatus,
  statusTone,
} from "@/lib/format";
import { supabase } from "@/lib/supabase";
import {
  PASSENGER_TIMELINE_LABELS,
  TRIP_STAGE_COPY,
  tripStageFromStatus,
} from "@/lib/trip-status";
import { StatusTimeline } from "@/components/delivery/StatusTimeline";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

function rideTypeFromNotes(notes: string | null | undefined) {
  const n = (notes ?? "").toLowerCase();
  if (n.includes("express")) return "Express";
  if (n.includes("comfort") || n.includes("care")) return "Comfort";
  return "Standard";
}

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("tracking_id", String(id))
      .maybeSingle();
    setDelivery(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!delivery) {
    return (
      <Screen>
        <EmptyState
          title="Trip not found"
          message="This trip may have been removed."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const stage = tripStageFromStatus(delivery.status);
  const active = ["pending", "accepted", "picked_up", "in_transit"].includes(
    delivery.status
  );

  return (
    <Screen>
      <ScreenHeader
        title="Trip details"
        subtitle={delivery.tracking_id}
        onBack={() => router.back()}
        right={
          <Badge
            label={formatStatus(delivery.status)}
            tone={statusTone(delivery.status)}
          />
        }
      />

      <View style={styles.card}>
        <Text style={styles.stage}>{TRIP_STAGE_COPY[stage].title}</Text>
        <Text style={styles.detail}>{TRIP_STAGE_COPY[stage].detail}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pickup</Text>
        <Text style={styles.value}>{delivery.pickup_address}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Destination</Text>
        <Text style={styles.value}>{delivery.delivery_address}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>Ride type</Text>
          <Text style={styles.metaValue}>
            {rideTypeFromNotes(delivery.notes)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>Fare</Text>
          <Text style={styles.metaValue}>
            {formatCurrency(
              Number(delivery.actual_fee ?? delivery.estimated_fee)
            )}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>When</Text>
          <Text style={styles.metaValue}>
            {delivery.created_at
              ? new Date(delivery.created_at).toLocaleString()
              : "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>City</Text>
          <Text style={styles.metaValue}>{delivery.city}</Text>
        </View>
      </View>

      <StatusTimeline
        status={delivery.status}
        labels={PASSENGER_TIMELINE_LABELS}
      />

      {active ? (
        <Button
          label="Open live tracking"
          onPress={() =>
            router.push(`/passenger/track/${delivery.tracking_id}` as never)
          }
        />
      ) : (
        <Button
          label="Book again"
          variant="outline"
          onPress={() => router.push("/passenger/where-to" as never)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  stage: { fontWeight: "900", fontSize: 18, color: colors.dark },
  detail: { color: colors.muted, lineHeight: 20 },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  value: { fontWeight: "700", color: colors.dark, lineHeight: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  metaLabel: { color: colors.muted, fontWeight: "600" },
  metaValue: { fontWeight: "800", color: colors.dark, flexShrink: 1, textAlign: "right" },
});
