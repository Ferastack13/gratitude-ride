import {
  ChoiceCard,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { TIP_OPTIONS } from "@/lib/settings";
import { Text } from "react-native";

export default function TipScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;

  return (
    <SettingsShell title="Tip automatically" palette={palette} settings={settings}>
      <Text style={{ color: palette.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
        Added as a suggested tip when you confirm a ride. You can still skip it
        on a trip.
      </Text>
      {TIP_OPTIONS.map((o) => (
        <ChoiceCard
          key={o.value}
          title={o.label}
          body={
            o.value === 0
              ? "No tip is added by default."
              : `${o.value}% of the fare is suggested at booking.`
          }
          selected={settings.defaultTipPercent === o.value}
          palette={palette}
          onPress={() => update({ defaultTipPercent: o.value })}
        />
      ))}
    </SettingsShell>
  );
}
