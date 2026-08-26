import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Keyboard, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { elevation, motion, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

/** How far the sheet has to be dragged down before it dismisses. */
const DISMISS_AFTER = 110;
const FLING_VELOCITY = 900;
/** Used for the very first frame, before the sheet has been measured. */
const FALLBACK_TRAVEL = 520;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Action row pinned below the scrollable body. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Modal sheet with a grab handle that drags to dismiss, a scrollable body and a
 * sticky footer that rides above the soft keyboard.
 */
export function BottomSheet({ visible, onClose, title, footer, children }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRtl, ui } = useLanguage();

  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [keyboardInset, setKeyboardInset] = useState(0);

  // Mounting during render rather than in an effect means the first open frame
  // already carries the content, so nothing flashes before it slides in.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      dragY.set(0);
      progress.set(withSpring(1, motion.springSoft));
      return;
    }
    if (!mounted) return;
    progress.set(
      withTiming(0, { duration: motion.duration.base }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      })
    );
  }, [dragY, mounted, progress, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardInset(0);
      return;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      setKeyboardInset(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [visible]);

  const travel = sheetHeight || FALLBACK_TRAVEL;

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [travel, 0]) + dragY.get() }],
  }));

  // Only the header drags, so the gesture never fights the scrollable body.
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          dragY.set(Math.max(0, event.translationY));
        })
        .onEnd((event) => {
          if (event.translationY > DISMISS_AFTER || event.velocityY > FLING_VELOCITY) {
            runOnJS(onClose)();
            return;
          }
          dragY.set(withSpring(0, motion.springSoft));
        }),
    [dragY, onClose]
  );

  if (!mounted) return null;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      {/* Gestures inside a native modal need their own root view. */}
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ui.actionClose}
            onPress={onClose}
            style={[StyleSheet.absoluteFill, { backgroundColor: theme.color.scrim }]}
          />
        </Animated.View>

        <View style={[styles.keyboardView, { paddingBottom: keyboardInset }]}>
          <Animated.View
            onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
            style={[
              styles.sheet,
              { backgroundColor: theme.color.surface, borderColor: theme.color.border },
              elevation(3, theme.scheme),
              sheetStyle,
            ]}>
            <GestureDetector gesture={dragGesture}>
              <View style={styles.header}>
                <View style={[styles.grab, { backgroundColor: theme.color.borderStrong }]} />
                <View style={[styles.titleRow, row(isRtl)]}>
                  <Text variant="heading" numberOfLines={1} style={styles.flex}>
                    {title}
                  </Text>
                  <IconButton
                    icon="close"
                    size={36}
                    accessibilityLabel={ui.actionClose}
                    onPress={onClose}
                  />
                </View>
              </View>
            </GestureDetector>

            {/* flexShrink lets the body give way to the sheet's max height, so a
                tall body scrolls instead of pushing the footer off-screen. */}
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={[
                styles.body,
                { paddingBottom: footer ? spacing.lg : insets.bottom + spacing['3xl'] },
              ]}>
              {children}
            </ScrollView>

            {footer ? (
              <View
                style={[
                  styles.footer,
                  row(isRtl),
                  {
                    borderTopColor: theme.color.border,
                    // The home-indicator inset is already inside the keyboard height.
                    paddingBottom: keyboardInset > 0 ? spacing.md : insets.bottom + spacing.lg,
                  },
                ]}>
                {footer}
              </View>
            ) : null}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3 },
  titleRow: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  scroll: { flexShrink: 1 },
  body: { paddingHorizontal: spacing.lg, gap: spacing.md },
  footer: {
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
