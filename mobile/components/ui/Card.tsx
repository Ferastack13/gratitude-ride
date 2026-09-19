import { radii } from "@/constants/theme";
import { useColors } from "@/context/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Button } from "@/components/ui/Button";

export function Card({
  children,
  padded = true,
  style,
  tint,
}: {
  children: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  tint?: "blue" | "green" | "purple" | "none";
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceAlt },
        tint === "blue" && { backgroundColor: colors.pastelBlue },
        tint === "green" && { backgroundColor: colors.pastelGreen },
        tint === "purple" && { backgroundColor: colors.pastelPurple },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyWrap}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={[styles.title, { color: colors.dark }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={{ marginTop: 12, alignSelf: "stretch" }}>
          <Button label={actionLabel} onPress={onAction} size="sm" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    gap: 8,
    overflow: "hidden",
  },
  padded: { padding: 18 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "400",
  },
});
