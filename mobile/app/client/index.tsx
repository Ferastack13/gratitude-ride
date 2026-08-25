import { QuickAction } from "@/components/home/QuickAction";
import { SectionLabel } from "@/components/home/SectionLabel";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { SERVICE_CITIES } from "@/lib/cities";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SERVICES = [
  {
    id: "express",
    title: "Express",
    hint: "Same-day",
    icon: "flash" as const,
  },
  {
    id: "scheduled",
    title: "Scheduled",
    hint: "Pick a time",
    icon: "time" as const,
  },
  {
    id: "fragile",
    title: "Fragile",
    hint: "Care handle",
    icon: "cube" as const,
  },
];

export default function ClientHomeScreen() {
  const { profile } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [recent, setRecent] = useState<
    { tracking_id: string; status: string; delivery_address: string; estimated_fee: number }[]
  >([]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!profile?.id) return;

    (async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (!client?.id) return;

      const { count } = await supabase
        .from("deliveries")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client.id)
        .in("status", ["pending", "accepted", "picked_up", "in_transit"]);
      setActiveCount(count ?? 0);

      const { data: rows } = await supabase
        .from("deliveries")
        .select("tracking_id, status, delivery_address, estimated_fee")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecent(rows ?? []);
    })();
  }, [profile?.id]);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.glow} />
        <Text style={styles.brand}>Gratitude Ride</Text>
        <Text style={styles.greeting}>
          {greeting}, {firstName}
        </Text>
        <Text style={styles.heroSub}>
          Premium express delivery across Nigeria's busiest cities.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
          onPress={() => router.push("/client/book")}
        >
          <View>
            <Text style={styles.ctaTitle}>Book a delivery</Text>
            <Text style={styles.ctaHint}>Quote in seconds · Live tracking</Text>
          </View>
          <View style={styles.ctaIcon}>
            <Ionicons name="arrow-forward" size={18} color={colors.dark} />
          </View>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{recent.length}</Text>
          <Text style={styles.statLabel}>Recent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Cities</Text>
        </View>
      </View>

      <SectionLabel title="Send faster" />
      <View style={styles.services}>
        {SERVICES.map((item) => (
          <Pressable
            key={item.id}
            style={styles.service}
            onPress={() => router.push("/client/book")}
          >
            <View style={styles.serviceIcon}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.serviceHint}>{item.hint}</Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel title="Coverage" />
      <View style={styles.cities}>
        {SERVICE_CITIES.map((city) => (
          <View key={city.id} style={styles.cityChip}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={styles.cityText}>{city.label}</Text>
          </View>
        ))}
      </View>

      <SectionLabel title="Shortcuts" />
      <View style={styles.actions}>
        <QuickAction
          icon="map"
          label="Track"
          hint="Live status"
          onPress={() => router.push("/client/deliveries")}
        />
        <QuickAction
          icon="cube"
          label="Deliveries"
          hint="History"
          onPress={() => router.push("/client/deliveries")}
          tone="dark"
        />
        <QuickAction
          icon="person"
          label="Profile"
          hint="Account"
          onPress={() => router.push("/client/profile")}
        />
      </View>

      <Pressable onPress={() => router.push("/client/deliveries")}>
        <SectionLabel title="Recent activity" action="View all" />
      </Pressable>
      <View style={styles.recentCard}>
        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bicycle" size={22} color={colors.primary} />
            <Text style={styles.emptyTitle}>No deliveries yet</Text>
            <Text style={styles.emptyBody}>
              Book your first package and track it live from pickup to doorstep.
            </Text>
          </View>
        ) : (
          recent.map((item) => (
            <Pressable
              key={item.tracking_id}
              style={styles.recentRow}
              onPress={() =>
                router.push(`/client/track/${item.tracking_id}` as never)
              }
            >
              <View style={styles.recentIcon}>
                <Ionicons name="navigate" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentId}>{item.tracking_id}</Text>
                <Text style={styles.recentAddr} numberOfLines={1}>
                  {item.delivery_address}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.status.replace("_", " ")}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.mapInk,
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
    gap: 8,
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.25,
    top: -60,
    right: -40,
  },
  brand: {
    color: colors.secondary,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  greeting: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  heroSub: { color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 20 },
  cta: {
    marginTop: 12,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaTitle: { color: colors.dark, fontWeight: "900", fontSize: 16 },
  ctaHint: { color: "rgba(15,15,15,0.65)", fontSize: 12, marginTop: 2 },
  ctaIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(15,15,15,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontWeight: "900", color: colors.dark },
  statLabel: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  statDivider: { width: 1, backgroundColor: colors.border },
  services: { flexDirection: "row", gap: 10 },
  service: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: { fontWeight: "800", color: colors.dark },
  serviceHint: { fontSize: 11, color: colors.muted },
  cities: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cityText: { fontWeight: "700", color: colors.dark, fontSize: 13 },
  actions: { flexDirection: "row", gap: 10 },
  recentCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  empty: { alignItems: "center", gap: 6, paddingVertical: 18, paddingHorizontal: 8 },
  emptyTitle: { fontWeight: "800", color: colors.dark, fontSize: 15 },
  emptyBody: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  recentIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  recentId: { fontWeight: "800", color: colors.dark, fontFamily: "monospace" },
  recentAddr: { color: colors.muted, fontSize: 12, marginTop: 2 },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },
});
