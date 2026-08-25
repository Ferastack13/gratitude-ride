import { RouteMap } from "@/components/maps/RouteMap";
import { Badge } from "@/components/ui/Badge";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  getCityConfig,
  SERVICE_CITIES,
  type ServiceCity,
} from "@/lib/cities";
import { formatCurrency, formatStatus, shortAddress, statusTone } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RecentRow = {
  tracking_id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  estimated_fee: number;
  city: string;
};

const SERVICES = [
  { id: "express", title: "Express", icon: "flash" as const },
  { id: "standard", title: "Standard", icon: "bicycle" as const },
  { id: "care", title: "Care", icon: "shield-checkmark" as const },
  { id: "later", title: "Later", icon: "time" as const },
];

export default function ClientHomeScreen() {
  const { profile } = useAuth();
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [active, setActive] = useState<RecentRow | null>(null);

  const config = getCityConfig(city);
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const loadHome = useCallback(async () => {
    if (!profile?.id) return;

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!client?.id) {
      setRecent([]);
      setActive(null);
      return;
    }

    const { data: rows } = await supabase
      .from("deliveries")
      .select(
        "tracking_id, status, pickup_address, delivery_address, estimated_fee, city"
      )
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(8);

    const list = (rows ?? []) as RecentRow[];
    setRecent(list);
    setActive(
      list.find((r) =>
        ["pending", "accepted", "picked_up", "in_transit"].includes(r.status)
      ) ?? null
    );
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome])
  );

  const hubs = useMemo(
    () =>
      config.hubs.map((h) => ({
        lat: h.lat,
        lng: h.lng,
        label: h.label,
        color: "primary" as const,
      })),
    [config]
  );

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; address: string }[] = [];
    for (const row of recent) {
      const key = row.delivery_address;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        label: shortAddress(row.delivery_address),
        address: row.delivery_address,
      });
      if (out.length >= 3) break;
    }
    if (out.length < 3) {
      for (const hub of config.hubs) {
        if (seen.has(hub.address)) continue;
        out.push({ label: hub.label, address: hub.address });
        if (out.length >= 3) break;
      }
    }
    return out;
  }, [recent, config.hubs]);

  const openSupport = () => {
    Alert.alert("Safety & support", "Need help with a delivery?", [
      {
        text: "WhatsApp support",
        onPress: () => Linking.openURL("https://wa.me/2348000000000"),
      },
      {
        text: "Emergency tip",
        onPress: () =>
          Alert.alert(
            "Stay safe",
            "Share your tracking ID with a trusted contact and wait in a public spot for pickup/drop-off."
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <MapShell
      map={
        <RouteMap
          fullBleed
          center={config.center}
          hubs={hubs}
          delta={0.14}
        />
      }
      top={
        <View style={styles.topRow}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push("/client/profile")}
          >
            <Ionicons name="menu" size={20} color={colors.dark} />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityRow}
          >
            {SERVICE_CITIES.map((item) => {
              const on = item.id === city;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCity(item.id)}
                  style={[styles.cityPill, on && styles.cityPillOn]}
                >
                  <Ionicons
                    name="location"
                    size={12}
                    color={on ? colors.white : colors.primary}
                  />
                  <Text style={[styles.cityText, on && styles.cityTextOn]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.sosBtn} onPress={openSupport}>
            <Ionicons name="shield-checkmark" size={18} color={colors.white} />
          </Pressable>
        </View>
      }
      sheet={
        <ScrollView
          style={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.sheetInner}
        >
          <SheetHandle />

          <View style={styles.greetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greet}>
                {greeting}, {firstName}
              </Text>
              <Text style={styles.sub}>
                {hubs.length} hubs live · couriers around {city}
              </Text>
            </View>
            <View style={styles.avail}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Online</Text>
            </View>
          </View>

          {active ? (
            <Pressable
              style={styles.activeCard}
              onPress={() =>
                router.push(`/client/track/${active.tracking_id}` as never)
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.activeLabel}>Ongoing delivery</Text>
                <Text style={styles.activeId}>{active.tracking_id}</Text>
                <Text style={styles.activeAddr} numberOfLines={1}>
                  {shortAddress(active.delivery_address)}
                </Text>
              </View>
              <Badge
                label={formatStatus(active.status)}
                tone={statusTone(active.status)}
              />
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.whereTo,
              pressed && { opacity: 0.92 },
            ]}
            onPress={() => router.push("/client/book")}
          >
            <View style={styles.searchIcon}>
              <Ionicons name="search" size={18} color={colors.dark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.whereTitle}>Where to deliver?</Text>
              <Text style={styles.whereHint}>Pickup · drop-off · instant fare</Text>
            </View>
            <View style={styles.laterChip}>
              <Ionicons name="time-outline" size={14} color={colors.dark} />
              <Text style={styles.laterText}>Later</Text>
            </View>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceRow}
          >
            {SERVICES.map((s) => (
              <Pressable
                key={s.id}
                style={styles.serviceChip}
                onPress={() => router.push("/client/book")}
              >
                <View style={styles.serviceIcon}>
                  <Ionicons name={s.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.serviceTitle}>{s.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.section}>Suggested drop-offs</Text>
          <View style={styles.suggestions}>
            {suggestions.map((item) => (
              <Pressable
                key={item.address}
                style={styles.suggestion}
                onPress={() => router.push("/client/book")}
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>{item.label}</Text>
                  <Text style={styles.suggestionAddr} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.muted} />
              </Pressable>
            ))}
          </View>

          {recent.length > 0 ? (
            <>
              <Pressable
                style={styles.sectionRow}
                onPress={() => router.push("/client/deliveries")}
              >
                <Text style={styles.section}>Recent activity</Text>
                <Text style={styles.viewAll}>See all</Text>
              </Pressable>
              {recent.slice(0, 2).map((item) => (
                <Pressable
                  key={item.tracking_id}
                  style={styles.recent}
                  onPress={() =>
                    router.push(`/client/track/${item.tracking_id}` as never)
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentId}>{item.tracking_id}</Text>
                    <Text style={styles.recentAddr} numberOfLines={1}>
                      {shortAddress(item.delivery_address)}
                    </Text>
                  </View>
                  <Text style={styles.recentFee}>
                    {formatCurrency(item.estimated_fee)}
                  </Text>
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>
      }
    />
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cityRow: { gap: 8, paddingHorizontal: 2, alignItems: "center" },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  cityPillOn: { backgroundColor: colors.dark, borderColor: colors.dark },
  cityText: { fontWeight: "800", fontSize: 12, color: colors.dark },
  cityTextOn: { color: colors.white },
  sosBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetScroll: { maxHeight: 460 },
  sheetInner: { gap: 12, paddingBottom: 8 },
  greetRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  greet: { fontSize: 20, fontWeight: "900", color: colors.dark },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: "600" },
  avail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  availText: { fontWeight: "800", fontSize: 11, color: colors.primaryDark },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.mapInk,
    borderRadius: 18,
    padding: 14,
  },
  activeLabel: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  activeId: {
    color: colors.white,
    fontFamily: "monospace",
    fontWeight: "800",
    marginTop: 2,
  },
  activeAddr: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },
  whereTo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f3f3f1",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  whereTitle: { fontSize: 17, fontWeight: "900", color: colors.dark },
  whereHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  laterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  laterText: { fontWeight: "800", fontSize: 12, color: colors.dark },
  serviceRow: { gap: 10 },
  serviceChip: {
    width: 88,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  serviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: { fontWeight: "800", fontSize: 12, color: colors.dark },
  section: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  suggestions: { gap: 8 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionTitle: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  suggestionAddr: { color: colors.muted, fontSize: 12, marginTop: 2 },
  recent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  recentId: {
    fontFamily: "monospace",
    fontWeight: "800",
    color: colors.dark,
    fontSize: 13,
  },
  recentAddr: { color: colors.muted, fontSize: 12, marginTop: 2 },
  recentFee: { color: colors.primary, fontWeight: "900" },
});
