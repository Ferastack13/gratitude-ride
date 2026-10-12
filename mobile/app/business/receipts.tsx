import { TripActivityCard } from "@/components/passenger/TripActivityCard";
import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { JobCardSkeletonList } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/auth";
import {
  buildTripReceiptText,
  guestFromNotes,
} from "@/lib/business-billing";
import type { Delivery } from "@/lib/deliveries";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Share } from "react-native";

export default function BusinessReceiptsScreen() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (!client?.id) {
        setRows([]);
        return;
      }
      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .eq("client_id", client.id)
        .eq("status", "delivered")
        .order("delivered_at", { ascending: false })
        .limit(50);
      setRows(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const openReceipt = (delivery: Delivery) => {
    const fee = formatCurrency(
      Number(delivery.actual_fee ?? delivery.estimated_fee ?? 0)
    );
    const guest = guestFromNotes(delivery.notes);
    Alert.alert(
      `Receipt · ${delivery.tracking_id}`,
      [
        guest ? `Passenger: ${guest}` : null,
        `Amount: ${fee}`,
        `Pickup: ${delivery.pickup_address}`,
        `Drop-off: ${delivery.delivery_address}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      [
        { text: "Close", style: "cancel" },
        {
          text: "Share",
          onPress: () =>
            void Share.share({
              message: buildTripReceiptText(
                delivery,
                profile?.full_name ?? undefined
              ),
            }),
        },
        {
          text: "Track",
          onPress: () =>
            router.push(`/business/track/${delivery.tracking_id}` as never),
        },
      ]
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title="Trip receipts"
        subtitle="Completed business trips"
        onBack={() => router.back()}
      />

      {loading ? (
        <JobCardSkeletonList count={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          message="Finished trips will appear here with fare and guest details."
          actionLabel="Book a trip"
          onAction={() => router.push("/business/where-to" as never)}
        />
      ) : (
        <Card padded={false} style={{ paddingHorizontal: 12 }}>
          {rows.map((row) => (
            <TripActivityCard
              key={row.id}
              delivery={row}
              onPress={() => openReceipt(row)}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
