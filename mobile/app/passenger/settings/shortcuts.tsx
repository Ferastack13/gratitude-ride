import { SettingsShell, useSettingsState } from "@/components/settings/SettingsChrome";
import { getSavedPlaces, getShortcuts, removeShortcut, setSavedPlace } from "@/lib/client-prefs";
import type { LivePlace } from "@/lib/places";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function ShortcutsScreen() {
  const { settings, palette, ready } = useSettingsState();
  const [home, setHome] = useState<LivePlace | null>(null);
  const [work, setWork] = useState<LivePlace | null>(null);
  const [extras, setExtras] = useState<LivePlace[]>([]);

  const load = useCallback(async () => {
    const [saved, list] = await Promise.all([getSavedPlaces(), getShortcuts()]);
    setHome(saved.home);
    setWork(saved.work);
    setExtras(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load])
  );

  if (!ready || !settings) return null;

  const clearSaved = (kind: "home" | "work", label: string) => {
    Alert.alert(`Remove ${label}?`, "This shortcut will be cleared.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await setSavedPlace(kind, null);
          await load();
        },
      },
    ]);
  };

  return (
    <SettingsShell title="Shortcuts" palette={palette} settings={settings}>
      <Text style={[styles.lead, { color: palette.muted }]}>
        Jump to saved places when you book. Add home, work, or extra pins.
      </Text>
      <PlaceRow
        title="Home"
        place={home}
        palette={palette}
        onSet={() =>
          router.push({
            pathname: "/passenger/where-to",
            params: { saveAs: "home", intent: "save" },
          } as never)
        }
        onClear={home ? () => clearSaved("home", "Home") : undefined}
      />
      <PlaceRow
        title="Work"
        place={work}
        palette={palette}
        onSet={() =>
          router.push({
            pathname: "/passenger/where-to",
            params: { saveAs: "work", intent: "save" },
          } as never)
        }
        onClear={work ? () => clearSaved("work", "Work") : undefined}
      />
      {extras.map((p) => (
        <PlaceRow
          key={p.id}
          title={p.title}
          place={p}
          palette={palette}
          onSet={() =>
            router.push({
              pathname: "/passenger/where-to",
              params: {
                dropoffLat: String(p.lat),
                dropoffLng: String(p.lng),
                dropoffTitle: p.title,
                dropoffAddress: p.address,
                dropoffCity: p.city ?? "",
                focus: "pickup",
              },
            } as never)
          }
          onClear={() =>
            Alert.alert("Remove shortcut?", p.title, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                  await removeShortcut(p.id);
                  await load();
                },
              },
            ])
          }
        />
      ))}
      <Pressable
        style={[styles.add, { borderColor: palette.border, backgroundColor: palette.card }]}
        onPress={() =>
          router.push({
            pathname: "/passenger/where-to",
            params: { intent: "shortcut" },
          } as never)
        }
      >
        <Ionicons name="add" size={20} color={palette.accent} />
        <Text style={[styles.addText, { color: palette.accent }]}>Add a shortcut</Text>
      </Pressable>
    </SettingsShell>
  );
}

function PlaceRow({
  title,
  place,
  palette,
  onSet,
  onClear,
}: {
  title: string;
  place: LivePlace | null;
  palette: { card: string; text: string; muted: string; border: string; danger: string };
  onSet: () => void;
  onClear?: () => void;
}) {
  return (
    <Pressable
      onPress={onSet}
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.sub, { color: palette.muted }]} numberOfLines={2}>
          {place?.address || "Tap to set"}
        </Text>
      </View>
      {onClear ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={palette.danger} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={palette.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontWeight: "700", fontSize: 16 },
  sub: { fontSize: 13, marginTop: 3 },
  add: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 6,
  },
  addText: { fontWeight: "700", fontSize: 15 },
});
