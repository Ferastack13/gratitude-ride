import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import {
  DRIVER_AREA_SHORTCUTS,
  setDriverWorkingArea,
} from "@/lib/driver-base-location";
import { ensureRiderId } from "@/lib/deliveries";
import { resolveCurrentLocation } from "@/lib/location";
import { searchLivePlaces, type LivePlace } from "@/lib/places";
import { updateRiderLocation } from "@/lib/ride-matching";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RiderSetLocationScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LivePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const places = await searchLivePlaces(q, null);
        if (id !== seq.current) return;
        setResults(places);
        if (!places.length) setError("No places found — try another search");
      } catch {
        if (id !== seq.current) return;
        setResults([]);
        setError("Search unavailable. Check your connection.");
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const applyPlace = async (place: LivePlace) => {
    if (!profile?.id || saving) return;
    setSaving(true);
    try {
      await setDriverWorkingArea(place);
      const riderId = await ensureRiderId(profile.id);
      await updateRiderLocation(riderId, {
        lat: place.lat,
        lng: place.lng,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        "Couldn’t save area",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const tryGpsOptional = async () => {
    setSaving(true);
    try {
      const res = await resolveCurrentLocation();
      if (!res.ok) {
        Alert.alert(
          "GPS not required",
          "No problem — search for your area or pick a city below. GPS is optional."
        );
        return;
      }
      await applyPlace(res.place);
    } finally {
      setSaving(false);
    }
  };

  const list =
    query.trim().length >= 2 ? results : DRIVER_AREA_SHORTCUTS;

  return (
    <Screen scroll={false}>
      <ScreenHeader
        title="Working area"
        subtitle="Search a place — GPS not required"
        onBack={() => router.back()}
      />

      <View
        style={[
          styles.search,
          { backgroundColor: colors.white, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Ikeja, Lekki, Wuse"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.dark }]}
          autoFocus
          autoCorrect={false}
        />
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
      </View>

      <Pressable
        style={[styles.gpsRow, { borderColor: colors.border }]}
        onPress={() => void tryGpsOptional()}
        disabled={saving}
      >
        <Ionicons name="navigate-outline" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.gpsTitle, { color: colors.dark }]}>
            Optional: use phone GPS
          </Text>
          <Text style={[styles.gpsSub, { color: colors.muted }]}>
            Only if you want — search works without it
          </Text>
        </View>
      </Pressable>

      <Text style={[styles.section, { color: colors.muted }]}>
        {query.trim().length >= 2 ? "Search results" : "Popular areas"}
      </Text>

      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.row,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
                opacity: saving ? 0.6 : 1,
              },
            ]}
            onPress={() => void applyPlace(item)}
            disabled={saving}
          >
            <View
              style={[styles.pin, { backgroundColor: colors.primarySoft }]}
            >
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.dark }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.rowSub, { color: colors.muted }]}
                numberOfLines={2}
              >
                {item.address || item.subtitle}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.mutedLight}
            />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 16, fontWeight: "600", paddingVertical: 10 },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  gpsTitle: { fontWeight: "800", fontSize: 14 },
  gpsSub: { fontSize: 12, marginTop: 2 },
  section: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  error: { fontWeight: "700", fontSize: 13 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontWeight: "800", fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
