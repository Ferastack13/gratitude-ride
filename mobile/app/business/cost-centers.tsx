import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FormCardSkeleton } from "@/components/ui/Skeleton";
import { radii, type ThemeColors } from "@/constants/theme";
import { useColors } from "@/context/theme";
import {
  deleteCostCenter,
  getCostCenters,
  getDefaultCostCenterId,
  saveCostCenter,
  setDefaultCostCenterId,
  type CostCenter,
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

export default function BusinessCostCentersScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [centers, setCenters] = useState<CostCenter[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, def] = await Promise.all([
        getCostCenters(),
        getDefaultCostCenterId(),
      ]);
      setCenters(list);
      setDefaultId(def);
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
    setCode("");
    setEditingId(null);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const next = await saveCostCenter({
        id: editingId ?? undefined,
        name,
        code,
      });
      setCenters(next);
      if (!defaultId && next[0]) {
        await setDefaultCostCenterId(next[0].id);
        setDefaultId(next[0].id);
      }
      resetForm();
    } catch (err) {
      Alert.alert(
        "Couldn’t save",
        err instanceof Error ? err.message : "Enter a name."
      );
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    await setDefaultCostCenterId(id);
    setDefaultId(id);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Cost centers"
        subtitle="Tag trips for reporting"
        onBack={() => router.back()}
      />

      {loading ? (
        <FormCardSkeleton fields={2} />
      ) : (
        <>
          <Card>
            <Text style={styles.formTitle}>
              {editingId ? "Edit cost center" : "Add cost center"}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sales, Ops, HQ"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Optional code (PO / GL)"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <View style={styles.formActions}>
              {editingId ? (
                <Button label="Cancel" variant="ghost" onPress={resetForm} />
              ) : null}
              <Button
                label={saving ? "Saving…" : editingId ? "Update" : "Save"}
                onPress={onSave}
                loading={saving}
                disabled={saving}
              />
            </View>
          </Card>

          <Text style={styles.section}>Your centers</Text>
          {centers.length === 0 ? (
            <EmptyState
              title="No cost centers"
              message="Add departments or projects, then pick one when booking."
            />
          ) : (
            centers.map((c) => {
              const isDefault = c.id === defaultId;
              return (
                <View key={c.id} style={styles.row}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => void makeDefault(c.id)}
                  >
                    <Text style={styles.rowName}>
                      {c.name}
                      {isDefault ? " · default" : ""}
                    </Text>
                    {c.code ? (
                      <Text style={styles.rowMeta}>Code {c.code}</Text>
                    ) : (
                      <Text style={styles.rowMeta}>Tap to set as default</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => {
                      setEditingId(c.id);
                      setName(c.name);
                      setCode(c.code ?? "");
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </Pressable>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() =>
                      Alert.alert("Delete?", `Remove ${c.name}?`, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () =>
                            void deleteCostCenter(c.id).then((next) => {
                              setCenters(next);
                              if (defaultId === c.id) setDefaultId(null);
                            }),
                        },
                      ])
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.danger}
                    />
                  </Pressable>
                </View>
              );
            })
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
    rowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
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
