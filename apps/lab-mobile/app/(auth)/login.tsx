import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand/logo-mark';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { OtpInput } from '@/components/ui/otp-input';
import { withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { elevation, motion, radius, spacing } from '@/constants/design';
import { ThemeOverride, useTheme } from '@/hooks/use-theme';
import { interpolate } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import {
  DEMO_OTP,
  DEMO_PASSWORD,
  DEMO_PHONE,
  cancelOtp,
  requestOtp,
  verifyOtp,
  type AuthErrorCode,
} from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';

const RESEND_SECONDS = 30;
const OTP_LENGTH = 4;

type Step = 'credentials' | 'otp';

export default function LoginScreen() {
  return (
    <ThemeOverride scheme="light">
      <LoginCanvas />
    </ThemeOverride>
  );
}

function LoginCanvas() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRtl, ui } = useLanguage();

  const [step, setStep] = useState<Step>('credentials');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);
  const [pending, setPending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const verifying = useRef(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));

  const reportError = useCallback(
    (next: AuthErrorCode) => {
      setErrorCode(next);
      shake.set(
        withSequence(
          withTiming(-7, { duration: 55 }),
          withTiming(7, { duration: 55 }),
          withTiming(-4, { duration: 55 }),
          withSpring(0, motion.springSnappy)
        )
      );
    },
    [shake]
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleSendCode = useCallback(async () => {
    if (pending) return;
    setPending(true);
    setErrorCode(null);
    const result = await requestOtp(phone, password);
    setPending(false);

    if (!result.ok) {
      reportError(result.error);
      return;
    }

    setCode('');
    setStep('otp');
    setSecondsLeft(RESEND_SECONDS);
  }, [password, pending, phone, reportError]);

  const handleVerify = useCallback(
    async (nextCode: string) => {
      if (verifying.current) return;
      verifying.current = true;
      setPending(true);
      setErrorCode(null);

      const result = await verifyOtp(nextCode);
      setPending(false);
      verifying.current = false;

      if (!result.ok) {
        reportError(result.error);
        setCode('');
      }
    },
    [reportError]
  );

  const handleCodeChange = (next: string) => {
    setCode(next);
    if (errorCode) setErrorCode(null);
    if (next.length === OTP_LENGTH) void handleVerify(next);
  };

  const goBackToCredentials = () => {
    cancelOtp();
    setStep('credentials');
    setCode('');
    setErrorCode(null);
  };

  const errorMessage = !errorCode
    ? null
    : errorCode === 'credentials'
      ? ui.loginErrorCredentials
      : errorCode === 'expired'
        ? ui.loginErrorExpired
        : interpolate(ui.loginErrorCode, { code: DEMO_OTP });

  return (
    <View style={[styles.root, { backgroundColor: theme.color.surface }]}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFFFFF', '#FBFDFC', '#EFF6F2']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.body,
            { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
          ]}>
          <View style={[styles.topBar, row(isRtl)]}>
            <LanguageSwitch compact />
          </View>

          <View style={styles.center}>
            <Animated.View entering={FadeInDown.duration(420)} style={styles.brand}>
              <LogoMark size={62} />
              <View style={styles.brandText}>
                <Text variant="displaySerif" style={styles.wordmark}>
                  Nadeem
                </Text>
                <Text variant="caption" tone="muted" style={styles.tagline}>
                  {ui.loginTagline}
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(90).duration(420)}
              style={[
                styles.card,
                {
                  backgroundColor: theme.color.surface,
                  borderColor: theme.color.border,
                },
                elevation(2, theme.scheme),
                shakeStyle,
              ]}>
              {step === 'credentials' ? (
                <Animated.View
                  key="credentials"
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}>
                  <View style={styles.stepHeader}>
                    <Text variant="heading">{ui.loginWelcome}</Text>
                    <Text variant="caption" tone="muted">
                      {ui.loginSubtitle}
                    </Text>
                  </View>

                  <Field
                    size="sm"
                    ltr
                    label={ui.loginPhoneLabel}
                    value={phone}
                    onChangeText={(next) => {
                      setPhone(next);
                      if (errorCode) setErrorCode(null);
                    }}
                    icon="call-outline"
                    placeholder={ui.loginPhonePlaceholder}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    invalid={Boolean(errorCode)}
                  />

                  <Field
                    size="sm"
                    label={ui.loginPasswordLabel}
                    value={password}
                    onChangeText={(next) => {
                      setPassword(next);
                      if (errorCode) setErrorCode(null);
                    }}
                    icon="lock-closed-outline"
                    placeholder={ui.loginPasswordPlaceholder}
                    secure
                    autoComplete="current-password"
                    invalid={Boolean(errorCode)}
                    returnKeyType="go"
                    onSubmitEditing={() => void handleSendCode()}
                    toggleLabels={{ show: ui.loginShowPassword, hide: ui.loginHidePassword }}
                  />

                  {errorMessage ? <ErrorNote message={errorMessage} /> : null}

                  <Button
                    size="md"
                    label={ui.loginSendCode}
                    icon="arrow-forward"
                    iconPosition="right"
                    loading={pending}
                    onPress={() => void handleSendCode()}
                  />

                  <PressableScale
                    scaleTo={0.98}
                    accessibilityRole="button"
                    accessibilityLabel={ui.loginFillDemo}
                    onPress={() => {
                      setPhone(DEMO_PHONE);
                      setPassword(DEMO_PASSWORD);
                      setErrorCode(null);
                    }}
                    style={[styles.demoRow, row(isRtl)]}>
                    <Icon name="sparkles-outline" size={14} color={theme.color.textMuted} />
                    <Text variant="caption" tone="muted">
                      {ui.loginFillDemo}
                    </Text>
                  </PressableScale>
                </Animated.View>
              ) : (
                <Animated.View
                  key="otp"
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}>
                  <View style={styles.stepHeader}>
                    <Text variant="heading">{ui.loginVerifyTitle}</Text>
                    <Text variant="caption" tone="muted">
                      {interpolate(ui.loginVerifySubtitle, { count: OTP_LENGTH })}
                    </Text>
                  </View>

                  <OtpInput
                    size="sm"
                    value={code}
                    onChangeText={handleCodeChange}
                    length={OTP_LENGTH}
                    autoFocus
                    invalid={Boolean(errorCode)}
                    disabled={pending}
                    accessibilityLabel={interpolate(ui.loginVerifySubtitle, { count: OTP_LENGTH })}
                  />

                  {errorMessage ? <ErrorNote message={errorMessage} /> : null}

                  <View style={[styles.hint, row(isRtl), { backgroundColor: theme.color.brandSoft }]}>
                    <Icon name="information-circle-outline" size={14} color={theme.color.brand} />
                    <Text variant="caption" tone="brand">
                      {interpolate(ui.loginDemoCode, { code: DEMO_OTP })}
                    </Text>
                  </View>

                  <Button
                    size="md"
                    label={pending ? ui.loginVerifying : ui.loginVerifyAction}
                    loading={pending}
                    onPress={() => void handleVerify(code)}
                    disabled={code.length !== OTP_LENGTH}
                  />

                  <View style={[styles.otpFooter, row(isRtl)]}>
                    <PressableScale
                      scaleTo={0.97}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={ui.loginChangeNumber}
                      onPress={goBackToCredentials}>
                      <Text variant="caption" tone="muted">
                        {ui.loginChangeNumber}
                      </Text>
                    </PressableScale>

                    <PressableScale
                      scaleTo={0.97}
                      hitSlop={8}
                      disabled={secondsLeft > 0}
                      accessibilityRole="button"
                      accessibilityLabel={ui.loginResend}
                      onPress={() => setSecondsLeft(RESEND_SECONDS)}>
                      <Text variant="caption" tone={secondsLeft > 0 ? 'faint' : 'brand'}>
                        {secondsLeft > 0
                          ? interpolate(ui.loginResendIn, { seconds: secondsLeft })
                          : ui.loginResend}
                      </Text>
                    </PressableScale>
                  </View>
                </Animated.View>
              )}
            </Animated.View>

            <StepDots active={step === 'otp' ? 1 : 0} />
          </View>

          <View style={[styles.footer, row(isRtl)]}>
            <Icon name="shield-checkmark-outline" size={13} color={theme.color.textFaint} />
            <Text variant="caption" tone="faint">
              {ui.loginSecureNote}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function StepDots({ active }: { active: number }) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();

  return (
    <View
      style={[styles.dots, row(isRtl)]}
      accessibilityLabel={interpolate(ui.loginStepStatus, { current: active + 1, total: 2 })}>
      {[0, 1].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === active ? theme.color.brand : theme.color.borderStrong,
              width: index === active ? 18 : 6,
            },
          ]}
        />
      ))}
    </View>
  );
}

function ErrorNote({ message }: { message: string }) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[styles.error, row(isRtl), { backgroundColor: withAlpha(theme.color.danger, 0.1) }]}>
      <Icon name="alert-circle" size={14} color={theme.color.danger} />
      <Text variant="caption" tone="danger" style={styles.flex}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: spacing.xl },
  topBar: { justifyContent: 'flex-end' },
  center: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  brand: { alignItems: 'center', gap: spacing.md },
  brandText: { alignItems: 'center', gap: 2 },
  wordmark: { fontSize: 34, lineHeight: 38, textAlign: 'center' },
  tagline: { textAlign: 'center', maxWidth: 260 },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
  },
  stepBody: { gap: spacing.md },
  stepHeader: { gap: 2, marginBottom: spacing.xs },
  dots: { alignSelf: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  demoRow: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: spacing.xs },
  hint: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  error: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  otpFooter: { justifyContent: 'space-between', alignItems: 'center' },
  footer: { alignItems: 'center', justifyContent: 'center', gap: 6 },
});
