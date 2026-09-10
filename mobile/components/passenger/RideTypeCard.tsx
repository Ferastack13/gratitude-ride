import { colors, radii } from "@/constants/theme";
import type { RideOption } from "@/lib/ride-options";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  option: RideOption;
  selected: boolean;
  fareLabel: string;
  etaLabel: string;
  onPress: () => void;
};

/** Selectable ride option (Standard / Express / Comfort). */
export function RideTypeCard({
  option,
  selected,
  fareLabel,
  etaLabel,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardOn,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.icon, selected && styles.iconOn]}>
        <Ionicons
          name={option.icon}
          size={20}
          color={selected ? colors.white : colors.dark}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{option.title}</Text>
        <Text style={styles.desc}>{option.description}</Text>
        <Text style={[styles.eta, selected && { color: colors.primary }]}>
          {etaLabel}
        </Text>
      </View>
      <Text style={styles.fare}>{fareLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  cardOn: {
    backgroundColor: colors.primarySoft,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOn: { backgroundColor: colors.primary },
  title: { fontWeight: "600", color: colors.dark, fontSize: 15 },
  desc: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: "400" },
  eta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  fare: { fontWeight: "600", color: colors.dark, fontSize: 15 },
});
