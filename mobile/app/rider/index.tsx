import { RouteMap } from "@/components/maps/RouteMap";
import { StatusChip } from "@/components/ui/StatusChip";
import { JobOfferModal } from "@/components/workflow/JobOfferModal";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { ensureRiderId, type Delivery } from "@/lib/deliveries";
import { formatCurrency, shortAddress } from "@/lib/format";
import { resolveCurrentLocation } from "@/lib/location";
import { startDriverLocationPublisher } from "@/lib/driver-location";
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
  View,
} from "react-native";

export default function DriverHomeScreen() {
  const { profile } = useAuth();
  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [riderId, setRiderId] = useState<string | null>(null);
  const [driverCoords, setDriverCoords] = useState<LatLng | null>(null);
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Delivery | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [todayEarn, setTodayEarn] = useState(0);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Driver";

  const mapCenter = useMemo(() => {
    if (driverCoords) return driverCoords;
    if (orders[0]?.pickup_lat != null) {
      return {
        lat: Number(orders[0].pickup_lat),
        lng: Number(orders[0].pickup_lng),
      };
    }
    // No GPS yet — center on first request only; never invent a city
    return { lat: 0, lng: 0 };
  }, [driverCoords, orders]);

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

    const { data: rider } = await supabase
      .from("riders")
      .select("id, is_available, current_lat, current_lng")
      .eq("id", id)
      .maybeSingle();
    setOnline(Boolean(rider?.is_available));

    let coords: LatLng | null = null;
    if (rider?.current_lat != null && rider?.current_lng != null) {
      coords = {
        lat: Number(rider.current_lat),
        lng: Number(rider.current_lng),
      };
      setDriverCoords(coords);
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
      load();
    }, [load])
  );

  /** Real device GPS → riders.current_* while online or on an active trip. */
  useEffect(() => {
    const shouldPublish = Boolean(riderId && (online || activeTripId));
    if (!shouldPublish || !riderId) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const result = await startDriverLocationPublisher(riderId, (coords) => {
        if (!cancelled) setDriverCoords(coords);
      });
      if (cancelled) {
        if ("stop" in result) result.stop();
        return;
      }
      if ("error" in result) {
        // Permission denied — matching still works loosely; passenger may wait for GPS
        return;
      }
      stop = result.stop;
      await refreshPending(driverCoords, declinedIds);
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
    // Intentionally omit driverCoords/declinedIds — refresh on focus / realtime handles offers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, riderId, activeTripId, refreshPending]);

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

  const toggleOnline = async () => {
    if (!profile?.id || toggling) return;
    setToggling(true);
    try {
      const id = await ensureRiderId(profile.id);
      setRiderId(id);
      const next = !online;

      if (next) {
        const res = await resolveCurrentLocation();
        if (res.ok) {
          setDriverCoords(res.coords);
          await updateRiderLocation(id, res.coords);
        } else {
          Alert.alert(
            "Location recommended",
            "Enable GPS so we can send you nearby ride requests. You can still go online."
          );
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
        await refreshPending(driverCoords, declined);
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
          <RouteMap
            fullBleed
            center={mapCenter}
            pickup={
              preview?.pickup_lat != null
                ? {
                    lat: Number(preview.pickup_lat),
                    lng: Number(preview.pickup_lng),
                    label: shortAddress(preview.pickup_address),
                  }
                : driverCoords
                  ? {
                      lat: driverCoords.lat,
                      lng: driverCoords.lng,
                      label: "You",
                    }
                  : undefined
            }
            dropoff={
              preview?.delivery_lat != null
                ? {
                    lat: Number(preview.delivery_lat),
                    lng: Number(preview.delivery_lng),
                    label: shortAddress(preview.delivery_address),
                  }
                : undefined
            }
            delta={0.08}
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
              {activeTripId ? (
                <Pressable
                  style={styles.activeBtn}
                  onPress={() =>
                    router.push(`/rider/active/${activeTripId}` as never)
                  }
                >
                  <Text style={styles.activeBtnText}>Resume trip</Text>
                </Pressable>
              ) : null}
            </View>

            {!online ? (
              <View style={styles.offlineCard}>
                <Text style={styles.offlineTitle}>Ready when you are</Text>
                <Text style={styles.offlineSub}>
                  Go online to receive nearby ride requests within about{" "}
                  {DRIVER_MATCH_RADIUS_KM} km.
                </Text>
              </View>
            ) : loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : orders.length === 0 ? (
              <View style={styles.offlineCard}>
                <Text style={styles.offlineTitle}>Looking for trips</Text>
                <Text style={styles.offlineSub}>
                  Stay nearby. New pending requests around you appear here
                  automatically.
                </Text>
              </View>
            ) : (
              <Pressable
                style={styles.queueCard}
                onPress={() => router.push("/rider/orders" as never)}
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

            <Pressable
              style={[styles.goBtn, online && styles.goBtnOff]}
              onPress={toggleOnline}
              disabled={toggling}
            >
              <Ionicons
                name={online ? "pause" : "play"}
                size={20}
                color={colors.white}
              />
              <Text style={styles.goText}>
                {toggling
                  ? "Updating…"
                  : online
                    ? "Go offline"
                    : "Go online"}
              </Text>
            </Pressable>
          </View>
        }
      />

      <JobOfferModal
        order={offer}
        visible={!!offer && online && !activeTripId}
        accepting={accepting}
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
  activeBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  activeBtnText: { color: colors.primaryDark, fontWeight: "800", fontSize: 12 },
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
  goBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    minHeight: 56,
    ...shadows.float,
  },
  goBtnOff: { backgroundColor: colors.dark },
  goText: { color: colors.white, fontWeight: "900", fontSize: 17 },
});
