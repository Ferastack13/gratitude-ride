import {
  ChoiceCard,
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import type { FontScale } from "@/lib/settings";
import { Linking, Text } from "react-native";

const SCALES: { value: FontScale; title: string; body: string }[] = [
  { value: "default", title: "Default", body: "Standard Gratitude type size." },
  { value: "large", title: "Large text", body: "Easier to read on Settings screens." },
  { value: "extra", title: "Extra large", body: "Maximum in-app type size." },
];

export default function AccessibilityScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;

  return (
    <SettingsShell title="Accessibility" palette={palette} settings={settings}>
      {SCALES.map((o) => (
        <ChoiceCard
          key={o.value}
          title={o.title}
          body={o.body}
          selected={settings.fontScale === o.value}
          palette={palette}
          onPress={() => update({ fontScale: o.value })}
        />
      ))}
      <ToggleRow
        title="Reduce motion"
        subtitle="Cut extra animation where the app can."
        value={settings.reduceMotion}
        palette={palette}
        onValueChange={(v) => update({ reduceMotion: v })}
      />
      <ToggleRow
        title="High contrast"
        subtitle="Stronger borders on Settings screens."
        value={settings.highContrast}
        palette={palette}
        onValueChange={(v) => update({ highContrast: v })}
      />
      <ToggleRow
        title="Simple mode"
        subtitle="A calmer layout for older adults. Saved on this device."
        value={settings.simpleMode}
        palette={palette}
        last
        onValueChange={(v) => update({ simpleMode: v })}
      />
      <Text
        onPress={() => Linking.openSettings()}
        style={{ color: palette.accent, fontWeight: "700", marginTop: 18, fontSize: 15 }}
      >
        Open phone accessibility settings
      </Text>
    </SettingsShell>
  );
}
