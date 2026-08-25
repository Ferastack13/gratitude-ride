import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors, typography } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Trip = {
  id: string;
  tracking_id: string;
  estimated_fee: number;
  actual_fee: number | null;
  delivered_at: string | null;
  city: string;
  delivery_address: string;
};

export default function RiderEarningsScreen() {
  const { profile } = useAuth();
  const [earnings, setEarnings] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data: rider } = await supabase
      .from("riders")
      .select("id, earnings")
      .eq("user_id", profile.id)
      .maybeSingle();

    setEarnings(Number(rider?.earnings || 0));

    if (rider?.id) {
      const { data } = await supabase
        .from("deliveries")
        .select(
          "id, tracking_id, estimated_fee, actual_fee, delivered_at, city, delivery_address"
        )
        .eq("rider_id", rider.id)
        .eq("status", "delivered")
        .order("delivered_at", { ascending: false })
        .limit(20);
      setTrips(data ?? []);
    } else {
      setTrips([]);
    }
    setLoading(false);
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const weekTotal = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return trips
      .filter((t) => t.delivered_at && new Date(t.delivered_at).getTime() > weekAgo)
      .reduce((sum, t) => sum + Number(t.actual_fee ?? t.estimated_fee), 0);
  }, [trips]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Earnings</Text>
      <Text style={styles.sub}>Track payouts from completed deliveries.</Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Lifetime earnings</Text>
        <Text style={styles.heroValue}>{formatCurrency(earnings)}</Text>
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.statValue}>{formatCurrency(weekTotal)}</Text>
            <Text style={styles.statLabel}>This week</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <Text style={styles.section}>Recent payouts</Text>
      {trips.length === 0 ? (
        <EmptyState
          title="No completed payouts yet"
          message="Accept jobs from Orders and complete the delivery lifecycle to grow your wallet."
        />
      ) : (
        <View style={styles.list}>
          {trips.map((trip) => (
            <Card key={trip.id}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tracking}>{trip.tracking_id}</Text>
                  <Text style={styles.addr} numberOfLines={1}>
                    {trip.city} · {trip.delivery_address}
                  </Text>
                </View>
                <Text style={styles.amount}>
                  {formatCurrency(trip.actual_fee ?? trip.estimated_fee)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.dark },
  sub: { ...typography.subtitle },
  hero: {
    backgroundColor: colors.mapInk,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  heroValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  heroStats: {
    flexDirection: "row",
    gap: 28,
    marginTop: 10,
  },
  statValue: { color: colors.secondary, fontWeight: "900", fontSize: 18 },
  statLabel: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 },
  section: { ...typography.label, marginTop: 4 },
  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  tracking: {
    fontFamily: "monospace",
    fontWeight: "800",
    color: colors.dark,
  },
  addr: { color: colors.muted, fontSize: 12, marginTop: 4 },
  amount: { color: colors.primary, fontWeight: "900", fontSize: 16 },
});
