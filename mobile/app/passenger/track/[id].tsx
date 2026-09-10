import { StatusTimeline } from "@/components/delivery/StatusTimeline";
import { RouteMap } from "@/components/maps/RouteMap";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Card";
import { ContactBar } from "@/components/workflow/ContactBar";
import { FindingCourier } from "@/components/workflow/FindingCourier";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { RateSheet } from "@/components/workflow/RateSheet";
import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { distanceKm } from "@/lib/cities";
import type { Delivery } from "@/lib/deliveries";
import { estimateEtaMinutes, formatEta } from "@/lib/eta";
import { formatCurrency, formatStatus, statusTone } from "@/lib/format";
import { fetchDrivingRoute } from "@/lib/routing";
import { cancelPendingDelivery, rideTypeFromNotes } from "@/lib/ride-matching";
import { supabase } from "@/lib/supabase";
import {
  PASSENGER_TIMELINE_LABELS,
  TRIP_STAGE_COPY,
  tripStageFromStatus,
} from "@/lib/trip-status";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PassengerTrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [riderName, setRiderName] = useState("Driver");
  const [riderPhone, setRiderPhone] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [routeCoords, setRouteCoords] = useState<
    { lat: number; lng: number }[] | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rated, setRated] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const hydrateDriver = useCallback(async (riderRowId: string) => {
    const { data: rider } = await supabase
      .from("riders")
      .select("user_id, rating, vehicle_type")
      .eq("id", riderRowId)
      .maybeSingle();
    setVehicleType(rider?.vehicle_type ?? null);
    setRating(rider?.rating != null ? Number(rider.rating) : null);
    if (rider?.user_id) {
      const { data: user } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("id", rider.user_id)
        .maybeSingle();
      setRiderName(user?.full_name?.split(" ")[0] ?? "Driver");
      setRiderPhone(user?.phone ?? null);
    }
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("tracking_id", String(id))
      .maybeSingle();

    if (queryError) {
      setError(queryError.message);
      setDelivery(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setDelivery(null);
      setError("Trip not found");
      setLoading(false);
      return;
    }

    setDelivery(data);

    if (
      data.pickup_lat != null &&
      data.delivery_lat != null &&
      data.pickup_lng != null &&
      data.delivery_lng != null
    ) {
      const route = await fetchDrivingRoute(
        { lat: data.pickup_lat, lng: data.pickup_lng },
        { lat: data.delivery_lat, lng: data.delivery_lng }
      );
      setRouteCoords(route.coords);
    }

    if (data.rider_id) {
      await hydrateDriver(data.rider_id);
    }

    if (profile?.id) {
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("delivery_id", data.id)
        .eq("reviewer_id", profile.id)
        .maybeSingle();
      setRated(Boolean(existing));
    }

    setLoading(false);
  }, [id, profile?.id, hydrateDriver]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!delivery?.id) return;
    const channel = supabase
      .channel(`passenger-track-${delivery.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
          filter: `id=eq.${delivery.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const next = payload.new as Delivery;
            setDelivery(next);
            if (next.rider_id && next.status !== "pending") {
              void hydrateDriver(next.rider_id);
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [delivery?.id, hydrateDriver]);

  const km = useMemo(() => {
    if (
      delivery?.pickup_lat == null ||
      delivery?.delivery_lat == null ||
      delivery?.pickup_lng == null ||
      delivery?.delivery_lng == null
    ) {
      return 6;
    }
    return distanceKm(
      { lat: delivery.pickup_lat, lng: delivery.pickup_lng },
      { lat: delivery.delivery_lat, lng: delivery.delivery_lng }
    );
  }, [delivery]);

  const eta = formatEta(estimateEtaMinutes(km, delivery?.status));

  const submitRating = async (value: number) => {
    if (!delivery || !profile?.id || !delivery.rider_id) return;
    setRatingBusy(true);
    try {
      const { data: rider } = await supabase
        .from("riders")
        .select("user_id, rating, total_deliveries")
        .eq("id", delivery.rider_id)
        .maybeSingle();
      if (!rider?.user_id) throw new Error("Driver unavailable for rating");

      const { error: reviewError } = await supabase.from("reviews").insert({
        delivery_id: delivery.id,
        reviewer_id: profile.id,
        reviewee_id: rider.user_id,
        rating: value,
      });
      if (reviewError) throw reviewError;

      const trips = Math.max(1, Number(rider.total_deliveries || 1));
      const nextRating =
        (Number(rider.rating || 5) * (trips - 1) + value) / trips;
      await supabase
        .from("riders")
        .update({ rating: Number(nextRating.toFixed(2)) })
        .eq("id", delivery.rider_id);

      setRated(true);
      Alert.alert("Thanks", "Your rating helps keep Gratitude Ride excellent.");
    } catch (err) {
      Alert.alert(
        "Could not rate",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setRatingBusy(false);
    }
  };

  const cancelRide = async () => {
    if (!delivery || delivery.status !== "pending" || cancelling) return;
    Alert.alert(
      "Cancel ride?",
      "Your request is still waiting for a driver. Cancel this trip?",
      [
        { text: "Keep waiting", style: "cancel" },
        {
          text: "Cancel ride",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelPendingDelivery(delivery.tracking_id);
              Alert.alert("Cancelled", "Your ride request was cancelled.");
              router.replace("/passenger" as never);
            } catch (err) {
              Alert.alert(
                "Could not cancel",
                err instanceof Error ? err.message : "Try again."
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
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
          message={error || "Check the trip ID and try again."}
          actionLabel="Activity"
          onAction={() => router.replace("/passenger/activity" as never)}
        />
      </View>
    );
  }

  const stage = tripStageFromStatus(delivery.status);
  const stageCopy = TRIP_STAGE_COPY[stage];
  const searching = delivery.status === "pending";
  const hasCoords =
    delivery.pickup_lat != null && delivery.delivery_lat != null;
  const center = hasCoords
    ? {
        lat: (delivery.pickup_lat! + delivery.delivery_lat!) / 2,
        lng: (delivery.pickup_lng! + delivery.delivery_lng!) / 2,
      }
    : { lat: 6.5244, lng: 3.3792 };

  return (
    <MapShell
      map={
        <RouteMap
          fullBleed
          center={center}
          pickup={
            hasCoords
              ? {
                  lat: delivery.pickup_lat!,
                  lng: delivery.pickup_lng!,
                  label: "Pickup",
                }
              : undefined
          }
          dropoff={
            hasCoords
              ? {
                  lat: delivery.delivery_lat!,
                  lng: delivery.delivery_lng!,
                  label: "Drop-off",
                }
              : undefined
          }
          routeCoords={routeCoords}
        />
      }
      top={
        <View style={styles.topRow}>
          <Pressable
            style={styles.back}
            onPress={() => router.replace("/passenger" as never)}
          >
            <Ionicons name="arrow-back" size={18} color={colors.dark} />
          </Pressable>
          <View style={styles.etaPill}>
            <Ionicons name="time" size={14} color={colors.primary} />
            <Text style={styles.etaText}>{eta}</Text>
          </View>
          <Pressable
            style={styles.share}
            onPress={() =>
              Share.share({
                message: `Track my Gratitude Ride trip ${delivery.tracking_id}`,
              })
            }
          >
            <Ionicons name="share-social" size={16} color={colors.dark} />
          </Pressable>
        </View>
      }
      sheet={
        <ScrollView
          style={{ maxHeight: 460 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
        >
          <SheetHandle />
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stageTitle}>{stageCopy.title}</Text>
              <Text style={styles.stageDetail}>{stageCopy.detail}</Text>
            </View>
            <Badge
              label={formatStatus(delivery.status)}
              tone={statusTone(delivery.status)}
            />
          </View>

          {searching ? (
            <>
              <FindingCourier
                city={delivery.city}
                trackingId={delivery.tracking_id}
                title="Finding your driver"
                subtitle="Waiting for a nearby driver to accept. This screen updates automatically when someone claims your ride."
              />
              <Pressable
                style={[styles.cancelRideBtn, cancelling && { opacity: 0.6 }]}
                onPress={cancelRide}
                disabled={cancelling}
              >
                <Text style={styles.cancelRideText}>
                  {cancelling ? "Cancelling…" : "Cancel ride"}
                </Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.driverCard}>
              <ContactBar
                name={riderName}
                phone={riderPhone}
                subtitle={[
                  rideTypeFromNotes(delivery.notes),
                  vehicleType ? vehicleType : "Driver",
                  rating != null ? `★ ${rating.toFixed(1)}` : null,
                  formatCurrency(delivery.estimated_fee),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <View style={styles.driverMeta}>
                <Text style={styles.metaLine}>
                  Vehicle · {vehicleType ?? "Car"}
                </Text>
                <Text style={styles.metaLine}>
                  Plate · {vehicleType ? "On file with driver" : "—"}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.stops}>
            <Text style={styles.stop}>
              <Text style={styles.dotGreen}>● </Text>
              {delivery.pickup_address}
            </Text>
            <Text style={styles.stop}>
              <Text style={styles.dotGold}>● </Text>
              {delivery.delivery_address}
            </Text>
          </View>

          <StatusTimeline
            status={delivery.status}
            labels={PASSENGER_TIMELINE_LABELS}
          />

          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => Linking.openURL("https://wa.me/2348000000000")}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.actionText}>Safety</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => Linking.openURL("https://wa.me/2348000000000")}
            >
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.actionText}>Help</Text>
            </Pressable>
          </View>

          {delivery.status === "delivered" && !rated && delivery.rider_id ? (
            <RateSheet
              title="Trip complete"
              submitting={ratingBusy}
              onSubmit={(value) => submitRating(value)}
            />
          ) : null}
        </ScrollView>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pad: { flex: 1, padding: 18, justifyContent: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  back: {
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  etaText: { fontWeight: "800", color: colors.dark },
  share: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  stageTitle: { fontSize: 18, fontWeight: "900", color: colors.dark },
  stageDetail: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  driverCard: { gap: 8 },
  driverMeta: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 12,
    gap: 4,
  },
  metaLine: { color: colors.dark, fontWeight: "600", fontSize: 13 },
  stops: { gap: 8 },
  stop: { color: colors.dark, fontSize: 13, lineHeight: 18 },
  dotGreen: { color: colors.primary, fontWeight: "900" },
  dotGold: { color: colors.secondaryDark, fontWeight: "900" },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
  },
  actionText: { fontWeight: "800", color: colors.primaryDark },
  cancelRideBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cancelRideText: { fontWeight: "800", color: colors.danger },
});
