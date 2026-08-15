import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import type { ExocadSource } from '@/lib/exocad';
import { useLanguage } from '@/store/language-store';

/**
 * Renders a self-contained exocad HTML export. The bundled asset is copied into
 * the cache directory first, because the WebView can only read a real file URL —
 * on Android the packaged asset lives inside the APK and is not addressable.
 */
export function ExocadWebView({ source }: { source: ExocadSource }) {
  const theme = useTheme();
  const { ui } = useLanguage();
  const [attempt, setAttempt] = useState(0);
  const [uri, setUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setUri(null);
    setProgress(0);
    setLoaded(false);
    setFailed(false);

    Asset.fromModule(source)
      .downloadAsync()
      .then((asset) => {
        if (!active) return;
        if (asset.localUri) setUri(asset.localUri);
        else setFailed(true);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [source, attempt]);

  return (
    <View style={styles.root}>
      {uri && !failed ? (
        <WebView
          key={`${uri}-${attempt}`}
          source={{ uri }}
          originWhitelist={['*']}
          style={styles.webview}
          containerStyle={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          // Local file access; the first three are Android-only, the last iOS-only.
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          allowingReadAccessToURL={uri}
          // WebGL needs a hardware-backed layer to render the mesh smoothly.
          androidLayerType="hardware"
          setBuiltInZoomControls={false}
          // The viewer owns every gesture, so the page itself must not scroll.
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          // Lets Safari/Chrome inspect the viewer while debugging WebGL issues.
          webviewDebuggingEnabled={__DEV__}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
          onLoadEnd={() => setLoaded(true)}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
          onRenderProcessGone={() => setFailed(true)}
        />
      ) : null}

      {failed ? (
        <View style={[styles.overlay, { backgroundColor: theme.color.background }]}>
          <Text variant="subheading" style={styles.centered}>
            {ui.exocadErrorTitle}
          </Text>
          <Text variant="body" tone="muted" style={styles.centered}>
            {ui.exocadErrorBody}
          </Text>
          <Button
            label={ui.exocadRetry}
            variant="secondary"
            size="md"
            icon="refresh"
            onPress={() => setAttempt((value) => value + 1)}
          />
        </View>
      ) : loaded ? null : (
        <View style={[styles.overlay, { backgroundColor: theme.color.background }]}>
          <ActivityIndicator size="large" color={theme.color.brand} />
          <Text variant="label" style={styles.centered}>
            {ui.exocadLoading}
          </Text>
          <Text variant="caption" tone="faint" style={styles.centered}>
            {ui.exocadLoadingHint}
          </Text>
          <ProgressBar value={progress} style={styles.progress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing['3xl'],
  },
  centered: { textAlign: 'center' },
  progress: { width: '70%', marginTop: spacing.xs },
});
