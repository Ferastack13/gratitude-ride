import { RouteMap } from "@/components/maps/RouteMap";
import { EmptyState } from "@/components/ui/Card";
import { CityChips } from "@/components/ui/CityChips";
import { JobOfferModal } from "@/components/workflow/JobOfferModal";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { getCityConfig } from "@/lib/cities";
import { ensureRiderId, type Delivery } from "@/lib/deliveries";
import { formatCurrency, shortAddress } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RiderOrdersScreen() {
  const { profile } = useAuth();
  const [city, setCity] = useState("Lagos");
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [offer, setOffer] = useState<Delivery | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const config = getCityConfig(city);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data: rider } = await supabase
      .from("riders")
      .select("is_available")
      .eq("user_id", profile.id)
      .maybeSingle();
    setOnline(Boolean(rider?.is_available));

    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("status", "pending")
      .eq("city", city)
      .order("created_at", { ascending: true });

    const next = (data ?? []).filter((row) => !dismissed.includes(row.id));
    setOrders(next);
    setActiveId((prev) =>
      next.some((o) => o.id === prev) ? prev : next[0]?.id ?? null
    );
    setLoading(false);
  }, [profile?.id, city, dismissed]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  // Push-style timed offer when online and new jobs appear
  useEffect(() => {
    if (!online || orders.length === 0) {
      setOffer(null);
      return;
    }
    const first = orders[0];
    setOffer(first);
  }, [online, orders]);

  const active = useMemo(
    () => orders.find((o) => o.id === activeId) ?? orders[0],
    [orders, activeId]
  );

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
              active?.pickup_lat != null
                ? {
                    lat: active.pickup_lat,
                    lng: active.pickup_lng!,
                    label: shortAddress(active.pickup_address),
                  }
                : undefined
            }
            dropoff={
              active?.delivery_lat != null
                ? {
                    lat: active.delivery_lat,
                    lng: active.delivery_lng!,
                    label: shortAddress(active.delivery_address),
                  }
                : undefined
            }
            delta={0.1}
          />
        }
        top={
          <View style={styles.top}>
            <Text style={styles.topTitle}>Job radar · {city}</Text>
            <View
              style={[styles.live, online ? styles.liveOn : styles.liveOff]}
            >
              <Text style={styles.liveText}>{online ? "Online" : "Offline"}</Text>
            </View>
          </View>
        }
        sheet={
          <View style={{ gap: 12, maxHeight: 360 }}>
            <SheetHandle />
            <CityChips
              value={city}
              onChange={(next) => {
                setCity(next);
                setActiveId(null);
              }}
            />

            {!online ? (
              <EmptyState
                title="Go online to receive offers"
                message="Timed delivery requests appear here with upfront payout — same workflow as top rider apps."
                actionLabel="Open Hub"
                onAction={() => router.push("/rider")}
              />
            ) : loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : orders.length === 0 ? (
              <EmptyState
                title="Scanning for jobs"
                message={`You're live in ${city}. New bookings will surface as timed offers.`}
              />
            ) : (
              <View style={{ gap: 8 }}>
                {orders.map((order) => (
                  <Pressable
                    key={order.id}
                    onPress={() => setActiveId(order.id)}
                    style={[
                      styles.row,
                      order.id === active?.id && styles.rowOn,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.id}>{order.tracking_id}</Text>
                      <Text style={styles.route} numberOfLines={1}>
                        {shortAddress(order.pickup_address)} →{" "}
                        {shortAddress(order.delivery_address)}
                      </Text>
                    </View>
                    <Text style={styles.fee}>
                      {formatCurrency(order.estimated_fee)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        }
      />

      <JobOfferModal
        order={offer}
        visible={Boolean(online && offer)}
        accepting={accepting}
        onAccept={() => offer && accept(offer)}
        onDecline={() => offer && decline(offer)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: { fontWeight: "800", color: colors.dark },
  live: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  liveOn: { backgroundColor: colors.primarySoft },
  liveOff: { backgroundColor: colors.surface },
  liveText: { fontWeight: "800", fontSize: 11, color: colors.dark },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  id: { fontFamily: "monospace", fontWeight: "800", color: colors.dark },
  route: { color: colors.muted, fontSize: 12, marginTop: 2 },
  fee: { color: colors.primary, fontWeight: "900" },
});
