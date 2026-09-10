import { TripActivityCard } from "@/components/passenger/TripActivityCard";
import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import type { Delivery } from "@/lib/deliveries";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const ACTIVE = new Set(["pending", "accepted", "picked_up", "in_transit"]);

export default function PassengerActivityScreen() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!client?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(40);
    setRows(data ?? []);
    setLoading(false);
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const { active, past } = useMemo(() => {
    const a: Delivery[] = [];
    const p: Delivery[] = [];
    for (const row of rows) {
      if (ACTIVE.has(row.status)) a.push(row);
      else p.push(row);
    }
    return { active: a, past: p };
  }, [rows]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.sub}>Your trips with Gratitude Ride</Text>
      </View>

      {rows.length === 0 ? (
        <EmptyState
          title="No trips yet"
          message="When you book a ride, your history will show up here."
          actionLabel="Where to?"
          onAction={() => router.push("/passenger/where-to" as never)}
        />
      ) : (
        <View style={styles.list}>
          {active.length > 0 ? (
            <>
              <Text style={styles.section}>In progress</Text>
              {active.map((row) => (
                <TripActivityCard
                  key={row.id}
                  delivery={row}
                  onPress={() =>
                    router.push(`/passenger/track/${row.tracking_id}` as never)
                  }
                />
              ))}
            </>
          ) : null}

          {past.length > 0 ? (
            <>
              <Text style={styles.section}>Past trips</Text>
              {past.map((row) => (
                <TripActivityCard
                  key={row.id}
                  delivery={row}
                  onPress={() =>
                    router.push(`/passenger/trip/${row.tracking_id}` as never)
                  }
                />
              ))}
            </>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4, marginBottom: 4 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  sub: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  list: { gap: 12 },
  section: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
