import { RouteMap } from "@/components/maps/RouteMap";
import { FindingCourier } from "@/components/workflow/FindingCourier";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { pushRecentPlace } from "@/lib/client-prefs";
import { createTrackingId, ensureClientId } from "@/lib/deliveries";
import { formatCurrency } from "@/lib/format";
import { placeParams, resolveCurrentLocation } from "@/lib/location";
import type { LivePlace } from "@/lib/places";
import {
  quotePickupEtaMin,
  quoteRideFare,
  RIDE_OPTIONS,
  rideOptionById,
  type RideOptionId,
} from "@/lib/ride-options";
import { fetchDrivingRoute, type RouteResult } from "@/lib/routing";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function placeFrom(
  lat?: string,
  lng?: string,
  title?: string,
  address?: string,
  city?: string
): LivePlace | null {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  return {
    id: `${la}-${ln}`,
    title: title || "Location",
    subtitle: city || "Nigeria",
    address: address || title || "Location",
    lat: la,
    lng: ln,
    city,
  };
}

export default function PassengerPlanScreen() {
  const { profile } = useAuth();
  const params = useLocalSearchParams<{
    pickupLat?: string;
    pickupLng?: string;
    pickupTitle?: string;
    pickupAddress?: string;
    pickupCity?: string;
    dropoffLat?: string;
    dropoffLng?: string;
    dropoffTitle?: string;
    dropoffAddress?: string;
    dropoffCity?: string;
    serviceId?: string;
  }>();

  const [pickup, setPickup] = useState<LivePlace | null>(() =>
    placeFrom(
      params.pickupLat,
      params.pickupLng,
      params.pickupTitle,
      params.pickupAddress,
      params.pickupCity
    )
  );
  const [dropoff, setDropoff] = useState<LivePlace | null>(() =>
    placeFrom(
      params.dropoffLat,
      params.dropoffLng,
      params.dropoffTitle,
      params.dropoffAddress,
      params.dropoffCity
    )
  );
  const [rideId, setRideId] = useState<RideOptionId>(
    (params.serviceId as RideOptionId) || "standard"
  );
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routing, setRouting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const option = useMemo(() => rideOptionById(rideId), [rideId]);

  useEffect(() => {
    if (!pickup || !dropoff) {
      setRouting(false);
      return;
    }
    let cancelled = false;
    setRouting(true);
    fetchDrivingRoute(pickup, dropoff).then((r) => {
      if (!cancelled) {
        setRoute(r);
        setRouting(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  const fare = route ? quoteRideFare(route.distanceKm, option) : 0;
  const driveMin = route?.durationMin ?? 0;
  const pickupEta = route ? quotePickupEtaMin(driveMin, option) : 0;

  const editLocation = (which: "pickup" | "dropoff") => {
    router.push({
      pathname: "/passenger/where-to",
      params: {
        ...(pickup ? placeParams(pickup, "pickup") : {}),
        ...(dropoff ? placeParams(dropoff, "dropoff") : {}),
        focus: which,
      },
    } as never);
  };

  const recenter = async () => {
    const res = await resolveCurrentLocation();
    if (res.ok) setPickup(res.place);
    else Alert.alert("Location", res.message);
  };

  const confirmRide = async () => {
    if (!profile?.id || !pickup || !dropoff || !route || submitting) return;
    setSubmitting(true);
    try {
      const clientId = await ensureClientId(profile.id);
      const id = await createTrackingId();
      const city =
        dropoff.city || pickup.city || dropoff.state || pickup.state || "Nigeria";

      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          client_id: clientId,
          tracking_id: id,
          city,
          pickup_address: pickup.address,
          delivery_address: dropoff.address,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          delivery_lat: dropoff.lat,
          delivery_lng: dropoff.lng,
          package_description: `${option.title} ride`,
          notes: `${option.title} · ${pickup.title} → ${dropoff.title} · ${route.distanceKm.toFixed(1)} km · pricing:local`,
          estimated_fee: fare,
          status: "pending",
        })
        .select("tracking_id")
        .single();
      if (error) throw error;

      await pushRecentPlace(dropoff);
      setTrackingId(data.tracking_id);
      setMatching(true);
      setTimeout(() => {
        router.replace(`/passenger/track/${data.tracking_id}` as never);
      }, 2400);
    } catch (err) {
      Alert.alert(
        "Request failed",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!pickup || !dropoff) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Pickup and destination are required.</Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.replace("/passenger/where-to" as never)}
        >
          <Text style={styles.primaryText}>Choose locations</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (matching) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.matching}>
          <FindingCourier
            city={dropoff.city || pickup.city || "your area"}
            trackingId={trackingId ?? undefined}
            title="Finding your driver"
            subtitle={`Matching a ${option.title} driver near you. This usually takes under a minute.`}
          />
          <Pressable
            style={styles.cancelGhost}
            onPress={() => router.replace("/passenger" as never)}
          >
            <Text style={styles.cancelText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.mapPane}>
        <RouteMap
          fullBleed
          center={{ lat: pickup.lat, lng: pickup.lng }}
          pickup={{ lat: pickup.lat, lng: pickup.lng, label: "Pickup" }}
          dropoff={{ lat: dropoff.lat, lng: dropoff.lng, label: "Drop-off" }}
          routeCoords={route?.coords}
          onRecenter={recenter}
        />
        <SafeAreaView edges={["top"]} style={styles.mapTop} pointerEvents="box-none">
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.dark} />
          </Pressable>
        </SafeAreaView>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.stops}>
            <View style={styles.stopRow}>
              <View style={[styles.stopDot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stopLabel}>Pickup</Text>
                <Text style={styles.stopValue} numberOfLines={1}>
                  {pickup.title}
                </Text>
              </View>
              <Pressable onPress={() => editLocation("pickup")}>
                <Text style={styles.edit}>Edit</Text>
              </Pressable>
            </View>
            <View style={styles.stopRail} />
            <View style={styles.stopRow}>
              <View
                style={[styles.stopDot, { backgroundColor: colors.secondaryDark }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.stopLabel}>Destination</Text>
                <Text style={styles.stopValue} numberOfLines={1}>
                  {dropoff.title}
                </Text>
              </View>
              <Pressable onPress={() => editLocation("dropoff")}>
                <Text style={styles.edit}>Edit</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.metaRow}>
            {routing ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.meta}>
                  {route ? `${route.distanceKm.toFixed(1)} km` : "—"}
                </Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.meta}>
                  {route ? `${driveMin} min trip` : "—"}
                </Text>
                {route?.source === "estimate" ? (
                  <Text style={styles.metaHint}> · estimate</Text>
                ) : null}
              </>
            )}
          </View>

          <Text style={styles.section}>Choose a ride</Text>
          {RIDE_OPTIONS.map((opt) => {
            const selected = opt.id === rideId;
            const optFare = route ? quoteRideFare(route.distanceKm, opt) : 0;
            const optEta = route ? quotePickupEtaMin(driveMin, opt) : 0;
            return (
              <Pressable
                key={opt.id}
                style={[styles.option, selected && styles.optionOn]}
                onPress={() => setRideId(opt.id)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={opt.icon} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionDesc}>{opt.description}</Text>
                  <Text style={styles.optionEta}>{optEta} min away</Text>
                </View>
                <Text style={styles.optionFare}>
                  {route ? formatCurrency(optFare) : "—"}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryLabel}>Estimated fare</Text>
              <Text style={styles.summaryFare}>
                {routing ? "…" : formatCurrency(fare)}
              </Text>
              <Text style={styles.pricingNote}>
                Local quote · connect backend pricing later
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.summaryLabel}>Driver ETA</Text>
              <Text style={styles.summaryEta}>{pickupEta} min</Text>
            </View>
          </View>

          <Pressable
            style={[styles.primaryBtn, (submitting || routing) && { opacity: 0.6 }]}
            disabled={submitting || routing || !route}
            onPress={confirmRide}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryText}>Confirm Ride</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 18,
    justifyContent: "center",
    gap: 16,
  },
  missing: { textAlign: "center", color: colors.muted, fontWeight: "600" },
  mapPane: { flex: 1.1, minHeight: 240 },
  mapTop: { position: "absolute", top: 0, left: 0, right: 0, padding: 12 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sheet: {
    flex: 1.25,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
    ...shadows.float,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  sheetBody: { padding: 16, paddingBottom: 36, gap: 10 },
  stops: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 12,
  },
  stopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stopDot: { width: 10, height: 10, borderRadius: 5 },
  stopLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  stopValue: { fontWeight: "800", color: colors.dark, marginTop: 2 },
  stopRail: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  edit: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 22,
  },
  meta: { fontWeight: "700", color: colors.dark, fontSize: 13 },
  metaDot: { color: colors.muted },
  metaHint: { color: colors.muted, fontSize: 12 },
  section: { fontWeight: "900", fontSize: 16, color: colors.dark, marginTop: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  optionDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  optionEta: { color: colors.primaryDark, fontSize: 12, fontWeight: "700", marginTop: 2 },
  optionFare: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 8,
  },
  summaryLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  summaryFare: { fontSize: 26, fontWeight: "900", color: colors.dark },
  summaryEta: { fontSize: 22, fontWeight: "900", color: colors.dark },
  pricingNote: { color: colors.mutedLight, fontSize: 11, marginTop: 2 },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: { color: colors.white, fontWeight: "900", fontSize: 16 },
  matching: { flex: 1, justifyContent: "center", padding: 24, gap: 20 },
  cancelGhost: { alignItems: "center", padding: 12 },
  cancelText: { color: colors.muted, fontWeight: "700" },
});
