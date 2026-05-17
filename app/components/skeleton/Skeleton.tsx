import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

type BoneProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBone({
  width = '100%',
  height = 14,
  borderRadius = 8,
  style,
}: BoneProps) {
  const { theme } = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.75]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonRow({
  iconSize = 44,
  lines = 2,
  style,
}: {
  iconSize?: number;
  lines?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[skeletonStyles.row, style]}>
      <SkeletonBone width={iconSize} height={iconSize} borderRadius={iconSize / 2} />
      <View style={skeletonStyles.rowText}>
        <SkeletonBone width="72%" height={14} />
        {lines > 1 && <SkeletonBone width="48%" height={12} style={{ marginTop: 8 }} />}
        {lines > 2 && <SkeletonBone width="36%" height={10} style={{ marginTop: 6 }} />}
      </View>
    </View>
  );
}

export function SkeletonScreen({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[skeletonStyles.screen, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView
        contentContainerStyle={[
          padded && skeletonStyles.scrollPad,
          { backgroundColor: theme.surface },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function HomeScreenSkeleton() {
  return (
    <SkeletonScreen>
      <View style={skeletonStyles.headerRow}>
        <View style={skeletonStyles.headerLeft}>
          <SkeletonBone width={52} height={52} borderRadius={26} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <SkeletonBone width={90} height={12} />
            <SkeletonBone width={140} height={18} style={{ marginTop: 8 }} />
          </View>
        </View>
        <SkeletonBone width={44} height={44} borderRadius={22} />
      </View>

      <SkeletonBone height={160} borderRadius={16} style={{ marginTop: 20 }} />
      <SkeletonBone width={180} height={16} style={{ marginTop: 28 }} />

      <View style={skeletonStyles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBone key={i} height={72} borderRadius={12} style={skeletonStyles.gridItem} />
        ))}
      </View>

      <SkeletonBone width={160} height={16} style={{ marginTop: 24 }} />
      <View style={[skeletonStyles.card, { marginTop: 12 }]}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonRow key={i} style={i > 0 ? { marginTop: 16 } : undefined} />
        ))}
      </View>
    </SkeletonScreen>
  );
}

export function DashboardScreenSkeleton() {
  return (
    <SkeletonScreen>
      <View style={skeletonStyles.headerRow}>
        <View style={{ flex: 1 }}>
          <SkeletonBone width={120} height={22} />
          <SkeletonBone width={160} height={14} style={{ marginTop: 8 }} />
        </View>
        <SkeletonBone width={44} height={44} borderRadius={22} />
      </View>

      <View style={[skeletonStyles.card, { marginTop: 20, flexDirection: 'row', gap: 12 }]}>
        <SkeletonBone width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1 }}>
          <SkeletonBone width="60%" height={16} />
          <SkeletonBone width="90%" height={12} style={{ marginTop: 8 }} />
          <SkeletonBone width="100%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>

      <View style={skeletonStyles.periodRow}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBone key={i} height={36} borderRadius={18} style={{ flex: 1 }} />
        ))}
      </View>

      <View style={[skeletonStyles.card, { marginTop: 16 }]}>
        <View style={skeletonStyles.summaryRow}>
          <SkeletonBone width="28%" height={48} />
          <SkeletonBone width="28%" height={48} />
          <SkeletonBone width="28%" height={48} />
        </View>
      </View>

      <SkeletonBone height={200} borderRadius={16} style={{ marginTop: 20 }} />
      <View style={[skeletonStyles.card, { marginTop: 16 }]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonRow key={i} style={i > 0 ? { marginTop: 14 } : undefined} />
        ))}
      </View>
    </SkeletonScreen>
  );
}

export function TransactionsScreenSkeleton() {
  return (
    <SkeletonScreen padded={false}>
      <View style={[skeletonStyles.scrollPad, { backgroundColor: 'transparent' }]}>
        <View style={skeletonStyles.headerRow}>
          <View style={{ flex: 1 }}>
            <SkeletonBone width={140} height={22} />
            <SkeletonBone width={200} height={14} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBone width={44} height={44} borderRadius={22} />
        </View>
        <SkeletonBone height={44} borderRadius={12} style={{ marginTop: 16 }} />
        <View style={skeletonStyles.actionRow}>
          {[0, 1, 2].map((i) => (
            <SkeletonBone key={i} height={40} borderRadius={10} style={{ flex: 1 }} />
          ))}
        </View>
      </View>
      <View style={[skeletonStyles.listCard, { marginHorizontal: 20, marginTop: 8 }]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonRow
            key={i}
            style={[
              { paddingHorizontal: 16 },
              i === 0 ? { paddingTop: 16 } : { marginTop: 16 },
            ]}
          />
        ))}
      </View>
    </SkeletonScreen>
  );
}

export function ListScreenSkeleton({ withSearch = true }: { withSearch?: boolean }) {
  return (
    <SkeletonScreen>
      <View style={skeletonStyles.headerRow}>
        <SkeletonBone width={40} height={40} borderRadius={20} />
        <SkeletonBone width={140} height={20} style={{ flex: 1, marginHorizontal: 12 }} />
        <SkeletonBone width={40} height={40} borderRadius={20} />
      </View>
      {withSearch && <SkeletonBone height={44} borderRadius={12} style={{ marginTop: 16 }} />}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[skeletonStyles.listArticle, i === 0 && { marginTop: 20 }]}>
          <SkeletonBone width="85%" height={18} />
          <SkeletonBone width="100%" height={12} style={{ marginTop: 10 }} />
          <SkeletonBone width="70%" height={12} style={{ marginTop: 6 }} />
          <View style={skeletonStyles.tagRow}>
            <SkeletonBone width={56} height={24} borderRadius={12} />
            <SkeletonBone width={48} height={24} borderRadius={12} />
          </View>
        </View>
      ))}
    </SkeletonScreen>
  );
}

export function ProfileFormSkeleton() {
  return (
    <SkeletonScreen>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <SkeletonBone width={96} height={96} borderRadius={48} />
        <SkeletonBone width={120} height={16} style={{ marginTop: 16 }} />
      </View>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <SkeletonBone width={80} height={12} />
          <SkeletonBone height={48} borderRadius={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </SkeletonScreen>
  );
}

export function CategoriesScreenSkeleton() {
  return (
    <SkeletonScreen>
      <View style={skeletonStyles.headerRow}>
        <SkeletonBone width={40} height={40} borderRadius={20} />
        <SkeletonBone width={160} height={20} style={{ flex: 1, marginHorizontal: 12 }} />
        <SkeletonBone width={40} height={40} borderRadius={20} />
      </View>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[skeletonStyles.categoryCard, i === 0 && { marginTop: 20 }]}>
          <SkeletonBone width={44} height={44} borderRadius={12} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBone width="50%" height={16} />
            <SkeletonBone width="30%" height={12} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBone width={32} height={32} borderRadius={8} />
        </View>
      ))}
    </SkeletonScreen>
  );
}

export function ProfileScreenSkeleton() {
  return (
    <SkeletonScreen>
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <SkeletonBone width={84} height={84} borderRadius={42} />
        <SkeletonBone width={150} height={20} style={{ marginTop: 14 }} />
        <SkeletonBone width={190} height={14} style={{ marginTop: 8 }} />
        <SkeletonBone width={120} height={12} style={{ marginTop: 6 }} />
      </View>
      {[0, 1, 2].map((section) => (
        <View key={section}>
          <SkeletonBone width={110} height={14} style={{ marginTop: section === 0 ? 0 : 18, marginBottom: 10 }} />
          <View style={skeletonStyles.card}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonRow key={i} lines={1} style={i > 0 ? { marginTop: 12 } : undefined} />
            ))}
          </View>
        </View>
      ))}
    </SkeletonScreen>
  );
}

export function SettingsListSkeleton({ rows = 4 }: { rows?: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      {[...Array(rows)].map((_, i) => (
        <View key={i} style={[skeletonStyles.card, { marginBottom: 12 }]}>
          <SkeletonBone width="40%" height={14} />
          <SkeletonBone width="70%" height={12} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  );
}

export function AppLoadingSkeleton() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[skeletonStyles.screen, { backgroundColor: theme.background }]}>
      <View style={skeletonStyles.appLoading}>
        <SkeletonBone width={64} height={64} borderRadius={16} />
        <SkeletonBone width={160} height={20} style={{ marginTop: 24 }} />
        <SkeletonBone width={120} height={14} style={{ marginTop: 12 }} />
      </View>
    </SafeAreaView>
  );
}

const skeletonStyles = StyleSheet.create({
  screen: { flex: 1 },
  scrollPad: { padding: 20, paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  gridItem: { width: '47%' },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: 12 },
  periodRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  listCard: {
    borderRadius: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  listArticle: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  appLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
});
