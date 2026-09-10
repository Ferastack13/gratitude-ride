import { Badge } from "@/components/ui/Badge";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { getRecentPlaces } from "@/lib/client-prefs";
import {
  formatCurrency,
  formatStatus,
  shortAddress,
  statusTone,
} from "@/lib/format";
import { placeParams, resolveCurrentLocation } from "@/lib/location";
import type { LivePlace } from "@/lib/places";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function PassengerHomeScreen() {
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<LivePlace | null>(null);
  const [locating, setLocating] = useState(true);
  const [locMessage, setLocMessage] = useState<string | null>(null);
  const [recent, setRecent] = useState<LivePlace[]>([]);
  const [active, setActive] = useState<{
    tracking_id: string;
    status: string;
    pickup_address: string;
    delivery_address: string;
    estimated_fee: number;
  } | null>(null);

  const first = profile?.full_name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(new Date().getHours());

  const refreshLocation = useCallback(async () => {
    setLocating(true);
    setLocMessage(null);
    const res = await resolveCurrentLocation();
    setLocating(false);
    if (res.ok) {
      setPickup(res.place);
    } else {
      setPickup(null);
      setLocMessage(res.message);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
    getRecentPlaces().then(setRecent).catch(() => undefined);
  }, [refreshLocation]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (!profile?.id) return;
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", profile.id)
          .maybeSingle();
        if (!client?.id) return;
        const { data } = await supabase
          .from("deliveries")
          .select(
            "tracking_id, status, pickup_address, delivery_address, estimated_fee"
          )
          .eq("client_id", client.id)
          .in("status", ["pending", "accepted", "picked_up", "in_transit"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setActive(data ?? null);
      })();
    }, [profile?.id])
  );

  const openWhereTo = (focus: "pickup" | "dropoff" = "dropoff") => {
    router.push({
      pathname: "/passenger/where-to",
      params: {
        ...(pickup ? placeParams(pickup, "pickup") : {}),
        focus,
      },
    } as never);
  };

  const goRecent = (place: LivePlace) => {
    if (!pickup) {
      openWhereTo("pickup");
      return;
    }
    router.push({
      pathname: "/passenger/plan",
      params: {
        ...placeParams(pickup, "pickup"),
        ...placeParams(place, "dropoff"),
        serviceId: "standard",
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Gratitude Ride</Text>
        <Text style={styles.hello}>
          {greeting}, {first}
        </Text>

        <Pressable style={styles.where} onPress={() => openWhereTo("dropoff")}>
          <Ionicons name="search" size={22} color={colors.dark} />
          <Text style={styles.whereText}>Where to?</Text>
        </Pressable>

        <Pressable style={styles.pickupRow} onPress={() => openWhereTo("pickup")}>
          <Ionicons
            name={pickup ? "locate" : "warning-outline"}
            size={16}
            color={pickup ? colors.primary : colors.warning}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>Pickup</Text>
            {locating ? (
              <View style={styles.pickupLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.pickupValue}>Detecting location…</Text>
              </View>
            ) : (
              <Text style={styles.pickupValue} numberOfLines={1}>
                {pickup
                  ? pickup.title === "Current location"
                    ? "Current location"
                    : `Current · ${pickup.title}`
                  : "Set pickup location"}
              </Text>
            )}
          </View>
          <Text style={styles.edit}>{pickup ? "Edit" : "Set"}</Text>
        </Pressable>

        {locMessage ? (
          <Pressable style={styles.permCard} onPress={refreshLocation}>
            <Text style={styles.permTitle}>Location needed</Text>
            <Text style={styles.permBody}>{locMessage}</Text>
            <Text style={styles.permAction}>Try again / grant permission</Text>
          </Pressable>
        ) : null}

        {active ? (
          <Pressable
            style={styles.activeCard}
            onPress={() =>
              router.push(`/passenger/track/${active.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Current trip</Text>
              <Text style={styles.activeAddr} numberOfLines={1}>
                {shortAddress(active.pickup_address)} →{" "}
                {shortAddress(active.delivery_address)}
              </Text>
              <Text style={styles.activeFee}>
                {formatCurrency(active.estimated_fee)}
              </Text>
            </View>
            <Badge
              label={formatStatus(active.status)}
              tone={statusTone(active.status)}
            />
          </Pressable>
        ) : null}

        <Text style={styles.section}>Recent destinations</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            Tap Where to? and search your destination to start a ride.
          </Text>
        ) : (
          recent.slice(0, 5).map((place) => (
            <Pressable
              key={place.id}
              style={styles.suggest}
              onPress={() => goRecent(place)}
            >
              <View style={styles.suggestIcon}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestTitle}>{place.title}</Text>
                <Text style={styles.suggestSub} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <View style={styles.tips}>
          <Text style={styles.tipTitle}>Ride tips</Text>
          <Text style={styles.tipBody}>
            Confirm pickup and destination on the map, then choose Standard,
            Express, or Comfort before requesting.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { padding: 18, gap: 12, paddingBottom: 40 },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  hello: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  where: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  whereText: { fontSize: 18, fontWeight: "800", color: colors.dark },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
  },
  pickupLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  pickupValue: { color: colors.dark, fontWeight: "700", fontSize: 13 },
  pickupLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
  edit: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  permCard: {
    backgroundColor: colors.warningSoft,
    borderRadius: radii.lg,
    padding: 14,
    gap: 4,
  },
  permTitle: { fontWeight: "900", color: colors.dark },
  permBody: { color: colors.muted, lineHeight: 18, fontSize: 13 },
  permAction: { color: colors.primary, fontWeight: "800", marginTop: 4 },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    padding: 16,
  },
  activeTitle: { fontWeight: "800", color: colors.primaryDark, fontSize: 12 },
  activeAddr: { fontWeight: "800", color: colors.dark, marginTop: 2 },
  activeFee: { color: colors.muted, marginTop: 2, fontWeight: "600" },
  section: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "900",
    color: colors.dark,
  },
  empty: { color: colors.muted, lineHeight: 20 },
  suggest: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestTitle: { fontWeight: "800", color: colors.dark },
  suggestSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  tips: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tipTitle: { fontWeight: "900", color: colors.dark },
  tipBody: { color: colors.muted, lineHeight: 20, fontSize: 13 },
});
