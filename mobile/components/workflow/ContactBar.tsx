import { colors, radii } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

/** Call / message actions — safety + coordination like ride apps. */
export function ContactBar({
  phone,
  name,
  subtitle,
}: {
  phone?: string | null;
  name: string;
  subtitle?: string;
}) {
  const call = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };
  const message = () => {
    if (phone) Linking.openURL(`sms:${phone}`);
  };

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <Pressable style={styles.btn} onPress={message} disabled={!phone}>
        <Ionicons name="chatbubble" size={18} color={colors.dark} />
      </Pressable>
      <Pressable
        style={[styles.btn, styles.call]}
        onPress={call}
        disabled={!phone}
      >
        <Ionicons name="call" size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: "600" },
  btn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  call: { backgroundColor: colors.primary, borderColor: colors.primary },
});
