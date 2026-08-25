import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import {
  distanceKm,
  estimateDeliveryFee,
  getCityConfig,
  SERVICE_CITIES,
  type ServiceCity,
} from "@/lib/cities";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BookScreen() {
  const [city, setCity] = useState<ServiceCity>("Lagos");
  const config = getCityConfig(city);
  const [pickupId, setPickupId] = useState(config.hubs[0].id);
  const [dropoffId, setDropoffId] = useState(config.hubs[1].id);
  const [notes, setNotes] = useState("");

  const pickup = config.hubs.find((h) => h.id === pickupId) ?? config.hubs[0];
  const dropoff = config.hubs.find((h) => h.id === dropoffId) ?? config.hubs[1];
  const km = useMemo(() => distanceKm(pickup, dropoff), [pickup, dropoff]);
  const fee = estimateDeliveryFee(km);

  const onCityChange = (next: ServiceCity) => {
    const nextConfig = getCityConfig(next);
    setCity(next);
    setPickupId(nextConfig.hubs[0].id);
    setDropoffId(nextConfig.hubs[1].id);
  };

  return (
    <Screen>
      <Text style={styles.title}>Book a delivery</Text>
      <Text style={styles.sub}>Choose a city, pickup, and drop-off hub.</Text>

      <View style={styles.chips}>
        {SERVICE_CITIES.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onCityChange(item.id)}
            style={[styles.chip, city === item.id && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, city === item.id && styles.chipTextActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Pickup</Text>
      <View style={styles.chips}>
        {config.hubs.map((hub) => (
          <Pressable
            key={hub.id}
            onPress={() => setPickupId(hub.id)}
            style={[styles.chip, pickupId === hub.id && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                pickupId === hub.id && styles.chipTextActive,
              ]}
            >
              {hub.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Drop-off</Text>
      <View style={styles.chips}>
        {config.hubs.map((hub) => (
          <Pressable
            key={hub.id}
            onPress={() => setDropoffId(hub.id)}
            style={[styles.chip, dropoffId === hub.id && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                dropoffId === hub.id && styles.chipTextActive,
              ]}
            >
              {hub.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Package notes (optional)"
        placeholder="Fragile, leave with security…"
        value={notes}
        onChangeText={setNotes}
      />

      <Card>
        <Text style={styles.quoteLabel}>Quote</Text>
        <Text style={styles.quote}>₦{fee.toLocaleString()}</Text>
        <Text style={styles.sub}>
          ~{km.toFixed(1)} km · {pickup.label} → {dropoff.label}
        </Text>
      </Card>

      <Button
        label="Confirm booking"
        disabled={pickupId === dropoffId}
        onPress={() => {}}
      />
      <Text style={styles.hint}>
        Saving to Supabase is the next build step. This screen is ready for
        that wiring.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.dark },
  sub: { fontSize: 14, color: colors.muted },
  label: { fontWeight: "700", color: colors.dark },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.dark, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  quoteLabel: { color: colors.muted, fontSize: 12, textTransform: "uppercase" },
  quote: { fontSize: 28, fontWeight: "800", color: colors.dark },
  hint: { fontSize: 12, color: colors.muted, textAlign: "center" },
});
