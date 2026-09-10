import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ClientProfileScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Card>
        {[
          ["Full name", profile?.full_name ?? "—"],
          ["Email", profile?.email ?? "—"],
          ["Phone", profile?.phone ?? "—"],
          ["Role", profile?.role ?? "client"],
        ].map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </Card>

      <Button
        label="Open Passenger app"
        variant="outline"
        onPress={async () => {
          await setAccountTypePreference("passenger");
          router.replace("/passenger" as never);
        }}
      />
      <Button
        label="Open Business app"
        variant="secondary"
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
