import { useIsFocused } from '@react-navigation/native';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
  type CameraType,
} from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { interpolate } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

/**
 * The overlay always sits on a live camera feed, so its palette is fixed rather
 * than themed — the scan colour has to stay legible on top of any image.
 */
const SCAN_GREEN = '#3DDC84';
const CANVAS = '#05080B';
const SCRIM = 'rgba(5, 8, 11, 0.62)';
const GLASS = 'rgba(9, 14, 19, 0.58)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.16)';
const ON_GLASS = '#FFFFFF';
const ON_GLASS_MUTED = 'rgba(255, 255, 255, 0.62)';

/** Every format the platforms support, so any label in the lab can be read. */
const BARCODE_TYPES: BarcodeType[] = [
  'qr',
  'datamatrix',
  'aztec',
  'pdf417',
  'code128',
  'code93',
  'code39',
  'codabar',
  'itf14',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
];

/** Height of the sweeping band; the bright core line sits in its middle. */
const SWEEP_HEIGHT = 72;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { isRtl, ui } = useLanguage();
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions({ request: true });

  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<BarcodeScanningResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [mountFailed, setMountFailed] = useState(false);
  /** The native callback fires many times a second; this latches the first hit. */
  const latched = useRef(false);

  const frameSize = Math.min(width * 0.74, 300);
  const granted = permission?.granted === true;
  const cameraLive = granted && !mountFailed;
  const scanning = cameraLive && result === null;

  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!scanning || !isFocused) {
      cancelAnimation(sweep);
      sweep.set(0);
      return;
    }
    sweep.set(0);
    sweep.set(
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.cubic) }), -1, true)
    );
    return () => cancelAnimation(sweep);
  }, [isFocused, scanning, sweep]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sweep.get() * frameSize }],
  }));

  const onBarcodeScanned = useCallback((scan: BarcodeScanningResult) => {
    if (latched.current) return;
    latched.current = true;
    setResult(scan);
    // A no-op on iOS while the camera is running, but real feedback on Android.
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const scanAgain = useCallback(() => {
    latched.current = false;
    setResult(null);
    setCopied(false);
  }, []);

  const retryMount = useCallback(() => {
    setMountFailed(false);
    scanAgain();
  }, [scanAgain]);

  const flipCamera = useCallback(() => {
    setTorch(false);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const copyCode = useCallback(() => {
    if (!result) return;
    void Clipboard.setStringAsync(result.data);
    setCopied(true);
  }, [result]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  // Stays null while the permission response is still resolving, so nothing
  // flashes up before we know whether the camera can even open.
  let notice: ReactNode = null;
  if (mountFailed) {
    notice = (
      <Notice
        icon="alert-circle-outline"
        title={ui.scanUnavailableTitle}
        body={ui.scanUnavailableBody}
        actionLabel={ui.scanRetry}
        onAction={retryMount}
      />
    );
  } else if (permission !== null && !granted) {
    notice = permission.canAskAgain ? (
      <Notice
        icon="camera-outline"
        title={ui.scanPermissionTitle}
        body={ui.scanPermissionBody}
        actionLabel={ui.scanPermissionAction}
        onAction={() => void requestPermission()}
      />
    ) : (
      <Notice
        icon="lock-closed-outline"
        title={ui.scanPermissionBlockedTitle}
        body={ui.scanPermissionBlockedBody}
        actionLabel={ui.scanOpenSettings}
        onAction={() => void Linking.openSettings()}
      />
    );
  }

  let overlay = notice;
  if (overlay === null && result !== null) {
    overlay = (
      <ResultPanel result={result} copied={copied} onCopy={copyCode} onScanAgain={scanAgain} />
    );
  } else if (overlay === null && cameraLive) {
    overlay = (
      <View style={styles.footer}>
        <View style={[styles.hint, row(isRtl)]}>
          <Icon name="qr-code-outline" size={15} color={SCAN_GREEN} />
          <Text variant="caption" color={ON_GLASS}>
            {ui.scanHint}
          </Text>
        </View>
        <View style={[styles.controls, row(isRtl)]}>
          {facing === 'back' ? (
            <OverlayButton
              icon={torch ? 'flash' : 'flash-off'}
              label={torch ? ui.scanTorchOff : ui.scanTorchOn}
              active={torch}
              onPress={() => setTorch((value) => !value)}
            />
          ) : null}
          <OverlayButton
            icon="camera-reverse-outline"
            label={ui.scanFlipCamera}
            onPress={flipCamera}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: CANVAS }]}>
      <StatusBar style="light" />

      {/* Only one preview may be live at a time, so it unmounts when unfocused. */}
      {cameraLive && isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
          onMountError={() => setMountFailed(true)}
          accessibilityLabel={ui.scanCameraAria}
        />
      ) : null}

      {cameraLive ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[styles.scrimTop, { backgroundColor: SCRIM }]} />
          <View style={[styles.scrimRow, { height: frameSize }]}>
            <View style={[styles.flex, { backgroundColor: SCRIM }]} />
            <View style={[styles.frame, { width: frameSize, height: frameSize }]}>
              {result ? (
                <Animated.View
                  entering={FadeIn.duration(220)}
                  style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(SCAN_GREEN, 0.16) }]}
                />
              ) : (
                <Animated.View style={[styles.sweep, sweepStyle]}>
                  <LinearGradient
                    colors={[
                      withAlpha(SCAN_GREEN, 0),
                      withAlpha(SCAN_GREEN, 0.3),
                      withAlpha(SCAN_GREEN, 0),
                    ]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.sweepCore, { backgroundColor: SCAN_GREEN }]} />
                </Animated.View>
              )}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <View style={[styles.flex, { backgroundColor: SCRIM }]} />
          </View>
          <View style={[styles.scrimBottom, { backgroundColor: SCRIM }]} />
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          styles.chrome,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl },
        ]}>
        <View style={[styles.header, row(isRtl)]}>
          <OverlayButton icon="chevron-back" label={ui.actionBack} onPress={goBack} directional />
          <View style={styles.flex}>
            <Text variant="heading" color={ON_GLASS} numberOfLines={1}>
              {ui.scanTitle}
            </Text>
            <Text variant="caption" color={ON_GLASS_MUTED} numberOfLines={1}>
              {ui.scanSubtitle}
            </Text>
          </View>
        </View>

        <View
          pointerEvents="box-none"
          style={[styles.body, { justifyContent: notice ? 'center' : 'flex-end' }]}>
          {overlay}
        </View>
      </View>
    </View>
  );
}

function ResultPanel({
  result,
  copied,
  onCopy,
  onScanAgain,
}: {
  result: BarcodeScanningResult;
  copied: boolean;
  onCopy: () => void;
  onScanAgain: () => void;
}) {
  const { isRtl, ui } = useLanguage();

  return (
    <Animated.View
      entering={FadeInUp.duration(320)}
      style={[styles.panel, { backgroundColor: GLASS, borderColor: withAlpha(SCAN_GREEN, 0.34) }]}>
      <View style={[styles.panelHead, row(isRtl)]}>
        <Animated.View
          entering={ZoomIn.springify().damping(13)}
          style={[styles.check, { backgroundColor: SCAN_GREEN }]}>
          <Icon name="checkmark" size={26} color={CANVAS} />
        </Animated.View>
        <View style={styles.flex}>
          <Text variant="subheading" color={ON_GLASS}>
            {ui.scanResultTitle}
          </Text>
          <Text variant="caption" color={ON_GLASS_MUTED}>
            {interpolate(ui.scanResultFormat, { type: result.type })}
          </Text>
        </View>
      </View>

      <View style={[styles.codeBox, { borderColor: GLASS_BORDER }]}>
        <Text variant="overline" color={ON_GLASS_MUTED}>
          {ui.scanResultCode}
        </Text>
        <Text variant="bodyMedium" color={ON_GLASS} selectable ltr>
          {result.data}
        </Text>
      </View>

      <View style={[styles.panelActions, row(isRtl)]}>
        <Button
          label={copied ? ui.scanResultCopied : ui.scanResultCopy}
          icon={copied ? 'checkmark' : 'copy-outline'}
          variant="secondary"
          size="md"
          onPress={onCopy}
          style={styles.flex}
        />
        <Button
          label={ui.scanResultAgain}
          icon="scan-outline"
          size="md"
          onPress={onScanAgain}
          style={styles.flex}
        />
      </View>
    </Animated.View>
  );
}

function Notice({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      style={[styles.panel, styles.notice, { backgroundColor: GLASS, borderColor: GLASS_BORDER }]}>
      <View style={[styles.noticeIcon, { backgroundColor: withAlpha(SCAN_GREEN, 0.16) }]}>
        <Icon name={icon} size={24} color={SCAN_GREEN} />
      </View>
      <Text variant="subheading" color={ON_GLASS} style={styles.centered}>
        {title}
      </Text>
      <Text variant="caption" color={ON_GLASS_MUTED} style={styles.centered}>
        {body}
      </Text>
      <Button label={actionLabel} size="md" onPress={onAction} style={styles.noticeAction} />
    </Animated.View>
  );
}

function OverlayButton({
  icon,
  label,
  onPress,
  active = false,
  directional = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  directional?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      style={[
        styles.overlayButton,
        {
          backgroundColor: active ? SCAN_GREEN : GLASS,
          borderColor: active ? SCAN_GREEN : GLASS_BORDER,
        },
      ]}>
      <Icon name={icon} size={20} color={active ? CANVAS : ON_GLASS} directional={directional} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  centered: { textAlign: 'center' },

  // The frame is nudged above the true centre so the controls do not crowd it.
  scrimTop: { flex: 1 },
  scrimBottom: { flex: 1.35 },
  scrimRow: { flexDirection: 'row' },
  frame: { borderRadius: radius.lg, overflow: 'hidden' },
  sweep: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -SWEEP_HEIGHT / 2,
    height: SWEEP_HEIGHT,
    justifyContent: 'center',
  },
  sweepCore: { height: 2, borderRadius: 1 },
  // Physical edges, not logical ones: the bracket set is symmetric, so it looks
  // identical in both directions and never needs mirroring.
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: SCAN_GREEN },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: radius.lg,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: radius.lg,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: radius.lg,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: radius.lg,
  },

  chrome: { paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', gap: spacing.md },
  body: { flex: 1, paddingTop: spacing.lg },
  footer: { alignItems: 'center', gap: spacing.lg },
  hint: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: GLASS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GLASS_BORDER,
  },
  controls: { alignItems: 'center', gap: spacing.md },
  overlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },

  panel: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  panelHead: { alignItems: 'center', gap: spacing.md },
  check: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  codeBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  panelActions: { gap: spacing.md },

  notice: { alignItems: 'center' },
  noticeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  noticeAction: { alignSelf: 'stretch' },
});
