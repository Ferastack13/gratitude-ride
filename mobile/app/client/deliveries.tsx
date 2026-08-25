import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";

export default function ClientDeliveriesScreen() {
  return (
    <Screen>
      <Text style={styles.title}>My deliveries</Text>
      <EmptyState
        title="No live deliveries yet"
        message="Book your first package to see tracking here."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
});
