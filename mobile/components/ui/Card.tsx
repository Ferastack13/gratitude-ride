import { colors } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.dark },
  message: { fontSize: 14, color: colors.muted, lineHeight: 20 },
});
