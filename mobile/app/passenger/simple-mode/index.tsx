import { colors, radii, shadows } from "@/constants/theme";
import {
  SENIOR_SUPPORT_TEL,
  SENIOR_SUPPORT_WHATSAPP,
  getAppSettings,
  setAppSettings,
  type AppSettings,
} from "@/lib/settings";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HERO = require("../../assets/images/simple-mode-hero.png");

export default function SimpleModeScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const load = useCallback(async () => {
    setSettings(await getAppSettings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load])
  );

  const update = async (patch: Parameters<typeof setAppSettings>[0]) => {
    const next = await setAppSettings(patch);
    setSettings(next);
    return next;
  };

  const onToggleSimple = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Turn on Simple Mode?",
        "Home and Account will use larger type, a bigger Where to? button, and a dedicated Call support button.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Turn on",
            onPress: async () => {
              await update({
                simpleMode: true,
                fontScale:
                  settings?.fontScale === "default" ? "large" : settings?.fontScale,
              });
            },
          },
        ]
      );
      return;
    }
    update({ simpleMode: false });
  };

  const onToggleSenior = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Senior identification",
        "Drivers will see that you may need extra time to board. This is added to your trip notes.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => update({ seniorIdentification: true }),
          },
        ]
      );
      return;
    }
    update({ seniorIdentification: false });
  };

  if (!settings) return <View style={[styles.root, { paddingTop: insets.top }]} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <View style={styles.heroWrap}>
          <Image source={HERO} style={styles.hero} />
          <Pressable
            style={[styles.back, { top: insets.top + 8 }]}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.dark} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Simple Mode</Text>
          <Text style={styles.lead}>
            A simpler version of the app made for older adults, so you can enjoy
            easy trip booking, larger text and dedicated phone support whenever
            you need it.
          </Text>

          <View style={styles.card}>
            <Text style={styles.toggleTitle}>
              Turn on a simplified version of the app
            </Text>
            <Switch
              value={settings.simpleMode}
              onValueChange={onToggleSimple}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <Text style={styles.section}>Senior identification</Text>
          <Text style={styles.sectionLead}>
            Let drivers know you’re a senior and may need extra time to board.
          </Text>
          <View style={styles.card}>
            <Text style={styles.toggleTitle}>I’m a senior</Text>
            <Switch
              value={settings.seniorIdentification}
              onValueChange={onToggleSenior}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <Pressable
            style={styles.support}
            onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
          >
            <Ionicons name="call" size={20} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Call or chat support</Text>
              <Text style={styles.supportSub}>Dedicated Simple Mode help line</Text>
            </View>
            <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(SENIOR_SUPPORT_TEL)}
            style={styles.phoneLink}
          >
            <Text style={styles.phoneLinkText}>Call +234 800 000 0000</Text>
          </Pressable>

          <Text style={styles.section}>Learn more</Text>
          <LearnRow
            title="Simple Mode Terms of Use"
            onPress={() => router.push("/passenger/simple-mode/terms" as never)}
          />
          <LearnRow
            title="Gratitude for Seniors FAQ"
            onPress={() => router.push("/passenger/simple-mode/faq" as never)}
          />
          <LearnRow
            title="Access accessibility tools"
            last
            onPress={() =>
              router.push("/passenger/settings/accessibility" as never)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

function LearnRow({
  title,
  onPress,
  last,
}: {
  title: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.learn, last && { borderBottomWidth: 0 }]}
    >
      <Text style={styles.learnTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  heroWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceAlt,
  },
  hero: { width: "100%", height: "100%" },
  back: {
    position: "absolute",
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(247,244,237,0.94)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    marginBottom: 18,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 8,
  },
  toggleTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    lineHeight: 22,
    paddingRight: 8,
  },
  section: {
    marginTop: 22,
    marginBottom: 6,
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
  },
  sectionLead: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 12,
  },
  support: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.soft,
  },
  supportTitle: { color: colors.white, fontWeight: "700", fontSize: 16 },
  supportSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  phoneLink: { paddingVertical: 12, alignItems: "center" },
  phoneLinkText: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  learn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  learnTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.dark },
});
