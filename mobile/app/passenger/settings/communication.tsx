import {
  SectionLabel,
  SettingsShell,
  ToggleRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { Linking, Text } from "react-native";

export default function CommunicationScreen() {
  const { settings, update, palette, ready } = useSettingsState();
  if (!ready || !settings) return null;
  const c = settings.communication;
  const n = settings.notifications;

  return (
    <SettingsShell title="Communication" palette={palette} settings={settings}>
      <SectionLabel label="Contact methods" palette={palette} />
      <ToggleRow
        title="Push notifications"
        subtitle="Trip status on this phone."
        value={c.push}
        palette={palette}
        onValueChange={(v) => update({ communication: { push: v } })}
      />
      <ToggleRow
        title="WhatsApp"
        subtitle="Family invites and trip help."
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
        title="Email"
        subtitle="Receipts and account mail."
        value={c.email}
        palette={palette}
        onValueChange={(v) => update({ communication: { email: v } })}
      />
      <ToggleRow
        title="In-app Inbox"
        subtitle="Offers and family updates in Account → Inbox."
        value={c.inApp}
        palette={palette}
        last
        onValueChange={(v) => update({ communication: { inApp: v } })}
      />

      <SectionLabel label="Notification types" palette={palette} />
      <ToggleRow
        title="Trip updates"
        value={n.trips}
        palette={palette}
        onValueChange={(v) => update({ notifications: { trips: v } })}
      />
      <ToggleRow
        title="Offers"
        value={n.offers}
        palette={palette}
        onValueChange={(v) => update({ notifications: { offers: v } })}
      />
      <ToggleRow
        title="Family"
        value={n.family}
        palette={palette}
        onValueChange={(v) => update({ notifications: { family: v } })}
      />
      <ToggleRow
        title="Commute alerts"
        value={n.commute}
        palette={palette}
        last
        onValueChange={(v) => update({ notifications: { commute: v } })}
      />
      <Text
        onPress={() => Linking.openSettings()}
        style={{ color: palette.accent, fontWeight: "700", marginTop: 18, fontSize: 15 }}
      >
        Open phone notification settings
      </Text>
    </SettingsShell>
  );
}
