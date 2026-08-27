import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export type SegmentedOption<T extends string> = {
  key: T;
  label: string;
  icon?: IconName;
};

type SegmentedProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
};

/**
 * Pill switch for two or three mutually exclusive views. The selected segment is
 * a raised surface rather than a colour fill, so it stays legible on both themes.
 */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <View style={[styles.track, row(isRtl), { backgroundColor: theme.color.surfaceMuted }]}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <PressableScale
            key={option.key}
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.key)}
            style={[
              styles.option,
              row(isRtl),
              active
                ? { backgroundColor: theme.color.surfaceRaised, ...elevation(1, theme.scheme) }
                : null,
            ]}>
            {option.icon ? (
              <Icon
                name={option.icon}
                size={15}
                color={active ? theme.color.brand : theme.color.textFaint}
              />
            ) : null}
            <Text
              variant="label"
              numberOfLines={1}
              color={active ? theme.color.text : theme.color.textFaint}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { padding: 4, borderRadius: radius.pill, gap: 4 },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
});
