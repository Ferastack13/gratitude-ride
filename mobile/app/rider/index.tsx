import { QuickAction } from "@/components/home/QuickAction";
import { SectionLabel } from "@/components/home/SectionLabel";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RiderHubScreen() {
  const { profile } = useAuth();
  const [online, setOnline] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [deliveries, setDeliveries] = useState(0);
  const [rating, setRating] = useState(5);
  const [pendingCount, setPendingCount] = useState(0);
  const [cityDemand, setCityDemand] = useState<
    { city: string; jobs: number }[]
  >([
    { city: "Lagos", jobs: 0 },
    { city: "Abuja", jobs: 0 },
    { city: "Port Harcourt", jobs: 0 },
  ]);
  const [toggling, setToggling] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const firstName = profile?.full_name?.split(" ")[0] ?? "Rider";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!profile?.id) return;

    supabase
      .from("riders")
      .select("is_available, earnings, total_deliveries, rating")
      .eq("user_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setOnline(Boolean(data.is_available));
        setEarnings(Number(data.earnings || 0));
        setDeliveries(Number(data.total_deliveries || 0));
        setRating(Number(data.rating || 5));
      });

    (async () => {
      const { count } = await supabase
        .from("deliveries")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingCount(count ?? 0);

      const cities = ["Lagos", "Abuja", "Port Harcourt"] as const;
      const demand = await Promise.all(
        cities.map(async (city) => {
          const { count: cityCount } = await supabase
            .from("deliveries")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending")
            .eq("city", city);
          return { city, jobs: cityCount ?? 0 };
        })
      );
      setCityDemand(demand);

      const { data: rider } = await supabase
        .from("riders")
        .select("id")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (rider?.id) {
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
    })();
  }, [profile?.id]);

  useEffect(() => {
    if (!online) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [online, pulse]);

  const toggleOnline = async () => {
    if (!profile?.id || toggling) return;
    const next = !online;
    setToggling(true);
    setOnline(next);
    const { error } = await supabase
      .from("riders")
      .update({ is_available: next })
      .eq("user_id", profile.id);
    if (error) setOnline(!next);
    setToggling(false);
  };

  const todayGoal = 15000;
  const progress = useMemo(
    () => Math.min(1, earnings / todayGoal || 0.12),
    [earnings]
  );

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.glowA} />
        <View style={styles.glowB} />

        <View style={styles.brandRow}>
          <Text style={styles.brand}>Gratitude Ride</Text>
          <View style={[styles.statusChip, online && styles.statusOnline]}>
            <Animated.View
              style={[
                styles.dot,
                online && styles.dotOnline,
                { transform: [{ scale: pulse }] },
              ]}
            />
            <Text style={styles.statusText}>{online ? "Live" : "Offline"}</Text>
          </View>
        </View>

        <Text style={styles.greeting}>
          {greeting}, {firstName}
        </Text>
        <Text style={styles.heroSub}>
          Premium courier mode · Lagos · Abuja · Port Harcourt
        </Text>

        <View style={styles.earnBlock}>
          <Text style={styles.earnLabel}>Today's earnings</Text>
          <Text style={styles.earnValue}>{formatCurrency(earnings)}</Text>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.goalHint}>
            Goal {formatCurrency(todayGoal)} · {Math.round(progress * 100)}%
            complete
          </Text>
        </View>

        <Pressable
          onPress={toggleOnline}
          disabled={toggling}
          style={({ pressed }) => [
            styles.power,
            online ? styles.powerOn : styles.powerOff,
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.powerLeft}>
            <Ionicons
              name={online ? "radio" : "power"}
              size={22}
              color={online ? colors.dark : colors.white}
            />
            <View>
              <Text style={[styles.powerTitle, online && styles.powerTitleOn]}>
                {online ? "You're online" : "Go online"}
              </Text>
              <Text style={[styles.powerHint, online && styles.powerHintOn]}>
                {online
                  ? `${pendingCount} open jobs nearby`
                  : "Start receiving delivery requests"}
              </Text>
            </View>
          </View>
          <View style={[styles.switch, online && styles.switchOn]}>
            <View style={[styles.knob, online && styles.knobOn]} />
          </View>
        </Pressable>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{deliveries}</Text>
          <Text style={styles.metricLabel}>Trips</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{rating.toFixed(1)}★</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{pendingCount}</Text>
          <Text style={styles.metricLabel}>Queue</Text>
        </View>
      </View>

      <SectionLabel title="Quick launch" />
      <View style={styles.actions}>
        <QuickAction
          icon="list"
          label="Orders"
          hint="Incoming jobs"
          onPress={() => router.push("/rider/orders")}
          tone="green"
        />
        <QuickAction
          icon="wallet"
          label="Wallet"
          hint="Payouts"
          onPress={() => router.push("/rider/earnings")}
        />
        <QuickAction
          icon="navigate"
          label="Navigate"
          hint="Active trip"
          onPress={() =>
            activeTripId
              ? router.push(`/rider/active/${activeTripId}` as never)
              : router.push("/rider/orders")
          }
          tone="dark"
        />
      </View>

      <SectionLabel title="City demand" action="Live" />
      <View style={styles.demandCard}>
        {cityDemand.map((row) => {
          const heat = Math.min(1, Math.max(0.08, row.jobs / 12));
          return (
            <View key={row.city} style={styles.demandRow}>
              <View style={styles.demandMeta}>
                <Text style={styles.demandCity}>{row.city}</Text>
                <Text style={styles.demandJobs}>{row.jobs} open</Text>
              </View>
              <View style={styles.heatTrack}>
                <View style={[styles.heatFill, { width: `${heat * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      <SectionLabel title="Shift tips" />
      <View style={styles.tips}>
        <View style={styles.tip}>
          <Ionicons name="flash" size={16} color={colors.secondaryDark} />
          <Text style={styles.tipText}>
            Peak windows: 7–10am and 5–9pm in Lagos VI & Lekki.
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          <Text style={styles.tipText}>
            Keep your status Online and accept within 30s for better ranking.
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.queueCard}
        onPress={() => router.push("/rider/orders")}
      >
        <View style={styles.queueTop}>
          <Text style={styles.queueTitle}>Job queue</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
        <Text style={styles.queueBody}>
          {online
            ? pendingCount > 0
              ? `${pendingCount} pending jobs nearby. Open Orders for timed Accept offers with upfront payout.`
              : "You're live. New requests will pop as timed offers — Accept within 20s."
            : "Go online to unlock timed job offers across Lagos, Abuja, and Port Harcourt."}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.mapInk,
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
    gap: 10,
  },
  glowA: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primary,
    opacity: 0.22,
    top: -40,
    right: -30,
  },
  glowB: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.secondary,
    opacity: 0.12,
    bottom: -50,
    left: -20,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    color: colors.secondary,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusOnline: { backgroundColor: "rgba(34,197,94,0.2)" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mutedLight,
  },
  dotOnline: { backgroundColor: colors.primaryGlow },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  greeting: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  heroSub: { color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 18 },
  earnBlock: { marginTop: 10, gap: 6 },
  earnLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  earnValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  goalTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginTop: 4,
  },
  goalFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  goalHint: { color: "rgba(255,255,255,0.55)", fontSize: 12 },
  power: {
    marginTop: 8,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  powerOn: { backgroundColor: colors.secondary },
  powerOff: { backgroundColor: colors.darkElevated },
  powerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  powerTitle: { color: colors.white, fontWeight: "800", fontSize: 16 },
  powerTitleOn: { color: colors.dark },
  powerHint: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },
  powerHintOn: { color: "rgba(15,15,15,0.65)" },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#333",
    padding: 3,
    justifyContent: "center",
  },
  switchOn: { backgroundColor: colors.dark },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  knobOn: { alignSelf: "flex-end" },
  metrics: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
  },
  metric: { flex: 1, alignItems: "center", gap: 4 },
  metricValue: { fontSize: 18, fontWeight: "900", color: colors.dark },
  metricLabel: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  metricDivider: { width: 1, backgroundColor: colors.border },
  actions: { flexDirection: "row", gap: 10 },
  demandCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  demandRow: { gap: 8 },
  demandMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  demandCity: { fontWeight: "800", color: colors.dark },
  demandJobs: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  heatTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  heatFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  tips: { gap: 10 },
  tip: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, color: colors.dark, fontSize: 13, lineHeight: 18 },
  queueCard: {
    backgroundColor: colors.dark,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  queueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  queueTitle: { color: colors.white, fontWeight: "800", fontSize: 16 },
  queueBody: { color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 19 },
});
