import { colors, radii } from "@/constants/theme";
import { SERVICE_CITIES, type ServiceCity } from "@/lib/cities";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function CityChips({
  value,
  onChange,
}: {
  value: ServiceCity;
  onChange: (city: ServiceCity) => void;
}) {
  return (
    <View style={styles.row}>
      {SERVICE_CITIES.map((city) => {
        const active = city.id === value;
        return (
          <Pressable
            key={city.id}
            onPress={() => onChange(city.id)}
            style={[styles.chip, active && styles.active]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {city.label}
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
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.dark, fontWeight: "700", fontSize: 13 },
  activeText: { color: colors.white },
});
