import { radii } from "@/constants/theme";
import { useColors } from "@/context/theme";
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
  const colors = useColors();
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
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "secondary" && { backgroundColor: colors.secondary },
        variant === "ghost" && { backgroundColor: "transparent" },
        variant === "outline" && {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.border,
        },
        variant === "danger" && { backgroundColor: colors.danger },
        variant === "dark" && { backgroundColor: colors.darkSurface },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger" || variant === "dark"
              ? "#FFFFFF"
              : colors.primary
          }
        />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={lightLabel ? colors.dark : "#FFFFFF"}
            />
          ) : null}
          <Text
            style={[
              styles.label,
              size === "sm" && styles.smLabel,
              size === "lg" && styles.lgLabel,
              variant === "secondary" && { color: colors.dark },
              variant === "ghost" && { color: colors.primary },
              variant === "outline" && { color: colors.dark },
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
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  label: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  smLabel: { fontSize: 14 },
  lgLabel: { fontSize: 16 },
});
