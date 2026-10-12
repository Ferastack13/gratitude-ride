import { TripActivityCard } from "@/components/passenger/TripActivityCard";
import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { JobCardSkeletonList } from "@/components/ui/Skeleton";
import { radii, type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import type { Delivery } from "@/lib/deliveries";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ACTIVE = new Set(["pending", "accepted", "picked_up", "in_transit"]);
const DONE = new Set(["delivered", "cancelled"]);

export default function BusinessBookingsScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const load = useCallback(async () => {
    if (!profile?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (!client?.id) {
        setRows([]);
        return;
      }
      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setRows(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const filtered = rows.filter((row) => {
    if (filter === "active") return ACTIVE.has(row.status);
    if (filter === "done") return DONE.has(row.status);
    return true;
  });

  const emptyCopy =
    filter === "active"
      ? {
          title: "No live trips",
          message: "Active bookings will show here while you’re matching or in transit.",
        }
      : filter === "done"
        ? {
            title: "No past trips",
            message: "Completed and cancelled trips land here.",
          }
        : {
            title: "No bookings yet",
            message: "Book a trip for a guest or teammate from Home.",
          };

  return (
    <Screen>
      <ScreenHeader title="Bookings" subtitle="All business trips" />
      <View style={styles.filters}>
        {(["all", "active", "done"] as const).map((f) => {
          const on = filter === f;
          return (
            <Pressable
              key={f}
              style={[
                styles.chip,
                {
                  backgroundColor: on ? colors.dark : colors.white,
                  borderColor: on ? colors.dark : colors.border,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: on ? colors.white : colors.muted },
                ]}
              >
                {f === "all" ? "All" : f === "active" ? "Live" : "Past"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <JobCardSkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={emptyCopy.title}
          message={emptyCopy.message}
          actionLabel="Quick book"
          onAction={() => router.push("/business/where-to" as never)}
        />
      ) : (
        <Card padded={false} style={{ paddingHorizontal: 12 }}>
          {filtered.map((row) => (
            <TripActivityCard
              key={row.id}
              delivery={row}
              onPress={() =>
                router.push(`/business/track/${row.tracking_id}` as never)
              }
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    filters: { flexDirection: "row", gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radii.full,
      borderWidth: 1,
    },
    chipText: { fontWeight: "700", fontSize: 13 },
  });
}
