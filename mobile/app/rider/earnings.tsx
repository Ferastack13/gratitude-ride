import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { getDriverPayoutDetails } from "@/lib/driver-payouts";
import { formatCurrency, shortAddress } from "@/lib/format";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
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

function tripFee(t: Trip) {
  return Number(t.actual_fee ?? t.estimated_fee ?? 0);
}

function openTripDetail(t: Trip) {
  const fee = formatCurrency(tripFee(t));
  const when = t.delivered_at
    ? new Date(t.delivered_at).toLocaleString()
    : "Completed";
  Alert.alert(
    `Trip ${t.tracking_id}`,
    [
      `Earned ${fee}`,
      `Pickup: ${t.pickup_address}`,
      `Drop-off: ${t.delivery_address}`,
      t.city ? `City: ${t.city}` : null,
      when,
    ]
      .filter(Boolean)
      .join("\n\n")
  );
}

export default function RiderEarningsScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const [earnings, setEarnings] = useState(0);
  const [verified, setVerified] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [tripCount, setTripCount] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hasPayout, setHasPayout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const [{ data: rider }, payout] = await Promise.all([
        supabase
          .from("riders")
          .select("id, earnings, is_verified, rating, total_deliveries")
          .eq("user_id", profile.id)
          .maybeSingle(),
        getDriverPayoutDetails(),
      ]);

      setEarnings(Number(rider?.earnings || 0));
      setVerified(Boolean(rider?.is_verified));
      setRating(
        typeof rider?.rating === "number" ? Number(rider.rating) : null
      );
      setTripCount(Number(rider?.total_deliveries || 0));
      setHasPayout(Boolean(payout));

      if (rider?.id) {
        const { data } = await supabase
          .from("deliveries")
          .select(
            "id, tracking_id, estimated_fee, actual_fee, delivered_at, city, delivery_address, pickup_address"
          )
          .eq("rider_id", rider.id)
          .eq("status", "delivered")
          .order("delivered_at", { ascending: false })
          .limit(100);
        setTrips((data as Trip[]) ?? []);
      } else {
        setTrips([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const todayTotal = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return trips
      .filter((t) => t.delivered_at && new Date(t.delivered_at) >= start)
      .reduce((sum, t) => sum + tripFee(t), 0);
  }, [trips]);

  const weekTotal = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return trips
      .filter(
        (t) => t.delivered_at && new Date(t.delivered_at).getTime() > weekAgo
      )
      .reduce((sum, t) => sum + tripFee(t), 0);
  }, [trips]);

  const weekTrips = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return trips.filter(
      (t) => t.delivered_at && new Date(t.delivered_at).getTime() > weekAgo
    ).length;
  }, [trips]);

  const ratingLabel =
    rating != null && Number.isFinite(rating)
      ? `${rating.toFixed(1)}★`
      : "New";

  if (loading && !refreshing) {
    return (
      <Screen>
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScreenHeader
        title="Earnings"
        right={
          <Pressable
            style={[styles.help, { backgroundColor: colors.surfaceAlt }]}
            onPress={() =>
              Linking.openURL(SENIOR_SUPPORT_WHATSAPP).catch(() =>
                Alert.alert(
                  "Help",
                  "Payouts come from completed trips. Cash out is coming soon."
                )
              )
            }
          >
            <Text style={[styles.helpText, { color: colors.dark }]}>Help</Text>
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <Card
          style={[
            styles.verify,
            {
              backgroundColor: verified
                ? colors.successSoft
                : colors.secondarySoft,
            },
          ]}
        >
          <Text
            style={[
              styles.verifyTitle,
              { color: verified ? colors.success : colors.secondaryDark },
            ]}
          >
            {verified ? "Verified driver" : "Verification pending"}
          </Text>
          <Text style={[styles.verifyBody, { color: colors.muted }]}>
            {verified
              ? `Trusted courier · ${ratingLabel}${
                  tripCount ? ` · ${tripCount} trips` : ""
                }`
              : "Complete trips and keep your profile details up to date while we review your account."}
          </Text>
        </Card>

        <Card style={styles.hero}>
          <Text style={[styles.range, { color: colors.muted }]}>This week</Text>
          <Text style={[styles.big, { color: colors.dark }]}>
            {formatCurrency(weekTotal)}
          </Text>
          <View style={styles.metrics}>
            <View
              style={[styles.metric, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.metricVal, { color: colors.dark }]}>
                {formatCurrency(todayTotal)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>
                Today
              </Text>
            </View>
            <View
              style={[styles.metric, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.metricVal, { color: colors.dark }]}>
                {weekTrips}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>
                Trips
              </Text>
            </View>
            <View
              style={[styles.metric, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.metricVal, { color: colors.dark }]}>
                {formatCurrency(earnings)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>
                All time
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[styles.walletTitle, { color: colors.dark }]}>
            Wallet
          </Text>
          <Text style={[styles.walletBal, { color: colors.dark }]}>
            {formatCurrency(earnings)}
          </Text>
          <Text style={[styles.walletHint, { color: colors.muted }]}>
            Available balance from completed trips
            {hasPayout ? " · payout details saved" : ""}
          </Text>
          <Pressable
            style={[styles.cashBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/rider/payouts" as never)}
          >
            <Text style={styles.cashText}>
              {hasPayout ? "Manage payout details" : "Set up payouts"}
            </Text>
          </Pressable>
          <Text style={[styles.coming, { color: colors.muted }]}>
            Cash out is coming soon
          </Text>
        </Card>

        <Text style={[styles.section, { color: colors.dark }]}>
          Trip history
        </Text>
        {trips.length === 0 ? (
          <EmptyState
            title="No completed trips yet"
            message="Finished trips and earnings will show up here."
          />
        ) : (
          trips.map((t) => (
            <Pressable key={t.id} onPress={() => openTripDetail(t)}>
              <Card style={styles.tripCard}>
                <View style={styles.tripRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tripFee, { color: colors.dark }]}>
                      {formatCurrency(tripFee(t))}
                    </Text>
                    <Text
                      style={[styles.tripAddr, { color: colors.dark }]}
                      numberOfLines={1}
                    >
                      {shortAddress(t.pickup_address)} →{" "}
                      {shortAddress(t.delivery_address)}
                    </Text>
                    <Text style={[styles.tripMeta, { color: colors.muted }]}>
                      {t.tracking_id}
                      {t.delivered_at
                        ? ` · ${new Date(t.delivered_at).toLocaleDateString()}`
                        : ""}
                    </Text>
                  </View>
                  <Text style={[styles.tap, { color: colors.mutedLight }]}>
                    Details
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingBottom: 48 },
  help: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  helpText: { fontWeight: "800", fontSize: 12 },
  verify: { gap: 4 },
  verifyTitle: { fontWeight: "900", fontSize: 15 },
  verifyBody: { fontSize: 13, lineHeight: 18 },
  hero: { gap: 10 },
  range: { fontWeight: "700", fontSize: 13 },
  big: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  metrics: { flexDirection: "row", gap: 8, marginTop: 4 },
  metric: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
  },
  metricVal: { fontWeight: "900", fontSize: 13 },
  metricLabel: { fontSize: 11, marginTop: 2 },
  walletTitle: { fontWeight: "900", fontSize: 16 },
  walletBal: { fontSize: 28, fontWeight: "900" },
  walletHint: { fontSize: 12 },
  cashBtn: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  cashText: { fontWeight: "800", color: "#fff" },
  coming: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
  },
  section: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  tripCard: {},
  tripRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tripFee: { fontWeight: "900", fontSize: 16 },
  tripAddr: { fontWeight: "600", marginTop: 4, fontSize: 13 },
  tripMeta: { fontSize: 12, marginTop: 2 },
  tap: { fontWeight: "700", fontSize: 12 },
});
