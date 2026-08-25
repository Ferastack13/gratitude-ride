import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function RateSheet({
  title,
  onSubmit,
  submitting,
}: {
  title: string;
  onSubmit: (rating: number, comment: string) => void;
  submitting?: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment] = useState("");

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>How was this delivery?</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={8}>
            <Ionicons
              name={n <= rating ? "star" : "star-outline"}
              size={34}
              color={n <= rating ? colors.secondaryDark : colors.border}
            />
          </Pressable>
        ))}
      </View>
      <Button
        label="Submit rating"
        loading={submitting}
        onPress={() => onSubmit(rating, comment)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, alignItems: "center", paddingVertical: 4 },
  title: { fontSize: 20, fontWeight: "900", color: colors.dark },
  sub: { color: colors.muted, fontSize: 14 },
  stars: { flexDirection: "row", gap: 8, marginVertical: 6 },
});
