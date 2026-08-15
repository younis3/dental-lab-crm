import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { motion, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

type OtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  invalid?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
};

/**
 * Digit boxes backed by one hidden input, which keeps SMS autofill, paste and
 * backspace behaving natively instead of juggling a ref per box. Boxes always
 * read left-to-right, even in an RTL layout.
 */
export function OtpInput({
  value,
  onChangeText,
  length = 4,
  invalid = false,
  autoFocus = false,
  disabled = false,
  size = 'md',
  accessibilityLabel,
}: OtpInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="none"
      style={styles.wrapper}>
      <View style={styles.row}>
        {Array.from({ length }).map((_, index) => (
          <OtpBox
            key={index}
            digit={value[index] ?? ''}
            active={focused && index === Math.min(value.length, length - 1)}
            filled={index < value.length}
            invalid={invalid}
            size={size}
          />
        ))}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(next) => onChangeText(next.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        editable={!disabled}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
        style={[styles.hiddenInput, { color: theme.color.text }]}
        accessibilityLabel={accessibilityLabel}
      />
    </Pressable>
  );
}

type OtpBoxProps = {
  digit: string;
  active: boolean;
  filled: boolean;
  invalid: boolean;
  size: 'sm' | 'md';
};

function OtpBox({ digit, active, filled, invalid, size }: OtpBoxProps) {
  const theme = useTheme();
  const pop = useSharedValue(0);
  const caret = useSharedValue(0);

  useEffect(() => {
    if (digit) {
      pop.set(withSequence(withSpring(1, motion.springSnappy), withSpring(0, motion.spring)));
    }
  }, [digit, pop]);

  useEffect(() => {
    caret.set(active ? withRepeat(withTiming(1, { duration: 600 }), -1, true) : withTiming(0));
  }, [active, caret]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pop.get() * 0.07 }],
  }));

  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.get() }));

  const borderColor = invalid
    ? theme.color.danger
    : active
      ? theme.color.brand
      : filled
        ? theme.color.borderStrong
        : theme.color.border;

  const compact = size === 'sm';

  return (
    <Animated.View
      style={[
        styles.box,
        {
          height: compact ? 54 : 66,
          borderRadius: compact ? radius.sm : radius.lg,
          borderWidth: compact ? 1 : 1.5,
          borderColor,
          backgroundColor: filled ? theme.color.surface : theme.color.surfaceMuted,
        },
        boxStyle,
      ]}>
      {digit ? (
        <Text variant={compact ? 'heading' : 'title'} ltr>
          {digit}
        </Text>
      ) : active ? (
        <Animated.View style={[styles.caret, { backgroundColor: theme.color.brand }, caretStyle]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  box: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  caret: { width: 2, height: 24, borderRadius: 1 },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});
