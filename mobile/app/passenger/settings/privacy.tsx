import {
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { setSafetyPrefs } from "@/lib/client-prefs";
import { Linking, Text } from "react-native";

export default function PrivacyScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;

  return (
    <SettingsShell title="Privacy" palette={palette} settings={settings}>
      <Text style={{ color: palette.muted, fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
        Control the data Gratitude Ride uses to book trips and improve the app.
      </Text>
      <ToggleRow
        title="Share live location on trips"
        subtitle="Drivers can see your pickup pin while a trip is active."
        value={settings.privacy.shareLocation}
        palette={palette}
        onValueChange={async (v) => {
          await update({ privacy: { shareLocation: v } });
          await setSafetyPrefs({ shareTripLocation: v });
        }}
      />
      <ToggleRow
        title="Personalized suggestions"
        subtitle="Use your recent places to rank nearby streets."
        value={settings.privacy.personalize}
        palette={palette}
        onValueChange={(v) => update({ privacy: { personalize: v } })}
      />
      <ToggleRow
        title="Product analytics"
        subtitle="Help us see which screens work. No ads."
        value={settings.privacy.analytics}
        palette={palette}
        onValueChange={(v) => update({ privacy: { analytics: v } })}
      />
      <ToggleRow
        title="Crash reports"
        subtitle="Send diagnostics if the app fails."
        value={settings.privacy.crashReports}
        palette={palette}
        last
        onValueChange={(v) => update({ privacy: { crashReports: v } })}
      />
      <Text
        onPress={() => Linking.openSettings()}
        style={{ color: palette.accent, fontWeight: "700", marginTop: 18, fontSize: 15 }}
      >
        Open phone privacy settings
      </Text>
    </SettingsShell>
  );
}
