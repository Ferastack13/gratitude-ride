import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FormCardSkeleton } from "@/components/ui/Skeleton";
import { radii, type ThemeColors } from "@/constants/theme";
import { useColors } from "@/context/theme";
import {
  deleteBusinessGuest,
  getBusinessGuests,
  saveBusinessGuest,
  type BusinessGuest,
} from "@/lib/business-team";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function BusinessTeamScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [guests, setGuests] = useState<BusinessGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setGuests(await getBusinessGuests());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setNote("");
    setEditingId(null);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const next = await saveBusinessGuest({
        id: editingId ?? undefined,
        name,
        phone,
        note,
      });
      setGuests(next);
      resetForm();
    } catch (err) {
      Alert.alert(
        "Couldn’t save",
        err instanceof Error ? err.message : "Check name and phone."
      );
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (g: BusinessGuest) => {
    setEditingId(g.id);
    setName(g.name);
    setPhone(g.phone);
    setNote(g.note ?? "");
  };

  const onDelete = (g: BusinessGuest) => {
    Alert.alert("Remove guest?", `${g.name} will be removed from your list.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          void deleteBusinessGuest(g.id).then(setGuests).catch(() => undefined),
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Guest riders"
        subtitle="Saved passengers for business bookings"
        onBack={() => router.back()}
      />

      {loading ? (
        <FormCardSkeleton fields={3} />
      ) : (
        <>
          <Card>
            <Text style={styles.formTitle}>
              {editingId ? "Edit guest" : "Add guest"}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <View style={styles.formActions}>
              {editingId ? (
                <Button label="Cancel" variant="ghost" onPress={resetForm} />
              ) : null}
              <Button
                label={saving ? "Saving…" : editingId ? "Update" : "Save guest"}
                onPress={onSave}
                loading={saving}
                disabled={saving}
              />
            </View>
          </Card>

          <Text style={styles.section}>Saved ({guests.length})</Text>
          {guests.length === 0 ? (
            <EmptyState
              title="No guests yet"
              message="Add staff or clients here, then pick them when booking."
            />
          ) : (
            guests.map((g) => (
              <View key={g.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{g.name}</Text>
                  <Text style={styles.rowMeta}>{g.phone}</Text>
                  {g.note ? (
                    <Text style={styles.rowNote} numberOfLines={1}>
                      {g.note}
                    </Text>
                  ) : null}
                </View>
                <Pressable style={styles.iconBtn} onPress={() => onEdit(g)}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => onDelete(g)}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    formTitle: { fontWeight: "900", fontSize: 16, color: colors.dark },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      fontWeight: "600",
      color: colors.dark,
      marginTop: 8,
    },
    formActions: { marginTop: 10, gap: 6 },
    section: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.dark,
      marginTop: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: 14,
    },
    rowName: { fontWeight: "800", color: colors.dark },
    rowMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
    rowNote: { color: colors.mutedLight, fontSize: 12, marginTop: 2 },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
  });
}
