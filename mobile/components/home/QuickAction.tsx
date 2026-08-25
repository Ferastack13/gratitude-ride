import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function QuickAction({
  icon,
  label,
  hint,
  onPress,
  tone = "light",
}: {
  icon: IconName;
  label: string;
  hint?: string;
  onPress: () => void;
  tone?: "light" | "dark" | "green";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        tone === "dark" && styles.actionDark,
        tone === "green" && styles.actionGreen,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          tone === "dark" && styles.iconWrapDark,
          tone === "green" && styles.iconWrapGreen,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={tone === "green" ? colors.white : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.label,
          (tone === "dark" || tone === "green") && styles.labelLight,
        ]}
      >
        {label}
      </Text>
      {hint ? (
        <Text
          style={[
            styles.hint,
            (tone === "dark" || tone === "green") && styles.hintLight,
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  actionDark: {
    backgroundColor: colors.darkElevated,
    borderColor: "#2a2a2a",
  },
  actionGreen: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  iconWrapDark: { backgroundColor: "#24352b" },
  iconWrapGreen: { backgroundColor: "rgba(255,255,255,0.18)" },
  label: { fontSize: 13, fontWeight: "800", color: colors.dark },
  labelLight: { color: colors.white },
  hint: { fontSize: 11, color: colors.muted, lineHeight: 14 },
  hintLight: { color: "rgba(255,255,255,0.72)" },
});
