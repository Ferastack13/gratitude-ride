import { useColors } from "@/context/theme";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  const safe = { flex: 1 as const, backgroundColor: colors.surface };
  const body = { padding: 18, gap: 14, paddingBottom: 48 };

  if (!scroll) {
    return (
      <SafeAreaView style={safe} edges={["top"]}>
        <View style={body}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={body}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
