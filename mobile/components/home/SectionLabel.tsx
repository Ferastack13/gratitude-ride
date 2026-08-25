import { colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export function SectionLabel({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.muted,
  },
  action: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
