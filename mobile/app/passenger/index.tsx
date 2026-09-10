import { LivePlaceSearch } from "@/components/location/LivePlaceSearch";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { getRecentPlaces, pushRecentPlace } from "@/lib/client-prefs";
import { formatCurrency, formatStatus, shortAddress, statusTone } from "@/lib/format";
import { reverseLivePlace, type LivePlace } from "@/lib/places";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_PLACE: LivePlace = {
  id: "lagos-default",
  title: "Current area",
  subtitle: "Lagos, Nigeria",
  address: "Lagos Island, Lagos, Nigeria",
  lat: 6.4541,
  lng: 3.3947,
  state: "Lagos",
  city: "Lagos",
};

function placeParams(place: LivePlace, prefix: "pickup" | "dropoff") {
  return {
    [`${prefix}Lat`]: String(place.lat),
    [`${prefix}Lng`]: String(place.lng),
    [`${prefix}Title`]: place.title,
    [`${prefix}Address`]: place.address,
    [`${prefix}City`]: place.city || place.state || "Nigeria",
  };
}

export default function PassengerHomeScreen() {
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<LivePlace>(DEFAULT_PLACE);
  const [whereOpen, setWhereOpen] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [recent, setRecent] = useState<LivePlace[]>([]);
  const [active, setActive] = useState<{
    tracking_id: string;
    status: string;
    delivery_address: string;
    estimated_fee: number;
  } | null>(null);

  const first = profile?.full_name?.split(" ")[0] ?? "there";

  useEffect(() => {
    (async () => {
      setRecent(await getRecentPlaces());
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({});
        const place = await reverseLivePlace(
          loc.coords.latitude,
          loc.coords.longitude
        );
        if (place) setPickup(place);
      } catch {
        // keep default
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (!profile?.id) return;
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", profile.id)
          .maybeSingle();
        if (!client?.id) return;
        const { data } = await supabase
          .from("deliveries")
          .select("tracking_id, status, delivery_address, estimated_fee")
          .eq("client_id", client.id)
          .in("status", ["pending", "accepted", "picked_up", "in_transit"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setActive(data ?? null);
      })();
    }, [profile?.id])
  );

  const goBook = async (dropoff: LivePlace) => {
    await pushRecentPlace(dropoff);
    setWhereOpen(false);
    router.push({
      pathname: "/passenger/book",
      params: {
        ...placeParams(pickup, "pickup"),
        ...placeParams(dropoff, "dropoff"),
        serviceId: "standard",
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Gratitude Ride</Text>
        <Text style={styles.hello}>Hi {first}</Text>

        <Pressable style={styles.where} onPress={() => setWhereOpen(true)}>
          <Ionicons name="search" size={20} color={colors.dark} />
          <Text style={styles.whereText}>Where to?</Text>
        </Pressable>

        <Pressable style={styles.pickupRow} onPress={() => setPickupOpen(true)}>
          <Ionicons name="locate" size={16} color={colors.primary} />
          <Text style={styles.pickupText} numberOfLines={1}>
            Pickup · {pickup.title}
          </Text>
          <Text style={styles.edit}>Edit</Text>
        </Pressable>

        {active ? (
          <Pressable
            style={styles.activeCard}
            onPress={() =>
              router.push(`/passenger/track/${active.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Current trip</Text>
              <Text style={styles.activeAddr} numberOfLines={1}>
                {shortAddress(active.delivery_address)}
              </Text>
              <Text style={styles.activeFee}>
                {formatCurrency(active.estimated_fee)}
              </Text>
            </View>
            <Badge
              label={formatStatus(active.status)}
              tone={statusTone(active.status)}
            />
          </Pressable>
        ) : null}

        <Text style={styles.section}>Suggestions</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            Search a destination to start your first ride.
          </Text>
        ) : (
          recent.slice(0, 5).map((place) => (
            <Pressable
              key={place.id}
              style={styles.suggest}
              onPress={() => goBook(place)}
            >
              <View style={styles.suggestIcon}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestTitle}>{place.title}</Text>
                <Text style={styles.suggestSub} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={whereOpen} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Where to?</Text>
            <Pressable onPress={() => setWhereOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <LivePlaceSearch
            placeholder="Search destination"
            onSelect={goBook}
          />
        </SafeAreaView>
      </Modal>

      <Modal visible={pickupOpen} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Pickup</Text>
            <Pressable onPress={() => setPickupOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <LivePlaceSearch
            placeholder="Search pickup"
            onSelect={(place) => {
              setPickup(place);
              setPickupOpen(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { padding: 18, gap: 12, paddingBottom: 40 },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  hello: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  where: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  whereText: { fontSize: 18, fontWeight: "800", color: colors.dark },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  pickupText: { flex: 1, color: colors.muted, fontWeight: "600", fontSize: 13 },
  edit: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    padding: 16,
  },
  activeTitle: { fontWeight: "800", color: colors.primaryDark, fontSize: 12 },
  activeAddr: { fontWeight: "800", color: colors.dark, marginTop: 2 },
  activeFee: { color: colors.muted, marginTop: 2, fontWeight: "600" },
  section: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "900",
    color: colors.dark,
  },
  empty: { color: colors.muted, lineHeight: 20 },
  suggest: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestTitle: { fontWeight: "800", color: colors.dark },
  suggestSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  modalSafe: { flex: 1, backgroundColor: colors.surface, padding: 18 },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: "900", color: colors.dark },
  close: { color: colors.primary, fontWeight: "800" },
});
