import {
  SectionLabel,
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { Text } from "react-native";

export default function RiderPrivacyScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;
  const p = settings.privacy;

  return (
    <SettingsShell title="Privacy" palette={palette} settings={settings}>
      <SectionLabel label="While driving" palette={palette} />
      <ToggleRow
        title="Share live location when online"
        subtitle="Passengers need this to see you on the map during a trip."
        value={p.shareLocation}
        palette={palette}
        last
        onValueChange={(v) => update({ privacy: { shareLocation: v } })}
      />

      <SectionLabel label="Data" palette={palette} />
      <ToggleRow
        title="Personalize experience"
        subtitle="Use trip history to improve nearby offers."
        value={p.personalize}
        palette={palette}
        onValueChange={(v) => update({ privacy: { personalize: v } })}
      />
      <ToggleRow
        title="Analytics"
        subtitle="Anonymous usage stats to improve the app."
        value={p.analytics}
        palette={palette}
        onValueChange={(v) => update({ privacy: { analytics: v } })}
      />
      <ToggleRow
        title="Crash reports"
        subtitle="Send crash logs so we can fix bugs faster."
        value={p.crashReports}
        palette={palette}
        last
        onValueChange={(v) => update({ privacy: { crashReports: v } })}
      />

      <Text style={{ color: palette.muted, marginTop: 16, lineHeight: 20 }}>
        Turning off location sharing can hide you from passengers on active
        trips. Stay online only when you’re ready to accept jobs.
      </Text>
    </SettingsShell>
  );
}
