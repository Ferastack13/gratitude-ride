import { EmptyState } from "@/components/ui/Card";
import { CityChips } from "@/components/ui/CityChips";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radii } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DriverDiscoverScreen() {
  const [city, setCity] = useState("Lagos");
  const [jobs, setJobs] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { count } = await supabase
          .from("deliveries")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("city", city);
        setJobs(count ?? 0);
      })();
    }, [city])
  );

  return (
    <Screen>
      <ScreenHeader
        title="Discover"
        subtitle="Opportunities and demand near you"
      />
      <CityChips value={city} onChange={setCity} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{city} demand</Text>
        <Text style={styles.cardValue}>
          {jobs} open request{jobs === 1 ? "" : "s"}
        </Text>
        <Text style={styles.cardSub}>
          Stay online on Home to receive timed trip offers.
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
