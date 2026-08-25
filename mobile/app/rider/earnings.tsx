import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";

export default function RiderEarningsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Earnings</Text>
      <EmptyState
        title="No completed payouts yet"
        message="Track earnings and request withdrawals once deliveries are completed."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
});
