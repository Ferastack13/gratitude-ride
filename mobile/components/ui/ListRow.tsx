import { colors, radii } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function ListRow({
  title,
  subtitle,
  icon,
  onPress,
  trailing,
  danger,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  trailing?: string;
  danger?: boolean;
}) {
  const content = (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.iconWrap, danger && styles.iconDanger]}>
          <Ionicons
            name={icon}
            size={18}
            color={danger ? colors.danger : colors.primary}
          />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, danger && { color: colors.danger }]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDanger: { backgroundColor: colors.dangerSoft },
  title: { fontSize: 16, fontWeight: "700", color: colors.dark },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  trailing: { fontSize: 13, fontWeight: "700", color: colors.muted },
});
