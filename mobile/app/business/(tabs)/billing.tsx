import { Card, EmptyState } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { type ThemeColors } from "@/constants/theme";
import { useColors } from "@/context/theme";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, Linking, StyleSheet, Text } from "react-native";

export default function BusinessBillingScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
          subtitle="Open Bookings for trip costs"
          onPress={() => router.push("/business/bookings" as never)}
        />
      </Card>
      <EmptyState
        title="Need billing help?"
        message="PO numbers and invoice changes go through support."
        actionLabel="WhatsApp support"
        onAction={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
      />
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    balLabel: { color: colors.muted, fontWeight: "700", fontSize: 12 },
    balValue: { fontSize: 22, fontWeight: "900", color: colors.dark },
    hint: { color: colors.muted, lineHeight: 18, fontSize: 13 },
  });
}
