import { TripActivityCard } from "@/components/passenger/TripActivityCard";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CardSkeletonList, JobCardSkeletonList } from "@/components/ui/Skeleton";
import { radii, type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import type { Delivery } from "@/lib/deliveries";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BusinessHomeScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [upcoming, setUpcoming] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) {
      setUpcoming([]);
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
        setUpcoming([]);
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

  const company = profile?.full_name?.trim() || "Business";

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Business" subtitle="Loading…" />
        <CardSkeletonList count={1} lines={3} />
        <JobCardSkeletonList count={3} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Business" subtitle={`Welcome, ${company}`} />

      <Card tint="blue">
        <Text style={styles.heroTitle}>Book for your team</Text>
        <Text style={styles.heroBody}>
          Create a trip for clients, staff, or guests.
        </Text>
        <Button
          label="Quick book"
          onPress={() => router.push("/business/where-to" as never)}
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
      {upcoming.length === 0 ? (
        <EmptyState
          title="No upcoming bookings"
          message="Book a trip for a guest or teammate."
          actionLabel="Quick book"
          onAction={() => router.push("/business/where-to" as never)}
        />
      ) : (
        <Card padded={false} style={{ paddingHorizontal: 12 }}>
          {upcoming.map((row) => (
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

      <Card>
        <Text style={styles.teamTitle}>Guest riders</Text>
        <Text style={styles.teamBody}>
          Save staff or clients, then pick them when you book.
        </Text>
        <Button
          label="Manage guests"
          variant="outline"
          onPress={() => router.push("/business/team" as never)}
        />
      </Card>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    section: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.dark,
      marginTop: 4,
    },
    teamTitle: { fontWeight: "900", color: colors.dark },
    teamBody: { color: colors.muted, lineHeight: 20 },
  });
}
