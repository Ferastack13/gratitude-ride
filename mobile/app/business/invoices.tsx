import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { JobCardSkeletonList } from "@/components/ui/Skeleton";
import { radii, type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { costCenterFromNotes } from "@/lib/business-team";
import type { Delivery } from "@/lib/deliveries";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";

type MonthBucket = {
  key: string;
  label: string;
  trips: number;
  total: number;
  byCenter: Record<string, { trips: number; total: number }>;
};

function monthKey(iso: string | null) {
  if (!iso) return "unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  if (key === "unknown") return "Unknown date";
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function BusinessInvoicesScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
        .limit(200);
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

  const months = useMemo(() => {
    const map = new Map<string, MonthBucket>();
    for (const d of rows) {
      const key = monthKey(d.delivered_at ?? d.created_at);
      const fee = Number(d.actual_fee ?? d.estimated_fee ?? 0);
      const center = costCenterFromNotes(d.notes) || "Unassigned";
      const bucket =
        map.get(key) ??
        ({
          key,
          label: monthLabel(key),
          trips: 0,
          total: 0,
          byCenter: {},
        } satisfies MonthBucket);
      bucket.trips += 1;
      bucket.total += fee;
      const cc = bucket.byCenter[center] ?? { trips: 0, total: 0 };
      cc.trips += 1;
      cc.total += fee;
      bucket.byCenter[center] = cc;
      map.set(key, bucket);
    }
    return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
  }, [rows]);

  const shareMonth = (m: MonthBucket) => {
    const lines = [
      `Gratitude Ride — Monthly summary`,
      profile?.full_name ? `Company: ${profile.full_name}` : null,
      m.label,
      `Trips: ${m.trips}`,
      `Total: ${formatCurrency(m.total)}`,
      "",
      "By cost center:",
      ...Object.entries(m.byCenter).map(
        ([name, v]) =>
          `· ${name}: ${v.trips} trip${v.trips === 1 ? "" : "s"} · ${formatCurrency(v.total)}`
      ),
      "",
      "Local summary from completed trips (not a formal tax invoice).",
    ].filter(Boolean);
    void Share.share({ message: lines.join("\n") });
  };

  return (
    <Screen>
      <ScreenHeader
        title="Monthly summaries"
        subtitle="From completed trips"
        onBack={() => router.back()}
      />

      {loading ? (
        <JobCardSkeletonList count={3} />
      ) : months.length === 0 ? (
        <EmptyState
          title="No invoice data yet"
          message="Complete trips to build monthly spend summaries by cost center."
          actionLabel="Book a trip"
          onAction={() => router.push("/business/where-to" as never)}
        />
      ) : (
        months.map((m) => (
          <Card key={m.key}>
            <Text style={styles.title}>{m.label}</Text>
            <Text style={styles.meta}>
              {m.trips} trip{m.trips === 1 ? "" : "s"} · {formatCurrency(m.total)}
            </Text>
            <View style={styles.centers}>
              {Object.entries(m.byCenter).map(([name, v]) => (
                <View key={name} style={styles.centerRow}>
                  <Text style={styles.centerName}>{name}</Text>
                  <Text style={styles.centerVal}>
                    {v.trips} · {formatCurrency(v.total)}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.shareBtn} onPress={() => shareMonth(m)}>
              <Text style={styles.shareText}>Share summary</Text>
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: { fontWeight: "900", fontSize: 17, color: colors.dark },
    meta: { color: colors.muted, fontWeight: "700", marginTop: 4 },
    centers: { marginTop: 10, gap: 6 },
    centerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    centerName: { color: colors.dark, fontWeight: "600", flex: 1 },
    centerVal: { color: colors.muted, fontWeight: "700", fontSize: 13 },
    shareBtn: {
      marginTop: 12,
      alignSelf: "flex-start",
      backgroundColor: colors.primarySoft,
      borderRadius: radii.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    shareText: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  });
}
