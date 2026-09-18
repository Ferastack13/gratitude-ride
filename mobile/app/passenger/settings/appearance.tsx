import {
  ChoiceCard,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import type { AppearanceMode } from "@/lib/settings";

const OPTIONS: { value: AppearanceMode; title: string; body: string }[] = [
  {
    value: "system",
    title: "Use device settings",
    body: "Follow your phone’s light or dark mode.",
  },
  {
    value: "light",
    title: "Light",
    body: "Cream canvas with forest and orange.",
  },
  {
    value: "dark",
    title: "Dark",
    body: "Forest green surfaces with cream type.",
  },
];

export default function AppearanceScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;

  return (
    <SettingsShell title="Appearance" palette={palette} settings={settings}>
      {OPTIONS.map((o) => (
        <ChoiceCard
          key={o.value}
          title={o.title}
          body={o.body}
          selected={settings.appearance === o.value}
          palette={palette}
          onPress={() => update({ appearance: o.value })}
        />
      ))}
    </SettingsShell>
  );
}
