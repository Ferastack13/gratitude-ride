import { RouteMap } from "@/components/maps/RouteMap";
import { Button } from "@/components/ui/Button";
import { CityChips } from "@/components/ui/CityChips";
import { FindingCourier } from "@/components/workflow/FindingCourier";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  distanceKm,
  estimateDeliveryFee,
  getCityConfig,
  type ServiceCity,
} from "@/lib/cities";
import { createTrackingId, ensureClientId } from "@/lib/deliveries";
import { estimateEtaMinutes, formatEta } from "@/lib/eta";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Step = "route" | "confirm" | "matching";

const SERVICES = [
  { id: "express", title: "Express", hint: "Fastest hub hop", mult: 1.15 },
  { id: "standard", title: "Standard", hint: "Best value", mult: 1 },
  { id: "care", title: "Care", hint: "Fragile handling", mult: 1.25 },
] as const;

export default function BookScreen() {
  const { profile } = useAuth();
  const [step, setStep] = useState<Step>("route");
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const config = getCityConfig(city);
  const [pickupId, setPickupId] = useState(config.hubs[0].id);
  const [dropoffId, setDropoffId] = useState(config.hubs[1].id);
  const [serviceId, setServiceId] = useState<(typeof SERVICES)[number]["id"]>(
    "express"
  );
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const pickup = config.hubs.find((h) => h.id === pickupId) ?? config.hubs[0];
  const dropoff = config.hubs.find((h) => h.id === dropoffId) ?? config.hubs[1];
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];
  const km = useMemo(() => distanceKm(pickup, dropoff), [pickup, dropoff]);
  const fee = Math.round(estimateDeliveryFee(km) * service.mult);
  const eta = formatEta(estimateEtaMinutes(km, "pending"));
  const sameHub = pickupId === dropoffId;

  const onCityChange = (next: ServiceCity) => {
    const nextConfig = getCityConfig(next);
    setCity(next);
    setPickupId(nextConfig.hubs[0].id);
    setDropoffId(nextConfig.hubs[1].id);
  };

  const request = async () => {
    if (!profile?.id || sameHub || loading) return;
    setLoading(true);
    try {
      const clientId = await ensureClientId(profile.id);
      const id = await createTrackingId();
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
          notes: `${service.title} · ${service.hint}`,
          estimated_fee: fee,
          status: "pending",
        })
        .select("tracking_id")
        .single();
      if (error) throw error;
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

  return (
    <MapShell
      map={
        <RouteMap
          fullBleed
          center={config.center}
          pickup={{ ...pickup, label: pickup.label }}
          dropoff={{ ...dropoff, label: dropoff.label }}
          delta={0.12}
        />
      }
      top={
        <View style={styles.topChip}>
          <Ionicons name="flash" size={14} color={colors.secondaryDark} />
          <Text style={styles.topText}>Gratitude Ride · {city}</Text>
        </View>
      }
      sheet={
        step === "matching" ? (
          <>
            <SheetHandle />
            <FindingCourier city={city} trackingId={trackingId ?? undefined} />
          </>
        ) : step === "confirm" ? (
          <>
            <SheetHandle />
            <Text style={styles.sheetTitle}>Confirm delivery</Text>
            <View style={styles.summary}>
              <Text style={styles.summaryRoute}>
                {pickup.label} → {dropoff.label}
              </Text>
              <Text style={styles.summaryMeta}>
                {service.title} · ~{km.toFixed(1)} km · ETA {eta}
              </Text>
              <Text style={styles.summaryFee}>{formatCurrency(fee)}</Text>
            </View>
            <Button
              label="Request courier"
              loading={loading}
              onPress={request}
            />
            <Button
              label="Edit route"
              variant="ghost"
              onPress={() => setStep("route")}
            />
          </>
        ) : (
          <>
            <SheetHandle />
            <Text style={styles.where}>Where are we delivering?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <CityChips value={city} onChange={onCityChange} />
            </ScrollView>

            <Text style={styles.label}>Pickup</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hubs}
            >
              {config.hubs.map((hub) => (
                <Pressable
                  key={hub.id}
                  onPress={() => setPickupId(hub.id)}
                  style={[styles.hub, pickupId === hub.id && styles.hubOn]}
                >
                  <Text
                    style={[
                      styles.hubText,
                      pickupId === hub.id && styles.hubTextOn,
                    ]}
                  >
                    {hub.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Drop-off</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hubs}
            >
              {config.hubs.map((hub) => (
                <Pressable
                  key={hub.id}
                  onPress={() => setDropoffId(hub.id)}
                  style={[styles.hub, dropoffId === hub.id && styles.hubGold]}
                >
                  <Text
                    style={[
                      styles.hubText,
                      dropoffId === hub.id && styles.hubTextDark,
                    ]}
                  >
                    {hub.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Service</Text>
            <View style={styles.services}>
              {SERVICES.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setServiceId(s.id)}
                  style={[
                    styles.service,
                    serviceId === s.id && styles.serviceOn,
                  ]}
                >
                  <Text style={styles.serviceTitle}>{s.title}</Text>
                  <Text style={styles.serviceHint}>{s.hint}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.quote}>
              <View>
                <Text style={styles.quoteLabel}>Fare estimate</Text>
                <Text style={styles.quoteValue}>{formatCurrency(fee)}</Text>
              </View>
              <Text style={styles.eta}>ETA {eta}</Text>
            </View>

            <Button
              label={sameHub ? "Choose different hubs" : "Continue"}
              disabled={sameHub}
              onPress={() => setStep("confirm")}
            />
          </>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  topChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topText: { fontWeight: "800", color: colors.dark, fontSize: 12 },
  where: { fontSize: 22, fontWeight: "900", color: colors.dark },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  hubs: { gap: 8, paddingBottom: 2 },
  hub: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hubOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  hubGold: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  hubText: { fontWeight: "700", color: colors.dark, fontSize: 13 },
  hubTextOn: { color: colors.white },
  hubTextDark: { color: colors.dark },
  services: { flexDirection: "row", gap: 8 },
  service: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.surface,
  },
  serviceOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  serviceTitle: { fontWeight: "800", color: colors.dark, fontSize: 13 },
  serviceHint: { color: colors.muted, fontSize: 10, marginTop: 2 },
  quote: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  quoteLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  quoteValue: { fontSize: 28, fontWeight: "900", color: colors.dark },
  eta: { color: colors.primary, fontWeight: "800", marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontWeight: "900", color: colors.dark },
  summary: { gap: 4 },
  summaryRoute: { fontWeight: "800", color: colors.dark, fontSize: 16 },
  summaryMeta: { color: colors.muted, fontSize: 13 },
  summaryFee: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
    marginTop: 4,
  },
});
