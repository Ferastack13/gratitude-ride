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
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={[styles.icon, selected && styles.iconOn]}>
        <Ionicons
          name={option.icon}
          size={22}
          color={selected ? colors.white : colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{option.title}</Text>
        <Text style={styles.desc}>{option.description}</Text>
        <Text style={styles.eta}>{etaLabel}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.fare}>{fareLabel}</Text>
        {selected ? (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={14} color={colors.white} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOn: { backgroundColor: colors.primary },
  title: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  desc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  eta: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  right: { alignItems: "flex-end", gap: 8 },
  fare: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
