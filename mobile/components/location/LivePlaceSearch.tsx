import { colors, radii } from "@/constants/theme";
import { searchLivePlaces, type LivePlace } from "@/lib/places";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  label?: string;
  placeholder?: string;
  value?: LivePlace | null;
  onSelect: (place: LivePlace) => void;
  /** Compact single-line field (e.g. top search bar) */
  compact?: boolean;
};

export function LivePlaceSearch({
  label = "Search any street or area",
  placeholder = "e.g. Allen Avenue, Ikeja or Ring Road, Ibadan",
  value,
  onSelect,
  compact = false,
}: Props) {
  const [query, setQuery] = useState(value?.title ?? "");
  const [results, setResults] = useState<LivePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (value?.title && value.title !== query && !open) {
      setQuery(value.title);
    }
  }, [value?.id, value?.title]);

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
        if (!places.length) setError("No places found — try another street or area");
      } catch {
        if (id !== seq.current) return;
        setResults([]);
        setError("Search unavailable. Check your connection.");
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const pick = (place: LivePlace) => {
    setQuery(place.title);
    setResults([]);
    setOpen(false);
    onSelect(place);
  };

  const resultsList = (
    <View style={styles.dropdown}>
      {error && !loading ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={{ maxHeight: compact ? 320 : 260 }}
        renderItem={({ item }) => (
          <Pressable style={styles.option} onPress={() => pick(item)}>
            <View style={styles.pin}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Text style={styles.optionSub} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  if (compact) {
    return (
      <View style={styles.wrapCompact}>
        <Pressable
          style={styles.fieldCompact}
          onPress={() => setOpen(true)}
        >
          <Ionicons name="search" size={16} color={colors.primary} />
          <Text style={styles.compactValue} numberOfLines={1}>
            {value?.title || placeholder}
          </Text>
        </Pressable>

        <Modal visible={open} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHead}>
                <Text style={styles.modalTitle}>Search any street or area</Text>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    setResults([]);
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={22} color={colors.dark} />
                </Pressable>
              </View>
              <View style={styles.field}>
                <Ionicons name="search" size={18} color={colors.primary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={placeholder}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="search"
                />
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : null}
              </View>
              {query.trim().length >= 2 ? resultsList : (
                <Text style={styles.error}>
                  Type any street, area, or landmark in Nigeria
                </Text>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.field}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        {query.length > 0 && !loading ? (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {value && !open ? (
        <Text style={styles.selected} numberOfLines={2}>
          {value.subtitle || value.address}
        </Text>
      ) : null}

      {open && query.trim().length >= 2 ? resultsList : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, zIndex: 20 },
  wrapCompact: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  compactValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: colors.dark,
  },
  input: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.dark, padding: 0 },
  selected: { color: colors.muted, fontSize: 12, paddingHorizontal: 2 },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  error: {
    padding: 12,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontWeight: "800", color: colors.dark, fontSize: 14 },
  optionSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: 16,
    gap: 10,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: colors.dark },
});
