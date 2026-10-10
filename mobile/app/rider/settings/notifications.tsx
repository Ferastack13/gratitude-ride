import {
  SectionLabel,
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { Linking, Text } from "react-native";

export default function RiderNotificationsScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;
  const c = settings.communication;
  const n = settings.notifications;

  return (
    <SettingsShell title="Job alerts" palette={palette} settings={settings}>
      <SectionLabel label="Channels" palette={palette} />
      <ToggleRow
        title="Push notifications"
        subtitle="New offers and trip status on this phone."
        value={c.push}
        palette={palette}
        onValueChange={(v) => update({ communication: { push: v } })}
      />
      <ToggleRow
        title="WhatsApp"
        subtitle="Support and trip help."
        value={c.whatsapp}
        palette={palette}
        onValueChange={(v) => update({ communication: { whatsapp: v } })}
      />
      <ToggleRow
        title="SMS"
        subtitle="Backup texts if data is slow."
        value={c.sms}
        palette={palette}
        onValueChange={(v) => update({ communication: { sms: v } })}
      />
      <ToggleRow
        title="In-app Inbox"
        subtitle="Alerts under the Inbox tab."
        value={c.inApp}
        palette={palette}
        last
        onValueChange={(v) => update({ communication: { inApp: v } })}
      />

      <SectionLabel label="What you hear about" palette={palette} />
      <ToggleRow
        title="New job offers"
        subtitle="When you’re online near a request."
        value={n.offers}
        palette={palette}
        onValueChange={(v) => update({ notifications: { offers: v } })}
      />
      <ToggleRow
        title="Active trip updates"
        subtitle="Pickup, in transit, and delivery."
        value={n.trips}
        palette={palette}
        last
        onValueChange={(v) => update({ notifications: { trips: v } })}
      />

      <Text
        onPress={() => Linking.openSettings()}
        style={{
          color: palette.accent,
          fontWeight: "700",
          marginTop: 18,
          fontSize: 15,
        }}
      >
        Open phone notification settings
      </Text>
    </SettingsShell>
  );
}
