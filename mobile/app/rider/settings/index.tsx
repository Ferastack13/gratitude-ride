import {
  SectionLabel,
  SettingsRow,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { SettingsSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/auth";
import {
  appearanceSubtitle,
} from "@/lib/settings";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RiderSettingsHome() {
  const { settings, palette, ready } = useSettingsState();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "1.0.0";

  if (!ready || !settings) {
    return (
      <View
        style={[
          styles.boot,
          { backgroundColor: "#F7F4ED", paddingTop: insets.top },
        ]}
      >
        <SettingsSkeleton rows={7} />
      </View>
    );
  }

  return (
    <SettingsShell title="Settings" palette={palette} settings={settings}>
      <SectionLabel label="Driving" palette={palette} />
      <SettingsRow
        icon="notifications-outline"
        title="Job alerts"
        subtitle="Offers, trip updates, and inbox"
        palette={palette}
        onPress={() => router.push("/rider/settings/notifications" as never)}
      />
      <SettingsRow
        icon="car-outline"
        title="Vehicle"
        subtitle="Type and license details"
        palette={palette}
        onPress={() => router.push("/rider/vehicle" as never)}
      />
      <SettingsRow
        icon="wallet-outline"
        title="Payout details"
        subtitle="Bank account for cash out"
        palette={palette}
        last
        onPress={() => router.push("/rider/payouts" as never)}
      />

      <SectionLabel label="App" palette={palette} />
      <SettingsRow
        icon="contrast-outline"
        title="Appearance"
        subtitle={appearanceSubtitle(settings.appearance)}
        palette={palette}
        onPress={() => router.push("/rider/settings/appearance" as never)}
      />
      <SettingsRow
        icon="accessibility-outline"
        title="Accessibility"
        subtitle="Text size and motion"
        palette={palette}
        onPress={() => router.push("/rider/settings/accessibility" as never)}
      />
      <SettingsRow
        icon="lock-closed-outline"
        title="Privacy"
        subtitle="Location and data sharing"
        palette={palette}
        last
        onPress={() => router.push("/rider/settings/privacy" as never)}
      />

      <SectionLabel label="Account" palette={palette} />
      <SettingsRow
        icon="create-outline"
        title="Edit profile"
        subtitle={profile?.full_name ?? "Name, phone, email, photo"}
        palette={palette}
        onPress={() => router.push("/rider/profile?edit=1" as never)}
      />
      <SettingsRow
        icon="shield-checkmark-outline"
        title="Verification"
        subtitle="Driver trust status"
        palette={palette}
        onPress={() =>
          Alert.alert(
            "Verification",
            "Keep your photo, phone, and vehicle details up to date. An admin marks your account verified after review."
          )
        }
      />
      <SettingsRow
        icon="information-circle-outline"
        title="About Gratitude Ride"
        subtitle={`Version ${version}`}
        palette={palette}
        last
        onPress={() =>
          Alert.alert(
            "Gratitude Ride Driver",
            `Version ${version}\n\nGo online, accept nearby jobs, and complete trips for your community.`
          )
        }
      />

      <Text style={[styles.foot, { color: palette.muted }]}>
        Changes sync on this device for your driver and passenger modes.
      </Text>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1 },
  foot: { marginTop: 18, fontSize: 12, lineHeight: 17, fontWeight: "600" },
});
