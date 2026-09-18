import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  FAMILY_MEMBER_LIMIT,
  familyInviteLink,
  familyInviteMessage,
  getFamilyMembers,
  inviteFamilyMember,
  nigeriaWhatsAppNumber,
  notifyInviterOfNewJoins,
  qrImageUrl,
  uninviteFamilyMember,
  type FamilyMember,
} from "@/lib/family";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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

function inviteText(member: FamilyMember, inviterName: string) {
  return familyInviteMessage({
    inviteeName: member.invitee_name,
    inviterName,
    code: member.code,
  });
}

export default function PassengerFamilyScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const inviterName = profile?.full_name ?? "A family member";
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sent, setSent] = useState<FamilyMember | null>(null);
  const [qrMember, setQrMember] = useState<FamilyMember | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile?.id) return;
    const list = await getFamilyMembers(profile.id);
    setMembers(list);
    await notifyInviterOfNewJoins(list);
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh])
  );

  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`family-invites-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_invites",
          filter: `inviter_id=eq.${profile.id}`,
        },
        () => {
          refresh().catch(() => undefined);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, refresh]);

  const openWhatsApp = async (member: FamilyMember) => {
    const msg = encodeURIComponent(inviteText(member, inviterName));
    const num = nigeriaWhatsAppNumber(member.invitee_phone ?? "");
    const url = num
      ? `https://wa.me/${num}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert("WhatsApp unavailable", "Install WhatsApp or copy the invite link.");
      return;
    }
    await Linking.openURL(url);
  };

  const openSms = async (member: FamilyMember) => {
    const body = encodeURIComponent(inviteText(member, inviterName));
    const phoneNum = (member.invitee_phone ?? "").replace(/\s+/g, "");
    const sep = Platform.OS === "ios" ? "&" : "?";
    const url = phoneNum
      ? `sms:${phoneNum}${sep}body=${body}`
      : `sms:${sep}body=${body}`;
    await Linking.openURL(url).catch(() =>
      Alert.alert("Couldn’t open Messages", "Copy the invite link instead.")
    );
  };

  const copyInvite = async (member: FamilyMember) => {
    const { app } = familyInviteLink(member.code);
    await Clipboard.setStringAsync(
      `${inviteText(member, inviterName)}\n\n${app}`
    );
    Alert.alert("Invite copied", "The family link and code are on your clipboard.");
  };

  const onInvite = async () => {
    if (saving || !profile?.id) return;
    setSaving(true);
    const res = await inviteFamilyMember({
      name,
      phone,
      inviterId: profile.id,
    });
    setSaving(false);
    if (!res.ok) {
      Alert.alert("Invite not sent", res.message);
      return;
    }
    setName("");
    setPhone("");
    setInviteOpen(false);
    setSent(res.member);
    await refresh();
  };

  const confirmUninvite = (member: FamilyMember) => {
    Alert.alert(
      "Uninvite this person?",
      member.status === "accepted"
        ? `${member.invitee_name} will be removed from your family profile.`
        : `${member.invitee_name} will no longer be able to join with this invite.`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Uninvite",
          style: "destructive",
          onPress: async () => {
            try {
              await uninviteFamilyMember(member.id);
              if (selectedId === member.id) setSelectedId(null);
              if (sent?.id === member.id) setSent(null);
              await refresh();
            } catch (e) {
              Alert.alert(
                "Couldn’t uninvite",
                e instanceof Error ? e.message : "Try again."
              );
            }
          },
        },
      ]
    );
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
              <Text style={styles.memberHeading}>Your family</Text>
              {members.map((m) => {
                const on = selectedId === m.id;
                const joined = m.status === "accepted";
                return (
                  <Pressable
                    key={m.id}
                    style={[styles.memberRow, on && styles.memberOn]}
                    onPress={() => setSelectedId(on ? null : m.id)}
                  >
                    <View
                      style={[
                        styles.avatar,
                        joined && { backgroundColor: colors.successSoft },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {m.invitee_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{m.invitee_name}</Text>
                      <Text style={styles.memberMeta}>
                        {joined
                          ? "Joined your family"
                          : "Waiting to join"}{" "}
                        · {m.invitee_phone}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.pill,
                        joined ? styles.pillOk : styles.pillWait,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          joined ? styles.pillOkText : styles.pillWaitText,
                        ]}
                      >
                        {joined ? "Joined" : "Pending"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              {selectedId
                ? (() => {
                    const m = members.find((x) => x.id === selectedId);
                    if (!m) return null;
                    return (
                      <View style={styles.actions}>
                        {m.status !== "accepted" ? (
                          <>
                            <Pressable
                              style={styles.actionBtn}
                              onPress={() => openWhatsApp(m)}
                            >
                              <Ionicons
                                name="logo-whatsapp"
                                size={18}
                                color={colors.primary}
                              />
                              <Text style={styles.actionText}>WhatsApp</Text>
                            </Pressable>
                            <Pressable
                              style={styles.actionBtn}
                              onPress={() => setQrMember(m)}
                            >
                              <Ionicons
                                name="qr-code-outline"
                                size={18}
                                color={colors.primary}
                              />
                              <Text style={styles.actionText}>Show QR</Text>
                            </Pressable>
                          </>
                        ) : null}
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => confirmUninvite(m)}
                        >
                          <Ionicons
                            name="person-remove-outline"
                            size={18}
                            color={colors.danger}
                          />
                          <Text style={[styles.actionText, { color: colors.danger }]}>
                            Uninvite
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })()
                : (
                  <Text style={styles.hint}>
                    Tap a person to resend or uninvite them.
                  </Text>
                )}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
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
              They’ll get a personal link and family code. After they sign up,
              you’ll see they’ve joined.
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
            <Text style={styles.fieldLabel}>WhatsApp / phone number</Text>
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
                {saving ? "Creating invite…" : "Create invite"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={Boolean(sent)}
        animationType="slide"
        transparent
        onRequestClose={() => setSent(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setSent(null)} />
          {sent ? (
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, 18) },
              ]}
            >
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>Invite ready</Text>
                <Pressable onPress={() => setSent(null)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={colors.dark} />
                </Pressable>
              </View>
              <Text style={styles.sheetLead}>
                Send {sent.invitee_name} this link. When they sign up, their
                status here changes to Joined.
              </Text>
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Family code</Text>
                <Text style={styles.codeValue}>{sent.code}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.cta,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => openWhatsApp(sent)}
              >
                <Text style={styles.ctaText}>Send on WhatsApp</Text>
              </Pressable>
              <View style={styles.sendRow}>
                <Pressable style={styles.sendAlt} onPress={() => openSms(sent)}>
                  <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                  <Text style={styles.sendAltText}>SMS</Text>
                </Pressable>
                <Pressable
                  style={styles.sendAlt}
                  onPress={() => copyInvite(sent)}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.primary} />
                  <Text style={styles.sendAltText}>Copy link</Text>
                </Pressable>
                <Pressable
                  style={styles.sendAlt}
                  onPress={() => setQrMember(sent)}
                >
                  <Ionicons name="qr-code-outline" size={18} color={colors.primary} />
                  <Text style={styles.sendAltText}>Show QR</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={Boolean(qrMember)}
        animationType="fade"
        transparent
        onRequestClose={() => setQrMember(null)}
      >
        <Pressable style={styles.qrBackdrop} onPress={() => setQrMember(null)}>
          {qrMember ? (
            <View style={styles.qrCard}>
              <Text style={styles.sheetTitle}>Show this to family</Text>
              <Text style={styles.sheetLead}>
                {qrMember.invitee_name} can scan this to open your invite.
              </Text>
              <Image
                source={{ uri: qrImageUrl(qrMember.code) }}
                style={styles.qrImage}
              />
              <Text style={styles.codeValue}>{qrMember.code}</Text>
              <Pressable onPress={() => setQrMember(null)}>
                <Text style={styles.done}>Done</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
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
  memberHeading: {
    color: colors.dark,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 4,
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
  pill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillWait: { backgroundColor: colors.warningSoft },
  pillOk: { backgroundColor: colors.successSoft },
  pillText: { fontSize: 11, fontWeight: "700" },
  pillWaitText: { color: colors.secondaryDark },
  pillOkText: { color: colors.success },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
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
  codeCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  codeLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  codeValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    marginTop: 4,
  },
  sendRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  sendAlt: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendAltText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  qrBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18,55,42,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  qrCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    gap: 8,
  },
  qrImage: {
    width: 220,
    height: 220,
    marginVertical: 8,
  },
  done: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    marginTop: 4,
  },
});
