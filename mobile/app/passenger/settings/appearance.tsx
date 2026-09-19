import {
  ChoiceCard,
  SettingsShell,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { darkColors, lightColors } from "@/constants/theme";
import { useAppTheme } from "@/context/theme";
import type { AppearanceMode } from "@/lib/settings";
import { StyleSheet, View } from "react-native";

const OPTIONS: {
  value: AppearanceMode;
  title: string;
  body: string;
}[] = [
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

function Preview({ mode }: { mode: AppearanceMode }) {
  if (mode === "system") {
    return (
      <View style={preview.split}>
        <View style={[preview.half, { backgroundColor: lightColors.surface }]}>
          <View style={[preview.dot, { backgroundColor: lightColors.primary }]} />
          <View style={[preview.dot, { backgroundColor: lightColors.secondary }]} />
        </View>
        <View style={[preview.half, { backgroundColor: darkColors.surface }]}>
          <View style={[preview.dot, { backgroundColor: darkColors.dark }]} />
          <View style={[preview.dot, { backgroundColor: darkColors.primary }]} />
        </View>
      </View>
    );
  }
  if (mode === "light") {
    return (
      <View style={[preview.strip, { backgroundColor: lightColors.surface }]}>
        <View style={[preview.swatch, { backgroundColor: lightColors.primary }]} />
        <View style={[preview.swatch, { backgroundColor: lightColors.secondary }]} />
        <View style={[preview.swatch, { backgroundColor: lightColors.white, borderWidth: 1, borderColor: lightColors.border }]} />
      </View>
    );
  }
  return (
    <View style={[preview.strip, { backgroundColor: darkColors.surface }]}>
      <View style={[preview.swatch, { backgroundColor: darkColors.dark }]} />
      <View style={[preview.swatch, { backgroundColor: darkColors.primary }]} />
      <View style={[preview.swatch, { backgroundColor: darkColors.white }]} />
    </View>
  );
}

export default function AppearanceScreen() {
  const { settings, palette, ready } = useSettingsState();
  const { setAppearance } = useAppTheme();
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
          onPress={() => void setAppearance(o.value)}
        >
          <Preview mode={o.value} />
        </ChoiceCard>
      ))}
    </SettingsShell>
  );
}

const preview = StyleSheet.create({
  strip: {
    height: 36,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  split: {
    height: 36,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  half: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
