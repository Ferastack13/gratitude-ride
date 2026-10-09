import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radii, shadows } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { ensureRiderId, type Delivery } from "@/lib/deliveries";
import { formatCurrency, shortAddress } from "@/lib/format";
import { distanceKm } from "@/lib/geo";
import { resolveCurrentLocation } from "@/lib/location";
import {
  DRIVER_MATCH_RADIUS_KM,
  filterNearbyPending,
  loadMyDeclinedDeliveryIds,
  rideTypeFromNotes,
  updateRiderLocation,
  type LatLng,
} from "@/lib/ride-matching";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type NearbyJob = Delivery & { distanceKm: number | null };

const PROMOS = [
  {
    id: "peak",
    title: "Evening peak boost",
    body: "Stay online 5–8pm for busier pickup corridors.",
    icon: "flash" as const,
  },
  {
    id: "airport",
    title: "Airport corridor",
    body: "Extra demand near city exits on weekends.",
    icon: "airplane" as const,
  },
  {
    id: "streak",
    title: "3-trip streak tip",
    body: "Complete three trips in a row to build your rating fast.",
    icon: "trophy" as const,
  },
];

export default function DriverDiscoverScreen() {
  const { profile } = useAuth();
  const [online, setOnline] = useState(false);
  const [riderId, setRiderId] = useState<string | null>(null);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [jobs, setJobs] = useState<NearbyJob[]>([]);
  const [cityWide, setCityWide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const id = await ensureRiderId(profile.id);
      setRiderId(id);

      const { data: rider } = await supabase
        .from("riders")
        .select("id, is_available, current_lat, current_lng")
        .eq("id", id)
        .maybeSingle();
      setOnline(Boolean(rider?.is_available));

      let here: LatLng | null = null;
      if (rider?.current_lat != null && rider?.current_lng != null) {
        here = {
          lat: Number(rider.current_lat),
          lng: Number(rider.current_lng),
        };
      } else {
        const res = await resolveCurrentLocation();
        if (res.ok) {
          here = res.coords;
          await updateRiderLocation(id, res.coords).catch(() => undefined);
        }
      }
      setCoords(here);

      const declined = await loadMyDeclinedDeliveryIds(id).catch(
        () => new Set<string>()
      );

      const { data: pending, count } = await supabase
        .from("deliveries")
        .select("*", { count: "exact" })
        .eq("status", "pending")
        .is("rider_id", null)
        .order("created_at", { ascending: true });

      setCityWide(count ?? pending?.length ?? 0);

      const nearby = filterNearbyPending(pending ?? [], here, declined);
      const withDistance: NearbyJob[] = nearby.map((row) => {
        let d: number | null = null;
        if (
          here &&
          row.pickup_lat != null &&
          row.pickup_lng != null
        ) {
          d = distanceKm(here, {
            lat: Number(row.pickup_lat),
            lng: Number(row.pickup_lng),
          });
        }
        return { ...row, distanceKm: d };
      });
      withDistance.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
      setJobs(withDistance);
    } catch (err) {
      console.warn("[discover] load failed", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const goOnline = async () => {
    if (!profile?.id || toggling) return;
    setToggling(true);
    try {
      const id = riderId ?? (await ensureRiderId(profile.id));
      setRiderId(id);
      const res = await resolveCurrentLocation();
      if (res.ok) {
        setCoords(res.coords);
        await updateRiderLocation(id, res.coords);
      }
      const { error } = await supabase
        .from("riders")
        .update({ is_available: true })
        .eq("id", id);
      if (error) throw error;
      setOnline(true);
      await load();
      Alert.alert(
        "You're online",
        "Nearby offers will also appear on Home. Stay in a busy area.",
        [
          { text: "Stay here", style: "cancel" },
          {
            text: "Open Home",
            onPress: () => router.push("/rider" as never),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        "Couldn’t go online",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setToggling(false);
    }
  };

  const openJob = (job: NearbyJob) => {
    if (!online) {
      Alert.alert(
        "Go online first",
        "Turn online to receive and accept this request on Home.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go online", onPress: () => void goOnline() },
        ]
      );
      return;
    }
    router.push("/rider" as never);
  };

  const nearbyLabel = useMemo(() => {
    if (!coords) return "Turn on location to sort by distance";
    return `Within about ${DRIVER_MATCH_RADIUS_KM} km of you`;
  }, [coords]);

  return (
    <Screen scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <ScreenHeader
          title="Discover"
          subtitle="See demand near you — accept offers on Home"
        />

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              online ? styles.statusOn : styles.statusOff,
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: online ? colors.success : colors.muted },
              ]}
            />
            <Text style={styles.statusText}>
              {online ? "Online" : "Offline"}
            </Text>
          </View>
          <Text style={styles.cityWide}>
            {cityWide} open city-wide
          </Text>
        </View>

        {!online ? (
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Go online to take trips</Text>
            <Text style={styles.ctaBody}>
              Discover shows nearby demand. Offers pop on Home while you are
              online.
            </Text>
            <Pressable
              style={[styles.ctaBtn, toggling && { opacity: 0.7 }]}
              onPress={goOnline}
              disabled={toggling}
            >
              {toggling ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="radio-button-on" size={18} color={colors.white} />
                  <Text style={styles.ctaBtnText}>Go online</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={styles.linkBtn}
              onPress={() => router.push("/rider" as never)}
            >
              <Text style={styles.linkText}>Open Home map</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>Nearby requests</Text>
        <Text style={styles.sectionSub}>{nearbyLabel}</Text>

        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginVertical: 24 }}
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title={online ? "No nearby requests yet" : "Nothing nearby to show"}
            message={
              online
                ? `Stay online — new pending trips within about ${DRIVER_MATCH_RADIUS_KM} km will list here.`
                : "Go online and allow location to see open pickups near you."
            }
            actionLabel={online ? "Refresh" : "Go online"}
            onAction={online ? () => void load() : () => void goOnline()}
          />
        ) : (
          <View style={styles.list}>
            {jobs.map((job) => (
              <Pressable
                key={job.id}
                style={({ pressed }) => [
                  styles.job,
                  pressed && { opacity: 0.92 },
                ]}
                onPress={() => openJob(job)}
              >
                <View style={styles.jobTop}>
                  <Text style={styles.jobType}>
                    {rideTypeFromNotes(job.notes)}
                  </Text>
                  <Text style={styles.jobFee}>
                    {formatCurrency(job.estimated_fee)}
                  </Text>
                </View>
                <Text style={styles.jobPickup} numberOfLines={2}>
                  {shortAddress(job.pickup_address)}
                </Text>
                <Text style={styles.jobDrop} numberOfLines={1}>
                  → {shortAddress(job.delivery_address)}
                </Text>
                <View style={styles.jobMeta}>
                  <Text style={styles.metaChip}>
                    {job.distanceKm != null
                      ? `${job.distanceKm.toFixed(1)} km away`
                      : job.city}
                  </Text>
                  <Text style={styles.metaChip}>{job.city}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.muted}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={[styles.section, { marginTop: 22 }]}>Boosts & tips</Text>
        <Text style={styles.sectionSub}>
          Static guides for now — live promotions come later
        </Text>
        <View style={styles.promoList}>
          {PROMOS.map((p) => (
            <View key={p.id} style={styles.promo}>
              <View style={styles.promoIcon}>
                <Ionicons name={p.icon} size={18} color={colors.secondaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>{p.title}</Text>
                <Text style={styles.promoBody}>{p.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: 36, gap: 4 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  statusOn: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  statusOff: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontWeight: "800", color: colors.dark, fontSize: 13 },
  cityWide: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  ctaCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    padding: 16,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaTitle: { fontWeight: "900", color: colors.dark, fontSize: 17 },
  ctaBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  ctaBtn: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...shadows.card,
  },
  ctaBtnText: { color: colors.white, fontWeight: "900", fontSize: 15 },
  linkBtn: { alignItems: "center", paddingVertical: 8 },
  linkText: { color: colors.primary, fontWeight: "800", fontSize: 14 },
  section: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.dark,
    marginTop: 8,
  },
  sectionSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 2,
  },
  list: { gap: 10 },
  job: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    ...shadows.card,
  },
  jobTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  jobType: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  jobFee: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  jobPickup: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  jobDrop: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  metaChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  promoList: { gap: 8, marginBottom: 8 },
  promo: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: colors.secondarySoft,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  promoTitle: { fontWeight: "900", color: colors.dark, fontSize: 14 },
  promoBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
