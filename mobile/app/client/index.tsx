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
import {
  formatCurrency,
  formatStatus,
  shortAddress,
  statusTone,
} from "@/lib/format";
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
  { id: "schedule", title: "Schedule", icon: "time" as const },
];

export default function ClientHomeScreen() {
  const { profile } = useAuth();
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [active, setActive] = useState<RecentRow | null>(null);

  const config = getCityConfig(city);
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

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
      if (seen.has(row.delivery_address)) continue;
      seen.add(row.delivery_address);
      out.push({
        label: shortAddress(row.delivery_address),
        address: row.delivery_address,
      });
      if (out.length >= 2) break;
    }
    for (const hub of config.hubs) {
      if (out.length >= 3) break;
      if (seen.has(hub.address)) continue;
      out.push({ label: hub.label, address: hub.address });
    }
    return out;
  }, [recent, config.hubs]);

  const openSupport = () => {
    Alert.alert("Safety & support", "Need help right now?", [
      {
        text: "WhatsApp",
        onPress: () => Linking.openURL("https://wa.me/2348000000000"),
      },
      {
        text: "Safety tip",
        onPress: () =>
          Alert.alert(
            "Stay safe",
            "Share your tracking ID with someone you trust before handover."
          ),
      },
      { text: "Close", style: "cancel" },
    ]);
  };

  return (
    <MapShell
      mapInteractive={false}
      map={
        <RouteMap
          fullBleed
          interactive={false}
          center={config.center}
          hubs={hubs}
          delta={0.13}
        />
      }
      top={
        <View style={styles.topRow}>
          <Pressable
            style={styles.roundBtn}
            onPress={() => router.push("/client/profile")}
          >
            <Ionicons name="menu" size={20} color={colors.dark} />
          </Pressable>

          <View style={styles.brandPill}>
            <Text style={styles.brandText}>Gratitude Ride</Text>
          </View>

          <Pressable style={styles.sosBtn} onPress={openSupport}>
            <Ionicons name="shield" size={18} color={colors.white} />
          </Pressable>
        </View>
      }
      sheet={
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.sheetBody}
        >
          <SheetHandle />

          <Text style={styles.hello}>Hi {firstName}</Text>
          <Text style={styles.helloSub}>Where should we deliver today?</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cities}
          >
            {SERVICE_CITIES.map((item) => {
              const on = item.id === city;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCity(item.id)}
                  style={[styles.cityChip, on && styles.cityChipOn]}
                >
                  <Text style={[styles.cityText, on && styles.cityTextOn]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {active ? (
            <Pressable
              style={styles.activeCard}
              onPress={() =>
                router.push(`/client/track/${active.tracking_id}` as never)
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.activeEyebrow}>Ongoing delivery</Text>
                <Text style={styles.activeId}>{active.tracking_id}</Text>
                <Text style={styles.activeAddr} numberOfLines={1}>
                  {shortAddress(active.delivery_address)}
                </Text>
              </View>
              <Badge
                label={formatStatus(active.status)}
                tone={statusTone(active.status)}
              />
            </Pressable>
          ) : null}

          {/* Lagride / Uber primary action */}
          <Pressable
            style={({ pressed }) => [
              styles.whereTo,
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
            onPress={() => router.push("/client/book")}
          >
            <View style={styles.searchBubble}>
              <Ionicons name="search" size={18} color={colors.dark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.whereTitle}>Where to deliver?</Text>
              <Text style={styles.whereHint}>Tap to set pickup & drop-off</Text>
            </View>
            <View style={styles.later}>
              <Ionicons name="time-outline" size={14} color={colors.dark} />
              <Text style={styles.laterText}>Later</Text>
            </View>
          </Pressable>

          <View style={styles.serviceRow}>
            {SERVICES.map((s) => (
              <Pressable
                key={s.id}
                style={styles.service}
                onPress={() => router.push("/client/book")}
              >
                <View style={styles.serviceIcon}>
                  <Ionicons name={s.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.serviceLabel}>{s.title}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.section}>Suggested places</Text>
          {suggestions.map((item) => (
            <Pressable
              key={item.address}
              style={styles.suggestion}
              onPress={() => router.push("/client/book")}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name="location" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle}>{item.label}</Text>
                <Text style={styles.suggestionAddr} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </Pressable>
          ))}

          {recent[0] ? (
            <Pressable
              style={styles.recent}
              onPress={() =>
                router.push(`/client/track/${recent[0].tracking_id}` as never)
              }
            >
              <Text style={styles.recentLabel}>Last delivery</Text>
              <Text style={styles.recentValue}>
                {recent[0].tracking_id} ·{" "}
                {formatCurrency(recent[0].estimated_fee)}
              </Text>
            </Pressable>
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
    justifyContent: "space-between",
    gap: 10,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandPill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  brandText: {
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: 0.3,
    fontSize: 13,
  },
  sosBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: { gap: 12, paddingBottom: 6 },
  hello: { fontSize: 22, fontWeight: "900", color: colors.dark },
  helloSub: { color: colors.muted, fontSize: 14, marginTop: -6 },
  cities: { gap: 8 },
  cityChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cityChipOn: { backgroundColor: colors.dark, borderColor: colors.dark },
  cityText: { fontWeight: "800", fontSize: 12, color: colors.dark },
  cityTextOn: { color: colors.white },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.mapInk,
    borderRadius: 18,
    padding: 14,
  },
  activeEyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  activeId: {
    color: colors.white,
    fontFamily: "monospace",
    fontWeight: "800",
    marginTop: 2,
  },
  activeAddr: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  whereTo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ecece8",
    borderRadius: 18,
    padding: 14,
    minHeight: 64,
  },
  searchBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  whereTitle: { fontSize: 18, fontWeight: "900", color: colors.dark },
  whereHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  later: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  laterText: { fontWeight: "800", fontSize: 12, color: colors.dark },
  serviceRow: { flexDirection: "row", gap: 8 },
  service: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: { fontWeight: "800", fontSize: 11, color: colors.dark },
  section: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionTitle: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  suggestionAddr: { color: colors.muted, fontSize: 12, marginTop: 1 },
  recent: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  recentValue: {
    marginTop: 4,
    fontWeight: "800",
    color: colors.dark,
    fontFamily: "monospace",
  },
});
