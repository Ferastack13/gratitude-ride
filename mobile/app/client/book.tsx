import { LivePlaceSearch } from "@/components/location/LivePlaceSearch";
import { FindingCourier } from "@/components/workflow/FindingCourier";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  applyPromo,
  pushRecentPlace,
  type PaymentMethod,
} from "@/lib/client-prefs";
import { createTrackingId, ensureClientId } from "@/lib/deliveries";
import { estimateEtaMinutes, formatEta } from "@/lib/eta";
import { formatCurrency } from "@/lib/format";
import { distanceKm, estimateDeliveryFee } from "@/lib/geo";
import type { LivePlace } from "@/lib/places";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "choose" | "matching";

const SERVICES = [
  {
    id: "express",
    title: "Express",
    hint: "Fastest bike courier",
    mult: 1.2,
    icon: "flash" as const,
    popular: true,
  },
  {
    id: "standard",
    title: "Standard",
    hint: "Best everyday value",
    mult: 1,
    icon: "bicycle" as const,
    popular: false,
  },
  {
    id: "care",
    title: "Care",
    hint: "Fragile & high-value",
    mult: 1.3,
    icon: "heart" as const,
    popular: false,
  },
  {
    id: "xl",
    title: "XL Box",
    hint: "Larger items · up to ~15kg",
    mult: 1.45,
    icon: "cube" as const,
    popular: false,
  },
] as const;

function placeFrom(
  lat?: string,
  lng?: string,
  title?: string,
  address?: string,
  city?: string,
  fallback?: LivePlace
): LivePlace | null {
  const la = Number(lat);
  const ln = Number(lng);
  if (Number.isFinite(la) && Number.isFinite(ln)) {
    return {
      id: `${la}-${ln}`,
      title: title || "Location",
      subtitle: city || "Nigeria",
      address: address || title || "Location",
      lat: la,
      lng: ln,
      city,
    };
  }
  return fallback ?? null;
}

export default function BookScreen() {
  const { profile } = useAuth();
  const params = useLocalSearchParams<{
    pickupLat?: string;
    pickupLng?: string;
    pickupTitle?: string;
    pickupAddress?: string;
    pickupCity?: string;
    dropoffLat?: string;
    dropoffLng?: string;
    dropoffTitle?: string;
    dropoffAddress?: string;
    dropoffCity?: string;
    serviceId?: string;
    paymentMethod?: string;
    promoCode?: string;
    scheduleAt?: string;
  }>();

  const initialPickup =
    placeFrom(
      params.pickupLat,
      params.pickupLng,
      params.pickupTitle,
      params.pickupAddress,
      params.pickupCity,
      {
        id: "lagos-default",
        title: "Pickup point",
        subtitle: "Lagos, Nigeria",
        address: "Lagos Island, Lagos, Nigeria",
        lat: 6.4541,
        lng: 3.3947,
        city: "Lagos",
        state: "Lagos",
      }
    )!;

  const initialDrop = placeFrom(
    params.dropoffLat,
    params.dropoffLng,
    params.dropoffTitle,
    params.dropoffAddress,
    params.dropoffCity
  );

  const mappedService =
    params.serviceId === "xl"
      ? "xl"
      : SERVICES.find((s) => s.id === params.serviceId)?.id ?? "express";

  const payment: PaymentMethod =
    params.paymentMethod === "transfer" ? "transfer" : "cash";
  const promoCode = (params.promoCode || "").toUpperCase();
  const scheduleAt = params.scheduleAt || "";

  const [step, setStep] = useState<Step>("choose");
  const [pickup, setPickup] = useState<LivePlace>(initialPickup);
  const [dropoff, setDropoff] = useState<LivePlace | null>(initialDrop);
  const [serviceId, setServiceId] =
    useState<(typeof SERVICES)[number]["id"]>(mappedService);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<"pickup" | "dropoff" | null>(
    null
  );

  // Keep in sync when Home navigates here with new params (tab may stay mounted).
  useEffect(() => {
    const nextPickup = placeFrom(
      params.pickupLat,
      params.pickupLng,
      params.pickupTitle,
      params.pickupAddress,
      params.pickupCity
    );
    if (nextPickup) setPickup(nextPickup);

    const nextDrop = placeFrom(
      params.dropoffLat,
      params.dropoffLng,
      params.dropoffTitle,
      params.dropoffAddress,
      params.dropoffCity
    );
    if (nextDrop) setDropoff(nextDrop);

    if (params.serviceId) {
      const nextService =
        params.serviceId === "xl"
          ? "xl"
          : SERVICES.find((s) => s.id === params.serviceId)?.id;
      if (nextService) setServiceId(nextService);
    }
  }, [
    params.pickupLat,
    params.pickupLng,
    params.pickupTitle,
    params.dropoffLat,
    params.dropoffLng,
    params.dropoffTitle,
    params.serviceId,
  ]);

  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];
  const km = useMemo(
    () => (dropoff ? distanceKm(pickup, dropoff) : 0),
    [pickup, dropoff]
  );

  const quoteFor = (mult: number) => {
    const raw = Math.round(estimateDeliveryFee(km || 3) * mult);
    return applyPromo(raw, promoCode);
  };

  const { fee, label: promoLabel } = quoteFor(service.mult);
  const etaMins = estimateEtaMinutes(km || 3, "pending");
  const eta = formatEta(
    service.id === "express"
      ? Math.max(12, Math.round(etaMins * 0.75))
      : service.id === "xl"
        ? Math.round(etaMins * 1.15)
        : etaMins
  );

  const samePoint =
    !!dropoff &&
    Math.abs(pickup.lat - dropoff.lat) < 0.0003 &&
    Math.abs(pickup.lng - dropoff.lng) < 0.0003;
  const canRequest = !!dropoff && !samePoint;

  const request = async () => {
    if (!profile?.id || !canRequest || loading || !dropoff) return;
    setLoading(true);
    try {
      const clientId = await ensureClientId(profile.id);
      const id = await createTrackingId();
      const city =
        dropoff.city ||
        pickup.city ||
        dropoff.state ||
        pickup.state ||
        "Nigeria";
      const extras = [
        `Pay ${payment}`,
        scheduleAt && `Scheduled ${new Date(scheduleAt).toLocaleString()}`,
        promoLabel,
        note.trim() && `Note: ${note.trim()}`,
      ]
        .filter(Boolean)
        .join(" · ");

      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          client_id: clientId,
          tracking_id: id,
          city,
          pickup_address: pickup.address,
          delivery_address: dropoff.address,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          delivery_lat: dropoff.lat,
          delivery_lng: dropoff.lng,
          package_description: `${service.title} package`,
          notes: `${service.title} · ${pickup.title} → ${dropoff.title}${
            extras ? ` · ${extras}` : ""
          }`,
          estimated_fee: fee,
          status: "pending",
        })
        .select("tracking_id")
        .single();
      if (error) throw error;
      await pushRecentPlace(dropoff);
      setTrackingId(data.tracking_id);
      setStep("matching");
      setTimeout(() => {
        router.replace(`/client/track/${data.tracking_id}` as never);
      }, 2200);
    } catch (err) {
      Alert.alert(
        "Request failed",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "matching") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.matching}>
          <FindingCourier
            city={dropoff?.city || pickup.city || "your area"}
            trackingId={trackingId ?? undefined}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.flex}>
        <View style={styles.head}>
          <Pressable
            style={styles.back}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/client" as never);
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.dark} />
          </Pressable>
          <Text style={styles.headTitle}>Choose a courier</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.body}
        >
          <View style={styles.routeCard}>
            <Pressable
              style={styles.routeRow}
              onPress={() => setEditTarget("pickup")}
            >
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeValue} numberOfLines={1}>
                  {pickup.title}
                </Text>
              </View>
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
            <View style={styles.rail} />
            <Pressable
              style={styles.routeRow}
              onPress={() => setEditTarget("dropoff")}
            >
              <View
                style={[styles.dot, { backgroundColor: colors.secondaryDark }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>Drop-off</Text>
                <Text
                  style={[styles.routeValue, !dropoff && styles.placeholder]}
                  numberOfLines={1}
                >
                  {dropoff?.title || "Add drop-off"}
                </Text>
              </View>
              <Text style={styles.edit}>{dropoff ? "Edit" : "Add"}</Text>
            </Pressable>
          </View>

          {(payment || promoLabel || scheduleAt) && (
            <View style={styles.contextRow}>
              <ContextPill
                icon={payment === "cash" ? "cash-outline" : "phone-portrait-outline"}
                label={payment === "cash" ? "Cash" : "Transfer"}
              />
              {promoLabel ? (
                <ContextPill icon="pricetag" label={promoCode || "Promo"} />
              ) : null}
              {scheduleAt ? (
                <ContextPill
                  icon="time"
                  label={new Date(scheduleAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ) : null}
            </View>
          )}

          <Text style={styles.section}>Available now</Text>
          <View style={styles.list}>
            {SERVICES.map((s) => {
              const priced = quoteFor(s.mult).fee;
              const selected = serviceId === s.id;
              const sEtaMins = estimateEtaMinutes(km || 3, "pending");
              const sEta = formatEta(
                s.id === "express"
                  ? Math.max(12, Math.round(sEtaMins * 0.75))
                  : s.id === "xl"
                    ? Math.round(sEtaMins * 1.15)
                    : sEtaMins
              );
              return (
                <Pressable
                  key={s.id}
                  style={[styles.option, selected && styles.optionOn]}
                  onPress={() => setServiceId(s.id)}
                >
                  <View style={[styles.icon, selected && styles.iconOn]}>
                    <Ionicons
                      name={s.icon}
                      size={20}
                      color={selected ? colors.white : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.optionTitle}>{s.title}</Text>
                      {s.popular ? (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>Popular</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.optionHint}>{s.hint}</Text>
                    <Text style={styles.optionEta}>
                      {dropoff ? `Arrives in ${sEta}` : "Set drop-off for ETA"}
                    </Text>
                  </View>
                  <Text style={styles.price}>{formatCurrency(priced)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.noteToggle}
            onPress={() => setShowNote((v) => !v)}
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.dark} />
            <Text style={styles.noteToggleText}>
              {showNote ? "Hide courier note" : "Add note for courier"}
            </Text>
            <Ionicons
              name={showNote ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.muted}
            />
          </Pressable>
          {showNote ? (
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Gate code, landmark, call on arrival…"
              placeholderTextColor={colors.muted}
              style={styles.noteInput}
              multiline
            />
          ) : null}
        </ScrollView>

        <View style={styles.sticky}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              (!canRequest || loading) && styles.ctaDisabled,
              pressed && canRequest && !loading && { opacity: 0.94 },
            ]}
            disabled={!canRequest || loading}
            onPress={request}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>
                {loading
                  ? "Requesting…"
                  : canRequest
                    ? `Request ${service.title}`
                    : "Add a drop-off first"}
              </Text>
              <Text style={styles.ctaHint}>
                {canRequest
                  ? `${formatCurrency(fee)} · ETA ${eta}`
                  : "Tap drop-off above to search"}
              </Text>
            </View>
            <View style={styles.ctaArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.dark} />
            </View>
          </Pressable>
        </View>
      </View>

      <Modal visible={!!editTarget} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>
                {editTarget === "pickup" ? "Edit pickup" : "Where to?"}
              </Text>
              <Pressable onPress={() => setEditTarget(null)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <LivePlaceSearch
              label={editTarget === "pickup" ? "Pickup" : "Drop-off"}
              placeholder="Search any street or area…"
              value={editTarget === "pickup" ? pickup : dropoff}
              onSelect={(place) => {
                if (editTarget === "pickup") setPickup(place);
                else setDropoff(place);
                setEditTarget(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ContextPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={12} color={colors.primaryDark} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 4,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headTitle: { fontSize: 22, fontWeight: "900", color: colors.dark },
  body: { padding: 18, gap: 12, paddingBottom: 20 },
  matching: { flex: 1, justifyContent: "center", padding: 24 },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rail: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
  },
  routeValue: {
    fontWeight: "900",
    color: colors.dark,
    fontSize: 15,
    marginTop: 2,
  },
  placeholder: { color: colors.muted, fontWeight: "700" },
  edit: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  contextRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { fontSize: 12, fontWeight: "800", color: colors.primaryDark },
  section: { fontSize: 15, fontWeight: "900", color: colors.dark, marginTop: 2 },
  list: { gap: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
  },
  optionOn: {
    borderColor: colors.primary,
    backgroundColor: "#f0fdf4",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOn: { backgroundColor: colors.primary },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  optionTitle: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  tag: {
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 9, fontWeight: "900", color: colors.dark },
  optionHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  optionEta: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  price: { fontWeight: "900", color: colors.dark, fontSize: 15 },
  noteToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  noteToggleText: { flex: 1, fontWeight: "700", color: colors.dark },
  noteInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 72,
    textAlignVertical: "top",
    fontWeight: "600",
    color: colors.dark,
  },
  sticky: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 14,
  },
  ctaDisabled: { opacity: 0.55 },
  ctaTitle: { color: colors.white, fontSize: 17, fontWeight: "900" },
  ctaHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
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
});
