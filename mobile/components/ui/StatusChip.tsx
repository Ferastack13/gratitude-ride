import { colors, radii } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export function StatusChip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "online" | "offline" | "warning" | "danger" | "primary";
}) {
  return (
    <View style={[styles.chip, styles[tone]]}>
      {(tone === "online" || tone === "offline") && (
        <View
          style={[
            styles.dot,
            tone === "online" ? styles.dotOnline : styles.dotOffline,
          ]}
        />
      )}
      <Text style={[styles.text, styles[`${tone}Text` as const]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
  },
  neutral: { backgroundColor: colors.surfaceAlt },
  online: { backgroundColor: colors.successSoft },
  offline: { backgroundColor: colors.surfaceAlt },
  warning: { backgroundColor: colors.warningSoft },
  danger: { backgroundColor: colors.dangerSoft },
  primary: { backgroundColor: colors.primarySoft },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOnline: { backgroundColor: colors.success },
  dotOffline: { backgroundColor: colors.mutedLight },
  text: { fontSize: 12, fontWeight: "800", color: colors.dark },
  neutralText: { color: colors.dark },
  onlineText: { color: colors.success },
  offlineText: { color: colors.muted },
  warningText: { color: colors.warning },
  dangerText: { color: colors.danger },
  primaryText: { color: colors.primaryDark },
});
