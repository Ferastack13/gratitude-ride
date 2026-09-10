import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Badge } from "@/components/ui/Badge";
import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import type { Delivery } from "@/lib/deliveries";
import {
  formatCurrency,
  formatStatus,
  shortAddress,
  statusTone,
} from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function BusinessHomeScreen() {
  const { profile } = useAuth();
  const [upcoming, setUpcoming] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!client?.id) {
      setUpcoming([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("client_id", client.id)
      .in("status", ["pending", "accepted", "picked_up", "in_transit"])
      .order("created_at", { ascending: false })
      .limit(5);
    setUpcoming(data ?? []);
    setLoading(false);
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const company = profile?.full_name?.split(" ")[0] ?? "Business";

  return (
    <Screen>
      <ScreenHeader
        title="Business"
        subtitle={`Welcome, ${company}`}
      />

      <Card tint="blue">
        <Text style={styles.heroTitle}>Book for your team</Text>
        <Text style={styles.heroBody}>
          Create a trip for clients, staff, or guests — same reliable Gratitude
          Ride network.
        </Text>
        <Button
          label="Quick book"
          onPress={() => router.push("/business/book" as never)}
        />
      </Card>

      <View style={styles.row}>
        <Pressable
          style={styles.tile}
          onPress={() => router.push("/business/bookings" as never)}
        >
          <Text style={styles.tileTitle}>Bookings</Text>
          <Text style={styles.tileSub}>History & live</Text>
        </Pressable>
        <Pressable
          style={styles.tile}
          onPress={() => router.push("/business/billing" as never)}
        >
          <Text style={styles.tileTitle}>Billing</Text>
          <Text style={styles.tileSub}>Payment prefs</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Upcoming</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          title="No upcoming bookings"
          message="Quick book a trip for a passenger or team member."
          actionLabel="Quick book"
          onAction={() => router.push("/business/book" as never)}
        />
      ) : (
        upcoming.map((row) => (
          <Pressable
            key={row.id}
            style={styles.item}
            onPress={() =>
              router.push(`/business/track/${row.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemAddr} numberOfLines={1}>
                {shortAddress(row.delivery_address)}
              </Text>
              <Text style={styles.itemMeta}>
                {formatCurrency(row.estimated_fee)} · {row.city}
              </Text>
            </View>
            <Badge
              label={formatStatus(row.status)}
              tone={statusTone(row.status)}
            />
          </Pressable>
        ))
      )}

      <Card>
        <Text style={styles.teamTitle}>Team / passengers</Text>
        <Text style={styles.teamBody}>
          Invite teammates and manage guest riders — coming soon.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroTitle: { fontWeight: "900", fontSize: 18, color: colors.dark },
  heroBody: { color: colors.muted, lineHeight: 20, marginBottom: 4 },
  row: { flexDirection: "row", gap: 12 },
  tile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  tileTitle: { fontWeight: "900", color: colors.dark },
  tileSub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  section: { fontSize: 16, fontWeight: "900", color: colors.dark, marginTop: 4 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  itemAddr: { fontWeight: "800", color: colors.dark },
  itemMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  teamTitle: { fontWeight: "900", color: colors.dark },
  teamBody: { color: colors.muted, lineHeight: 20 },
});
