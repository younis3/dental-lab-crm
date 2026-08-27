import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

/** Name column: the label plus a quieter second line for context. */
export function PrimaryCell({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.cell}>
      <Text variant="bodyMedium" numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" tone="faint" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function TextCell({ value }: { value: string }) {
  return (
    <Text variant="body" tone="muted" numberOfLines={1}>
      {value}
    </Text>
  );
}

/** Numeric column — kept left-to-right so digits never reorder in RTL. */
export function NumberCell({ value, strong = false }: { value: string | number; strong?: boolean }) {
  return (
    <Text variant={strong ? 'bodyMedium' : 'body'} tone={strong ? 'default' : 'muted'} numberOfLines={1} ltr>
      {value}
    </Text>
  );
}

/**
 * Trailing action column. Tinted rather than raised, so a button on every row
 * stays readable on the striped ones without crowding the table.
 */
export function EditCell({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.action, { backgroundColor: theme.color.brandSoft }]}>
      <Icon name="create-outline" size={16} color={theme.color.brand} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  cell: { gap: 1 },
  action: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
