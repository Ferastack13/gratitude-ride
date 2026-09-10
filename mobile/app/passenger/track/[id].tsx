import { StatusTimeline } from "@/components/delivery/StatusTimeline";
import { RouteMap } from "@/components/maps/RouteMap";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Card";
import { ContactBar } from "@/components/workflow/ContactBar";
import { FindingCourier } from "@/components/workflow/FindingCourier";
import { MapShell, SheetHandle } from "@/components/workflow/MapShell";
import { RateSheet } from "@/components/workflow/RateSheet";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { distanceKm } from "@/lib/cities";
import type { Delivery } from "@/lib/deliveries";
import { estimateEtaMinutes, formatEta } from "@/lib/eta";
import { formatCurrency, formatStatus, statusTone } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [riderName, setRiderName] = useState("Driver");
  const [riderPhone, setRiderPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rated, setRated] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("tracking_id", String(id))
      .maybeSingle();

    if (queryError) {
      setError(queryError.message);
      setDelivery(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setDelivery(null);
      setError("Trip not found");
      setLoading(false);
      return;
    }

    setDelivery(data);

    if (data.rider_id) {
      const { data: rider } = await supabase
        .from("riders")
        .select("user_id, rating, vehicle_type")
        .eq("id", data.rider_id)
        .maybeSingle();
      if (rider?.user_id) {
        const { data: user } = await supabase
          .from("users")
          .select("full_name, phone")
          .eq("id", rider.user_id)
          .maybeSingle();
        setRiderName(user?.full_name?.split(" ")[0] ?? "Driver");
        setRiderPhone(user?.phone ?? null);
      }
    }

    if (profile?.id) {
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("delivery_id", data.id)
        .eq("reviewer_id", profile.id)
        .maybeSingle();
      setRated(Boolean(existing));
    }

    setLoading(false);
  }, [id, profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!delivery?.id) return;
    const channel = supabase
      .channel(`track-${delivery.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
          filter: `id=eq.${delivery.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            setDelivery(payload.new as Delivery);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [delivery?.id]);

  const km = useMemo(() => {
    if (
      delivery?.pickup_lat == null ||
      delivery?.delivery_lat == null ||
      delivery?.pickup_lng == null ||
      delivery?.delivery_lng == null
    ) {
      return 6;
    }
    return distanceKm(
      { lat: delivery.pickup_lat, lng: delivery.pickup_lng },
      { lat: delivery.delivery_lat, lng: delivery.delivery_lng }
    );
  }, [delivery]);

  const eta = formatEta(estimateEtaMinutes(km, delivery?.status));

  const submitRating = async (rating: number) => {
    if (!delivery || !profile?.id || !delivery.rider_id) return;
    setRatingBusy(true);
    try {
      const { data: rider } = await supabase
        .from("riders")
        .select("user_id, rating, total_deliveries")
        .eq("id", delivery.rider_id)
        .maybeSingle();
      if (!rider?.user_id) throw new Error("Driver unavailable for rating");

      const { error: reviewError } = await supabase.from("reviews").insert({
        delivery_id: delivery.id,
        reviewer_id: profile.id,
        reviewee_id: rider.user_id,
        rating,
      });
      if (reviewError) throw reviewError;

      const trips = Math.max(1, Number(rider.total_deliveries || 1));
      const nextRating =
        (Number(rider.rating || 5) * (trips - 1) + rating) / trips;
      await supabase
        .from("riders")
        .update({ rating: Number(nextRating.toFixed(2)) })
        .eq("id", delivery.rider_id);

      setRated(true);
      Alert.alert("Thanks", "Your rating helps keep Gratitude Ride excellent.");
    } catch (err) {
      Alert.alert(
        "Could not rate",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setRatingBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.pad}>
        <EmptyState
          title="Trip not found"
          message={error || "Check the tracking ID and try again."}
          actionLabel="Retry"
          onAction={load}
        />
      </View>
    );
  }

  const finding = delivery.status === "pending";
  const hasCoords =
    delivery.pickup_lat != null && delivery.delivery_lat != null;
  const center = hasCoords
    ? {
        lat: (delivery.pickup_lat! + delivery.delivery_lat!) / 2,
        lng: (delivery.pickup_lng! + delivery.delivery_lng!) / 2,
      }
    : { lat: 6.5244, lng: 3.3792 };

  return (
    <MapShell
      map={
        <RouteMap
          fullBleed
          center={center}
          pickup={
            hasCoords
              ? {
                  lat: delivery.pickup_lat!,
                  lng: delivery.pickup_lng!,
                  label: "Pickup",
                }
              : undefined
          }
          dropoff={
            hasCoords
              ? {
                  lat: delivery.delivery_lat!,
                  lng: delivery.delivery_lng!,
                  label: "Drop-off",
                }
              : undefined
          }
        />
      }
      top={
        <View style={styles.topRow}>
          <View style={styles.etaPill}>
            <Ionicons name="time" size={14} color={colors.primary} />
            <Text style={styles.etaText}>{eta}</Text>
          </View>
          <Pressable
            style={styles.share}
            onPress={() =>
              Share.share({
                message: `Track my Gratitude Ride trip ${delivery.tracking_id}`,
              })
            }
          >
            <Ionicons name="share-social" size={16} color={colors.dark} />
          </Pressable>
        </View>
      }
      sheet={
        <ScrollView
          style={{ maxHeight: 420 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
        >
          <SheetHandle />
          <View style={styles.head}>
            <View>
              <Text style={styles.id}>{delivery.tracking_id}</Text>
              <Text style={styles.city}>{delivery.city}</Text>
            </View>
            <Badge
              label={formatStatus(delivery.status)}
              tone={statusTone(delivery.status)}
            />
          </View>

          {finding ? (
            <FindingCourier
              city={delivery.city}
              trackingId={delivery.tracking_id}
            />
          ) : (
            <ContactBar
              name={riderName}
              phone={riderPhone}
              subtitle={`Driver · ${formatCurrency(delivery.estimated_fee)}`}
            />
          )}

          <View style={styles.stops}>
            <Text style={styles.stop}>
              <Text style={styles.dotGreen}>● </Text>
              {delivery.pickup_address}
            </Text>
            <Text style={styles.stop}>
              <Text style={styles.dotGold}>● </Text>
              {delivery.delivery_address}
            </Text>
          </View>

          <StatusTimeline status={delivery.status} />

          {delivery.status === "delivered" && !rated && delivery.rider_id ? (
            <RateSheet
              title="Trip complete"
              submitting={ratingBusy}
              onSubmit={(rating) => submitRating(rating)}
            />
          ) : null}
        </ScrollView>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pad: { flex: 1, padding: 18, justifyContent: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaPill: {
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
  etaText: { fontWeight: "800", color: colors.dark },
  share: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  id: { fontFamily: "monospace", fontWeight: "900", fontSize: 18, color: colors.dark },
  city: { color: colors.muted, marginTop: 2, fontSize: 12, fontWeight: "600" },
  stops: { gap: 8 },
  stop: { color: colors.dark, fontSize: 13, lineHeight: 18 },
  dotGreen: { color: colors.primary, fontWeight: "900" },
  dotGold: { color: colors.secondaryDark, fontWeight: "900" },
});
