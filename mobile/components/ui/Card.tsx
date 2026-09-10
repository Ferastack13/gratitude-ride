import { Button } from "@/components/ui/Button";
import { colors, radii, shadows } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

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
  return (
    <View
      style={[
        styles.card,
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
  return (
    <View style={styles.emptyWrap}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    overflow: "hidden",
    ...shadows.card,
  },
  padded: { padding: 18 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.dark,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    textAlign: "center",
  },
});
