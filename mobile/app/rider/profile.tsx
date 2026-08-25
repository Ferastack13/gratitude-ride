import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function RiderProfileScreen() {
  const { profile, signOut } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Card>
        {[
          ["Full name", profile?.full_name ?? "—"],
          ["Email", profile?.email ?? "—"],
          ["Phone", profile?.phone ?? "—"],
          ["Role", profile?.role ?? "rider"],
        ].map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </Card>
      <Button
        label="Switch to Client"
        variant="secondary"
        onPress={() => router.replace("/client")}
      />
      <Button label="Sign out" variant="ghost" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
  },
  label: { color: colors.muted },
  value: { fontWeight: "600", color: colors.dark, textTransform: "capitalize" },
});
