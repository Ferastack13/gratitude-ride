import { colors, radii } from "@/constants/theme";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "dark";
  disabled?: boolean;
  size?: "md" | "sm" | "lg";
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  loading,
  variant = "primary",
  disabled,
  size = "md",
  icon,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const lightLabel =
    variant === "secondary" || variant === "ghost" || variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.sm,
        size === "lg" && styles.lg,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "outline" && styles.outline,
        variant === "danger" && styles.danger,
        variant === "dark" && styles.dark,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger" || variant === "dark"
              ? colors.white
              : colors.primary
          }
        />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={lightLabel ? colors.dark : colors.white}
            />
          ) : null}
          <Text
            style={[
              styles.label,
              size === "sm" && styles.smLabel,
              size === "lg" && styles.lgLabel,
              variant === "secondary" && styles.secondaryLabel,
              variant === "ghost" && styles.ghostLabel,
              variant === "outline" && styles.outlineLabel,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  sm: { minHeight: 42, paddingHorizontal: 14 },
  lg: { minHeight: 58, paddingHorizontal: 24 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  ghost: { backgroundColor: "transparent" },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.danger },
  dark: { backgroundColor: colors.dark },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  label: { color: colors.white, fontSize: 16, fontWeight: "600" },
  smLabel: { fontSize: 14 },
  lgLabel: { fontSize: 16 },
  secondaryLabel: { color: colors.dark },
  ghostLabel: { color: colors.primary },
  outlineLabel: { color: colors.dark },
});
