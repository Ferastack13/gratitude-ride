import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Linking, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function BusinessAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const first = profile?.full_name?.split(" ")[0] ?? "B";

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{first.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name ?? "Business"}</Text>
          <Text style={styles.meta}>{profile?.email}</Text>
          <Text style={styles.role}>Client / Business account</Text>
        </View>
      </View>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow icon="business-outline" title="Company profile" />
        <ListRow icon="people-outline" title="Team members" subtitle="Coming soon" />
        <ListRow
          icon="help-circle-outline"
          title="Support"
          onPress={() => Linking.openURL("https://wa.me/2348000000000")}
        />
      </Card>

      <Button
        label="Switch to Passenger"
        variant="outline"
        onPress={async () => {
          await setAccountTypePreference("passenger");
          router.replace("/passenger" as never);
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
