import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  addSavedContact,
  contactMatches,
  formatPhoneLabel,
  getDeviceContactsPermission,
  getSavedContacts,
  loadDeviceContacts,
  removeSavedContact,
  requestDeviceContactsPermission,
  shareTripMessage,
  smsShareUrl,
  whatsappShareUrl,
  type ContactsPermission,
  type DeviceContact,
  type SavedContact,
} from "@/lib/contacts";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

function ContactBookArt() {
  return (
    <View style={art.wrap} accessibilityElementsHidden>
      <View style={art.book}>
        <View style={art.spine} />
        <View style={art.page} />
        <View style={art.smile} />
      </View>
      <View style={art.tab} />
    </View>
  );
}

export default function PassengerContactsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const riderName = profile?.full_name ?? "A Gratitude rider";

  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<SavedContact[]>([]);
  const [device, setDevice] = useState<DeviceContact[]>([]);
  const [permission, setPermission] = useState<ContactsPermission>("undetermined");
  const [loadingDevice, setLoadingDevice] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<
    | { kind: "saved"; contact: SavedContact }
    | { kind: "phone"; contact: DeviceContact }
    | null
  >(null);

  const refreshSaved = useCallback(async () => {
    setSaved(await getSavedContacts());
  }, []);

  const refreshDevice = useCallback(async () => {
    const status = await getDeviceContactsPermission();
    setPermission(status);
    if (status !== "granted") {
      setDevice([]);
      return;
    }
    setLoadingDevice(true);
    try {
      setDevice(await loadDeviceContacts());
    } catch {
      setDevice([]);
    } finally {
      setLoadingDevice(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshSaved();
      void refreshDevice();
    }, [refreshSaved, refreshDevice])
  );

  const filteredSaved = useMemo(
    () => saved.filter((c) => contactMatches(query, c.name, c.phone)),
    [saved, query]
  );
  const filteredDevice = useMemo(
    () => device.filter((c) => contactMatches(query, c.name, c.phone)),
    [device, query]
  );

  const onAllow = async () => {
    setLoadingDevice(true);
    const status = await requestDeviceContactsPermission();
    setPermission(status);
    if (status === "granted") {
      try {
        setDevice(await loadDeviceContacts());
      } catch {
        Alert.alert(
          "Couldn’t load contacts",
          "Check that contacts permission is on, then try again."
        );
      } finally {
        setLoadingDevice(false);
      }
      return;
    }
    setLoadingDevice(false);
    if (status === "denied") {
      Alert.alert(
        "Contacts are off",
        "Turn on contacts access in system settings to share trip status.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Open settings", onPress: () => void Linking.openSettings() },
        ]
      );
    }
  };

  const onSaveNew = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await addSavedContact({ name, phone });
      setName("");
      setPhone("");
      setAddOpen(false);
      await refreshSaved();
    } catch (err) {
      Alert.alert(
        "Couldn’t save contact",
        err instanceof Error ? err.message : "Enter a name and phone number."
      );
    } finally {
      setSaving(false);
    }
  };

  const addFromPhone = async (contact: DeviceContact) => {
    if (!contact.phone) {
      Alert.alert("No number", "This phone contact doesn’t have a number to save.");
      return;
    }
    try {
      await addSavedContact({ name: contact.name, phone: contact.phone });
      setSelected(null);
      await refreshSaved();
      Alert.alert("Saved", `${contact.name} is now a Gratitude contact.`);
    } catch (err) {
      Alert.alert(
        "Couldn’t save contact",
        err instanceof Error ? err.message : "Try again."
      );
    }
  };

  const callNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      Alert.alert("No number", "This contact doesn’t have a phone number.");
      return;
    }
    void Linking.openURL(`tel:${digits}`).catch(() =>
      Alert.alert("Couldn’t call", "Check the phone number and try again.")
    );
  };

  const shareTrip = async (contactName: string, value: string, via: "whatsapp" | "sms") => {
    const message = shareTripMessage(contactName, riderName);
    const url =
      via === "whatsapp" ? whatsappShareUrl(value, message) : smsShareUrl(value, message);
    if (!url) {
      Alert.alert("No number", "This contact doesn’t have a phone number.");
      return;
    }
    const can = await Linking.canOpenURL(url);
    if (!can && via === "whatsapp") {
      Alert.alert("WhatsApp isn’t available", "Try SMS instead.");
      return;
    }
    void Linking.openURL(url);
  };

  const confirmRemove = (contact: SavedContact) => {
    Alert.alert("Remove contact?", `${contact.name} will leave your Gratitude contacts.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removeSavedContact(contact.id);
          setSelected(null);
          await refreshSaved();
        },
      },
    ]);
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
        <Text style={styles.headerTitle}>Contacts</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.search}
          placeholder="Search name or number"
          placeholderTextColor={colors.mutedLight}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={colors.primary}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.mutedLight} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.75 }]}
        onPress={() => setAddOpen(true)}
      >
        <View style={styles.addIcon}>
          <Ionicons name="person-add-outline" size={18} color={colors.primary} />
        </View>
        <Text style={styles.addLabel}>Add new contact</Text>
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Gratitude contacts</Text>
        {filteredSaved.length === 0 ? (
          <View style={styles.emptySaved}>
            <View style={styles.emptySavedIcon}>
              <Ionicons name="person-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emptySavedTitle}>
                {query ? "No matching Gratitude contacts" : "No Gratitude contacts yet"}
              </Text>
              <Text style={styles.emptySavedBody}>
                {query
                  ? "Try a different name or number."
                  : "People you add will show here."}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.88 }]}
              onPress={() => setAddOpen(true)}
            >
              <Text style={styles.chipText}>Add</Text>
            </Pressable>
          </View>
        ) : (
          filteredSaved.map((contact) => (
            <Pressable
              key={contact.id}
              style={({ pressed }) => [styles.personRow, pressed && { opacity: 0.8 }]}
              onPress={() => setSelected({ kind: "saved", contact })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{contact.name}</Text>
                <Text style={styles.personPhone}>{formatPhoneLabel(contact.phone)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
            </Pressable>
          ))
        )}

        <Text style={[styles.section, { marginTop: 22 }]}>Phone contacts</Text>
        {permission === "granted" ? (
          loadingDevice ? (
            <View style={styles.phoneLoading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.phoneLoadingText}>Loading phone contacts…</Text>
            </View>
          ) : filteredDevice.length === 0 ? (
            <Text style={styles.nonePhone}>
              {query
                ? "No matching phone contacts."
                : "No phone contacts with names or numbers were found."}
            </Text>
          ) : (
            filteredDevice.map((contact) => (
              <Pressable
                key={contact.id}
                style={({ pressed }) => [styles.personRow, pressed && { opacity: 0.8 }]}
                onPress={() => setSelected({ kind: "phone", contact })}
              >
                <View style={[styles.avatar, styles.avatarPhone]}>
                  <Text style={styles.avatarText}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{contact.name}</Text>
                  <Text style={styles.personPhone}>
                    {contact.phone ? formatPhoneLabel(contact.phone) : "No number"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
              </Pressable>
            ))
          )
        ) : (
          <View style={styles.allowCard}>
            <ContactBookArt />
            <Text style={styles.allowTitle}>Allow access to your contacts</Text>
            <Text style={styles.allowBody}>
              We’ll use contact information to share trip status and to send pick-up and
              drop-off notifications.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.allowBtn,
                pressed && { opacity: 0.9 },
                loadingDevice && { opacity: 0.7 },
              ]}
              onPress={onAllow}
              disabled={loadingDevice}
            >
              {loadingDevice ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.allowBtnText}>Allow</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={addOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setAddOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setAddOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Add new contact</Text>
              <Pressable onPress={() => setAddOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <Text style={styles.sheetLead}>
              Saved people can get trip status, pick-up, and drop-off updates.
            </Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
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
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
              onPress={onSaveNew}
              disabled={saving}
            >
              <Text style={styles.ctaText}>{saving ? "Saving…" : "Save contact"}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={Boolean(selected)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setSelected(null)} />
          {selected ? (
            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>{selected.contact.name}</Text>
                <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={colors.dark} />
                </Pressable>
              </View>
              <Text style={styles.sheetLead}>
                {selected.contact.phone
                  ? formatPhoneLabel(selected.contact.phone)
                  : "No phone number"}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => callNumber(selected.contact.phone)}
                >
                  <Ionicons name="call-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>Call</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() =>
                    void shareTrip(selected.contact.name, selected.contact.phone, "whatsapp")
                  }
                >
                  <Ionicons name="logo-whatsapp" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>WhatsApp</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() =>
                    void shareTrip(selected.contact.name, selected.contact.phone, "sms")
                  }
                >
                  <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>SMS</Text>
                </Pressable>
              </View>
              {selected.kind === "phone" ? (
                <Pressable
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                  onPress={() => void addFromPhone(selected.contact)}
                >
                  <Text style={styles.ctaText}>Add to Gratitude contacts</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => confirmRemove(selected.contact)}
                >
                  <Text style={styles.removeText}>Remove contact</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const art = StyleSheet.create({
  wrap: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  book: {
    width: 58,
    height: 68,
    borderRadius: 8,
    backgroundColor: colors.primary,
    overflow: "hidden",
    ...shadows.soft,
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: colors.primaryDark,
  },
  page: {
    position: "absolute",
    right: 6,
    top: 8,
    bottom: 8,
    width: 38,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  smile: {
    position: "absolute",
    right: 16,
    top: 34,
    width: 18,
    height: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.primary,
  },
  tab: {
    position: "absolute",
    right: 8,
    top: 18,
    width: 14,
    height: 22,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.secondary,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
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
    fontSize: 18,
    fontWeight: "700",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  search: {
    flex: 1,
    color: colors.dark,
    fontSize: 15,
    paddingVertical: 10,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: { flex: 1 },
  section: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptySaved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptySavedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySavedTitle: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "700",
  },
  emptySavedBody: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  chip: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPhone: {
    backgroundColor: colors.primarySoft,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  personName: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "600",
  },
  personPhone: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  allowCard: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 12,
  },
  allowTitle: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  allowBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 18,
  },
  allowBtn: {
    minWidth: 88,
    minHeight: 36,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  allowBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  phoneLoading: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
  },
  phoneLoadingText: {
    color: colors.muted,
    fontSize: 13,
  },
  nonePhone: {
    color: colors.muted,
    fontSize: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    flex: 1,
    paddingRight: 12,
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
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...shadows.soft,
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
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
  removeBtn: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 15,
  },
});
