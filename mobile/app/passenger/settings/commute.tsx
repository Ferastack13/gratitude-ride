import {
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { WEEKDAYS } from "@/lib/settings";
import { Pressable, StyleSheet, Text, View } from "react-native";

function bumpTime(value: string, minutes: number) {
  const [h, m] = value.split(":").map(Number);
  const total = ((h * 60 + m + minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function CommuteScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;
  const c = settings.commute;

  return (
    <SettingsShell title="Commute alerts" palette={palette} settings={settings}>
      <Text style={{ color: palette.muted, fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
        Get a Home reminder around your usual leave times so you can request a
        ride then.
      </Text>
      <ToggleRow
        title="Commute alerts"
        subtitle="Remind me on Home at my usual times."
        value={c.enabled}
        palette={palette}
        last
        onValueChange={(v) =>
          update({
            commute: { enabled: v },
            notifications: { commute: v || settings.notifications.commute },
          })
        }
      />
      <Text style={[styles.label, { color: palette.muted }]}>Morning</Text>
      <TimeStepper
        value={c.morning}
        palette={palette}
        onChange={(morning) => update({ commute: { morning } })}
      />
      <Text style={[styles.label, { color: palette.muted }]}>Evening</Text>
      <TimeStepper
        value={c.evening}
        palette={palette}
        onChange={(evening) => update({ commute: { evening } })}
      />
      <Text style={[styles.label, { color: palette.muted }]}>Days</Text>
      <View style={styles.days}>
        {WEEKDAYS.map((d) => {
          const on = c.days.includes(d.id);
          return (
            <Pressable
              key={d.id}
              onPress={() => {
                const days = on
                  ? c.days.filter((x) => x !== d.id)
                  : [...c.days, d.id].sort();
                update({ commute: { days } });
              }}
              style={[
                styles.day,
                {
                  backgroundColor: on ? palette.accent : palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={{ color: on ? "#fff" : palette.text, fontWeight: "700" }}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsShell>
  );
}

function TimeStepper({
  value,
  onChange,
  palette,
}: {
  value: string;
  onChange: (v: string) => void;
  palette: { card: string; text: string; border: string; accent: string };
}) {
  return (
    <View style={[styles.step, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Pressable onPress={() => onChange(bumpTime(value, -15))} hitSlop={10}>
        <Text style={[styles.stepBtn, { color: palette.accent }]}>−</Text>
      </Pressable>
      <Text style={[styles.time, { color: palette.text }]}>{value}</Text>
      <Pressable onPress={() => onChange(bumpTime(value, 15))} hitSlop={10}>
        <Text style={[styles.stepBtn, { color: palette.accent }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  step: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stepBtn: { fontSize: 28, fontWeight: "700", width: 36, textAlign: "center" },
  time: { fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  days: { flexDirection: "row", gap: 6 },
  day: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
