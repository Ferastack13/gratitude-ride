import { Badge } from "@/components/ui/Badge";
import { BrandRoadAnimation } from "@/components/home/BrandRoadAnimation";
import { HomeLocationMap } from "@/components/maps/HomeLocationMap";
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

  const mapCoords =
    pickup != null
      ? { lat: pickup.lat, lng: pickup.lng }
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.topBar}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.brand}>Gratitude Ride</Text>
            <Text style={styles.hello}>
              {greeting}, {first} 👋🏽
            </Text>
            <Text style={styles.prompt}>Where are we taking you today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {first.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.where,
            pressed && { opacity: 0.96, transform: [{ scale: 0.995 }] },
          ]}
          onPress={() => openWhereTo("dropoff")}
        >
          <View style={styles.whereIcon}>
            <Ionicons name="search" size={18} color={colors.white} />
          </View>
          <Text style={styles.whereText}>Where to?</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
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
            {locating && !pickup ? (
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

        {locMessage && !pickup ? (
          <Pressable style={styles.permBanner} onPress={refreshLocation}>
            <Text style={styles.permTitle}>Location needed</Text>
            <Text style={styles.permBody}>{locMessage}</Text>
            <Text style={styles.permAction}>Try again</Text>
          </Pressable>
        ) : null}

        <View style={styles.mapBlock}>
          <HomeLocationMap
            coords={mapCoords}
            loading={locating}
            errorMessage={locMessage}
            onRequestLocation={refreshLocation}
            height={210}
          />
        </View>

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
        ) : (
          <BrandRoadAnimation />
        )}

        <Text style={styles.section}>Recent</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            Destinations you book will show up here for quick rebooking.
          </Text>
        ) : (
          <View style={styles.recentList}>
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  brand: { ...typography.brand, marginBottom: 6 },
  hello: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.4,
  },
  prompt: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "400",
    color: colors.muted,
    lineHeight: 21,
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
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  whereIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  whereText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
    letterSpacing: -0.2,
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    marginBottom: 14,
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
    marginBottom: 14,
  },
  permTitle: { fontWeight: "600", color: colors.dark, fontSize: 14 },
  permBody: { ...typography.supporting },
  permAction: {
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
    fontSize: 14,
  },
  mapBlock: {
    marginBottom: 8,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
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
    marginTop: 8,
    marginBottom: 6,
  },
  empty: {
    ...typography.supporting,
    paddingVertical: 8,
    paddingRight: 12,
  },
  recentList: { marginBottom: 8 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 13,
  },
  recentTitle: { ...typography.bodyStrong },
  recentSub: { ...typography.supporting, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 34,
  },
});
