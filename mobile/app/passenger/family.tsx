import { colors, radii, shadows } from "@/constants/theme";
import {
  FAMILY_MEMBER_LIMIT,
  getFamilyMembers,
  inviteFamilyMember,
  type FamilyMember,
} from "@/lib/family";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HERO = require("../../assets/images/family-hero.png");

const FEATURES = [
  {
    icon: "heart-outline" as const,
    title: "Pay for your family",
    body: "Use a shared payment method",
  },
  {
    icon: "notifications-outline" as const,
    title: "Get updates",
    body: "Receive notifications when a family member uses the family profile",
  },
  {
    icon: "settings-outline" as const,
    title: "Manage family members",
    body: `Add up to ${FAMILY_MEMBER_LIMIT} people that can use the Family profile`,
  },
];

export default function PassengerFamilyScreen() {
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setMembers(await getFamilyMembers());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh])
  );

  const onInvite = async () => {
    if (saving) return;
    setSaving(true);
    const res = await inviteFamilyMember({ name, phone });
    setSaving(false);
    if (!res.ok) {
      Alert.alert("Invite not sent", res.message);
      return;
    }
    setName("");
    setPhone("");
    setInviteOpen(false);
    await refresh();
    try {
      await Share.share({
        message: `You’re invited to the Gratitude Ride family profile. Open the app so I can cover your trips.`,
      });
    } catch {
      Alert.alert(
        "Invite saved",
        `${res.member.name} was added. They can use the family profile once they join.`
      );
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={26} color={colors.dark} />
        </Pressable>
        <Text style={styles.headerTitle}>Select a member</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Image source={HERO} style={styles.hero} resizeMode="cover" />

        <View style={styles.copy}>
          <Text style={styles.headline}>
            Take care of your family with Gratitude
          </Text>
          <Text style={styles.lead}>
            Want to pay for your loved ones? Invite a family member (ages 18+)
            to create a family profile. You can:
          </Text>

          <View style={styles.features}>
            {FEATURES.map((item) => (
              <View key={item.title} style={styles.feature}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureBody}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>

          {members.length > 0 ? (
            <View style={styles.memberBlock}>
              {members.map((m) => {
                const on = selectedId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    style={[styles.memberRow, on && styles.memberOn]}
                    onPress={() => setSelectedId(m.id)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberMeta}>Invited · {m.phone}</Text>
                    </View>
                    {on ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
          onPress={() => setInviteOpen(true)}
        >
          <Text style={styles.ctaText}>Invite family</Text>
        </Pressable>
      </View>

      <Modal
        visible={inviteOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setInviteOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setInviteOpen(false)} />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 18) },
            ]}
          >
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Invite family</Text>
              <Pressable onPress={() => setInviteOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <Text style={styles.sheetLead}>
              Family members must be 18 or older. You can add up to{" "}
              {FAMILY_MEMBER_LIMIT} people.
            </Text>
            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Adaeze Okonkwo"
              placeholderTextColor={colors.mutedLight}
              style={styles.input}
              autoCapitalize="words"
            />
            <Text style={styles.fieldLabel}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="0803 000 0000"
              placeholderTextColor={colors.mutedLight}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <Pressable
              style={({ pressed }) => [
                styles.cta,
                { marginTop: 8 },
                pressed && { opacity: 0.9 },
              ]}
              onPress={onInvite}
              disabled={saving}
            >
              <Text style={styles.ctaText}>
                {saving ? "Sending…" : "Send invite"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: { flex: 1 },
  body: {
    paddingBottom: 12,
  },
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.secondarySoft,
  },
  copy: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  headline: {
    color: colors.dark,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 10,
  },
  lead: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  featureTitle: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  featureBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  memberBlock: {
    marginTop: 24,
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  memberOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  memberName: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "600",
  },
  memberMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.surface,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(18,55,42,0.35)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    gap: 8,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sheetTitle: {
    color: colors.dark,
    fontSize: 20,
    fontWeight: "700",
  },
  sheetLead: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.dark,
    fontWeight: "600",
  },
});
