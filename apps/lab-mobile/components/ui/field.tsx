import { useState } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions, type TextInputProps, type TextStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { motion, radius, spacing, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { LTR_INPUT, row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: IconName;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: TextInputProps['autoComplete'];
  invalid?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: TextInputProps['returnKeyType'];
  size?: 'sm' | 'md';
  /** Keeps typed characters left-to-right, e.g. phone numbers. */
  ltr?: boolean;
  textAlign?: TextStyle['textAlign'];
  toggleLabels?: { show: string; hide: string };
};

export function Field({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  secure = false,
  keyboardType,
  autoComplete,
  invalid = false,
  onSubmitEditing,
  returnKeyType,
  size = 'md',
  ltr = false,
  textAlign,
  toggleLabels,
}: FieldProps) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const focus = useSharedValue(0);

  const compact = size === 'sm';

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.get(),
      [0, 1],
      [invalid ? theme.color.danger : theme.color.border, theme.color.brand]
    ),
    backgroundColor: interpolateColor(
      focus.get(),
      [0, 1],
      [theme.color.surfaceMuted, theme.color.surface]
    ),
  }));

  return (
    <View style={styles.wrapper}>
      <Text variant={compact ? 'caption' : 'label'} tone="muted">
        {label}
      </Text>
      <Animated.View
        style={[
          styles.field,
          row(isRtl),
          {
            height: compact ? 46 : 54,
            paddingHorizontal: compact ? spacing.md : spacing.lg,
            borderRadius: compact ? radius.sm : radius.lg,
            borderWidth: compact ? 1 : 1.5,
          },
          containerStyle,
        ]}>
        <Icon
          name={icon}
          size={compact ? 16 : 18}
          color={focused ? theme.color.brand : theme.color.textFaint}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.color.textFaint}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize="none"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => {
            setFocused(true);
            focus.set(withTiming(1, { duration: motion.duration.fast }));
          }}
          onBlur={() => {
            setFocused(false);
            focus.set(withTiming(0, { duration: motion.duration.fast }));
          }}
          style={[
            styles.input,
            compact ? typeScale.body : typeScale.bodyMedium,
            { color: theme.color.text },
            ltr ? LTR_INPUT : { textAlign: isRtl ? 'right' : 'left' },
            textAlign ? { textAlign } : null,
          ]}
        />
        {secure ? (
          <PressableScale
            onPress={() => setHidden((previous) => !previous)}
            hitSlop={10}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel={hidden ? toggleLabels?.show : toggleLabels?.hide}>
            <Icon
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={compact ? 16 : 18}
              color={theme.color.textFaint}
            />
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: { alignItems: 'center', gap: spacing.md },
  input: { flex: 1, paddingVertical: 0 },
});
