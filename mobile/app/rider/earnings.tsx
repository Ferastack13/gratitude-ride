import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { formatCurrency, shortAddress } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Trip = {
  id: string;
  tracking_id: string;
  estimated_fee: number;
  actual_fee: number | null;
  delivered_at: string | null;
  city: string;
  delivery_address: string;
  pickup_address: string;
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
          "id, tracking_id, estimated_fee, actual_fee, delivered_at, city, delivery_address, pickup_address"
        )
        .eq("rider_id", rider.id)
        .eq("status", "delivered")
        .order("delivered_at", { ascending: false })
        .limit(30);
      setTrips((data as Trip[]) ?? []);
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

  const todayTotal = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return trips
      .filter((t) => t.delivered_at && new Date(t.delivered_at) >= start)
      .reduce((sum, t) => sum + Number(t.actual_fee ?? t.estimated_fee), 0);
  }, [trips]);

  const weekTotal = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return trips
      .filter(
        (t) => t.delivered_at && new Date(t.delivered_at).getTime() > weekAgo
      )
      .reduce((sum, t) => sum + Number(t.actual_fee ?? t.estimated_fee), 0);
  }, [trips]);

  const weekTrips = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return trips.filter(
      (t) => t.delivered_at && new Date(t.delivered_at).getTime() > weekAgo
    ).length;
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
      <ScreenHeader
        title="Earnings"
        right={
          <Pressable
            style={styles.help}
            onPress={() =>
              Alert.alert("Help", "Payouts are tracked from completed trips.")
            }
          >
            <Text style={styles.helpText}>Help</Text>
          </Pressable>
        }
      />

      <Card style={styles.hero}>
        <Text style={styles.range}>This week</Text>
        <Text style={styles.big}>{formatCurrency(weekTotal)}</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>{formatCurrency(todayTotal)}</Text>
            <Text style={styles.metricLabel}>Today</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>{weekTrips}</Text>
            <Text style={styles.metricLabel}>Trips</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>{formatCurrency(earnings)}</Text>
            <Text style={styles.metricLabel}>Lifetime</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.walletTitle}>Wallet</Text>
        <Text style={styles.walletBal}>{formatCurrency(earnings)}</Text>
        <Text style={styles.walletHint}>
          Available balance from completed trips
        </Text>
        <Pressable
          style={styles.cashBtn}
          onPress={() =>
            Alert.alert(
              "Payouts",
              "Cash out will connect to your payout method soon."
            )
          }
        >
          <Text style={styles.cashText}>Cash out and more</Text>
        </Pressable>
      </Card>

      <Text style={styles.section}>Trip history</Text>
      {trips.length === 0 ? (
        <EmptyState
          title="No completed trips yet"
          message="Finished trips and earnings will show up here."
        />
      ) : (
        trips.slice(0, 12).map((t) => (
          <Card key={t.id} style={styles.tripCard}>
            <View style={styles.tripRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tripFee}>
                  {formatCurrency(Number(t.actual_fee ?? t.estimated_fee))}
                </Text>
                <Text style={styles.tripAddr} numberOfLines={1}>
                  {shortAddress(t.pickup_address)} →{" "}
                  {shortAddress(t.delivery_address)}
                </Text>
                <Text style={styles.tripMeta}>
                  {t.city}
                  {t.delivered_at
                    ? ` · ${new Date(t.delivered_at).toLocaleDateString()}`
                    : ""}
                </Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  helpText: { fontWeight: "800", color: colors.dark, fontSize: 12 },
  hero: { gap: 10 },
  range: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  big: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -1,
  },
  metrics: { flexDirection: "row", gap: 8, marginTop: 4 },
  metric: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
  },
  metricVal: { fontWeight: "900", color: colors.dark, fontSize: 13 },
  metricLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  walletTitle: { fontWeight: "900", fontSize: 16, color: colors.dark },
  walletBal: { fontSize: 28, fontWeight: "900", color: colors.dark },
  walletHint: { color: colors.muted, fontSize: 12 },
  cashBtn: {
    marginTop: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  cashText: { fontWeight: "800", color: colors.dark },
  section: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.dark,
    marginTop: 8,
  },
  tripCard: { ...shadows.card },
  tripRow: { flexDirection: "row", alignItems: "center" },
  tripFee: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  tripAddr: { color: colors.dark, fontWeight: "600", marginTop: 4, fontSize: 13 },
  tripMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
