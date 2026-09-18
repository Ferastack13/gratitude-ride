import {
  ChoiceCard,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { RESERVE_OPTIONS } from "@/lib/settings";
import { Text } from "react-native";

export default function ReserveScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;

  return (
    <SettingsShell title="Reserve" palette={palette} settings={settings}>
      <Text style={{ color: palette.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
        Choose how you’re matched with drivers when you book ahead.
      </Text>
      {RESERVE_OPTIONS.map((o) => (
        <ChoiceCard
          key={o.value}
          title={o.title}
          body={o.body}
          selected={settings.reserveMatch === o.value}
          palette={palette}
          onPress={() => update({ reserveMatch: o.value })}
        />
      ))}
    </SettingsShell>
  );
}
