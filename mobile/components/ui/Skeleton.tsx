import { useColors } from "@/context/theme";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

type BoneProps = {
  /** Fraction of screen width (0–1), or absolute px when `px` is set. */
  widthFrac?: number;
  widthPx?: number;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/** Soft pulse block used to build loading placeholders. */
export function SkeletonBone({
  widthFrac = 1,
  widthPx,
  height = 14,
  radius = 8,
  style,
}: BoneProps) {
  const colors = useColors();
  const { width: winW } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0.35)).current;
  const width = widthPx ?? Math.max(24, Math.round((winW - 56) * widthFrac));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

function SkeletonCardShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.white,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Inbox-shaped notification card placeholders. */
export function NotificationSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardShell key={`notif-sk-${i}`}>
          <View style={styles.rowBetween}>
            <SkeletonBone widthFrac={0.55} height={16} radius={8} />
            <SkeletonBone widthPx={10} height={10} radius={5} />
          </View>
          <SkeletonBone widthFrac={0.9} height={12} radius={6} />
          <SkeletonBone widthFrac={0.72} height={12} radius={6} />
          <SkeletonBone
            widthFrac={0.3}
            height={10}
            radius={6}
            style={{ marginTop: 4 }}
          />
        </SkeletonCardShell>
      ))}
    </View>
  );
}

/** Discover nearby-request job cards. */
export function JobCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardShell key={`job-sk-${i}`}>
          <View style={styles.rowBetween}>
            <SkeletonBone widthFrac={0.35} height={14} radius={7} />
            <SkeletonBone widthFrac={0.22} height={14} radius={7} />
          </View>
          <SkeletonBone widthFrac={0.85} height={13} radius={6} />
          <SkeletonBone widthFrac={0.65} height={12} radius={6} />
          <View style={[styles.row, { marginTop: 4 }]}>
            <SkeletonBone widthPx={64} height={22} radius={11} />
            <SkeletonBone widthPx={72} height={22} radius={11} />
          </View>
        </SkeletonCardShell>
      ))}
    </View>
  );
}

/** Menu tab: avatar header + tiles + list rows. */
export function MenuSkeleton() {
  return (
    <View style={styles.stack}>
      <View style={styles.menuHeader}>
        <SkeletonBone widthPx={72} height={72} radius={36} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBone widthFrac={0.45} height={20} radius={8} />
          <SkeletonBone widthFrac={0.35} height={12} radius={6} />
          <View style={styles.row}>
            <SkeletonBone widthPx={70} height={24} radius={12} />
            <SkeletonBone widthPx={88} height={24} radius={12} />
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCardShell key={`tile-sk-${i}`} style={styles.tile}>
            <SkeletonBone widthPx={22} height={22} radius={8} />
            <SkeletonBone widthFrac={0.5} height={12} radius={6} />
          </SkeletonCardShell>
        ))}
      </View>

      <SkeletonCardShell>
        <SkeletonBone widthFrac={0.35} height={12} radius={6} />
        <SkeletonBone widthFrac={0.5} height={26} radius={8} />
        <SkeletonBone widthFrac={0.6} height={12} radius={6} />
      </SkeletonCardShell>

      <ListRowSkeletonList count={5} />
      <ListRowSkeletonList count={3} />
    </View>
  );
}

/** Compact list-row cards (Menu / Settings). */
export function ListRowSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <SkeletonCardShell style={{ paddingVertical: 6, gap: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={`row-sk-${i}`} style={styles.listRow}>
          <SkeletonBone widthPx={28} height={28} radius={14} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonBone widthFrac={0.4} height={13} radius={6} />
            <SkeletonBone widthFrac={0.55} height={11} radius={6} />
          </View>
          <SkeletonBone widthPx={12} height={12} radius={4} />
        </View>
      ))}
    </SkeletonCardShell>
  );
}

/** Earnings: period cards + trip history. */
export function EarningsSkeleton() {
  return (
    <View style={styles.stack}>
      <View style={styles.periodRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCardShell key={`period-sk-${i}`} style={styles.periodCard}>
            <SkeletonBone widthFrac={0.5} height={11} radius={6} />
            <SkeletonBone widthFrac={0.7} height={20} radius={8} />
          </SkeletonCardShell>
        ))}
      </View>
      <SkeletonCardShell>
        <SkeletonBone widthFrac={0.4} height={12} radius={6} />
        <SkeletonBone widthFrac={0.55} height={24} radius={8} />
        <SkeletonBone widthFrac={0.7} height={12} radius={6} />
      </SkeletonCardShell>
      <JobCardSkeletonList count={4} />
    </View>
  );
}

/** Vehicle / payouts / edit-profile form fields. */
export function FormCardSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <View style={styles.stack}>
      <SkeletonCardShell>
        <SkeletonBone widthFrac={0.3} height={12} radius={6} />
        <SkeletonBone widthFrac={0.7} height={18} radius={8} />
        <SkeletonBone widthFrac={0.9} height={12} radius={6} />
      </SkeletonCardShell>
      {Array.from({ length: fields }).map((_, i) => (
        <View key={`field-sk-${i}`} style={{ gap: 8 }}>
          <SkeletonBone widthFrac={0.28} height={12} radius={6} />
          <SkeletonBone widthFrac={1} height={48} radius={14} />
        </View>
      ))}
      <SkeletonBone widthFrac={1} height={50} radius={14} />
    </View>
  );
}

/** Home bottom sheet offer / status card. */
export function HomeSheetSkeleton() {
  return (
    <SkeletonCardShell style={{ marginTop: 4 }}>
      <SkeletonBone widthFrac={0.45} height={16} radius={8} />
      <SkeletonBone widthFrac={0.85} height={12} radius={6} />
      <SkeletonBone widthFrac={0.65} height={12} radius={6} />
    </SkeletonCardShell>
  );
}

/** Active trip screen: map block + action cards. */
export function TripSkeleton() {
  return (
    <View style={[styles.stack, { padding: 18 }]}>
      <SkeletonBone widthFrac={1} height={220} radius={18} />
      <SkeletonCardShell>
        <SkeletonBone widthFrac={0.5} height={16} radius={8} />
        <SkeletonBone widthFrac={0.8} height={12} radius={6} />
        <SkeletonBone widthFrac={0.7} height={12} radius={6} />
      </SkeletonCardShell>
      <SkeletonCardShell>
        <View style={styles.rowBetween}>
          <SkeletonBone widthFrac={0.4} height={14} radius={7} />
          <SkeletonBone widthPx={64} height={28} radius={14} />
        </View>
        <SkeletonBone widthFrac={1} height={52} radius={14} />
      </SkeletonCardShell>
    </View>
  );
}

/** Settings screens while preferences hydrate. */
export function SettingsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <View style={[styles.stack, { paddingHorizontal: 16, paddingTop: 8 }]}>
      <SkeletonBone widthFrac={0.35} height={28} radius={8} />
      <ListRowSkeletonList count={Math.min(3, rows)} />
      <ListRowSkeletonList count={Math.max(2, rows - 3)} />
    </View>
  );
}

/** Generic pulsing card stack for any driver section. */
export function CardSkeletonList({
  count = 3,
  lines = 3,
}: {
  count?: number;
  lines?: number;
}) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardShell key={`card-sk-${i}`}>
          <SkeletonBone widthFrac={0.5} height={15} radius={8} />
          {Array.from({ length: lines - 1 }).map((__, j) => (
            <SkeletonBone
              key={`line-${j}`}
              widthFrac={j === lines - 2 ? 0.65 : 0.88}
              height={12}
              radius={6}
            />
          ))}
        </SkeletonCardShell>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 24, width: "100%" },
  stack: { gap: 12, width: "100%" },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "47%",
    flexGrow: 1,
    minHeight: 78,
    justifyContent: "center",
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
  },
  periodCard: {
    flex: 1,
    padding: 12,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
});
