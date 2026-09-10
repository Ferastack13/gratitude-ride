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
import {
  formatLocationAge,
  isDriverLocationStale,
  type DriverLiveLocation,
} from "@/lib/driver-location";
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

const TRACK_LIVE_STATUSES = new Set([
  "accepted",
  "picked_up",
  "in_transit",
]);

export default function PassengerTrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [riderName, setRiderName] = useState("Driver");
  const [riderPhone, setRiderPhone] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [driverLive, setDriverLive] = useState<DriverLiveLocation | null>(
    null
  );
  const [routeCoords, setRouteCoords] = useState<
    { lat: number; lng: number }[] | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rated, setRated] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [locationTick, setLocationTick] = useState(0);

  const hydrateDriver = useCallback(async (riderRowId: string) => {
    const { data: rider } = await supabase
      .from("riders")
      .select(
        "user_id, rating, vehicle_type, current_lat, current_lng, location_updated_at"
      )
      .eq("id", riderRowId)
      .maybeSingle();
    setVehicleType(rider?.vehicle_type ?? null);
    setRating(rider?.rating != null ? Number(rider.rating) : null);
    if (
      rider?.current_lat != null &&
      rider?.current_lng != null &&
      Number.isFinite(Number(rider.current_lat)) &&
      Number.isFinite(Number(rider.current_lng))
    ) {
      setDriverLive({
        lat: Number(rider.current_lat),
        lng: Number(rider.current_lng),
        updatedAt: rider.location_updated_at ?? null,
      });
    }
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

    if (data.rider_id && data.status !== "pending") {
      await hydrateDriver(data.rider_id);
    } else {
      setDriverLive(null);
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

  /** Delivery status realtime (Phase 1). */
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
            if (next.status === "pending" || !next.rider_id) {
              setDriverLive(null);
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [delivery?.id, hydrateDriver]);

  /**
   * Live GPS for the assigned rider only (`delivery.rider_id`).
   * Pending → no driver marker. Delivered → stop listening.
   */
  useEffect(() => {
    const riderId = delivery?.rider_id;
    const status = delivery?.status;
    if (!riderId || !status || !TRACK_LIVE_STATUSES.has(status)) {
      if (status === "pending" || status === "delivered" || !riderId) {
        // keep last known coords only while active; clear on pending
        if (status === "pending" || !riderId) setDriverLive(null);
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data } = await supabase
        .from("riders")
        .select("current_lat, current_lng, location_updated_at")
        .eq("id", riderId)
        .maybeSingle();
      if (cancelled) return;
      if (data?.current_lat != null && data?.current_lng != null) {
        setDriverLive({
          lat: Number(data.current_lat),
          lng: Number(data.current_lng),
          updatedAt: data.location_updated_at ?? null,
        });
      }
    })();

    const channel = supabase
      .channel(`passenger-driver-gps-${delivery!.id}-${riderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "riders",
          filter: `id=eq.${riderId}`,
        },
        (payload) => {
          const row = payload.new as {
            current_lat?: number | null;
            current_lng?: number | null;
            location_updated_at?: string | null;
          } | null;
          if (
            row?.current_lat == null ||
            row?.current_lng == null ||
            !Number.isFinite(Number(row.current_lat)) ||
            !Number.isFinite(Number(row.current_lng))
          ) {
            return;
          }
          setDriverLive({
            lat: Number(row.current_lat),
            lng: Number(row.current_lng),
            updatedAt: row.location_updated_at ?? new Date().toISOString(),
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [delivery?.id, delivery?.rider_id, delivery?.status]);

  /** Refresh "Updated Xs ago" copy while watching live GPS. */
  useEffect(() => {
    if (!delivery?.status || !TRACK_LIVE_STATUSES.has(delivery.status)) return;
    const t = setInterval(() => setLocationTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, [delivery?.status]);

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
  const showLiveDriver =
    Boolean(delivery.rider_id) && TRACK_LIVE_STATUSES.has(delivery.status);
  const hasFreshDriver =
    showLiveDriver &&
    driverLive != null &&
    !isDriverLocationStale(driverLive.updatedAt);
  const hasAnyDriverPoint =
    showLiveDriver &&
    driverLive != null &&
    Number.isFinite(driverLive.lat) &&
    Number.isFinite(driverLive.lng);

  const hasPickup = delivery.pickup_lat != null && delivery.pickup_lng != null;
  const hasDropoff =
    delivery.delivery_lat != null && delivery.delivery_lng != null;
  const center =
    hasPickup && hasDropoff
      ? {
          lat: (delivery.pickup_lat! + delivery.delivery_lat!) / 2,
          lng: (delivery.pickup_lng! + delivery.delivery_lng!) / 2,
        }
      : hasPickup
        ? { lat: delivery.pickup_lat!, lng: delivery.pickup_lng! }
        : hasDropoff
          ? { lat: delivery.delivery_lat!, lng: delivery.delivery_lng! }
          : hasAnyDriverPoint
            ? { lat: driverLive!.lat, lng: driverLive!.lng }
            : { lat: 0, lng: 0 };

  void locationTick; // keep age label reactive

  const locationLabel = !showLiveDriver
    ? null
    : !hasAnyDriverPoint
      ? "Waiting for driver’s location…"
      : isDriverLocationStale(driverLive!.updatedAt)
        ? "Waiting for driver’s location update"
        : formatLocationAge(driverLive!.updatedAt);

  return (
    <MapShell
      map={
        <RouteMap
          fullBleed
          live={Boolean(hasFreshDriver)}
          center={center}
          pickup={
            hasPickup
              ? {
                  lat: delivery.pickup_lat!,
                  lng: delivery.pickup_lng!,
                  label: "Pickup",
                }
              : undefined
          }
          dropoff={
            hasDropoff
              ? {
                  lat: delivery.delivery_lat!,
                  lng: delivery.delivery_lng!,
                  label: "Drop-off",
                }
              : undefined
          }
          driver={
            hasAnyDriverPoint
              ? {
                  lat: driverLive!.lat,
                  lng: driverLive!.lng,
                  label: "Driver",
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
                pickupLabel={delivery.pickup_address}
                dropoffLabel={delivery.delivery_address}
                rideType={rideTypeFromNotes(delivery.notes)}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.cancelRideBtn,
                  cancelling && { opacity: 0.6 },
                  pressed && { opacity: 0.85 },
                ]}
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
              <View style={styles.driverPanel}>
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
                {locationLabel ? (
                  <View style={styles.livePill}>
                    <View
                      style={[
                        styles.liveDot,
                        hasFreshDriver
                          ? { backgroundColor: colors.success }
                          : { backgroundColor: colors.warning },
                      ]}
                    />
                    <Text style={styles.liveLine}>{locationLabel}</Text>
                  </View>
                ) : null}
                <View style={styles.driverMeta}>
                  <Text style={styles.metaLine}>
                    Vehicle · {vehicleType ?? "Car"}
                  </Text>
                  <Text style={styles.metaLine}>
                    Fare · {formatCurrency(delivery.estimated_fee)}
                  </Text>
                </View>
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
  etaText: { fontWeight: "600", color: colors.dark },
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
  stageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
    letterSpacing: -0.2,
  },
  stageDetail: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    fontWeight: "400",
  },
  driverCard: { gap: 8 },
  driverPanel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 14,
    gap: 12,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveLine: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.dark,
    flex: 1,
  },
  driverMeta: {
    gap: 4,
  },
  metaLine: { color: colors.muted, fontWeight: "400", fontSize: 13 },
  stops: {
    gap: 10,
    paddingVertical: 4,
  },
  stop: { color: colors.dark, fontSize: 13, lineHeight: 18, fontWeight: "500" },
  dotGreen: { color: colors.primary, fontWeight: "700" },
  dotGold: { color: colors.secondaryDark, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
  },
  actionText: { fontWeight: "600", color: colors.dark },
  cancelRideBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
  },
  cancelRideText: { fontWeight: "600", color: colors.danger },
});
