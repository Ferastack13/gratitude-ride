import { Card, EmptyState } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors } from "@/constants/theme";
import { Alert, StyleSheet, Text } from "react-native";

export default function BusinessBillingScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Billing"
        subtitle="Payment preferences for company trips"
      />
      <Card>
        <Text style={styles.balLabel}>Current method</Text>
        <Text style={styles.balValue}>Cash on trip</Text>
        <Text style={styles.hint}>
          Corporate invoicing and card on file will connect here.
        </Text>
      </Card>
      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="card-outline"
          title="Add payment method"
          onPress={() =>
            Alert.alert("Coming soon", "Card and invoice billing is next.")
          }
        />
        <ListRow
          icon="document-text-outline"
          title="Invoices"
          subtitle="Monthly summaries"
          onPress={() =>
            Alert.alert("Invoices", "No invoices yet for this account.")
          }
        />
        <ListRow
          icon="receipt-outline"
          title="Trip receipts"
          onPress={() =>
            Alert.alert("Receipts", "Open Bookings to view trip costs.")
          }
        />
      </Card>
      <EmptyState
        title="Support"
        message="Need a PO or billing change? Contact Gratitude Ride support."
        actionLabel="Contact support"
        onAction={() =>
          Alert.alert("Support", "WhatsApp support: +234 800 000 0000")
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balLabel: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  balValue: { fontSize: 22, fontWeight: "900", color: colors.dark },
  hint: { color: colors.muted, lineHeight: 18, fontSize: 13 },
});
