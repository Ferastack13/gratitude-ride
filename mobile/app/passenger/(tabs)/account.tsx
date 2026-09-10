import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function PassengerAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const first = profile?.full_name?.split(" ")[0] ?? "P";

  const soon = (label: string) =>
    Alert.alert(label, "This section is coming soon.");

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{first.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name ?? "Passenger"}</Text>
          <Text style={styles.meta}>{profile?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.role}>Passenger</Text>
          </View>
        </View>
      </View>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="wallet-outline"
          title="Wallet"
          subtitle="Coming soon"
          onPress={() => soon("Wallet")}
        />
        <ListRow
          icon="shield-checkmark-outline"
          title="Safety"
          subtitle="Coming soon"
          onPress={() => soon("Safety")}
        />
        <ListRow
          icon="help-circle-outline"
          title="Help"
          subtitle="Chat with support"
          onPress={() => Linking.openURL("https://wa.me/2348000000000")}
        />
        <ListRow
          icon="settings-outline"
          title="Settings"
          subtitle="Coming soon"
          onPress={() => soon("Settings")}
        />
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
  head: { marginBottom: 4 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.card,
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
  name: { fontSize: 20, fontWeight: "900", color: colors.dark },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  role: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 12,
  },
});
