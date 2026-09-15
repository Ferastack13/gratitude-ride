import { colors, radii, typography } from "@/constants/theme";
import {
  getSafetyPrefs,
  setSafetyPrefs,
  type EmergencyContact,
  type RideCheckMode,
  type SafetyPrefs,
} from "@/lib/client-prefs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function rideCheckLabel(mode: RideCheckMode) {
  if (mode === "all") return "All trips";
  if (mode === "night") return "Night trips";
  return "Off";
}

export default function SafetyHubScreen() {
  const [prefs, setPrefs] = useState<SafetyPrefs | null>(null);
  const [addingContact, setAddingContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pinDraft, setPinDraft] = useState("");
  const [settingPin, setSettingPin] = useState(false);

  const refresh = useCallback(async () => {
    setPrefs(await getSafetyPrefs());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh])
  );

  const update = async (patch: Partial<SafetyPrefs>) => {
    const next = await setSafetyPrefs(patch);
    setPrefs(next);
  };

  const togglePin = async (value: boolean) => {
    if (!value) {
      await update({ pinVerification: false });
      return;
    }
    if (prefs?.pinCode && prefs.pinCode.length === 4) {
      await update({ pinVerification: true });
      return;
    }
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Set ride PIN",
        "Enter a 4-digit PIN to share with your driver.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: async (text?: string) => {
              const pin = (text ?? "").replace(/\D/g, "").slice(0, 4);
              if (pin.length !== 4) {
                Alert.alert("Invalid PIN", "Use exactly 4 digits.");
                return;
              }
              await update({ pinVerification: true, pinCode: pin });
              Alert.alert(
                "PIN saved",
                "Share this PIN only with your assigned driver."
              );
            },
          },
        ],
        "plain-text"
      );
      return;
    }
    setPinDraft("");
    setSettingPin(true);
  };

  const savePinDraft = async () => {
    const pin = pinDraft.replace(/\D/g, "").slice(0, 4);
    if (pin.length !== 4) {
      Alert.alert("Invalid PIN", "Use exactly 4 digits.");
      return;
    }
    await update({ pinVerification: true, pinCode: pin });
    setSettingPin(false);
    setPinDraft("");
    Alert.alert("PIN saved", "Share this PIN only with your assigned driver.");
  };

  const toggleAudio = async (value: boolean) => {
    if (value) {
      Alert.alert(
        "Audio recording",
        "When enabled, Gratitude Ride will request microphone access on future trips so you can record ride audio for your safety. Recording only starts after you confirm on an active trip.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              await update({ audioRecording: true });
            },
          },
        ]
      );
      return;
    }
    await update({ audioRecording: false });
  };

  const toggleEmergency = async (value: boolean) => {
    if (value && (!prefs || prefs.emergencyContacts.length === 0)) {
      Alert.alert(
        "Add a contact first",
        "Add at least one emergency contact before enabling this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add contact", onPress: () => setAddingContact(true) },
        ]
      );
      return;
    }
    await update({ emergencyContactsEnabled: value });
  };

  const saveContact = async () => {
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (!name || phone.length < 7) {
      Alert.alert("Missing details", "Enter a name and a valid phone number.");
      return;
    }
    const contact: EmergencyContact = {
      id: `${Date.now()}`,
      name,
      phone,
    };
    const list = [...(prefs?.emergencyContacts ?? []), contact];
    await update({
      emergencyContacts: list,
      emergencyContactsEnabled: true,
    });
    setContactName("");
    setContactPhone("");
    setAddingContact(false);
    Alert.alert("Contact saved", `${name} was added as an emergency contact.`);
  };

  const removeContact = (id: string) => {
    Alert.alert("Remove contact?", "They will no longer be called in an emergency.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const list = (prefs?.emergencyContacts ?? []).filter((c) => c.id !== id);
          await update({
            emergencyContacts: list,
            emergencyContactsEnabled: list.length > 0 ? prefs?.emergencyContactsEnabled : false,
          });
        },
      },
    ]);
  };

  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Couldn’t call", "Check the phone number and try again.")
    );
  };

  if (!prefs) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.close}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Close safety hub"
        >
          <Ionicons name="close" size={24} color={colors.dark} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Safety hub</Text>

        <Text style={styles.section}>Safety preferences</Text>
        <Text style={styles.sectionSub}>
          Manage and schedule your safety features.
        </Text>

        <View style={styles.list}>
          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Ionicons name="keypad-outline" size={22} color={colors.dark} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>PIN verification</Text>
              <Text style={styles.itemSub}>
                Use PIN to help you get in the right car.
                {prefs.pinCode ? ` Current PIN: ${prefs.pinCode}` : ""}
              </Text>
              {settingPin ? (
                <View style={styles.addForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="4-digit PIN"
                    placeholderTextColor={colors.mutedLight}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    value={pinDraft}
                    onChangeText={setPinDraft}
                  />
                  <View style={styles.addActions}>
                    <Pressable
                      onPress={() => {
                        setSettingPin(false);
                        setPinDraft("");
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.saveBtn} onPress={savePinDraft}>
                      <Text style={styles.saveBtnText}>Save PIN</Text>
                    </Pressable>
                  </View>
                </View>
              ) : prefs.pinCode ? (
                <Pressable
                  style={styles.addLink}
                  onPress={() => {
                    setPinDraft("");
                    setSettingPin(true);
                  }}
                >
                  <Text style={styles.addLinkText}>Change PIN</Text>
                </Pressable>
              ) : null}
            </View>
            <Switch
              value={prefs.pinVerification}
              onValueChange={togglePin}
              trackColor={{ false: colors.border, true: colors.primaryGlow }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Ionicons name="mic-outline" size={22} color={colors.dark} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>Audio recording</Text>
              <Text style={styles.itemSub}>Record audio while you ride.</Text>
            </View>
            <Switch
              value={prefs.audioRecording}
              onValueChange={toggleAudio}
              trackColor={{ false: colors.border, true: colors.primaryGlow }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Ionicons name="star-outline" size={22} color={colors.dark} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>Emergency contacts</Text>
              <Text style={styles.itemSub}>
                We’ll call them in case of emergency.
              </Text>
              {(prefs.emergencyContacts.length > 0 || addingContact) && (
                <View style={styles.contactBlock}>
                  {prefs.emergencyContacts.map((c) => (
                    <View key={c.id} style={styles.contactRow}>
                      <Pressable
                        style={{ flex: 1 }}
                        onPress={() => callContact(c.phone)}
                      >
                        <Text style={styles.contactName}>{c.name}</Text>
                        <Text style={styles.contactPhone}>{c.phone}</Text>
                      </Pressable>
                      <Pressable onPress={() => removeContact(c.id)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </Pressable>
                    </View>
                  ))}
                  {addingContact ? (
                    <View style={styles.addForm}>
                      <TextInput
                        style={styles.input}
                        placeholder="Contact name"
                        placeholderTextColor={colors.mutedLight}
                        value={contactName}
                        onChangeText={setContactName}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Phone number"
                        placeholderTextColor={colors.mutedLight}
                        keyboardType="phone-pad"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                      />
                      <View style={styles.addActions}>
                        <Pressable
                          onPress={() => {
                            setAddingContact(false);
                            setContactName("");
                            setContactPhone("");
                          }}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.saveBtn} onPress={saveContact}>
                          <Text style={styles.saveBtnText}>Save contact</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.addLink}
                      onPress={() => setAddingContact(true)}
                    >
                      <Text style={styles.addLinkText}>+ Add contact</Text>
                    </Pressable>
                  )}
                </View>
              )}
              {!addingContact && prefs.emergencyContacts.length === 0 ? (
                <Pressable
                  style={styles.addLink}
                  onPress={() => setAddingContact(true)}
                >
                  <Text style={styles.addLinkText}>+ Add contact</Text>
                </Pressable>
              ) : null}
            </View>
            <Switch
              value={prefs.emergencyContactsEnabled}
              onValueChange={toggleEmergency}
              trackColor={{ false: colors.border, true: colors.primaryGlow }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Ionicons name="navigate-outline" size={22} color={colors.dark} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>Share trip location</Text>
              <Text style={styles.itemSub}>
                Let contacts follow your trips.
              </Text>
            </View>
            <Switch
              value={prefs.shareTripLocation}
              onValueChange={async (v) => {
                await update({ shareTripLocation: v });
                Alert.alert(
                  v ? "Sharing on" : "Sharing off",
                  v
                    ? "During active trips you can share a live link with your contacts."
                    : "Trip location sharing is turned off."
                );
              }}
              trackColor={{ false: colors.border, true: colors.primaryGlow }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.item,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/passenger/safety-ride-check" as never)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="car-outline" size={22} color={colors.dark} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>RideCheck</Text>
              <Text style={styles.itemSub}>
                Get a message if we detect a possible safety issue.
              </Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>
                  {rideCheckLabel(prefs.rideCheck)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
          </Pressable>
        </View>

        <Text style={[styles.section, { marginTop: 28 }]}>
          More safety support
        </Text>

        <View style={styles.list}>
          <Pressable
            style={({ pressed }) => [
              styles.item,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/passenger/safety-tips" as never)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="shield-outline" size={22} color={colors.dark} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>Safety tips</Text>
              <Text style={styles.itemSub}>Take charge of your safety.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.item,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/passenger/safety-about" as never)}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={colors.dark}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>Safety at Gratitude Ride</Text>
              <Text style={styles.itemSub}>
                Learn how we stand for your safety.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.6,
    marginBottom: 22,
  },
  section: {
    ...typography.section,
    fontSize: 16,
    marginBottom: 4,
  },
  sectionSub: {
    ...typography.supporting,
    marginBottom: 14,
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 28,
    paddingTop: 2,
    alignItems: "center",
  },
  itemBody: { flex: 1, paddingRight: 8 },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  itemSub: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 54,
  },
  pill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  contactBlock: {
    marginTop: 10,
    gap: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.dark,
  },
  contactPhone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  addLink: { marginTop: 8 },
  addLinkText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  addForm: { gap: 8, marginTop: 4 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceAlt,
    color: colors.dark,
    fontSize: 14,
  },
  addActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 14,
  },
  cancelText: { color: colors.muted, fontWeight: "600" },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
});
