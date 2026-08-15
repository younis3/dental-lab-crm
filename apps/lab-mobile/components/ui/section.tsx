import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

type SectionProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
};

export function Section({ title, actionLabel, onAction, children }: SectionProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <View style={styles.section}>
      <View style={[styles.header, row(isRtl)]}>
        <Text variant="subheading">{title}</Text>
        {actionLabel ? (
          <PressableScale
            onPress={onAction}
            scaleTo={0.95}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={[styles.action, row(isRtl)]}>
            <Text variant="caption" tone="brand">
              {actionLabel}
            </Text>
            <Icon name="chevron-forward" size={13} color={theme.color.brand} directional />
          </PressableScale>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  header: { alignItems: 'center', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: 2 },
});
