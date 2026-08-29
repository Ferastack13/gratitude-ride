import { colors } from "@/constants/theme";
import { NIGERIA_STATES } from "@/lib/nigeria-locations";
import { Pressable, StyleSheet, Text, View } from "react-native";

/** Compact state chip row for rider screens (scroll horizontally). */
export function CityChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string) => void;
}) {
  const featured = NIGERIA_STATES.filter((s) =>
    ["lagos", "fct", "rivers", "ogun", "oyo", "kano", "kaduna", "enugu"].includes(
      s.id
    )
  );

  return (
    <View style={styles.row}>
      {featured.map((state) => {
        const active =
          value === state.label ||
          value.toLowerCase().includes(state.label.toLowerCase().split(" ")[0]);
        return (
          <Pressable
            key={state.id}
            onPress={() => onChange(state.label)}
            style={[styles.chip, active && styles.active]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {state.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.dark, fontWeight: "700", fontSize: 13 },
  activeText: { color: colors.white },
});
