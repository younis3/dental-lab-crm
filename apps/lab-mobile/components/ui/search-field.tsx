import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { radius, spacing, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** Accessibility label for the clear button. */
  clearLabel: string;
  style?: StyleProp<ViewStyle>;
};

/** Single-line search box with an inline clear affordance. */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  clearLabel,
  style,
}: SearchFieldProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <View
      style={[
        styles.search,
        row(isRtl),
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
        style,
      ]}>
      <Icon name="search-outline" size={18} color={theme.color.textFaint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.color.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: theme.color.text, textAlign: isRtl ? 'right' : 'left' }]}
      />
      {value.length > 0 ? (
        <PressableScale
          onPress={() => onChangeText('')}
          hitSlop={10}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}>
          <Icon name="close-circle" size={17} color={theme.color.textFaint} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, ...typeScale.body, paddingVertical: 0 },
});
