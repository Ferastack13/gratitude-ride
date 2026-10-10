import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import {
  DRIVER_VEHICLE_OPTIONS,
  type DriverVehicleType,
  getRiderByUserId,
  updateRiderVehicle,
} from "@/lib/driver-bootstrap";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function normalizeVehicle(value?: string | null): DriverVehicleType {
  const match = DRIVER_VEHICLE_OPTIONS.find(
    (opt) => opt.toLowerCase() === (value ?? "").trim().toLowerCase()
  );
  return match ?? "Motorcycle";
}

export default function RiderVehicleScreen() {
  const { session } = useAuth();
  const colors = useColors();
  const [vehicle, setVehicle] = useState<DriverVehicleType>("Motorcycle");
  const [license, setLicense] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) return;
    setLoading(true);
    try {
      const rider = await getRiderByUserId(userId);
      setVehicle(normalizeVehicle(rider?.vehicle_type));
      setLicense(rider?.license_number ?? "");
    } catch (err) {
      Alert.alert(
        "Couldn’t load vehicle",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onSave = async () => {
    const userId = session?.user.id;
    if (!userId) return;
    setSaving(true);
    try {
      await updateRiderVehicle(userId, {
        vehicle_type: vehicle,
        license_number: license,
      });
      Alert.alert("Vehicle saved", "Passengers will see this on your trips.");
      router.back();
    } catch (err) {
      Alert.alert(
        "Couldn’t save",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Vehicle"
        subtitle="Type and license details"
        onBack={() => router.back()}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <>
          <Text style={[styles.label, { color: colors.muted }]}>
            Vehicle type
          </Text>
          <View style={styles.options}>
            {DRIVER_VEHICLE_OPTIONS.map((opt) => {
              const on = opt === vehicle;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setVehicle(opt)}
                  style={[
                    styles.chip,
                    {
                      borderColor: on ? colors.primary : colors.border,
                      backgroundColor: on ? colors.primarySoft : colors.white,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: on ? colors.primary : colors.dark },
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>
            License / plate number
          </Text>
          <TextInput
            value={license}
            onChangeText={setLicense}
            autoCapitalize="characters"
            placeholder="e.g. ABC-123XY"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                color: colors.dark,
                borderColor: colors.border,
                backgroundColor: colors.white,
              },
            ]}
          />

          <Card>
            <Text style={[styles.hint, { color: colors.muted }]}>
              Plate/license is stored on your driver profile. Verification review
              may use this later.
            </Text>
          </Card>

          <Button
            label={saving ? "Saving…" : "Save vehicle"}
            onPress={onSave}
            disabled={saving}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: { fontWeight: "800", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  hint: { fontSize: 13, lineHeight: 18 },
});
