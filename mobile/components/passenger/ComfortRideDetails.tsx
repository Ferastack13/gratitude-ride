import { FaqAccordion } from "@/components/passenger/FaqAccordion";
import { colors, radii, typography } from "@/constants/theme";
import { COMFORT_RIDE_CONTENT as C } from "@/lib/comfort-ride-content";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

const WARM = "#8B7355";
const WARM_SOFT = "#F4F0E6";

/** Full Comfort Ride details body — no map, no booking controls. */
export function ComfortRideDetails() {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Ionicons name="star" size={12} color={WARM} />
        <Text style={styles.badgeText}>{C.badge}</Text>
      </View>
      <Text style={styles.headline}>{C.headline}</Text>
      <Text style={styles.tagline}>{C.tagline}</Text>

      <View style={styles.highlights}>
        {C.highlights.map((h) => (
          <View key={h.label} style={styles.highlightItem}>
            <View style={styles.highlightIcon}>
              <Ionicons name={h.icon} size={18} color={WARM} />
            </View>
            <Text style={styles.highlightLabel}>{h.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>What is Comfort?</Text>
      <Text style={styles.body}>{C.whatIs}</Text>
      <Text style={[styles.body, { marginBottom: 20 }]}>{C.whatIsExtra}</Text>

      <Text style={styles.section}>What’s included</Text>
      <View style={styles.block}>
        {C.included.map((item, i) => (
          <View key={item.title}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.includeRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.includeTitle}>{item.title}</Text>
                <Text style={styles.includeDetail}>{item.detail}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Why choose Comfort?</Text>
      <Text style={styles.body}>{C.whyChoose}</Text>
      <View style={styles.whyList}>
        {C.whyPoints.map((point) => (
          <View key={point} style={styles.whyRow}>
            <View style={styles.whyDot} />
            <Text style={styles.whyText}>{point}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Best for</Text>
      <View style={styles.chips}>
        {C.bestFor.map((label) => (
          <View key={label} style={styles.chip}>
            <Text style={styles.chipText}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Ride experience</Text>
      <Text style={styles.body}>{C.experience}</Text>

      <Text style={styles.section}>Service details</Text>
      <View style={styles.block}>
        {C.specs.map((row, i) => (
          <View key={row.label}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{row.label}</Text>
              <Text style={styles.specValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Important information</Text>
      <View style={styles.block}>
        {C.infoRows.map((row, i) => (
          <View key={row.label}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.section}>FAQ</Text>
      <View style={styles.block}>
        <FaqAccordion items={C.faq} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 8 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: WARM_SOFT,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: WARM,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.muted,
    lineHeight: 24,
    marginBottom: 22,
  },
  highlights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  highlightItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: WARM_SOFT,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: colors.dark,
  },
  section: {
    ...typography.section,
    marginTop: 8,
    marginBottom: 12,
  },
  block: {
    marginBottom: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 32,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  includeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 3,
  },
  includeDetail: {
    ...typography.supporting,
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.muted,
    lineHeight: 23,
    marginBottom: 14,
  },
  whyList: { gap: 10, marginBottom: 20 },
  whyRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  whyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WARM,
    marginTop: 7,
  },
  whyText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: colors.dark,
    lineHeight: 22,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: WARM_SOFT,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.dark,
  },
  infoRow: { paddingVertical: 12, gap: 4 },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: WARM,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.dark,
    lineHeight: 20,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  specLabel: { fontSize: 14, fontWeight: "400", color: colors.muted },
  specValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.dark,
    flexShrink: 1,
    textAlign: "right",
  },
});
