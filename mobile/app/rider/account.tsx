import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { getRiderByUserId } from "@/lib/driver-bootstrap";
import {
  createProfile,
  deleteAvatar,
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

export default function RiderAccountScreen() {
  const { profile, session, refreshProfile } = useAuth();
  const colors = useColors();
  const userId = session?.user.id ?? profile?.id;
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(
    profile?.email ?? session?.user.email ?? ""
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loading, setLoading] = useState(!profile?.id);
  const [exists, setExists] = useState(Boolean(profile?.id));
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [trips, setTrips] = useState(0);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [row, rider] = await Promise.all([
        getProfile(userId),
        getRiderByUserId(userId).catch(() => null),
      ]);
      if (row) {
        setExists(true);
        setName((prev) => (prev === (row.full_name ?? "") ? prev : row.full_name ?? ""));
        setPhone((prev) => (prev === (row.phone ?? "") ? prev : row.phone ?? ""));
        setEmail((prev) => (prev === (row.email ?? "") ? prev : row.email ?? ""));
        setAvatarUrl((prev) =>
          prev === row.avatar_url ? prev : row.avatar_url
        );
        setMemberSince(row.created_at ?? null);
      } else {
        setExists(false);
        const metaName = String(session?.user.user_metadata?.full_name ?? "");
        const metaPhone = String(session?.user.user_metadata?.phone ?? "");
        const metaEmail = session?.user.email ?? "";
        setName((prev) => (prev === metaName ? prev : metaName));
        setPhone((prev) => (prev === metaPhone ? prev : metaPhone));
        setEmail((prev) => (prev === metaEmail ? prev : metaEmail));
        setAvatarUrl((prev) => (prev == null ? prev : null));
      }
      setVehicle(rider?.vehicle_type ?? null);
      setVerified(Boolean(rider?.is_verified));
      setRating(
        typeof rider?.rating === "number" ? Number(rider.rating) : null
      );
      setTrips(Number(rider?.total_deliveries || 0));
    } catch (err) {
      Alert.alert(
        "Couldn’t load profile",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user.email, session?.user.user_metadata?.full_name, session?.user.user_metadata?.phone, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

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
    Alert.alert(
      "Remove photo?",
      "Your profile will show your initials instead.",
      [
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
      ]
    );
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

      const authPatch: {
        data: { full_name: string; phone: string };
        email?: string;
      } = {
        data: { full_name: name.trim(), phone: phone.trim() },
      };
      if (
        email.trim() &&
        email.trim() !== (profile?.email ?? session.user.email)
      ) {
        authPatch.email = email.trim();
      }
      const { error: authError } = await supabase.auth.updateUser(authPatch);
      await refreshProfile();
      if (authError) {
        Alert.alert("Profile saved", authError.message);
      } else {
        Alert.alert(
          "Profile updated",
          "Your driver account details are up to date."
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

  const ratingLabel =
    rating != null && Number.isFinite(rating)
      ? `${rating.toFixed(1)}★`
      : "New driver";
  const sinceLabel = memberSince
    ? new Date(memberSince).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;
  const checklist = [
    { ok: Boolean(avatarUrl), label: "Profile photo" },
    { ok: phone.trim().length >= 7, label: "Phone number" },
    { ok: Boolean(vehicle), label: "Vehicle details" },
    { ok: verified, label: "Verified badge" },
  ];

  return (
    <Screen>
      <ScreenHeader
        title="Account"
        subtitle="Your driver identity"
        onBack={() => router.back()}
      />

      <View style={styles.hero}>
        <View style={{ position: "relative" }}>
          <ProfileAvatar
            uri={avatarUrl}
            name={name || "Driver"}
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
        <Text style={[styles.heroName, { color: colors.dark }]}>
          {name || "Your name"}
        </Text>
        <Text style={[styles.heroMeta, { color: colors.muted }]}>
          {ratingLabel}
          {trips ? ` · ${trips} trips` : ""}
          {sinceLabel ? ` · Joined ${sinceLabel}` : ""}
        </Text>
        <View style={styles.photoActions}>
          <Pressable
            style={[
              styles.photoBtn,
              { borderColor: colors.border, backgroundColor: colors.white },
            ]}
            onPress={onChangePhoto}
          >
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={[styles.photoBtnText, { color: colors.primary }]}>
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Text>
          </Pressable>
          {avatarUrl ? (
            <Pressable
              style={[
                styles.photoBtn,
                { borderColor: colors.border, backgroundColor: colors.white },
              ]}
              onPress={onRemovePhoto}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={[styles.photoBtnText, { color: colors.danger }]}>
                Remove
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Card
        style={{
          backgroundColor: verified ? colors.successSoft : colors.secondarySoft,
        }}
      >
        <Text
          style={[
            styles.statusTitle,
            { color: verified ? colors.success : colors.secondaryDark },
          ]}
        >
          {verified ? "Verified driver" : "Finish your profile"}
        </Text>
        <Text style={[styles.statusBody, { color: colors.muted }]}>
          {verified
            ? "Passengers can trust your account. Keep phone and vehicle details current."
            : "Complete the checklist below so we can review your account."}
        </Text>
        <View style={styles.checkList}>
          {checklist.map((item) => (
            <View key={item.label} style={styles.checkRow}>
              <Ionicons
                name={item.ok ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={item.ok ? colors.success : colors.muted}
              />
              <Text style={[styles.checkText, { color: colors.dark }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />
      ) : null}

      <Text style={[styles.blockTitle, { color: colors.dark }]}>
        Contact details
      </Text>
      <Text style={[styles.label, { color: colors.muted }]}>Full name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          {
            color: colors.dark,
            borderColor: colors.border,
            backgroundColor: colors.white,
          },
        ]}
        placeholder="Your name"
        placeholderTextColor={colors.muted}
      />
      <Text style={[styles.label, { color: colors.muted }]}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={[
          styles.input,
          {
            color: colors.dark,
            borderColor: colors.border,
            backgroundColor: colors.white,
          },
        ]}
        placeholder="0803 000 0000"
        placeholderTextColor={colors.muted}
      />
      <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          {
            color: colors.dark,
            borderColor: colors.border,
            backgroundColor: colors.white,
          },
        ]}
        placeholderTextColor={colors.muted}
      />
      <Pressable
        style={[
          styles.save,
          { backgroundColor: colors.primary },
          saving && { opacity: 0.7 },
        ]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving…" : exists ? "Save changes" : "Create profile"}
        </Text>
      </Pressable>

      <Text style={[styles.blockTitle, { color: colors.dark }]}>
        Linked driver info
      </Text>
      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="car-outline"
          title="Vehicle"
          subtitle={vehicle ?? "Add vehicle type and license"}
          onPress={() => router.push("/rider/vehicle" as never)}
        />
        <ListRow
          icon="card-outline"
          title="Payout details"
          subtitle="Bank account for cash out"
          onPress={() => router.push("/rider/payouts" as never)}
        />
        <ListRow
          icon="settings-outline"
          title="Settings"
          subtitle="Alerts, appearance, privacy"
          onPress={() => router.push("/rider/settings" as never)}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 4,
    gap: 8,
  },
  heroName: { fontSize: 20, fontWeight: "900", marginTop: 4 },
  heroMeta: { fontSize: 13, fontWeight: "600", textAlign: "center" },
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
  photoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
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
  statusTitle: { fontWeight: "900", fontSize: 15 },
  statusBody: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  checkList: { marginTop: 10, gap: 6 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkText: { fontSize: 13, fontWeight: "700" },
  blockTitle: { fontSize: 16, fontWeight: "900", marginTop: 8 },
  label: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  save: {
    marginTop: 10,
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
