import { DeliveryCard } from "@/components/delivery/DeliveryCard";
import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors, typography } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import type { Delivery } from "@/lib/deliveries";
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

type Filter = "all" | "active" | "done";

export default function ClientDeliveriesScreen() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

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
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = rows.filter((row) => {
    if (filter === "active") {
      return ["pending", "accepted", "picked_up", "in_transit"].includes(
        row.status
      );
    }
    if (filter === "done") {
      return ["delivered", "cancelled"].includes(row.status);
    }
    return true;
  });

  return (
    <Screen>
      <Text style={styles.title}>My deliveries</Text>
      <Text style={styles.sub}>Track every package from hub to doorstep.</Text>

      <View style={styles.filters}>
        {(
          [
            ["all", "All"],
            ["active", "Active"],
            ["done", "Completed"],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[styles.chip, filter === key && styles.chipOn]}
          >
            <Text style={[styles.chipText, filter === key && styles.chipTextOn]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No deliveries yet"
          message="Book your first package to see live tracking here."
          actionLabel="Book a delivery"
          onAction={() => router.push("/client/book")}
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((item) => (
            <DeliveryCard
              key={item.id}
              delivery={item}
              onPress={() =>
                router.push(`/client/track/${item.tracking_id}` as never)
              }
            />
          ))}
          <Pressable onPress={onRefresh} style={styles.refresh}>
            <Text style={styles.refreshText}>
              {refreshing ? "Refreshing…" : "Pull-style refresh · Tap to reload"}
            </Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.dark },
  sub: { ...typography.subtitle },
  filters: { flexDirection: "row", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.dark, borderColor: colors.dark },
  chipText: { fontWeight: "700", color: colors.dark, fontSize: 13 },
  chipTextOn: { color: colors.white },
  list: { gap: 10 },
  refresh: { alignItems: "center", paddingVertical: 8 },
  refreshText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
});
