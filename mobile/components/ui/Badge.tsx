import { colors, radii } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type Tone = "primary" | "secondary" | "success" | "warning" | "danger" | "muted" | "outline";

const TONE: Record<
  Tone,
  { bg: string; fg: string; border?: string }
> = {
  primary: { bg: colors.primarySoft, fg: colors.primaryDark },
  secondary: { bg: colors.secondarySoft, fg: colors.secondaryDark },
  success: { bg: colors.primarySoft, fg: colors.primaryDark },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  muted: { bg: colors.surface, fg: colors.muted },
  outline: { bg: "transparent", fg: colors.dark, border: colors.border },
};

export function Badge({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: Tone;
}) {
  const palette = TONE[tone];
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border ?? "transparent" },
        palette.border ? styles.outlined : null,
      ]}
    >
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  outlined: { borderWidth: 1 },
  text: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
});
