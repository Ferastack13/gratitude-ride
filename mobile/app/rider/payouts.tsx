import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useColors } from "@/context/theme";
import {
  getDriverPayoutDetails,
  saveDriverPayoutDetails,
} from "@/lib/driver-payouts";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RiderPayoutsScreen() {
  const colors = useColors();
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const row = await getDriverPayoutDetails();
      if (row) {
        setAccountName(row.accountName);
        setBankName(row.bankName);
        setAccountNumber(row.accountNumber);
        setSavedAt(row.updatedAt);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onSave = async () => {
    setSaving(true);
    try {
      const row = await saveDriverPayoutDetails({
        accountName,
        bankName,
        accountNumber,
      });
      setSavedAt(row.updatedAt);
      Alert.alert(
        "Payout details saved",
        "Cash out is coming soon. We’ll use these details when payouts go live."
      );
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
        title="Payouts"
        subtitle="Bank details for cash out"
        onBack={() => router.back()}
      />

      <Card>
        <Text style={[styles.badge, { color: colors.secondaryDark }]}>
          Coming soon
        </Text>
        <Text style={[styles.title, { color: colors.dark }]}>
          Save your bank account
        </Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Stored on this device for now. Automatic transfers aren’t available
          yet.
        </Text>
      </Card>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.muted }]}>
            Account name
          </Text>
          <TextInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Name on the account"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                color: colors.dark,
                borderColor: colors.border,
                backgroundColor: colors.white,
              },
            ]}
          />
          <Text style={[styles.label, { color: colors.muted }]}>Bank name</Text>
          <TextInput
            value={bankName}
            onChangeText={setBankName}
            placeholder="e.g. GTBank"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                color: colors.dark,
                borderColor: colors.border,
                backgroundColor: colors.white,
              },
            ]}
          />
          <Text style={[styles.label, { color: colors.muted }]}>
            Account number
          </Text>
          <TextInput
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            placeholder="0123456789"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                color: colors.dark,
                borderColor: colors.border,
                backgroundColor: colors.white,
              },
            ]}
          />
          {savedAt ? (
            <Text style={[styles.saved, { color: colors.muted }]}>
              Last saved {new Date(savedAt).toLocaleString()}
            </Text>
          ) : null}
          <Button
            label={saving ? "Saving…" : "Save payout details"}
            onPress={onSave}
            disabled={saving}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  title: { fontWeight: "900", fontSize: 18, marginTop: 4 },
  body: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  label: { fontSize: 12, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  saved: { fontSize: 12, fontWeight: "600" },
});
