import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Text style={styles.title}>Track package</Text>
      <Text style={styles.sub}>Tracking ID: {id}</Text>
      <EmptyState
        title="Live map coming next"
        message="This screen will subscribe to delivery tracking updates from Supabase Realtime."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
  sub: { fontSize: 14, color: colors.muted },
});
