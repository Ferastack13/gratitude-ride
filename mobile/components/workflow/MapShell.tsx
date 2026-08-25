import { colors, radii } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Full-bleed map canvas with floating top + bottom sheet overlays (Uber/Bolt style). */
export function MapShell({
  map,
  top,
  sheet,
}: {
  map: ReactNode;
  top?: ReactNode;
  sheet: ReactNode;
}) {
  return (
    <View style={styles.root}>
      {map}
      <SafeAreaView style={styles.overlay} edges={["top"]} pointerEvents="box-none">
        {top ? <View style={styles.top}>{top}</View> : null}
      </SafeAreaView>
      <View style={styles.bottomSafe} pointerEvents="box-none">
        <View style={styles.sheet} pointerEvents="auto">
          {sheet}
        </View>
      </View>
    </View>
  );
}

export function SheetHandle() {
  return <View style={styles.handle} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    // Clip Android elevation so the sheet cannot steal tab-bar taps.
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
  },
  top: { paddingHorizontal: 16, paddingTop: 8 },
  bottomSafe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
});
