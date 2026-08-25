import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";

export default function RiderOrdersScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Orders</Text>
      <EmptyState
        title="No incoming requests"
        message="Go online from the Hub tab. Pending deliveries in your city will show here."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
});
