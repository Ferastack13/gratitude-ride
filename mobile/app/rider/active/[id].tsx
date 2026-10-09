import { StatusTimeline } from "@/components/delivery/StatusTimeline";
import { RouteMap } from "@/components/maps/RouteMap";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Card";
import { ContactBar } from "@/components/workflow/ContactBar";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { SlideAction } from "@/components/workflow/SlideAction";
import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { distanceKm } from "@/lib/cities";
import {
  ensureRiderId,
  nextStatus,
  TIMELINE_LABELS,
  type Delivery,
} from "@/lib/deliveries";
import { startDriverLocationPublisher } from "@/lib/driver-location";
import { estimateEtaMinutes, formatEta } from "@/lib/eta";
import { formatCurrency, formatStatus, statusTone } from "@/lib/format";
import { openNavigationChooser } from "@/lib/maps-nav";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

function slideLabel(status: Delivery["status"]) {
  const next = nextStatus(status);
  if (!next) return "Complete";
  switch (next) {
    case "picked_up":
      return "Slide to confirm pickup";
    case "in_transit":
      return "Slide to start trip";
    case "delivered":
      return "Slide to complete trip";
    case "accepted":
      return "Slide to accept";
    default:
      return `Slide to ${TIMELINE_LABELS[next].toLowerCase()}`;
  }
}

const LIVE_STATUSES = new Set(["accepted", "picked_up", "in_transit"]);
const NIGERIA = { lat: 9.082, lng: 8.6753 };

/** Only these forward steps are allowed from each status. */
const ALLOWED_NEXT: Partial<Record<Delivery["status"], Delivery["status"]>> = {
  accepted: "picked_up",
  picked_up: "in_transit",
  in_transit: "delivered",
};

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { width: winW } = useWindowDimensions();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [clientName, setClientName] = useState("Client");
  const [clientPhone, setClientPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selfCoords, setSelfCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", String(id))
      .maybeSingle();
    setDelivery(data);
    if (data?.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("user_id")
        .eq("id", data.client_id)
        .maybeSingle();
      if (client?.user_id) {
        const { data: user } = await supabase
          .from("users")
          .select("full_name, phone")
          .eq("id", client.user_id)
          .maybeSingle();
        setClientName(user?.full_name?.split(" ")[0] ?? "Client");
        setClientPhone(user?.phone ?? null);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /** Keep publishing real GPS while this trip is active. */
  useEffect(() => {
    if (!profile?.id || !delivery || !LIVE_STATUSES.has(delivery.status)) {
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const riderId = await ensureRiderId(profile.id);
      const result = await startDriverLocationPublisher(riderId, (coords) => {
        if (!cancelled) setSelfCoords(coords);
      });
      if (cancelled) {
        if ("stop" in result) result.stop();
        return;
      }
      if ("error" in result) return;
      stop = result.stop;
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [profile?.id, delivery?.id, delivery?.status]);

  const km = useMemo(() => {
    if (
      !delivery ||
      delivery.pickup_lat == null ||
      delivery.delivery_lat == null
    ) {
      return 5;
    }
    return distanceKm(
      { lat: delivery.pickup_lat, lng: delivery.pickup_lng! },
      { lat: delivery.delivery_lat, lng: delivery.delivery_lng! }
    );
  }, [delivery]);

  const advance = async () => {
    if (!delivery || !profile?.id || updating) return;
    const next = nextStatus(delivery.status);
    if (!next || ALLOWED_NEXT[delivery.status] !== next) {
      Alert.alert("Not ready", "Complete the current step first.");
      return;
    }
    setUpdating(true);
    try {
      const patch: Partial<Delivery> = { status: next };
      if (next === "delivered") {
        patch.delivered_at = new Date().toISOString();
        patch.actual_fee = delivery.estimated_fee;
      }
      // Ordered advance: only update if status is still the expected current one.
      const { data, error } = await supabase
        .from("deliveries")
        .update(patch)
        .eq("id", delivery.id)
        .eq("status", delivery.status)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        throw new Error("Trip status changed. Pull to refresh and try again.");
      }
      setDelivery(data);

      if (next === "delivered") {
        const { data: rider } = await supabase
          .from("riders")
          .select("id, earnings, total_deliveries")
          .eq("user_id", profile.id)
          .maybeSingle();
        if (rider) {
          await supabase
            .from("riders")
            .update({
              earnings:
                Number(rider.earnings || 0) + Number(delivery.estimated_fee),
              total_deliveries: Number(rider.total_deliveries || 0) + 1,
              is_available: false,
            })
            .eq("id", rider.id);
        }
        Alert.alert(
          "Trip complete",
          `You earned ${formatCurrency(delivery.estimated_fee)}`,
          [{ text: "Hub", onPress: () => router.replace("/rider") }]
        );
      }
    } catch (err) {
      Alert.alert(
        "Update failed",
        err instanceof Error ? err.message : "Try again."
      );
      await load();
    } finally {
      setUpdating(false);
    }
  };

  const navigateToNextStop = () => {
    if (!delivery) return;
    const toPickup = delivery.status === "accepted";
    const lat = toPickup ? delivery.pickup_lat : delivery.delivery_lat;
    const lng = toPickup ? delivery.pickup_lng : delivery.delivery_lng;
    const label = toPickup ? delivery.pickup_address : delivery.delivery_address;
    if (lat == null || lng == null) {
      Alert.alert("No coordinates", "This stop has no map pin yet.");
      return;
    }
    void openNavigationChooser({ lat, lng, label: label ?? undefined });
  };

  const onHelp = () => {
    Alert.alert("Need help?", "Choose an option", [
      {
        text: "WhatsApp support",
        onPress: () => Linking.openURL("https://wa.me/2348000000000"),
      },
      {
        text: "Safety",
        onPress: () => router.push("/passenger/safety" as never),
      },
      { text: "Close", style: "cancel" },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.pad}>
        <EmptyState
          title="Trip not found"
          message="This request may have been cancelled."
          actionLabel="Back to Home"
          onAction={() => router.replace("/rider")}
        />
      </View>
    );
  }

  const next = nextStatus(delivery.status);
  const hasCoords =
    delivery.pickup_lat != null && delivery.delivery_lat != null;
  const eta = formatEta(estimateEtaMinutes(km, delivery.status));
  const mapCenter = hasCoords
    ? {
        lat: (delivery.pickup_lat! + delivery.delivery_lat!) / 2,
        lng: (delivery.pickup_lng! + delivery.delivery_lng!) / 2,
      }
    : selfCoords
      ? selfCoords
      : delivery.pickup_lat != null
        ? { lat: delivery.pickup_lat, lng: delivery.pickup_lng! }
        : NIGERIA;

  return (
    <MapShell
      map={
        <RouteMap
          fullBleed
          live={Boolean(selfCoords)}
          center={mapCenter}
          height={Math.round(winW * 0.9)}
          pickup={
            delivery.pickup_lat != null
              ? {
                  lat: delivery.pickup_lat,
                  lng: delivery.pickup_lng!,
                  label: "Pickup",
                }
              : undefined
          }
          dropoff={
            delivery.delivery_lat != null
              ? {
                  lat: delivery.delivery_lat,
                  lng: delivery.delivery_lng!,
                  label: "Drop-off",
                }
              : undefined
          }
          driver={
            selfCoords
              ? {
                  lat: selfCoords.lat,
                  lng: selfCoords.lng,
                  label: "You",
                }
              : undefined
          }
        />
      }
      top={
        <View style={styles.topRow}>
          <Pressable style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.dark} />
          </Pressable>
          <View style={styles.etaPill}>
            <Ionicons name="navigate" size={14} color={colors.primary} />
            <Text style={styles.etaText}>
              {delivery.status === "accepted" ? "To pickup" : "To drop-off"} ·{" "}
              {eta}
            </Text>
          </View>
          <Pressable style={styles.topBtn} onPress={onHelp}>
            <Ionicons name="help-circle-outline" size={20} color={colors.dark} />
          </Pressable>
        </View>
      }
      sheet={
        <View style={{ gap: 12 }}>
          <SheetHandle />
          <View style={styles.head}>
            <View>
              <Text style={styles.id}>{delivery.tracking_id}</Text>
              <Text style={styles.payout}>
                {formatCurrency(delivery.estimated_fee)} payout
              </Text>
            </View>
            <Badge
              label={formatStatus(delivery.status)}
              tone={statusTone(delivery.status)}
            />
          </View>

          <ContactBar
            name={clientName}
            phone={clientPhone}
            subtitle="Passenger · call or WhatsApp if you need directions"
            whatsAppMessage={`Hi ${clientName}, I'm your Gratitude Ride driver for ${delivery.tracking_id}.`}
          />

          <Pressable
            style={({ pressed }) => [
              styles.navBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={navigateToNextStop}
          >
            <Ionicons name="map" size={18} color={colors.white} />
            <Text style={styles.navBtnText}>
              {delivery.status === "accepted"
                ? "Navigate to pickup"
                : "Navigate to drop-off"}
            </Text>
          </Pressable>

          <View style={styles.routeBlock}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeAddr} numberOfLines={2}>
              {delivery.pickup_address}
            </Text>
            <Text style={[styles.routeLabel, { marginTop: 10 }]}>Drop-off</Text>
            <Text style={styles.routeAddr} numberOfLines={2}>
              {delivery.delivery_address}
            </Text>
          </View>

          <StatusTimeline status={delivery.status} />

          {next && LIVE_STATUSES.has(delivery.status) ? (
            <SlideAction
              label={slideLabel(delivery.status)}
              disabled={updating}
              onConfirm={advance}
            />
          ) : delivery.status === "delivered" ? (
            <Text style={styles.done}>Trip completed</Text>
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pad: { flex: 1, padding: 18, justifyContent: "center" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  etaPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  etaText: { fontWeight: "800", color: colors.dark, fontSize: 13 },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  id: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 16,
    color: colors.dark,
  },
  payout: { color: colors.primary, fontWeight: "800", marginTop: 2 },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    minHeight: 48,
  },
  navBtnText: { color: colors.white, fontWeight: "900", fontSize: 15 },
  routeBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 14,
    gap: 2,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  routeAddr: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
    lineHeight: 20,
  },
  done: {
    textAlign: "center",
    fontWeight: "800",
    color: colors.primary,
    paddingVertical: 12,
  },
});
