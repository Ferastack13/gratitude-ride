import { colors, radii } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: "pickup" | "dropoff" | "recent" | "gps";
  onPress?: () => void;
  trailing?: string;
};

const TONE_BG = {
  pickup: colors.primarySoft,
  dropoff: colors.secondarySoft,
  recent: colors.surfaceAlt,
  gps: colors.primarySoft,
} as const;

const TONE_FG = {
  pickup: colors.primary,
  dropoff: colors.secondaryDark,
  recent: colors.muted,
  gps: colors.primary,
} as const;

/** Compact location / suggestion row used across passenger booking. */
export function LocationRow({
  title,
  subtitle,
  icon = "location-outline",
  tone = "recent",
  onPress,
  trailing,
}: Props) {
  const body = (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: TONE_BG[tone] }]}>
        <Ionicons name={icon} size={18} color={TONE_FG[tone]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.press, pressed && { opacity: 0.88 }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    borderRadius: radii.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "800", color: colors.dark, fontSize: 15 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  trailing: { color: colors.primary, fontWeight: "800", fontSize: 13 },
});
