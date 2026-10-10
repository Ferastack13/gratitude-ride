import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { promptAppReview } from "@/lib/app-review";
import { getRiderByUserId } from "@/lib/driver-bootstrap";
import { formatCurrency } from "@/lib/format";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function SectionTitle({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.section, { color: colors.muted }]}>{label}</Text>
  );
}

function QuickTile({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.white,
          borderColor: colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={[styles.tileLabel, { color: colors.dark }]}>{label}</Text>
    </Pressable>
  );
}

export default function RiderMenuScreen() {
  const { profile, session, signOut, setAccountTypePreference } = useAuth();
  const colors = useColors();
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [verified, setVerified] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [trips, setTrips] = useState<number | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "1.0.0";

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const rider = await getRiderByUserId(userId);
      setVehicle(rider?.vehicle_type ?? null);
      setOnline(Boolean(rider?.is_available));
      setVerified(Boolean(rider?.is_verified));
      setRating(
        typeof rider?.rating === "number" ? Number(rider.rating) : null
      );
      setTrips(
        typeof rider?.total_deliveries === "number"
          ? rider.total_deliveries
          : null
      );
      setEarnings(Number(rider?.earnings || 0));
    } catch {
      setVehicle(null);
      setOnline(false);
      setVerified(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const name = profile?.full_name ?? "Driver";
  const phone = profile?.phone?.trim() || "Add phone number";
  const ratingLabel =
    rating != null && Number.isFinite(rating)
      ? `${rating.toFixed(1)}★`
      : "New";
  const tripsLabel =
    trips != null && trips > 0 ? `${trips} trip${trips === 1 ? "" : "s"}` : "No trips yet";

  const goOfflineThen = async (action: () => Promise<void> | void) => {
    if (userId && online) {
      const rider = await getRiderByUserId(userId).catch(() => null);
      if (rider?.id) {
        await supabase
          .from("riders")
          .update({ is_available: false })
          .eq("id", rider.id);
      }
    }
    await action();
  };

  const switchToPassenger = () => {
    Alert.alert(
      "Switch to passenger?",
      "You’ll leave driver mode. We’ll take you offline first.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: () =>
            void goOfflineThen(async () => {
              try {
                await setAccountTypePreference("passenger");
                router.replace("/passenger" as never);
              } catch (err) {
                Alert.alert(
                  "Couldn’t switch",
                  err instanceof Error ? err.message : "Try again."
                );
              }
            }),
        },
      ]
    );
  };

  return (
    <Screen>
      <Pressable
        style={styles.header}
        onPress={() => router.push("/rider/account" as never)}
      >
        <ProfileAvatar
          uri={profile?.avatar_url}
          name={name}
          size={72}
          badge
          onPress={() => router.push("/rider/account" as never)}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.name, { color: colors.dark }]}>{name}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{phone}</Text>
          <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
            {profile?.email ?? "Add email in Account"}
          </Text>
          <View style={styles.chips}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: online
                    ? colors.successSoft
                    : colors.surfaceAlt,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: online ? colors.success : colors.muted },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: online ? colors.success : colors.muted },
                ]}
              >
                {online ? "Online" : "Offline"}
              </Text>
            </View>
            <View
              style={[styles.chip, { backgroundColor: colors.secondarySoft }]}
            >
              <Text style={[styles.chipText, { color: colors.secondaryDark }]}>
                {ratingLabel} · {tripsLabel}
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: verified
                    ? colors.successSoft
                    : colors.surfaceAlt,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: verified ? colors.success : colors.muted },
                ]}
              >
                {verified ? "Verified" : "Pending review"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 4 }} />
      ) : null}

      <View style={styles.grid}>
        <QuickTile
          icon="wallet-outline"
          label="Earnings"
          onPress={() => router.push("/rider/earnings" as never)}
        />
        <QuickTile
          icon="file-tray-outline"
          label="Inbox"
          onPress={() => router.push("/rider/inbox" as never)}
        />
        <QuickTile
          icon="shield-checkmark-outline"
          label="Safety"
          onPress={() =>
            Alert.alert(
              "Driver safety",
              "Share your trip with a trusted contact, meet passengers in public spots, and use Help anytime.",
              [
                { text: "Close", style: "cancel" },
                {
                  text: "WhatsApp help",
                  onPress: () => Linking.openURL(SENIOR_SUPPORT_WHATSAPP),
                },
              ]
            )
          }
        />
        <QuickTile
          icon="help-buoy-outline"
          label="Help"
          onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
        />
      </View>

      <Card style={[styles.statCard, { backgroundColor: colors.primarySoft }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statLabel, { color: colors.primary }]}>
            Lifetime earnings
          </Text>
          <Text style={[styles.statValue, { color: colors.dark }]}>
            {formatCurrency(earnings)}
          </Text>
          <Text style={[styles.statSub, { color: colors.muted }]}>
            {vehicle ? `${vehicle} · ` : ""}
            {verified ? "Verified driver" : "Complete profile for verification"}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/rider/earnings" as never)}
          style={[styles.statBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.statBtnText}>Wallet</Text>
        </Pressable>
      </Card>

      <SectionTitle label="Your profile" />
      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="person-outline"
          title="Account"
          subtitle="Photo, name, phone, email"
          onPress={() => router.push("/rider/account" as never)}
        />
        <ListRow
          icon="car-outline"
          title="Vehicle"
          subtitle={vehicle ? `${vehicle} · edit details` : "Type and license"}
          onPress={() => router.push("/rider/vehicle" as never)}
        />
        <ListRow
          icon="card-outline"
          title="Payout details"
          subtitle="Bank account for cash out"
          onPress={() => router.push("/rider/payouts" as never)}
        />
      </Card>

      <SectionTitle label="App" />
      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="settings-outline"
          title="Settings"
          subtitle="Alerts, appearance, privacy"
          onPress={() => router.push("/rider/settings" as never)}
        />
        <ListRow
          icon="notifications-outline"
          title="Job alerts"
          subtitle="Offers and trip notifications"
          onPress={() => router.push("/rider/settings/notifications" as never)}
        />
        <ListRow
          icon="swap-horizontal-outline"
          title="Switch to passenger"
          subtitle="Book rides instead of driving"
          onPress={switchToPassenger}
        />
      </Card>

      <SectionTitle label="Support" />
      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="help-circle-outline"
          title="Help & support"
          subtitle="Chat on WhatsApp"
          onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
        />
        <ListRow
          icon="star-outline"
          title="Rate Gratitude Ride"
          subtitle="App Store / Play review or feedback"
          onPress={() => void promptAppReview()}
        />
        <ListRow
          icon="document-text-outline"
          title="Community guidelines"
          subtitle="How we keep trips safe"
          onPress={() =>
            Alert.alert(
              "Community guidelines",
              "Be respectful, arrive on time, keep your vehicle details accurate, and never ask passengers for off-app payments."
            )
          }
        />
        <ListRow
          icon="information-circle-outline"
          title="About"
          subtitle={`Version ${version}`}
          onPress={() =>
            Alert.alert("Gratitude Ride Driver", `Version ${version}`)
          }
        />
      </Card>

      <Button label="Sign out" variant="ghost" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: "900" },
  meta: { fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 12, fontWeight: "800" },
  dot: { width: 7, height: 7, borderRadius: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "47%",
    flexGrow: 1,
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    justifyContent: "center",
  },
  tileLabel: { fontWeight: "800", fontSize: 14 },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statLabel: { fontWeight: "800", fontSize: 12 },
  statValue: { fontWeight: "900", fontSize: 26, marginTop: 2 },
  statSub: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  statBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  section: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 4,
  },
});
