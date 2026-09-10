import { colors, radii } from "@/constants/theme";
import { buildTimeline, type Delivery } from "@/lib/deliveries";
import type { DeliveryStatus } from "@/lib/format";
import { StyleSheet, Text, View } from "react-native";

export function StatusTimeline({
  status,
  labels,
}: {
  status: Delivery["status"];
  labels?: Partial<Record<DeliveryStatus, string>>;
}) {
  const steps = buildTimeline(status).map((step) => ({
    ...step,
    label: labels?.[step.key as DeliveryStatus] ?? step.label,
  }));

  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.row}>
          <View style={styles.rail}>
            <View
              style={[
                styles.dot,
                step.done && styles.dotDone,
                step.active && styles.dotActive,
              ]}
            />
            {index < steps.length - 1 ? (
              <View
                style={[styles.line, (step.done || step.active) && styles.lineDone]}
              />
            ) : null}
          </View>
          <Text
            style={[
              styles.label,
              (step.done || step.active) && styles.labelActive,
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  row: { flexDirection: "row", alignItems: "flex-start", minHeight: 36 },
  rail: { width: 18, alignItems: "center" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  dotDone: { backgroundColor: colors.primary },
  dotActive: {
    backgroundColor: colors.primaryGlow,
    width: 12,
    height: 12,
    marginTop: 3,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 22,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  lineDone: { backgroundColor: colors.primarySoft },
  label: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 14,
    color: colors.muted,
    fontSize: 14,
    fontWeight: "500",
  },
  labelActive: { color: colors.dark, fontWeight: "700" },
});
