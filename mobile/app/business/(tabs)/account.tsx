import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";

export default function BusinessAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const name = profile?.full_name?.trim() || "Business";
  const phone = profile?.phone?.trim() || "Add phone number";

  return (
    <Screen>
      <View style={styles.header}>
        <ProfileAvatar uri={profile?.avatar_url} name={name} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{profile?.email}</Text>
          <Text style={styles.meta}>{phone}</Text>
          <Text style={styles.role}>Client / Business</Text>
        </View>
      </View>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="business-outline"
          title="Company profile"
          subtitle="Name and phone"
          onPress={() => router.push("/business/company-profile" as never)}
        />
        <ListRow
          icon="people-outline"
          title="Team members"
          subtitle="Coming soon"
          onPress={() =>
            Alert.alert(
              "Team members",
              "Invite teammates in a later update."
            )
          }
        />
        <ListRow
          icon="help-circle-outline"
          title="Support"
          subtitle="WhatsApp help"
          onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 8,
    },
    name: { fontSize: 22, fontWeight: "900", color: colors.dark },
    meta: { color: colors.muted, fontSize: 13 },
    role: {
      color: colors.primary,
      fontWeight: "800",
      fontSize: 12,
      marginTop: 2,
    },
  });
}
