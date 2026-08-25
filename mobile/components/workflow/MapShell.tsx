import { colors, radii } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Map on top + sheet in normal layout flow (not absolute over the tab bar).
 * This keeps Home / Book / Deliveries / Profile fully tappable.
 */
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
      <View style={styles.mapPane}>
        {map}
        <SafeAreaView
          style={styles.topOverlay}
          edges={["top"]}
          pointerEvents="box-none"
        >
          {top ? <View style={styles.top}>{top}</View> : null}
        </SafeAreaView>
      </View>
      <View style={styles.sheet}>{sheet}</View>
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
  },
  mapPane: {
    flex: 1,
    minHeight: 180,
    position: "relative",
    overflow: "hidden",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
  },
  top: { paddingHorizontal: 16, paddingTop: 8 },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -18,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    maxHeight: "52%",
    zIndex: 2,
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
