import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radii } from "@/constants/theme";
import { DRIVER_MATCH_RADIUS_KM } from "@/lib/ride-matching";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DriverDiscoverScreen() {
  const [jobs, setJobs] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { count } = await supabase
          .from("deliveries")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .is("rider_id", null);
        setJobs(count ?? 0);
      })();
    }, [])
  );

  return (
    <Screen>
      <ScreenHeader
        title="Discover"
        subtitle="Demand across open ride requests"
      />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Open requests</Text>
        <Text style={styles.cardValue}>
          {jobs} pending trip{jobs === 1 ? "" : "s"}
        </Text>
        <Text style={styles.cardSub}>
          Go online on Home to receive nearby offers within about{" "}
          {DRIVER_MATCH_RADIUS_KM} km — new requests appear automatically.
        </Text>
      </View>
      <EmptyState
        title="Nothing yet"
        message="Promotions, boosts, and events will appear here soon."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    padding: 16,
    gap: 4,
  },
  cardTitle: { fontWeight: "800", color: colors.primaryDark, fontSize: 13 },
  cardValue: { fontWeight: "900", color: colors.dark, fontSize: 22 },
  cardSub: { color: colors.muted, fontSize: 13, lineHeight: 18 },
});
