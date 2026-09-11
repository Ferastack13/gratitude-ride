import { Badge } from "@/components/ui/Badge";
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
import { placeParams, resolveCurrentLocation, startDeviceLocationWatch } from "@/lib/location";
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
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACCESS = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "work", label: "Work", emoji: "💼" },
  { id: "add", label: "Add Place", emoji: "＋" },
] as const;

export default function PassengerHomeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
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
  const mapHeight = Math.round(Math.min(420, Math.max(260, winH * 0.42)));

  const refreshLocation = useCallback(async () => {
    setLocating(true);
    setLocMessage(null);
    const res = await resolveCurrentLocation();
    setLocating(false);
    if (res.ok) {
      setPickup(res.place);
    } else {
      setLocMessage(res.message);
    }
  }, []);

  useEffect(() => {
    getRecentPlaces().then(setRecent).catch(() => undefined);
  }, []);

  // Live device GPS while Home is focused — not a one-shot on mount.
  useFocusEffect(
    useCallback(() => {
      let stopped = false;
      const stopRef = { current: undefined as undefined | (() => void) };

      console.log("[GR-GPS] Home:focus — starting watch");
      setLocating(true);
      setLocMessage(null);

      (async () => {
        const watch = await startDeviceLocationWatch({
          onUpdate: (place) => {
            if (stopped) return;
            console.log("[GR-GPS] Home:setPickup", {
              lat: Number(place.lat.toFixed(6)),
              lng: Number(place.lng.toFixed(6)),
              title: place.title,
            });
            setPickup(place);
            setLocating(false);
            setLocMessage(null);
          },
          onError: (message) => {
            if (stopped) return;
            console.log("[GR-GPS] Home:onError", message);
            setLocating(false);
            setLocMessage(message);
          },
        });
        if (stopped) {
          if ("stop" in watch) watch.stop();
          return;
        }
        if ("error" in watch) {
          console.log("[GR-GPS] Home:watch-error", watch.error);
          setLocating(false);
          setLocMessage(watch.error);
          return;
        }
        stopRef.current = watch.stop;
        console.log("[GR-GPS] Home:watch-armed");
      })();

      return () => {
        console.log("[GR-GPS] Home:blur — stopping watch");
        stopped = true;
        stopRef.current?.();
      };
    }, [])
  );

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
    pickup != null ? { lat: pickup.lat, lng: pickup.lng } : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.mapStage}>
        <HomeLocationMap
          coords={mapCoords}
          loading={locating}
          errorMessage={locMessage}
          onRequestLocation={refreshLocation}
          height={mapHeight}
          flush
          controlsTop
        />

        <View style={styles.mapHeader} pointerEvents="box-none">
          <View style={styles.brandPill}>
            <Text style={styles.brand}>Gratitude Ride</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.avatar,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push("/passenger/account" as never)}
            accessibilityLabel="Open account"
          >
            <Text style={styles.avatarText}>
              {first.charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Text style={styles.nice}>
            {greeting}, {first}
          </Text>
          <Text style={styles.headline}>Where are you going?</Text>

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
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.mutedLight}
            />
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
              {pickup ? (
                <Text style={styles.pickupCoords}>
                  {pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)} · live GPS
                </Text>
              ) : null}
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

          <Text style={[styles.section, { marginTop: 8, marginBottom: 10 }]}>
            Quick Access
          </Text>
          <View style={styles.quickRow}>
            {QUICK_ACCESS.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.quickChip,
                  pressed && { opacity: 0.88 },
                ]}
                // UI placeholder only — saved places not wired yet
                onPress={() => undefined}
              >
                <View style={styles.quickIcon}>
                  <Text style={styles.quickEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.section, { marginTop: 18 }]}>Recent</Text>
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
                    <View style={styles.recentIcon}>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={colors.muted}
                      />
                    </View>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapStage: {
    position: "relative",
  },
  mapHeader: {
    position: "absolute",
    top: 10,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 4,
  },
  brandPill: {
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },
  brand: {
    ...typography.brand,
    marginBottom: 0,
    fontSize: 11,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatarText: {
    color: colors.dark,
    fontWeight: "600",
    fontSize: 16,
  },
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.float,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  nice: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
    marginBottom: 4,
  },
  headline: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  where: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
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
    fontSize: 17,
    fontWeight: "600",
    color: colors.dark,
    letterSpacing: -0.2,
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  pickupLabel: { ...typography.label, marginBottom: 2 },
  pickupValue: { ...typography.bodyStrong, fontSize: 14 },
  pickupCoords: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
    color: colors.mutedLight,
    fontVariant: ["tabular-nums"],
  },
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
    marginBottom: 12,
  },
  permTitle: { fontWeight: "600", color: colors.dark, fontSize: 14 },
  permBody: { ...typography.supporting },
  permAction: {
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
    fontSize: 14,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
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
    marginBottom: 0,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.dark,
    textAlign: "center",
  },
  empty: {
    ...typography.supporting,
    paddingVertical: 10,
    paddingRight: 12,
  },
  recentList: { marginTop: 4, marginBottom: 8 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  recentTitle: { ...typography.bodyStrong },
  recentSub: { ...typography.supporting, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
});
