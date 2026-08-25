import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Text style={styles.title}>Active delivery</Text>
      <Text style={styles.sub}>Order {id}</Text>
      <EmptyState
        title="Navigation coming next"
        message="This screen will show pickup/drop-off, status buttons, and live GPS updates."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
  sub: { fontSize: 14, color: colors.muted },
});
