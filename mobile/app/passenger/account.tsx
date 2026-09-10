import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Linking, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function PassengerAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const first = profile?.full_name?.split(" ")[0] ?? "P";

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{first.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name ?? "Passenger"}</Text>
          <Text style={styles.meta}>{profile?.email}</Text>
          <Text style={styles.role}>Passenger account</Text>
        </View>
      </View>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow icon="wallet-outline" title="Wallet" subtitle="Payment methods" />
        <ListRow
          icon="shield-checkmark-outline"
          title="Safety"
          subtitle="Trusted contacts & trip share"
        />
        <ListRow
          icon="help-circle-outline"
          title="Help"
          onPress={() => Linking.openURL("https://wa.me/2348000000000")}
        />
        <ListRow icon="settings-outline" title="Settings" />
      </Card>

      <Button
        label="Switch to Business"
        variant="outline"
        onPress={async () => {
          await setAccountTypePreference("business");
          router.replace("/business" as never);
        }}
      />
      <Button label="Sign out" variant="ghost" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: 24 },
  name: { fontSize: 22, fontWeight: "900", color: colors.dark },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  role: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 4,
  },
});
