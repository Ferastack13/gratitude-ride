import { colors, radii } from "@/constants/theme";
import {
  NIGERIA_STATES,
  type Area,
  type NigeriaState,
  type Street,
} from "@/lib/nigeria-locations";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Mode = "state" | "area" | "street";

export function LocationDropdowns({
  state,
  area,
  street,
  onStateChange,
  onAreaChange,
  onStreetChange,
}: {
  state: NigeriaState;
  area: Area;
  street: Street;
  onStateChange: (s: NigeriaState) => void;
  onAreaChange: (a: Area) => void;
  onStreetChange: (s: Street) => void;
}) {
  const [open, setOpen] = useState<Mode | null>(null);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (open === "state") {
      return NIGERIA_STATES.filter((s) =>
        !q ? true : s.label.toLowerCase().includes(q) || s.capital.toLowerCase().includes(q)
      ).map((s) => ({ id: s.id, title: s.label, subtitle: `Capital · ${s.capital}` }));
    }
    if (open === "area") {
      return state.areas
        .filter((a) => (!q ? true : a.label.toLowerCase().includes(q)))
        .map((a) => ({
          id: a.id,
          title: a.label,
          subtitle: `${a.streets.length} streets`,
        }));
    }
    if (open === "street") {
      return area.streets
        .filter((s) => (!q ? true : s.label.toLowerCase().includes(q)))
        .map((s) => ({ id: s.id, title: s.label, subtitle: s.address }));
    }
    return [];
  }, [open, query, state, area]);

  const select = (id: string) => {
    if (open === "state") {
      const next = NIGERIA_STATES.find((s) => s.id === id)!;
      onStateChange(next);
      onAreaChange(next.areas[0]);
      onStreetChange(next.areas[0].streets[0]);
    } else if (open === "area") {
      const next = state.areas.find((a) => a.id === id)!;
      onAreaChange(next);
      onStreetChange(next.streets[0]);
    } else if (open === "street") {
      onStreetChange(area.streets.find((s) => s.id === id)!);
    }
    setOpen(null);
    setQuery("");
  };

  return (
    <View style={styles.wrap}>
      <DropdownRow
        label="State"
        value={state.label}
        onPress={() => {
          setQuery("");
          setOpen("state");
        }}
      />
      <DropdownRow
        label="Area"
        value={area.label}
        onPress={() => {
          setQuery("");
          setOpen("area");
        }}
      />
      <DropdownRow
        label="Street"
        value={street.label}
        onPress={() => {
          setQuery("");
          setOpen("street");
        }}
      />

      <Modal visible={!!open} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>
                Select {open === "state" ? "state" : open === "area" ? "area" : "street"}
              </Text>
              <Pressable
                onPress={() => {
                  setOpen(null);
                  setQuery("");
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color={colors.dark} />
              </Pressable>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search…"
              placeholderTextColor={colors.muted}
              style={styles.search}
              autoFocus
            />
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => select(item.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionSub} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DropdownRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={18} color={colors.dark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rowValue: { fontWeight: "800", color: colors.dark, marginTop: 2, fontSize: 14 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 16,
    gap: 10,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: colors.dark },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.dark,
    backgroundColor: colors.surface,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionTitle: { fontWeight: "800", color: colors.dark, fontSize: 15 },
  optionSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
