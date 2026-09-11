import { LocationRow } from "@/components/passenger/LocationRow";
import { colors, radii } from "@/constants/theme";
import { resolveCurrentLocation, placeParams } from "@/lib/location";
import { getRecentPlaces, setSavedPlace } from "@/lib/client-prefs";
import { searchLivePlaces, type LivePlace } from "@/lib/places";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FocusField = "pickup" | "dropoff";
type SaveAs = "home" | "work";

function parsePlaceFromParams(
  lat?: string,
  lng?: string,
  title?: string,
  address?: string,
  city?: string
): LivePlace | null {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
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

export default function WhereToScreen() {
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
    focus?: string;
    serviceId?: string;
    saveAs?: string;
  }>();

  const saveAs: SaveAs | null =
    params.saveAs === "home" || params.saveAs === "work"
      ? params.saveAs
      : null;

  const [pickup, setPickup] = useState<LivePlace | null>(() =>
    parsePlaceFromParams(
      params.pickupLat,
      params.pickupLng,
      params.pickupTitle,
      params.pickupAddress,
      params.pickupCity
    )
  );
  const [dropoff, setDropoff] = useState<LivePlace | null>(() =>
    parsePlaceFromParams(
      params.dropoffLat,
      params.dropoffLng,
      params.dropoffTitle,
      params.dropoffAddress,
      params.dropoffCity
    )
  );
  const [focus, setFocus] = useState<FocusField>(
    params.focus === "pickup" ? "pickup" : "dropoff"
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LivePlace[]>([]);
  const [recent, setRecent] = useState<LivePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locMessage, setLocMessage] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    getRecentPlaces().then(setRecent).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (pickup) return;
    let cancelled = false;
    (async () => {
      setLocating(true);
      const res = await resolveCurrentLocation();
      if (cancelled) return;
      setLocating(false);
      if (res.ok) {
        setPickup(res.place);
        setLocMessage(null);
      } else {
        setLocMessage(res.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pickup]);

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
        const places = await searchLivePlaces(q);
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

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    setLocMessage(null);
    const res = await resolveCurrentLocation();
    setLocating(false);
    if (res.ok) {
      setPickup(res.place);
      setFocus("dropoff");
      setQuery("");
      setResults([]);
    } else {
      setLocMessage(res.message);
      setFocus("pickup");
    }
  }, []);

  const goPlan = (from: LivePlace, to: LivePlace) => {
    router.push({
      pathname: "/passenger/plan",
      params: {
        ...placeParams(from, "pickup"),
        ...placeParams(to, "dropoff"),
        serviceId: params.serviceId || "standard",
      },
    } as never);
  };

  const onSelect = async (place: LivePlace) => {
    if (saveAs) {
      await setSavedPlace(saveAs, place);
      setDropoff(place);
      setQuery("");
      setResults([]);
      if (pickup) {
        goPlan(pickup, place);
      } else {
        setFocus("pickup");
        setLocMessage("Set your pickup location to continue.");
      }
      return;
    }

    if (focus === "pickup") {
      setPickup(place);
      setFocus("dropoff");
      setQuery("");
      setResults([]);
      if (dropoff) goPlan(place, dropoff);
      return;
    }
    setDropoff(place);
    setQuery("");
    setResults([]);
    if (pickup) {
      goPlan(pickup, place);
    } else {
      setFocus("pickup");
      setLocMessage("Set your pickup location to continue.");
    }
  };

  const suggestions = query.trim().length >= 2 ? results : recent;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.head}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.dark} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {saveAs === "home"
                ? "Set Home"
                : saveAs === "work"
                  ? "Set Work"
                  : "Plan your trip"}
            </Text>
            <Text style={styles.subtitle}>
              {saveAs
                ? "Search and choose an address to save"
                : "Pickup → Destination"}
            </Text>
          </View>
        </View>

        <View style={styles.fields}>
          <Pressable
            style={[styles.field, focus === "pickup" && styles.fieldOn]}
            onPress={() => {
              setFocus("pickup");
              setQuery("");
              setResults([]);
            }}
          >
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Pickup</Text>
              <Text
                style={[styles.fieldValue, !pickup && styles.placeholder]}
                numberOfLines={1}
              >
                {locating && !pickup
                  ? "Detecting current location…"
                  : pickup?.title || "Search pickup location"}
              </Text>
            </View>
            {focus === "pickup" ? (
              <View style={styles.focusPill}>
                <Text style={styles.focusPillText}>Editing</Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.rail} />

          <Pressable
            style={[styles.field, focus === "dropoff" && styles.fieldOn]}
            onPress={() => {
              setFocus("dropoff");
              setQuery("");
              setResults([]);
            }}
          >
            <View
              style={[styles.dot, { backgroundColor: colors.secondaryDark }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>
                {saveAs === "home"
                  ? "Home address"
                  : saveAs === "work"
                    ? "Work address"
                    : "Destination"}
              </Text>
              <Text
                style={[styles.fieldValue, !dropoff && styles.placeholder]}
                numberOfLines={1}
              >
                {dropoff?.title || "Where to?"}
              </Text>
            </View>
            {focus === "dropoff" ? (
              <View style={styles.focusPill}>
                <Text style={styles.focusPillText}>Editing</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.search}
            placeholder={
              focus === "pickup"
                ? "Search pickup street or area"
                : "Search destination"
            }
            placeholderTextColor={colors.mutedLight}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
          {query.length > 0 && !loading ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedLight} />
            </Pressable>
          ) : null}
        </View>

        {locMessage ? <Text style={styles.locMsg}>{locMessage}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.currentRow,
            pressed && { opacity: 0.88 },
          ]}
          onPress={useCurrentLocation}
        >
          <View style={styles.currentIcon}>
            <Ionicons name="locate" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.currentTitle}>
              {locating ? "Getting current location…" : "Use current location"}
            </Text>
            <Text style={styles.currentSub}>
              Set pickup from your device GPS
            </Text>
          </View>
        </Pressable>

        <Text style={styles.section}>
          {query.trim().length >= 2 ? "Suggestions" : "Recent"}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 8 }}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>
                {query.trim().length >= 2
                  ? "No matches yet"
                  : "Recent destinations will appear here"}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <LocationRow
              title={item.title}
              subtitle={item.subtitle || item.address}
              icon={
                query.trim().length >= 2 ? "location-outline" : "time-outline"
              }
              tone={query.trim().length >= 2 ? "dropoff" : "recent"}
              onPress={() => onSelect(item)}
            />
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
  },
  fields: {
    marginHorizontal: 16,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.xl,
    paddingVertical: 4,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldOn: { backgroundColor: colors.white },
  dot: { width: 8, height: 8, borderRadius: 4 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.dark,
    marginTop: 2,
  },
  placeholder: { color: colors.mutedLight, fontWeight: "400" },
  focusPill: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  focusPillText: { color: colors.white, fontSize: 10, fontWeight: "600" },
  rail: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 36,
    marginRight: 14,
  },
  searchWrap: {
    marginTop: 14,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  search: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: colors.dark,
    padding: 0,
  },
  locMsg: {
    marginHorizontal: 18,
    marginTop: 10,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  currentRow: {
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  currentTitle: { fontWeight: "600", color: colors.dark },
  currentSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  section: {
    marginTop: 16,
    marginHorizontal: 18,
    marginBottom: 4,
    fontWeight: "600",
    color: colors.dark,
    fontSize: 15,
  },
  error: { marginHorizontal: 18, color: colors.danger, fontSize: 13 },
  empty: { marginHorizontal: 10, color: colors.muted, marginTop: 8 },
});
