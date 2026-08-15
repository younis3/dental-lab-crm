import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExocadWebView } from '@/components/exocad/exocad-webview';
import { Button, IconButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { findExocadFile } from '@/lib/exocad';
import { localized } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export default function ExocadViewerScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isRtl, lang, ui } = useLanguage();
  /** Bumping the token remounts the WebView, which is how reload works here. */
  const [reloadToken, setReloadToken] = useState(0);
  const file = findExocadFile(id);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/demo-exocad');
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.color.background,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom,
        },
      ]}>
      <View style={[styles.bar, row(isRtl), { borderBottomColor: theme.color.border }]}>
        <IconButton
          icon={isRtl ? 'chevron-forward' : 'chevron-back'}
          accessibilityLabel={ui.exocadBack}
          onPress={goBack}
          size={40}
        />
        <View style={styles.flex}>
          <Text variant="label" numberOfLines={1}>
            {file ? localized(file.title, lang) : ui.exocadNotFoundTitle}
          </Text>
          {file ? (
            <Text variant="caption" tone="faint" numberOfLines={1} ltr>
              {file.fileName}
            </Text>
          ) : null}
        </View>
        {file ? (
          <IconButton
            icon="refresh"
            accessibilityLabel={ui.exocadReload}
            onPress={() => setReloadToken((value) => value + 1)}
            size={40}
          />
        ) : null}
      </View>

      {file ? (
        <ExocadWebView key={reloadToken} source={file.source} />
      ) : (
        <View style={styles.missing}>
          <Icon name="alert-circle-outline" size={30} color={theme.color.textFaint} />
          <Text variant="subheading" style={styles.centered}>
            {ui.exocadNotFoundTitle}
          </Text>
          <Text variant="body" tone="muted" style={styles.centered}>
            {ui.exocadNotFoundBody}
          </Text>
          <Button
            label={ui.exocadBackToList}
            variant="secondary"
            size="md"
            icon="arrow-back"
            onPress={goBack}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  centered: { textAlign: 'center' },
  bar: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing['3xl'],
  },
});
