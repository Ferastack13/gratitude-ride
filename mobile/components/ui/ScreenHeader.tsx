import { radii } from "@/constants/theme";
import { useColors } from "@/context/theme";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            style={[
              styles.back,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
              },
            ]}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={20} color={colors.dark} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.dark }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: colors.muted }]}>{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  sub: { fontSize: 13, marginTop: 2, fontWeight: "400" },
});
