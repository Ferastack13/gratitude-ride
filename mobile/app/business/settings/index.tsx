import {
  SectionLabel,
  SettingsRow,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { SettingsSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/auth";
import { switchToDriverMode } from "@/lib/driver-bootstrap";
import {
  appearanceSubtitle,
  SENIOR_SUPPORT_WHATSAPP,
} from "@/lib/settings";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BusinessSettingsHome() {
  const { settings, palette, ready } = useSettingsState();
  const { profile, setAccountTypePreference } = useAuth();
  const insets = useSafeAreaInsets();
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "1.0.0";

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
      {
        text: "Stay on Business",
        style: "cancel",
      },
    ]);
  };

  if (!ready || !settings) {
    return (
      <View
        style={[
          styles.boot,
          { backgroundColor: "#F7F4ED", paddingTop: insets.top },
        ]}
      >
        <SettingsSkeleton rows={6} />
      </View>
    );
  }

  return (
    <SettingsShell title="Settings" palette={palette} settings={settings}>
      <SectionLabel label="Company" palette={palette} />
      <SettingsRow
        icon="business-outline"
        title="Company profile"
        subtitle={profile?.full_name ?? "Name and phone"}
        palette={palette}
        onPress={() => router.push("/business/company-profile" as never)}
      />
      <SettingsRow
        icon="wallet-outline"
        title="Billing"
        subtitle="Payment prefs and receipts"
        palette={palette}
        onPress={() => router.push("/business/billing" as never)}
      />
      <SettingsRow
        icon="people-outline"
        title="Guest riders"
        subtitle="Saved passengers"
        palette={palette}
        onPress={() => router.push("/business/team" as never)}
      />
      <SettingsRow
        icon="pricetag-outline"
        title="Cost centers"
        subtitle="Tag trips for reporting"
        palette={palette}
        last
        onPress={() => router.push("/business/cost-centers" as never)}
      />

      <SectionLabel label="App" palette={palette} />
      <SettingsRow
        icon="contrast-outline"
        title="Appearance"
        subtitle={appearanceSubtitle(settings.appearance)}
        palette={palette}
        onPress={() => router.push("/business/settings/appearance" as never)}
      />
      <SettingsRow
        icon="lock-closed-outline"
        title="Privacy"
        subtitle="Location and data sharing"
        palette={palette}
        last
        onPress={() => router.push("/business/settings/privacy" as never)}
      />

      <SectionLabel label="Account" palette={palette} />
      <SettingsRow
        icon="swap-horizontal-outline"
        title="Switch account type"
        subtitle="Passenger, driver, or stay on business"
        palette={palette}
        onPress={switchAccount}
      />
      <SettingsRow
        icon="help-circle-outline"
        title="Support"
        subtitle="WhatsApp help"
        palette={palette}
        onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
      />
      <SettingsRow
        icon="information-circle-outline"
        title="About Gratitude Ride"
        subtitle={`Version ${version}`}
        palette={palette}
        last
        onPress={() =>
          Alert.alert(
            "Gratitude Ride Business",
            `Version ${version}\n\nBook trips for guests and teammates on the same network.`
          )
        }
      />

      <Text style={[styles.foot, { color: palette.muted }]}>
        Appearance and privacy sync on this device for passenger and business
        modes.
      </Text>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1 },
  foot: { marginTop: 18, fontSize: 12, lineHeight: 17, fontWeight: "600" },
});
