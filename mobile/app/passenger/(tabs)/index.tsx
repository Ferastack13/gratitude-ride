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
import { LocationRow } from "@/components/passenger/LocationRow";
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
          <View>
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
            pressed && { opacity: 0.94, transform: [{ scale: 0.99 }] },
          ]}
          onPress={() => openWhereTo("dropoff")}
        >
          <View style={styles.whereIcon}>
            <Ionicons name="search" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.whereText}>Where to?</Text>
            <Text style={styles.whereHint}>Search destination or pick a recent place</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
        </Pressable>

        <Pressable style={styles.pickupCard} onPress={() => openWhereTo("pickup")}>
          <View style={styles.pickupIcon}>
            <Ionicons
              name={pickup ? "locate" : "warning-outline"}
              size={18}
              color={pickup ? colors.primary : colors.warning}
            />
          </View>
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
            <Text style={styles.permAction}>Try again</Text>
          </Pressable>
        ) : null}

        {active ? (
          <Pressable
            style={({ pressed }) => [
              styles.activeCard,
              pressed && { opacity: 0.92 },
            ]}
            onPress={() =>
              router.push(`/passenger/track/${active.tracking_id}` as never)
            }
          >
            <View style={styles.activeIcon}>
              <Ionicons name="navigate" size={18} color={colors.white} />
            </View>
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

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Recent</Text>
        </View>
        {recent.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="map-outline" size={22} color={colors.mutedLight} />
            <Text style={styles.empty}>
              Your recent destinations will appear here after you book.
            </Text>
          </View>
        ) : (
          <View style={styles.recentCard}>
            {recent.slice(0, 5).map((place, i) => (
              <View key={place.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <LocationRow
                  title={place.title}
                  subtitle={place.address}
                  icon="time-outline"
                  tone="recent"
                  onPress={() => goRecent(place)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: 20, paddingTop: 8, gap: 14, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brand: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  hello: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: 18 },
  where: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.float,
  },
  whereIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  whereText: { fontSize: 18, fontWeight: "900", color: colors.dark },
  whereHint: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: "600" },
  pickupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickupIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pickupLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pickupValue: { color: colors.dark, fontWeight: "700", fontSize: 13, marginTop: 1 },
  pickupLoading: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
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
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: 16,
    ...shadows.soft,
  },
  activeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTitle: {
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  activeAddr: { fontWeight: "800", color: colors.white, marginTop: 2, fontSize: 14 },
  activeFee: { color: "rgba(255,255,255,0.8)", marginTop: 2, fontWeight: "600", fontSize: 12 },
  sectionRow: { marginTop: 6 },
  section: { fontSize: 17, fontWeight: "900", color: colors.dark },
  emptyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: { flex: 1, color: colors.muted, lineHeight: 19, fontSize: 13 },
  recentCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    ...shadows.card,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 54,
  },
});
