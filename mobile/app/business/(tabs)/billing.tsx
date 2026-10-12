import { Card, EmptyState } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FormCardSkeleton } from "@/components/ui/Skeleton";
import { radii, type ThemeColors } from "@/constants/theme";
import { useColors } from "@/context/theme";
import {
  getBusinessPaymentMethod,
  paymentMethodLabel,
  setBusinessPaymentMethod,
  type BusinessPaymentMethod,
} from "@/lib/business-billing";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const METHODS: {
  id: BusinessPaymentMethod;
  title: string;
  body: string;
}[] = [
  {
    id: "cash",
    title: "Cash on trip",
    body: "Guest or driver settles in cash at drop-off.",
  },
  {
    id: "transfer",
    title: "Bank transfer",
    body: "Pay by transfer — details shared with the guest on the trip.",
  },
];

export default function BusinessBillingScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [method, setMethod] = useState<BusinessPaymentMethod>("cash");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setMethod(await getBusinessPaymentMethod());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const choose = async (next: BusinessPaymentMethod) => {
    if (saving || next === method) return;
    setSaving(true);
    try {
      await setBusinessPaymentMethod(next);
      setMethod(next);
    } catch (err) {
      Alert.alert(
        "Couldn’t save",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Billing"
        subtitle="Default payment for company trips"
      />

      {loading ? (
        <FormCardSkeleton fields={2} />
      ) : (
        <>
          <Card>
            <Text style={styles.balLabel}>Default method</Text>
            <Text style={styles.balValue}>{paymentMethodLabel(method)}</Text>
            <Text style={styles.hint}>
              Applied when you confirm a business booking. You can still change
              it per trip on the plan screen.
            </Text>
          </Card>

          <Text style={styles.section}>Choose default</Text>
          <View style={styles.methods}>
            {METHODS.map((m) => {
              const on = m.id === method;
              return (
                <Pressable
                  key={m.id}
                  style={[
                    styles.method,
                    {
                      borderColor: on ? colors.primary : colors.border,
                      backgroundColor: on ? colors.primarySoft : colors.white,
                    },
                  ]}
                  onPress={() => void choose(m.id)}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.methodTitle,
                      { color: on ? colors.primary : colors.dark },
                    ]}
                  >
                    {m.title}
                  </Text>
                  <Text style={styles.methodBody}>{m.body}</Text>
                </Pressable>
              );
            })}
          </View>

          <Card padded={false} style={{ paddingHorizontal: 12 }}>
            <ListRow
              icon="receipt-outline"
              title="Trip receipts"
              subtitle="Completed trips with fare"
              onPress={() => router.push("/business/receipts" as never)}
            />
            <ListRow
              icon="document-text-outline"
              title="Monthly summaries"
              subtitle="Spend by month and cost center"
              onPress={() => router.push("/business/invoices" as never)}
            />
            <ListRow
              icon="pricetag-outline"
              title="Cost centers"
              subtitle="Departments / projects"
              onPress={() => router.push("/business/cost-centers" as never)}
            />
            <ListRow
              icon="card-outline"
              title="Card on file"
              subtitle="Coming soon"
              onPress={() =>
                Alert.alert("Coming soon", "Card billing is next.")
              }
            />
          </Card>
        </>
      )}

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
    section: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.dark,
      marginTop: 4,
    },
    methods: { gap: 10 },
    method: {
      borderWidth: 1,
      borderRadius: radii.lg,
      padding: 14,
      gap: 4,
    },
    methodTitle: { fontWeight: "800", fontSize: 15 },
    methodBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  });
}
