import { colors, radii } from "@/constants/theme";
import { openPhoneCall, openSms, openWhatsApp } from "@/lib/maps-nav";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

/** Call / WhatsApp / SMS — contacts the passenger (or the phone you pass in). */
export function ContactBar({
  phone,
  name,
  subtitle,
  whatsAppMessage,
}: {
  phone?: string | null;
  name: string;
  subtitle?: string;
  whatsAppMessage?: string;
}) {
  const hasPhone = Boolean(phone?.trim());

  const fail = (label: string, err: unknown) => {
    Alert.alert(
      `Couldn’t open ${label}`,
      err instanceof Error ? err.message : "Check that the app is installed."
    );
  };

  const call = () => {
    if (!phone) return;
    void openPhoneCall(phone).catch((err) => fail("Phone", err));
  };
  const message = () => {
    if (!phone) return;
    void openSms(phone).catch((err) => fail("Messages", err));
  };
  const whatsapp = () => {
    if (!phone) return;
    void openWhatsApp(phone, whatsAppMessage).catch((err) =>
      fail("WhatsApp", err)
    );
  };

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        {hasPhone ? (
          <Text style={styles.phone}>{phone}</Text>
        ) : (
          <Text style={styles.phoneMuted}>No phone on this profile</Text>
        )}
      </View>
      <Pressable
        style={[styles.btn, !hasPhone && styles.btnOff]}
        onPress={whatsapp}
        disabled={!hasPhone}
        accessibilityLabel="WhatsApp passenger"
      >
        <Ionicons
          name="logo-whatsapp"
          size={18}
          color={hasPhone ? colors.primary : colors.muted}
        />
      </Pressable>
      <Pressable
        style={[styles.btn, !hasPhone && styles.btnOff]}
        onPress={message}
        disabled={!hasPhone}
        accessibilityLabel="SMS passenger"
      >
        <Ionicons
          name="chatbubble"
          size={18}
          color={hasPhone ? colors.dark : colors.muted}
        />
      </Pressable>
      <Pressable
        style={[styles.btn, styles.call, !hasPhone && styles.btnOff]}
        onPress={call}
        disabled={!hasPhone}
        accessibilityLabel="Call passenger"
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
    gap: 10,
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
  phone: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  phoneMuted: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOff: { opacity: 0.45 },
  call: { backgroundColor: colors.primary, borderColor: colors.primary },
});
