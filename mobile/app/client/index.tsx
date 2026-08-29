import { LivePlaceSearch } from "@/components/location/LivePlaceSearch";
import { Badge } from "@/components/ui/Badge";
import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  applyPromo,
  getPaymentMethod,
  getRecentPlaces,
  getSavedPlaces,
  pushRecentPlace,
  setPaymentMethod,
  setSavedPlace,
  type PaymentMethod,
} from "@/lib/client-prefs";
import {
  formatCurrency,
  formatStatus,
  shortAddress,
  statusTone,
} from "@/lib/format";
import { reverseLivePlace, type LivePlace } from "@/lib/places";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RecentRow = {
  tracking_id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  estimated_fee: number;
  city: string;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
};

const SERVICES = [
  {
    id: "express",
    title: "Express",
    hint: "Fastest arrival",
    eta: "20–35 min",
    icon: "flash" as const,
  },
  {
    id: "standard",
    title: "Standard",
    hint: "Best everyday value",
    eta: "35–55 min",
    icon: "bicycle" as const,
  },
  {
    id: "care",
    title: "Care",
    hint: "Fragile & valuable",
    eta: "30–50 min",
    icon: "heart" as const,
  },
  {
    id: "schedule",
    title: "Schedule",
    hint: "Pick a later time",
    eta: "You choose",
    icon: "calendar" as const,
  },
] as const;

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

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function placeParams(place: LivePlace, prefix: "pickup" | "dropoff") {
  return {
    [`${prefix}Lat`]: String(place.lat),
    [`${prefix}Lng`]: String(place.lng),
    [`${prefix}Title`]: place.title,
    [`${prefix}Address`]: place.address,
    [`${prefix}City`]: place.city || place.state || "Nigeria",
  };
}

export default function ClientHomeScreen() {
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<LivePlace>(DEFAULT_PLACE);
  const [savedHome, setSavedHome] = useState<LivePlace | null>(null);
  const [savedWork, setSavedWork] = useState<LivePlace | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<LivePlace[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<RecentRow[]>([]);
  const [active, setActive] = useState<RecentRow | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string>("express");
  const [scheduleAt, setScheduleAt] = useState<string | null>(null);
  const [saveModal, setSaveModal] = useState<"home" | "work" | null>(null);
  const [whereOpen, setWhereOpen] = useState(false);
  const [pickupEditOpen, setPickupEditOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleHour, setScheduleHour] = useState("16");
  const [scheduleMinute, setScheduleMinute] = useState("00");

  const firstName = profile?.full_name?.split(" ")[0] ?? "friend";
  const greeting = greetingForHour(new Date().getHours());

  const sampleFare = useMemo(() => {
    const base = serviceId === "express" ? 2800 : serviceId === "care" ? 3200 : 2400;
    const { fee, label } = applyPromo(base, promoApplied);
    return { fee, label };
  }, [serviceId, promoApplied]);

  const loadPrefs = useCallback(async () => {
    const [places, recent, pay] = await Promise.all([
      getSavedPlaces(),
      getRecentPlaces(),
      getPaymentMethod(),
    ]);
    setSavedHome(places.home);
    setSavedWork(places.work);
    setRecentPlaces(recent);
    setPayment(pay);
  }, []);

  useEffect(() => {
    loadPrefs();
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      try {
        const place = await reverseLivePlace(
          current.coords.latitude,
          current.coords.longitude
        );
        if (place && !cancelled) setPickup(place);
        else if (!cancelled) {
          setPickup({
            ...DEFAULT_PLACE,
            id: "gps",
            title: "My location",
            lat: current.coords.latitude,
            lng: current.coords.longitude,
            address: "Current GPS location",
          });
        }
      } catch {
        if (!cancelled) {
          setPickup({
            ...DEFAULT_PLACE,
            id: "gps",
            title: "My location",
            lat: current.coords.latitude,
            lng: current.coords.longitude,
            address: "Current GPS location",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPrefs]);

  const loadHome = useCallback(async () => {
    if (!profile?.id) return;
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!client?.id) {
      setRecentDeliveries([]);
      setActive(null);
      return;
    }
    const { data: rows } = await supabase
      .from("deliveries")
      .select(
        "tracking_id, status, pickup_address, delivery_address, estimated_fee, city, delivery_lat, delivery_lng"
      )
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(10);
    const list = (rows ?? []) as RecentRow[];
    setRecentDeliveries(list);
    setActive(
      list.find((r) =>
        ["pending", "accepted", "picked_up", "in_transit"].includes(r.status)
      ) ?? null
    );
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadHome();
      loadPrefs();
    }, [loadHome, loadPrefs])
  );

  const openSupport = () => {
    Alert.alert("Safety toolkit", "How can we help?", [
      {
        text: "Share trip with contact",
        onPress: () =>
          Alert.alert(
            "Share trip",
            "Open an active delivery, then tap Share on the tracking screen."
          ),
      },
      {
        text: "WhatsApp support",
        onPress: () => Linking.openURL("https://wa.me/2348000000000"),
      },
      {
        text: "Emergency (112)",
        onPress: () => Linking.openURL("tel:112"),
        style: "destructive",
      },
      { text: "Close", style: "cancel" },
    ]);
  };

  const goBook = async (dropoff?: LivePlace | null, serviceOverride?: string) => {
    const service = serviceOverride || serviceId;
    if (dropoff) await pushRecentPlace(dropoff);
    router.push({
      pathname: "/client/book",
      params: {
        ...placeParams(pickup, "pickup"),
        ...(dropoff ? placeParams(dropoff, "dropoff") : {}),
        serviceId: service === "schedule" ? "standard" : service,
        paymentMethod: payment,
        promoCode: promoApplied || "",
        scheduleAt: scheduleAt || "",
      },
    } as never);
  };

  const onWhereSelect = async (place: LivePlace) => {
    setWhereOpen(false);
    await pushRecentPlace(place);
    await goBook(place);
  };

  const onSavePlace = async (place: LivePlace) => {
    if (!saveModal) return;
    await setSavedPlace(saveModal, place);
    if (saveModal === "home") setSavedHome(place);
    else setSavedWork(place);
    setSaveModal(null);
    Alert.alert("Saved", `${saveModal === "home" ? "Home" : "Work"} updated.`);
  };

  const applyPromoCode = () => {
    const { label } = applyPromo(2500, promo);
    if (!label) {
      Alert.alert("Invalid code", "Try GRAT10, WELCOME, or EXPRESS.");
      setPromoApplied(null);
      return;
    }
    setPromoApplied(promo.trim().toUpperCase());
    Alert.alert("Promo applied", label);
  };

  const confirmSchedule = () => {
    const h = Math.min(23, Math.max(0, Number(scheduleHour) || 0));
    const m = Math.min(59, Math.max(0, Number(scheduleMinute) || 0));
    const when = new Date();
    when.setHours(h, m, 0, 0);
    if (when.getTime() < Date.now() + 20 * 60 * 1000) {
      when.setDate(when.getDate() + 1);
    }
    const label = when.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    setScheduleAt(when.toISOString());
    setServiceId("schedule");
    setScheduleOpen(false);
    Alert.alert("Scheduled", `We'll aim for ${label}. Continue to set drop-off.`);
  };

  const recentDestinations = useMemo(() => {
    const fromDeliveries: LivePlace[] = recentDeliveries
      .filter((r) => r.delivery_address)
      .slice(0, 5)
      .map((r, i) => ({
        id: `del-${r.tracking_id}-${i}`,
        title: shortAddress(r.delivery_address),
        subtitle: r.city,
        address: r.delivery_address,
        lat: Number(r.delivery_lat) || pickup.lat,
        lng: Number(r.delivery_lng) || pickup.lng,
        city: r.city,
      }));
    const merged = [...recentPlaces, ...fromDeliveries];
    const seen = new Set<string>();
    return merged.filter((p) => {
      const key = p.address.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  }, [recentPlaces, recentDeliveries, pickup.lat, pickup.lng]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
      >
        <View style={styles.topRow}>
          <Pressable
            style={styles.avatar}
            onPress={() => router.push("/client/profile")}
          >
            <Text style={styles.avatarText}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>Gratitude Ride</Text>
            <Text style={styles.hello}>
              {greeting}, {firstName}
            </Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={openSupport}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primaryDark} />
          </Pressable>
        </View>

        {active ? (
          <Pressable
            style={styles.activeCard}
            onPress={() =>
              router.push(`/client/track/${active.tracking_id}` as never)
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.activeEyebrow}>Trip in progress</Text>
              <Text style={styles.activeTitle} numberOfLines={1}>
                {shortAddress(active.delivery_address)}
              </Text>
              <Text style={styles.activeMeta}>{active.tracking_id}</Text>
            </View>
            <Badge
              label={formatStatus(active.status)}
              tone={statusTone(active.status)}
            />
          </Pressable>
        ) : null}

        <Pressable style={styles.whereCard} onPress={() => setWhereOpen(true)}>
          <View style={styles.whereIcon}>
            <Ionicons name="search" size={20} color={colors.dark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.whereTitle}>Where to?</Text>
            <Text style={styles.whereHint}>
              Search any street or area nationwide
            </Text>
          </View>
        </Pressable>

        <View style={styles.pickupCard}>
          <View style={styles.pickupDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>Pickup</Text>
            <Text style={styles.pickupValue} numberOfLines={1}>
              {pickup.title}
            </Text>
            <Text style={styles.pickupSub} numberOfLines={1}>
              {pickup.subtitle || pickup.address}
            </Text>
          </View>
          <Pressable onPress={() => setPickupEditOpen(true)} hitSlop={8}>
            <Text style={styles.link}>Change</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Saved places</Text>
        <View style={styles.savedRow}>
          <SavedTile
            icon="home"
            title="Home"
            subtitle={savedHome?.title || "Add home"}
            onPress={() =>
              savedHome ? goBook(savedHome) : setSaveModal("home")
            }
            onLongPress={() => setSaveModal("home")}
          />
          <SavedTile
            icon="briefcase"
            title="Work"
            subtitle={savedWork?.title || "Add work"}
            onPress={() =>
              savedWork ? goBook(savedWork) : setSaveModal("work")
            }
            onLongPress={() => setSaveModal("work")}
          />
        </View>

        <Text style={styles.section}>Suggestions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.serviceScroll}
        >
          {SERVICES.map((s) => (
            <Pressable
              key={s.id}
              style={[
                styles.serviceCard,
                serviceId === s.id && styles.serviceCardOn,
              ]}
              onPress={() => {
                if (s.id === "schedule") {
                  setScheduleOpen(true);
                  return;
                }
                setServiceId(s.id);
                setScheduleAt(null);
              }}
            >
              <View
                style={[
                  styles.serviceIcon,
                  serviceId === s.id && styles.serviceIconOn,
                ]}
              >
                <Ionicons
                  name={s.icon}
                  size={20}
                  color={serviceId === s.id ? colors.white : colors.primary}
                />
              </View>
              <Text style={styles.serviceTitle}>{s.title}</Text>
              <Text style={styles.serviceHint}>{s.hint}</Text>
              <Text style={styles.serviceEta}>{s.eta}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {scheduleAt ? (
          <View style={styles.scheduleBanner}>
            <Ionicons name="time" size={16} color={colors.primaryDark} />
            <Text style={styles.scheduleText}>
              Scheduled ·{" "}
              {new Date(scheduleAt).toLocaleString(undefined, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Pressable onPress={() => setScheduleAt(null)}>
              <Text style={styles.link}>Clear</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>Recent destinations</Text>
        {recentDestinations.length ? (
          <View style={styles.list}>
            {recentDestinations.map((place) => (
              <Pressable
                key={place.id}
                style={styles.listRow}
                onPress={() => goBook(place)}
              >
                <View style={styles.listIcon}>
                  <Ionicons name="time-outline" size={18} color={colors.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle} numberOfLines={1}>
                    {place.title}
                  </Text>
                  <Text style={styles.listSub} numberOfLines={1}>
                    {place.subtitle || place.address}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>
            Your recent drop-offs will show up here for one-tap booking.
          </Text>
        )}

        <Text style={styles.section}>Payment & promo</Text>
        <View style={styles.payRow}>
          {(["cash", "transfer"] as PaymentMethod[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.payChip, payment === m && styles.payChipOn]}
              onPress={async () => {
                setPayment(m);
                await setPaymentMethod(m);
              }}
            >
              <Ionicons
                name={m === "cash" ? "cash-outline" : "phone-portrait-outline"}
                size={16}
                color={payment === m ? colors.white : colors.dark}
              />
              <Text
                style={[styles.payText, payment === m && styles.payTextOn]}
              >
                {m === "cash" ? "Cash" : "Transfer"}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.promoRow}>
          <TextInput
            value={promo}
            onChangeText={setPromo}
            placeholder="Promo code (GRAT10)"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            style={styles.promoInput}
          />
          <Pressable style={styles.promoBtn} onPress={applyPromoCode}>
            <Text style={styles.promoBtnText}>Apply</Text>
          </Pressable>
        </View>
        {promoApplied ? (
          <Text style={styles.promoOk}>
            {sampleFare.label || `Code ${promoApplied} ready`} · sample fare{" "}
            {formatCurrency(sampleFare.fee)}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.94 }]}
          onPress={() => goBook(null)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Request a courier</Text>
            <Text style={styles.ctaHint}>
              {SERVICES.find((s) => s.id === serviceId)?.title || "Express"} ·{" "}
              {payment === "cash" ? "Cash" : "Transfer"}
              {scheduleAt ? " · Scheduled" : ""}
            </Text>
          </View>
          <View style={styles.ctaArrow}>
            <Ionicons name="arrow-forward" size={20} color={colors.dark} />
          </View>
        </Pressable>

        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Ride safely</Text>
          <Text style={styles.safetyBody}>
            Share your trip, chat support anytime, or call emergency services
            from the shield button above.
          </Text>
          <Pressable onPress={openSupport}>
            <Text style={styles.link}>Open safety toolkit</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Where to modal */}
      <Modal visible={whereOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Where to?</Text>
              <Pressable onPress={() => setWhereOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <LivePlaceSearch
              label="Drop-off street or area"
              placeholder="e.g. Lekki Phase 1, Wuse 2, Ring Road…"
              onSelect={onWhereSelect}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={pickupEditOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Change pickup</Text>
              <Pressable onPress={() => setPickupEditOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <LivePlaceSearch
              label="Pickup street or area"
              placeholder="Search pickup location…"
              value={pickup}
              onSelect={(place) => {
                setPickup(place);
                setPickupEditOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Save Home/Work */}
      <Modal visible={!!saveModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>
                Set {saveModal === "home" ? "Home" : "Work"}
              </Text>
              <Pressable onPress={() => setSaveModal(null)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <LivePlaceSearch
              label="Search address"
              placeholder="Find your place…"
              onSelect={onSavePlace}
            />
          </View>
        </View>
      </Modal>

      {/* Schedule */}
      <Modal visible={scheduleOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Schedule for later</Text>
              <Pressable onPress={() => setScheduleOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <Text style={styles.scheduleHelp}>
              Choose a pickup time (24h). If the time already passed today, we
              book tomorrow.
            </Text>
            <View style={styles.timeRow}>
              <TextInput
                value={scheduleHour}
                onChangeText={setScheduleHour}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.timeInput}
                placeholder="16"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                value={scheduleMinute}
                onChangeText={setScheduleMinute}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.timeInput}
                placeholder="00"
                placeholderTextColor={colors.muted}
              />
            </View>
            <Pressable style={styles.cta} onPress={confirmSchedule}>
              <Text style={[styles.ctaTitle, { flex: 1 }]}>Confirm time</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SavedTile({
  icon,
  title,
  subtitle,
  onPress,
  onLongPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      style={styles.savedTile}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.savedIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.savedTitle}>{title}</Text>
      <Text style={styles.savedSub} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { padding: 18, gap: 14, paddingBottom: 36 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.mapInk,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: 17 },
  brand: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  hello: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.mapInk,
    borderRadius: 20,
    padding: 16,
  },
  activeEyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  activeTitle: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    marginTop: 4,
  },
  activeMeta: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: "monospace",
    fontSize: 11,
    marginTop: 4,
  },
  whereCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 72,
  },
  whereIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ecece8",
    alignItems: "center",
    justifyContent: "center",
  },
  whereTitle: { fontSize: 20, fontWeight: "900", color: colors.dark },
  whereHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  pickupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  pickupLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  pickupValue: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  pickupSub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  link: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  section: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.dark,
    marginTop: 4,
  },
  savedRow: { flexDirection: "row", gap: 10 },
  savedTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  savedIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  savedTitle: { fontWeight: "900", color: colors.dark, fontSize: 14 },
  savedSub: { color: colors.muted, fontSize: 12 },
  serviceScroll: { gap: 10, paddingRight: 8 },
  serviceCard: {
    width: 132,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 3,
  },
  serviceCardOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  serviceIconOn: { backgroundColor: colors.primary },
  serviceTitle: { fontWeight: "900", color: colors.dark, fontSize: 14 },
  serviceHint: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  serviceEta: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  scheduleBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.secondarySoft,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  scheduleText: { flex: 1, fontWeight: "700", color: colors.dark, fontSize: 13 },
  list: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  listSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  payRow: { flexDirection: "row", gap: 8 },
  payChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  payChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  payText: { fontWeight: "800", color: colors.dark },
  payTextOn: { color: colors.white },
  promoRow: { flexDirection: "row", gap: 8 },
  promoInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontWeight: "700",
    color: colors.dark,
  },
  promoBtn: {
    backgroundColor: colors.dark,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  promoBtnText: { color: colors.white, fontWeight: "800" },
  promoOk: { color: colors.primaryDark, fontWeight: "700", fontSize: 12 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
  },
  ctaTitle: { color: colors.white, fontSize: 18, fontWeight: "900" },
  ctaHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
  ctaArrow: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  safetyTitle: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  safetyBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    gap: 12,
    maxHeight: "85%",
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: colors.dark },
  scheduleHelp: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timeInput: {
    width: 72,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  timeColon: { fontSize: 28, fontWeight: "900", color: colors.dark },
});
