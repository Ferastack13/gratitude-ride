import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

const logoSource = require("../../assets/brand/gratitude-ride-logo.jpg");

type Props = {
  /** Overall height of the logo image */
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Gratitude Ride brand mark — login, splash, and home headers.
 */
export function BrandLogo({ size = 120, style }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={logoSource}
        style={{ width: size, height: size, borderRadius: size * 0.18 }}
        resizeMode="cover"
        accessibilityLabel="Gratitude Ride"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
