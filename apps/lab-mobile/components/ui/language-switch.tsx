import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { LANGS } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { setLanguage, useLanguage } from '@/store/language-store';

type LanguageSwitchProps = {
  /** Compact shows language codes only, for tight spots like the login header. */
  compact?: boolean;
};

export function LanguageSwitch({ compact = false }: LanguageSwitchProps) {
  const theme = useTheme();
  const { lang, isRtl } = useLanguage();

  return (
    <View
      style={[
        styles.track,
        row(isRtl),
        {
          backgroundColor: theme.color.surfaceMuted,
          borderColor: theme.color.border,
        },
        compact ? styles.trackCompact : styles.trackFull,
      ]}>
      {LANGS.map((option) => {
        const active = lang === option.key;
        return (
          <PressableScale
            key={option.key}
            scaleTo={0.93}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            onPress={() => setLanguage(option.key)}
            style={[
              styles.option,
              compact ? styles.optionCompact : styles.optionFull,
              active
                ? { backgroundColor: theme.color.surface, ...elevation(1, theme.scheme) }
                : null,
            ]}>
            <Text
              variant="caption"
              color={active ? theme.color.brand : theme.color.textFaint}
              numberOfLines={1}
              style={styles.label}>
              {compact ? option.short : option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  trackFull: { alignSelf: 'stretch' },
  trackCompact: { alignSelf: 'center' },
  option: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  optionFull: { flex: 1, paddingVertical: spacing.sm },
  optionCompact: { paddingVertical: 5, paddingHorizontal: spacing.md, minWidth: 38 },
  label: { textAlign: 'center' },
});
