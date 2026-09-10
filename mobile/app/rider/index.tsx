import { RouteMap } from "@/components/maps/RouteMap";
import { StatusChip } from "@/components/ui/StatusChip";
import { JobOfferModal } from "@/components/workflow/JobOfferModal";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { getCityConfig } from "@/lib/cities";
import { ensureRiderId, type Delivery } from "@/lib/deliveries";
import { formatCurrency, shortAddress } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [city, setCity] = useState("Lagos");
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Delivery | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [todayEarn, setTodayEarn] = useState(0);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const config = getCityConfig(city);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Driver";

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data: rider } = await supabase
      .from("riders")
      .select("id, is_available")
      .eq("user_id", profile.id)
      .maybeSingle();
    setOnline(Boolean(rider?.is_available));

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (rider?.id) {
      const { data: todayRows } = await supabase
        .from("deliveries")
        .select("estimated_fee, actual_fee")
        .eq("rider_id", rider.id)
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
        .eq("rider_id", rider.id)
        .in("status", ["accepted", "picked_up", "in_transit"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setActiveTripId(active?.id ?? null);
    }

    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("status", "pending")
      .eq("city", city)
      .order("created_at", { ascending: true });
    const next = (data ?? []).filter((row) => !dismissed.includes(row.id));
    setOrders(next);
    setLoading(false);
  }, [profile?.id, city, dismissed]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

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
      const riderId = await ensureRiderId(profile.id);
      const next = !online;
      const { error } = await supabase
        .from("riders")
        .update({ is_available: next })
        .eq("id", riderId);
      if (error) throw error;
      setOnline(next);
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
      const riderId = await ensureRiderId(profile.id);
      const { error } = await supabase
        .from("deliveries")
        .update({ rider_id: riderId, status: "accepted" })
        .eq("id", order.id)
        .eq("status", "pending");
      if (error) throw error;
      setOffer(null);
      router.push(`/rider/active/${order.id}` as never);
    } catch (err) {
      Alert.alert(
        "Could not accept",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setAccepting(false);
    }
  };

  const decline = (order: Delivery) => {
    setDismissed((prev) => [...prev, order.id]);
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    setOffer(null);
  };

  return (
    <>
      <MapShell
        map={
          <RouteMap
            fullBleed
            center={config.center}
            pickup={
              preview?.pickup_lat != null
                ? {
                    lat: preview.pickup_lat,
                    lng: preview.pickup_lng!,
                    label: shortAddress(preview.pickup_address),
                  }
                : undefined
            }
            dropoff={
              preview?.delivery_lat != null
                ? {
                    lat: preview.delivery_lat,
                    lng: preview.delivery_lng!,
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
                    onPress: () => Linking.openURL("https://wa.me/2348000000000"),
                  },
                  { text: "Close", style: "cancel" },
                ])
              }
            >
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
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
                  Go online to receive nearby ride requests with upfront
                  earnings.
                </Text>
              </View>
            ) : loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : orders.length === 0 ? (
              <View style={styles.offlineCard}>
                <Text style={styles.offlineTitle}>Looking for trips</Text>
                <Text style={styles.offlineSub}>
                  Stay in a busy area. New requests in {city} will appear here.
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
                    {orders.length} nearby request{orders.length === 1 ? "" : "s"}
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
