import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { getRiderByUserId } from "@/lib/driver-bootstrap";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
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

export default function RiderMenuScreen() {
  const { profile, session, signOut, setAccountTypePreference } = useAuth();
  const colors = useColors();
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [trips, setTrips] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const rider = await getRiderByUserId(userId);
      setVehicle(rider?.vehicle_type ?? null);
      setOnline(Boolean(rider?.is_available));
      setRating(
        typeof rider?.rating === "number" ? Number(rider.rating) : null
      );
      setTrips(
        typeof rider?.total_deliveries === "number"
          ? rider.total_deliveries
          : null
      );
    } catch {
      setVehicle(null);
      setOnline(false);
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
  const ratingLabel =
    rating != null && Number.isFinite(rating)
      ? `${rating.toFixed(1)}★`
      : "New";
  const tripsLabel =
    trips != null && trips > 0 ? `${trips} trip${trips === 1 ? "" : "s"}` : null;

  const switchToPassenger = () => {
    Alert.alert(
      "Switch to passenger?",
      "You’ll leave driver mode. We’ll take you offline first.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            try {
              await setAccountTypePreference("passenger");
              router.replace("/passenger" as never);
            } catch (err) {
              Alert.alert(
                "Couldn’t switch",
                err instanceof Error ? err.message : "Try again."
              );
            }
          },
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
          <Text style={[styles.meta, { color: colors.muted }]}>
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
                {ratingLabel}
                {tripsLabel ? ` · ${tripsLabel}` : ""}
              </Text>
            </View>
            {vehicle ? (
              <View
                style={[styles.chip, { backgroundColor: colors.primarySoft }]}
              >
                <Text style={[styles.chipText, { color: colors.primary }]}>
                  {vehicle}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 4 }} />
      ) : null}

      <Card padded={false} style={{ paddingHorizontal: 12 }}>
        <ListRow
          icon="person-outline"
          title="Account"
          subtitle="Name, phone, email, photo"
          onPress={() => router.push("/rider/account" as never)}
        />
        <ListRow
          icon="car-outline"
          title="Vehicle"
          subtitle={vehicle ? `${vehicle} · edit details` : "Type and license"}
          onPress={() => router.push("/rider/vehicle" as never)}
        />
        <ListRow
          icon="notifications-outline"
          title="Notifications"
          subtitle="Inbox alerts"
          onPress={() => router.push("/rider/inbox" as never)}
        />
        <ListRow
          icon="wallet-outline"
          title="Wallet & payouts"
          subtitle="Earnings and balance"
          onPress={() => router.push("/rider/earnings" as never)}
        />
        <ListRow
          icon="help-circle-outline"
          title="Help"
          subtitle="WhatsApp support"
          onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
        />
        <ListRow
          icon="swap-horizontal-outline"
          title="Switch to passenger"
          subtitle="Book rides instead of driving"
          onPress={switchToPassenger}
        />
      </Card>

      <Button label="Sign out" variant="ghost" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
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
});
