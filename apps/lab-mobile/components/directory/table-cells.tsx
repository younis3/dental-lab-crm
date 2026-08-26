import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';

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

const styles = StyleSheet.create({
  cell: { gap: 1 },
});
