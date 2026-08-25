import { colors } from "@/constants/theme";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  disabled?: boolean;
  size?: "md" | "sm";
};

export function Button({
  label,
  onPress,
  loading,
  variant = "primary",
  disabled,
  size = "md",
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.sm,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "outline" && styles.outline,
        variant === "danger" && styles.danger,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? colors.white
              : colors.primary
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            size === "sm" && styles.smLabel,
            variant === "secondary" && styles.secondaryLabel,
            variant === "ghost" && styles.ghostLabel,
            variant === "outline" && styles.outlineLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  sm: { minHeight: 42, borderRadius: 12, paddingHorizontal: 14 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  ghost: { backgroundColor: "transparent" },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.danger },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
  label: { color: colors.white, fontSize: 16, fontWeight: "700" },
  smLabel: { fontSize: 14 },
  secondaryLabel: { color: colors.dark },
  ghostLabel: { color: colors.primary },
  outlineLabel: { color: colors.dark },
});
