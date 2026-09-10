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

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Activity" subtitle="Your trips" />
      {rows.length === 0 ? (
        <EmptyState
          title="No trips yet"
          message="When you book a ride, it will show up here."
          actionLabel="Where to?"
          onAction={() => router.push("/passenger" as never)}
        />
      ) : (
        rows.map((row) => (
          <Pressable
            key={row.id}
            style={styles.row}
            onPress={() =>
              router.push(`/passenger/track/${row.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.addr} numberOfLines={1}>
                {shortAddress(row.pickup_address)} →{" "}
                {shortAddress(row.delivery_address)}
              </Text>
              <Text style={styles.meta}>
                {row.city} · {formatCurrency(row.estimated_fee)}
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
