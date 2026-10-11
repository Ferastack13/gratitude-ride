import {
  ChoiceCard,
  SectionLabel,
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { SettingsSkeleton } from "@/components/ui/Skeleton";
import type { FontScale } from "@/lib/settings";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FONT_OPTIONS: { value: FontScale; title: string; body: string }[] = [
  { value: "default", title: "Default", body: "Standard text size." },
  { value: "large", title: "Large", body: "Easier to read on the road." },
  { value: "extra", title: "Extra large", body: "Maximum text size." },
];

export default function RiderAccessibilityScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  const insets = useSafeAreaInsets();
  if (!ready || !settings) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F7F4ED", paddingTop: insets.top }}>
        <SettingsSkeleton rows={5} />
      </View>
    );
  }

  return (
    <SettingsShell title="Accessibility" palette={palette} settings={settings}>
      <SectionLabel label="Text size" palette={palette} />
      {FONT_OPTIONS.map((o) => (
        <ChoiceCard
          key={o.value}
          title={o.title}
          body={o.body}
          selected={settings.fontScale === o.value}
          palette={palette}
          onPress={() => void update({ fontScale: o.value })}
        />
      ))}

      <SectionLabel label="Motion & contrast" palette={palette} />
      <ToggleRow
        title="Reduce motion"
        subtitle="Less animation on screens."
        value={settings.reduceMotion}
        palette={palette}
        onValueChange={(v) => update({ reduceMotion: v })}
      />
      <ToggleRow
        title="Higher contrast"
        subtitle="Stronger colors for text and buttons."
        value={settings.highContrast}
        palette={palette}
        last
        onValueChange={(v) => update({ highContrast: v })}
      />
    </SettingsShell>
  );
}
