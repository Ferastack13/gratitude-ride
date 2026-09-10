import { EmptyState } from "@/components/ui/Card";
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

export default function BusinessBookingsScreen() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

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
      .limit(50);
    setRows(data ?? []);
    setLoading(false);
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

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
      <ScreenHeader title="Bookings" subtitle="All business trips" />
      <View style={styles.filters}>
        {(["all", "active", "done"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipOn]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>
              {f === "all" ? "All" : f === "active" ? "Live" : "Past"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No bookings"
          message="Book a trip for a guest or teammate from Home."
          actionLabel="Quick book"
          onAction={() => router.push("/business/book" as never)}
        />
      ) : (
        filtered.map((row) => (
          <Pressable
            key={row.id}
            style={styles.row}
            onPress={() =>
              router.push(`/business/track/${row.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.addr} numberOfLines={1}>
                {shortAddress(row.pickup_address)} →{" "}
                {shortAddress(row.delivery_address)}
              </Text>
              <Text style={styles.meta}>
                {row.tracking_id} · {formatCurrency(row.estimated_fee)}
              </Text>
            </View>
            <Badge
              label={formatStatus(row.status)}
              tone={statusTone(row.status)}
            />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.dark, borderColor: colors.dark },
  chipText: { fontWeight: "700", color: colors.muted, fontSize: 13 },
  chipTextOn: { color: colors.white },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  addr: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12, fontWeight: "600" },
});
