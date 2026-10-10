import { HomeLocationMap } from "@/components/maps/HomeLocationMap";
import { StatusChip } from "@/components/ui/StatusChip";
import { JobOfferModal } from "@/components/workflow/JobOfferModal";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { ensureRiderId, type Delivery } from "@/lib/deliveries";
import { formatCurrency, shortAddress } from "@/lib/format";
import { startDriverLocationPublisher } from "@/lib/driver-location";
import {
  resolveCurrentLocation,
  startDeviceLocationWatch,
} from "@/lib/location";
import {
  acceptDeliveryAtomic,
  declineDeliveryForRider,
  DRIVER_MATCH_RADIUS_KM,
  filterNearbyPending,
  loadMyDeclinedDeliveryIds,
  updateRiderLocation,
  type LatLng,
} from "@/lib/ride-matching";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function DriverHomeScreen() {
  const { profile } = useAuth();
  const { width: winW, height: winH } = useWindowDimensions();
  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [riderId, setRiderId] = useState<string | null>(null);
  const [driverCoords, setDriverCoords] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locMessage, setLocMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Delivery | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [todayEarn, setTodayEarn] = useState(0);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const liveGpsRef = useRef(false);
  const riderIdRef = useRef<string | null>(null);
  const coordsRef = useRef<LatLng | null>(null);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Driver";
  const mapHeight = Math.round(Math.min(420, Math.max(260, winH * 0.42)));

  const refreshLocation = useCallback(async () => {
    setLocating(true);
    setLocMessage(null);
    const res = await resolveCurrentLocation();
    setLocating(false);
    if (res.ok) {
      liveGpsRef.current = true;
      coordsRef.current = res.coords;
      setDriverCoords(res.coords);
      const id = riderIdRef.current;
      if (id) {
        await updateRiderLocation(id, res.coords).catch(() => undefined);
      }
    } else {
      setLocMessage(res.message);
    }
  }, []);

  const refreshPending = useCallback(
    async (coords: LatLng | null, declined: Set<string>) => {
      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .eq("status", "pending")
        .is("rider_id", null)
        .order("created_at", { ascending: true });

      const nearby = filterNearbyPending(data ?? [], coords, declined);
      setOrders(nearby);
      return nearby;
    },
    []
  );

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const id = await ensureRiderId(profile.id);
    setRiderId(id);
    riderIdRef.current = id;

    const { data: rider } = await supabase
      .from("riders")
      .select("id, is_available, current_lat, current_lng")
      .eq("id", id)
      .maybeSingle();
    setOnline(Boolean(rider?.is_available));

    // Don't overwrite a live GPS fix with a stale DB pin.
    let coords: LatLng | null = coordsRef.current;
    if (!liveGpsRef.current) {
      if (rider?.current_lat != null && rider?.current_lng != null) {
        coords = {
          lat: Number(rider.current_lat),
          lng: Number(rider.current_lng),
        };
        coordsRef.current = coords;
        setDriverCoords(coords);
      }
    }

    const declined = await loadMyDeclinedDeliveryIds(id).catch(
      () => new Set<string>()
    );
    setDeclinedIds(declined);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data: todayRows } = await supabase
      .from("deliveries")
      .select("estimated_fee, actual_fee")
      .eq("rider_id", id)
      .eq("status", "delivered")
      .gte("delivered_at", start.toISOString());
    const sum = (todayRows ?? []).reduce(
      (acc, r) => acc + Number(r.actual_fee ?? r.estimated_fee ?? 0),
      0
    );
    setTodayEarn(sum);

    const { data: active } = await supabase
      .from("deliveries")
      .select("id")
      .eq("rider_id", id)
      .in("status", ["accepted", "picked_up", "in_transit"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setActiveTripId(active?.id ?? null);

    await refreshPending(coords, declined);
    setLoading(false);
  }, [profile?.id, refreshPending]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  /** Live device GPS while Home is focused — map follows you. */
  useFocusEffect(
    useCallback(() => {
      let stopped = false;
      const stopRef = { current: undefined as undefined | (() => void) };

      setLocating(true);
      setLocMessage(null);

      void (async () => {
        const watch = await startDeviceLocationWatch({
          onUpdate: (place) => {
            if (stopped) return;
            liveGpsRef.current = true;
            const coords = { lat: place.lat, lng: place.lng };
            coordsRef.current = coords;
            setDriverCoords(coords);
            setLocating(false);
            setLocMessage(null);
            const id = riderIdRef.current;
            if (id) {
              void updateRiderLocation(id, coords).catch(() => undefined);
            }
          },
          onError: (message) => {
            if (stopped) return;
            setLocating(false);
            if (!liveGpsRef.current) setLocMessage(message);
          },
        });
        if (stopped) {
          if ("stop" in watch) watch.stop();
          return;
        }
        if ("error" in watch) {
          setLocating(false);
          setLocMessage(watch.error);
          return;
        }
        stopRef.current = watch.stop;
      })();

      return () => {
        stopped = true;
        stopRef.current?.();
      };
    }, [])
  );

  /** Also publish GPS while online or on an active trip (passenger tracking). */
  useEffect(() => {
    const shouldPublish = Boolean(riderId && (online || activeTripId));
    if (!shouldPublish || !riderId) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const result = await startDriverLocationPublisher(riderId, (coords) => {
        if (!cancelled) {
          liveGpsRef.current = true;
          coordsRef.current = coords;
          setDriverCoords(coords);
        }
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
  }, [online, riderId, activeTripId]);

  /** Realtime: new/updated pending deliveries while online. */
  useEffect(() => {
    if (!online || !profile?.id) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase
      .channel(`driver-pending-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
        },
        async (payload) => {
          const row = (payload.new ?? payload.old) as Delivery | undefined;
          if (!row?.id) return;

          // Always re-query eligible pending set (handles insert + accept races)
          await refreshPending(driverCoords, declinedIds);

          if (
            payload.eventType === "UPDATE" &&
            row.status === "accepted" &&
            row.rider_id &&
            row.rider_id === riderId
          ) {
            setOffer(null);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [
    online,
    profile?.id,
    riderId,
    driverCoords,
    declinedIds,
    refreshPending,
  ]);

  useEffect(() => {
    if (!online || orders.length === 0 || activeTripId) {
      setOffer(null);
      return;
    }
    setOffer(orders[0]);
  }, [online, orders, activeTripId]);

  const preview = useMemo(() => orders[0], [orders]);

  const offerMarkers = useMemo(() => {
    if (!preview?.pickup_lat || preview.pickup_lng == null) return [];
    const list = [
      {
        lat: Number(preview.pickup_lat),
        lng: Number(preview.pickup_lng),
        color: "#16A34A",
      },
    ];
    if (preview.delivery_lat != null && preview.delivery_lng != null) {
      list.push({
        lat: Number(preview.delivery_lat),
        lng: Number(preview.delivery_lng),
        color: "#F59E0B",
      });
    }
    return list;
  }, [preview]);

  const toggleOnline = async () => {
    if (!profile?.id || toggling) return;
    setToggling(true);
    try {
      const id = await ensureRiderId(profile.id);
      setRiderId(id);
      const next = !online;

      let coordsForMatch = coordsRef.current ?? driverCoords;
      if (next) {
        const res = await resolveCurrentLocation();
        if (res.ok) {
          liveGpsRef.current = true;
          coordsForMatch = res.coords;
          coordsRef.current = res.coords;
          setDriverCoords(res.coords);
          await updateRiderLocation(id, res.coords);
        } else if (coordsForMatch) {
          await updateRiderLocation(id, coordsForMatch);
        } else {
          Alert.alert(
            "Location needed",
            "Turn on Location for Expo Go / Gratitude Ride, set Precise location On, then tap Retry on the map.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Retry", onPress: () => void refreshLocation() },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings().catch(() => undefined),
              },
            ]
          );
          return;
        }
      }

      const { error } = await supabase
        .from("riders")
        .update({ is_available: next })
        .eq("id", id);
      if (error) throw error;
      setOnline(next);
      if (!next) {
        setOffer(null);
        setOrders([]);
      } else {
        const declined = await loadMyDeclinedDeliveryIds(id);
        setDeclinedIds(declined);
        await refreshPending(coordsForMatch, declined);
      }
    } catch (err) {
      Alert.alert(
        "Could not update status",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setToggling(false);
    }
  };

  const accept = async (order: Delivery) => {
    if (!profile?.id) return;
    setAccepting(true);
    try {
      const claimed = await acceptDeliveryAtomic(order.id);
      setOffer(null);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setActiveTripId(claimed.id);
      router.push(`/rider/active/${claimed.id}` as never);
    } catch (err) {
      Alert.alert(
        "Could not accept",
        err instanceof Error ? err.message : "Ride may have been taken."
      );
      await refreshPending(driverCoords, declinedIds);
    } finally {
      setAccepting(false);
    }
  };

  const decline = async (order: Delivery) => {
    try {
      const id = riderId ?? (await ensureRiderId(profile!.id));
      setRiderId(id);
      await declineDeliveryForRider(order.id, id);
      const nextDeclined = new Set(declinedIds);
      nextDeclined.add(order.id);
      setDeclinedIds(nextDeclined);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setOffer(null);
    } catch (err) {
      Alert.alert(
        "Could not decline",
        err instanceof Error ? err.message : "Try again."
      );
    }
  };

  return (
    <>
      <MapShell
        map={
          <HomeLocationMap
            coords={driverCoords}
            loading={locating || (loading && !driverCoords)}
            errorMessage={locMessage}
            onRequestLocation={() => void refreshLocation()}
            height={mapHeight}
            width={winW}
            flush
            controlsTop
            markers={offerMarkers}
          />
        }
        top={
          <View style={styles.topRow}>
            <View style={styles.earnPill}>
              <Text style={styles.earnLabel}>Today</Text>
              <Text style={styles.earnValue}>{formatCurrency(todayEarn)}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable
              style={styles.iconBtn}
              onPress={() =>
                Alert.alert("Safety", "Need help?", [
                  {
                    text: "WhatsApp support",
                    onPress: () =>
                      Linking.openURL("https://wa.me/2348000000000"),
                  },
                  { text: "Close", style: "cancel" },
                ])
              }
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={colors.primary}
              />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push("/rider/orders" as never)}
            >
              <Ionicons name="options-outline" size={18} color={colors.dark} />
            </Pressable>
          </View>
        }
        sheet={
          <View style={styles.sheet}>
            <SheetHandle />
            <View style={styles.helloRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hello}>Hi {firstName}</Text>
                <StatusChip
                  label={online ? "You're online" : "You're offline"}
                  tone={online ? "online" : "offline"}
                />
              </View>
            </View>

            {activeTripId ? (
              <Pressable
                style={({ pressed }) => [
                  styles.resumeBanner,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() =>
                  router.push(`/rider/active/${activeTripId}` as never)
                }
              >
                <View style={styles.resumeIcon}>
                  <Ionicons name="navigate" size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resumeTitle}>Trip in progress</Text>
                  <Text style={styles.resumeSub}>
                    Tap to resume pickup, navigation, and status updates
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.primaryDark}
                />
              </Pressable>
            ) : null}

            <Text style={styles.mapHint}>
              {activeTripId
                ? "Finish your active trip before taking a new offer."
                : locating
                  ? "Finding your live location…"
                  : driverCoords
                    ? "Live map around you — go online to get nearby ride offers."
                    : "Allow location (Precise On) so the map centers on you."}
            </Text>

            {!activeTripId ? (
              <Pressable
                style={[
                  styles.onlineBtn,
                  online ? styles.onlineBtnOn : styles.onlineBtnOff,
                  toggling && { opacity: 0.7 },
                ]}
                onPress={toggleOnline}
                disabled={toggling || loading}
              >
                {toggling ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name={online ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.onlineBtnText}>
                      {online ? "Go offline" : "Go online"}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : null}

            {online && !activeTripId ? (
              <Text style={styles.listen}>
                Listening for rides within about {DRIVER_MATCH_RADIUS_KM} km
                {preview
                  ? ` · next: ${shortAddress(preview.pickup_address)}`
                  : ""}
              </Text>
            ) : null}

            {activeTripId ? null : !online ? (
              <View style={styles.offlineCard}>
                <Text style={styles.offlineTitle}>You're offline</Text>
                <Text style={styles.offlineSub}>
                  Go online to receive nearby ride requests within about{" "}
                  {DRIVER_MATCH_RADIUS_KM} km. The map above already shows your
                  area before any ride.
                </Text>
              </View>
            ) : loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : orders.length === 0 ? (
              <View style={styles.offlineCard}>
                <Text style={styles.offlineTitle}>Waiting for offers</Text>
                <Text style={styles.offlineSub}>
                  You're online and listening. New pending requests near you
                  pop up automatically.
                </Text>
              </View>
            ) : (
              <Pressable
                style={styles.queueCard}
                onPress={() => setOffer(orders[0])}
              >
                <View style={styles.queueIcon}>
                  <Ionicons name="flash" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.queueTitle}>
                    {orders.length} nearby request
                    {orders.length === 1 ? "" : "s"}
                  </Text>
                  <Text style={styles.queueSub} numberOfLines={1}>
                    Next: {shortAddress(orders[0].pickup_address)}
                  </Text>
                </View>
                <Text style={styles.queueFee}>
                  {formatCurrency(orders[0].estimated_fee)}
                </Text>
              </Pressable>
            )}
          </View>
        }
      />

      <JobOfferModal
        order={offer}
        visible={!!offer && online && !activeTripId}
        accepting={accepting}
        driverCoords={driverCoords}
        onAccept={() => offer && accept(offer)}
        onDecline={() => offer && decline(offer)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  earnPill: {
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  earnLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  earnValue: { fontSize: 15, fontWeight: "900", color: colors.dark },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  sheet: { gap: 12 },
  helloRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  hello: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.dark,
    marginBottom: 6,
  },
  mapHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  listen: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  onlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.full,
    minHeight: 54,
    ...shadows.float,
  },
  onlineBtnOn: { backgroundColor: colors.dark },
  onlineBtnOff: { backgroundColor: colors.primary },
  onlineBtnText: { color: colors.white, fontWeight: "900", fontSize: 16 },
  resumeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resumeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  resumeTitle: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  resumeSub: { color: colors.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  offlineCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    gap: 4,
  },
  offlineTitle: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  offlineSub: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  queueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: 12,
  },
  queueIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  queueTitle: { fontWeight: "900", color: colors.dark, fontSize: 14 },
  queueSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  queueFee: { fontWeight: "900", color: colors.primaryDark },
});
