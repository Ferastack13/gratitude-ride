import { Badge } from "@/components/ui/Badge";
import { RouteMap } from "@/components/maps/RouteMap";
import { colors, radii, shadows, typography } from "@/constants/theme";
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
        <View style={styles.topBar}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.brand}>Gratitude Ride</Text>
            <Text style={styles.hello}>
              {greeting}, {first}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{first.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.where,
            pressed && { opacity: 0.96, transform: [{ scale: 0.995 }] },
          ]}
          onPress={() => openWhereTo("dropoff")}
        >
          <Ionicons name="search" size={22} color={colors.dark} />
          <Text style={styles.whereText}>Where to?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.pickupRow,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => openWhereTo("pickup")}
        >
          <Ionicons
            name={pickup ? "locate-outline" : "alert-circle-outline"}
            size={18}
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
                    : pickup.title
                  : "Set pickup location"}
              </Text>
            )}
          </View>
          <Text style={styles.edit}>{pickup ? "Edit" : "Set"}</Text>
        </Pressable>

        {locMessage ? (
          <Pressable style={styles.permBanner} onPress={refreshLocation}>
            <Text style={styles.permTitle}>Location needed</Text>
            <Text style={styles.permBody}>{locMessage}</Text>
            <Text style={styles.permAction}>Try again</Text>
          </Pressable>
        ) : null}

        {pickup && !locating ? (
          <View style={styles.mapStrip}>
            <RouteMap
              center={{ lat: pickup.lat, lng: pickup.lng }}
              pickup={{
                lat: pickup.lat,
                lng: pickup.lng,
                label: "Pickup",
              }}
              height={132}
              delta={0.035}
            />
          </View>
        ) : null}

        {active ? (
          <Pressable
            style={({ pressed }) => [
              styles.activeBanner,
              pressed && { opacity: 0.92 },
            ]}
            onPress={() =>
              router.push(`/passenger/track/${active.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Trip in progress</Text>
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

        <Text style={styles.section}>Recent</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            Destinations you book will show up here for quick rebooking.
          </Text>
        ) : (
          <View>
            {recent.slice(0, 6).map((place, i) => (
              <View key={place.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  style={({ pressed }) => [
                    styles.recentRow,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => goRecent(place)}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={colors.muted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      {place.title}
                    </Text>
                    <Text style={styles.recentSub} numberOfLines={1}>
                      {place.address}
                    </Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  brand: { ...typography.brand, marginBottom: 6 },
  hello: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.dark,
    fontWeight: "600",
    fontSize: 16,
  },
  where: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
  },
  whereText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.dark,
    letterSpacing: -0.2,
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  pickupLabel: { ...typography.label, marginBottom: 2 },
  pickupValue: { ...typography.bodyStrong, fontSize: 14 },
  pickupLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
  edit: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  permBanner: {
    backgroundColor: colors.warningSoft,
    borderRadius: radii.md,
    padding: 14,
    gap: 4,
    marginBottom: 16,
  },
  permTitle: { fontWeight: "600", color: colors.dark, fontSize: 14 },
  permBody: { ...typography.supporting },
  permAction: {
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
    fontSize: 14,
  },
  mapStrip: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: colors.surfaceAlt,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 24,
    ...shadows.soft,
  },
  activeTitle: {
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 2,
  },
  activeAddr: {
    fontWeight: "600",
    color: colors.white,
    fontSize: 15,
  },
  activeFee: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    fontWeight: "400",
    fontSize: 13,
  },
  section: {
    ...typography.section,
    marginBottom: 8,
  },
  empty: {
    ...typography.supporting,
    paddingVertical: 8,
    paddingRight: 12,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  recentTitle: { ...typography.bodyStrong },
  recentSub: { ...typography.supporting, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 34,
  },
});
