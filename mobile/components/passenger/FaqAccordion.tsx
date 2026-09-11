import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FaqItem = { q: string; a: string };

/** Expandable FAQ rows — one open at a time for scanability. */
export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === index ? null : index));
  };

  return (
    <View>
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <View key={item.q}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              onPress={() => toggle(index)}
              style={({ pressed }) => [
                styles.row,
                pressed && { opacity: 0.75 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text style={styles.q}>{item.q}</Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </Pressable>
            {expanded ? <Text style={styles.a}>{item.a}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  q: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.dark,
    lineHeight: 21,
  },
  a: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.muted,
    lineHeight: 21,
    paddingBottom: 14,
    paddingRight: 28,
  },
});
