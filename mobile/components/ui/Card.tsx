import { Button } from "@/components/ui/Button";
import { colors, radii } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Card({
  children,
  padded = true,
}: {
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={[styles.card, padded && styles.padded]}>{children}</View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={{ marginTop: 8 }}>
          <Button label={actionLabel} onPress={onAction} size="sm" />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    overflow: "hidden",
  },
  padded: { padding: 20 },
  title: { fontSize: 16, fontWeight: "700", color: colors.dark },
  message: { fontSize: 14, color: colors.muted, lineHeight: 20 },
});
