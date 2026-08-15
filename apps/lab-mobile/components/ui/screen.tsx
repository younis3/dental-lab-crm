import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DrawerButton } from '@/components/navigation/drawer';
import { TAB_BAR_CLEARANCE } from '@/components/navigation/floating-tab-bar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Text, type TextProps } from '@/components/ui/text';
import { spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

type ScreenProps = {
  children: ReactNode;
  header?: ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  /** Leaves room for the floating tab bar. */
  withTabBarInset?: boolean;
};

export function Screen({
  children,
  header,
  scrollable = true,
  refreshing,
  onRefresh,
  contentStyle,
  withTabBarInset = true,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingBottom: withTabBarInset ? TAB_BAR_CLEARANCE + insets.bottom : spacing['2xl'],
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.color.background }]}>
      <AuroraBackground />
      <View style={{ paddingTop: insets.top + spacing.sm }}>{header}</View>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, padding, contentStyle]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={theme.color.brand}
                colors={[theme.color.brand]}
                progressBackgroundColor={theme.color.surface}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  showMenu?: boolean;
  titleVariant?: TextProps['variant'];
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  showMenu = true,
  titleVariant = 'heading',
}: ScreenHeaderProps) {
  const { isRtl } = useLanguage();

  return (
    <Animated.View entering={FadeInDown.duration(420)} style={[styles.header, row(isRtl)]}>
      {showMenu ? <DrawerButton /> : null}
      <View style={styles.flex}>
        <Text variant={titleVariant} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  header: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
});
