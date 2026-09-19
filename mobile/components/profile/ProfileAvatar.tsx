import { useColors } from "@/context/theme";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function ProfileAvatar({
  uri,
  name,
  size = 64,
  onPress,
  badge,
}: {
  uri?: string | null;
  name: string;
  size?: number;
  onPress?: () => void;
  badge?: boolean;
}) {
  const colors = useColors();
  const letter = (name || "G").charAt(0).toUpperCase();
  const body = (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primarySoft,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text
          style={{
            color: colors.primary,
            fontWeight: "700",
            fontSize: Math.round(size * 0.38),
          }}
        >
          {letter}
        </Text>
      )}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ position: "relative" }, pressed && { opacity: 0.88 }]}
      accessibilityLabel="Profile photo"
    >
      {body}
      {badge ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary, borderColor: colors.surface },
          ]}
        >
          <Text style={styles.badgeText}>+</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginTop: -1,
  },
});
