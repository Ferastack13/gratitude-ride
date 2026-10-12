import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { switchToDriverMode } from "@/lib/driver-bootstrap";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

export default function BusinessAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const name = profile?.full_name?.trim() || "Business";
  const phone = profile?.phone?.trim() || "Add phone number";

  const openProfile = () =>
    router.push("/business/company-profile" as never);

  const switchAccount = () => {
    Alert.alert("Switch account", "Choose how you want to use Gratitude Ride.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Passenger (personal)",
        onPress: async () => {
          await setAccountTypePreference("passenger");
          router.replace("/passenger" as never);
        },
      },
      {
        text: "Driver",
        onPress: () => {
          const userId = profile?.id;
          if (!userId) return;
          void switchToDriverMode({
            userId,
            setAccountTypePreference: (type, opts) =>
              setAccountTypePreference(type, opts),
            onReady: () => router.replace("/rider" as never),
            onError: (message) =>
              Alert.alert("Couldn’t switch to driver", message),
          });
        },
      },
    ]);
  };

  return (
    <Screen>
      <Pressable style={styles.header} onPress={openProfile}>
        <ProfileAvatar
          uri={profile?.avatar_url}
          name={name}
          size={64}
          onPress={openProfile}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{profile?.email}</Text>
          <Text style={styles.meta}>{phone}</Text>
          <Text style={styles.role}>Client / Business · tap to edit</Text>
        </View>
      </Pressable>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="business-outline"
          title="Company profile"
          subtitle="Name and phone"
          onPress={openProfile}
        />
        <ListRow
          icon="settings-outline"
          title="Settings"
          subtitle="Appearance, privacy, support"
          onPress={() => router.push("/business/settings" as never)}
        />
        <ListRow
          icon="people-outline"
          title="Team members"
          subtitle="Coming soon"
          onPress={() =>
            Alert.alert("Team members", "Invite teammates in a later update.")
          }
        />
        <ListRow
          icon="help-circle-outline"
          title="Support"
          subtitle="WhatsApp help"
          onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
        />
      </Card>

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="swap-horizontal-outline"
          title="Switch account type"
          subtitle="Passenger or driver"
          onPress={switchAccount}
        />
      </Card>

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
