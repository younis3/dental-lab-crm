import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  hint?: string;
};

export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.empty,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <Icon name={icon} size={26} color={theme.color.textFaint} />
      <Text variant="subheading" style={styles.centered}>
        {title}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted" style={styles.centered}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  centered: { textAlign: 'center' },
});
