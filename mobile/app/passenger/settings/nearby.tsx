import {
  ChoiceCard,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { NEARBY_OPTIONS } from "@/lib/settings";
import { Text } from "react-native";

export default function NearbyAlertScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;

  return (
    <SettingsShell title="Driver nearby alert" palette={palette} settings={settings}>
      <Text style={{ color: palette.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
        Manage how you want to be notified during pick-ups with long waits.
      </Text>
      {NEARBY_OPTIONS.map((o) => (
        <ChoiceCard
          key={o.value}
          title={o.title}
          body={o.body}
          selected={settings.nearbyAlert === o.value}
          palette={palette}
          onPress={() => update({ nearbyAlert: o.value })}
        />
      ))}
    </SettingsShell>
  );
}
