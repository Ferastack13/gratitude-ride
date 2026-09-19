import { SettingsShell, useSettingsState } from "@/components/settings/SettingsChrome";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useColors } from "@/context/theme";
import { useAuth } from "@/context/auth";
import {
  createProfile,
  deleteAvatar,
  deleteProfile,
  getProfile,
  updateProfile,
  uploadAvatar,
} from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SettingsProfileScreen() {
  const { profile, session, refreshProfile, signOut } = useAuth();
  const { settings, palette, ready } = useSettingsState();
  const colors = useColors();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? session?.user.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(Boolean(profile?.id));

  const load = useCallback(async () => {
    const userId = session?.user.id ?? profile?.id;
    if (!userId) return;
    setLoading(true);
    try {
      const row = await getProfile(userId);
      if (row) {
        setExists(true);
        setName(row.full_name ?? "");
        setPhone(row.phone ?? "");
        setEmail(row.email ?? "");
        setAvatarUrl(row.avatar_url);
      } else {
        setExists(false);
        setName(session?.user.user_metadata?.full_name ?? "");
        setPhone(session?.user.user_metadata?.phone ?? "");
        setEmail(session?.user.email ?? "");
        setAvatarUrl(null);
      }
      await refreshProfile();
    } catch (err) {
      Alert.alert(
        "Couldn’t load profile",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [profile?.id, refreshProfile, session]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (!ready || !settings) return null;

  const pickFrom = async (source: "library" | "camera") => {
    const userId = session?.user.id;
    if (!userId) return;

    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        source === "camera"
          ? "Allow camera access to take a profile photo."
          : "Allow photo access to upload a profile picture."
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
    if (result.canceled || !result.assets[0]?.uri) return;

    setLoadingPhoto(true);
    try {
      if (!exists && session?.user) {
        await createProfile(session.user, {
          full_name: name,
          phone,
          email,
        });
      }
      const url = await uploadAvatar(userId, result.assets[0].uri);
      setAvatarUrl(url);
      setExists(true);
      await refreshProfile();
    } catch (err) {
      Alert.alert(
        "Couldn’t save photo",
        err instanceof Error ? err.message : "Try another image."
      );
    } finally {
      setLoadingPhoto(false);
    }
  };

  const onChangePhoto = () => {
    Alert.alert("Profile photo", "Choose a source", [
      { text: "Cancel", style: "cancel" },
      { text: "Take photo", onPress: () => void pickFrom("camera") },
      { text: "Choose from gallery", onPress: () => void pickFrom("library") },
    ]);
  };

  const onRemovePhoto = () => {
    const userId = session?.user.id;
    if (!userId || !avatarUrl) return;
    Alert.alert("Remove photo?", "Your profile will show your initials instead.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setLoadingPhoto(true);
          try {
            await deleteAvatar(userId);
            setAvatarUrl(null);
            await refreshProfile();
          } catch (err) {
            Alert.alert(
              "Couldn’t remove photo",
              err instanceof Error ? err.message : "Try again."
            );
          } finally {
            setLoadingPhoto(false);
          }
        },
      },
    ]);
  };

  const onSave = async () => {
    if (!session?.user) return;
    if (name.trim().length < 2) {
      Alert.alert("Name required", "Enter your full name.");
      return;
    }
    setSaving(true);
    try {
      if (exists) {
        await updateProfile(session.user.id, {
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || undefined,
        });
      } else {
        await createProfile(session.user, {
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim(),
        });
        setExists(true);
      }

      const authPatch: { data: { full_name: string; phone: string }; email?: string } = {
        data: { full_name: name.trim(), phone: phone.trim() },
      };
      if (email.trim() && email.trim() !== (profile?.email ?? session.user.email)) {
        authPatch.email = email.trim();
      }
      const { error: authError } = await supabase.auth.updateUser(authPatch);
      await refreshProfile();
      if (authError) {
        Alert.alert("Profile saved", authError.message);
      } else {
        Alert.alert(
          exists ? "Profile updated" : "Profile created",
          email.trim() !== (profile?.email ?? session.user.email)
            ? "Check your email if you changed your address."
            : "Your profile is up to date."
        );
      }
    } catch (err) {
      Alert.alert(
        "Couldn’t save",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!session?.user) return;
    Alert.alert(
      "Delete profile?",
      "This removes your Gratitude profile photo and details. You will be signed out.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await deleteProfile(session.user.id);
              await signOut();
              router.replace("/login" as never);
            } catch (err) {
              setSaving(false);
              Alert.alert(
                "Couldn’t delete profile",
                err instanceof Error ? err.message : "Try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SettingsShell title="Profile" palette={palette} settings={settings}>
      <View style={styles.hero}>
        <View style={{ position: "relative" }}>
          <ProfileAvatar
            uri={avatarUrl}
            name={name || "Passenger"}
            size={96}
            badge
            onPress={onChangePhoto}
          />
          {loadingPhoto ? (
            <View style={styles.photoBusy}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </View>
        <Text style={[styles.heroTitle, { color: palette.text }]}>
          {exists ? "Your photo" : "Add a profile"}
        </Text>
        <Text style={[styles.heroBody, { color: palette.muted }]}>
          Upload a picture, then create or update your name, phone, and email.
        </Text>
        <View style={styles.photoActions}>
          <Pressable
            style={[styles.photoBtn, { borderColor: palette.border, backgroundColor: palette.card }]}
            onPress={onChangePhoto}
          >
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={[styles.photoBtnText, { color: colors.primary }]}>
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Text>
          </Pressable>
          {avatarUrl ? (
            <Pressable
              style={[styles.photoBtn, { borderColor: palette.border, backgroundColor: palette.card }]}
              onPress={onRemovePhoto}
            >
              <Ionicons name="trash-outline" size={16} color={palette.danger} />
              <Text style={[styles.photoBtnText, { color: palette.danger }]}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={palette.accent} style={{ marginVertical: 12 }} />
      ) : null}

      <Text style={[styles.label, { color: palette.muted }]}>Full name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.card },
        ]}
        placeholder="Your name"
        placeholderTextColor={palette.muted}
      />
      <Text style={[styles.label, { color: palette.muted }]}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={[
          styles.input,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.card },
        ]}
        placeholder="0803 000 0000"
        placeholderTextColor={palette.muted}
      />
      <Text style={[styles.label, { color: palette.muted }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.card },
        ]}
        placeholderTextColor={palette.muted}
      />
      <Pressable
        style={[styles.save, { backgroundColor: colors.primary }, saving && { opacity: 0.7 }]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving…" : exists ? "Update profile" : "Create profile"}
        </Text>
      </Pressable>
      {exists ? (
        <Pressable style={styles.delete} onPress={onDelete} disabled={saving}>
          <Text style={[styles.deleteText, { color: palette.danger }]}>Delete profile</Text>
        </Pressable>
      ) : null}
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  photoBusy: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18,55,42,0.28)",
    borderRadius: 48,
  },
  heroTitle: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  heroBody: { fontSize: 13, lineHeight: 18, textAlign: "center", paddingHorizontal: 12 },
  photoActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  photoBtnText: { fontWeight: "700", fontSize: 13 },
  label: { fontSize: 12, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  save: {
    marginTop: 18,
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  delete: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  deleteText: { fontWeight: "700", fontSize: 15 },
});
