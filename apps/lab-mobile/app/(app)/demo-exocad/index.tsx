import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { EXOCAD_FILES, type ExocadFile } from '@/lib/exocad';
import { interpolate, localized } from '@/lib/i18n';
import { row, selfStart } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export default function DemoExocadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isRtl, ui } = useLanguage();

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={ui.exocadTitle}
          subtitle={ui.exocadSubtitle}
          leading={
            <IconButton
              icon={isRtl ? 'chevron-forward' : 'chevron-back'}
              accessibilityLabel={ui.exocadBack}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            />
          }
        />
      }>
      <Animated.View entering={FadeInDown.duration(450)}>
        <Card style={styles.about}>
          <View style={[styles.aboutTop, row(isRtl)]}>
            <View style={[styles.aboutIcon, { backgroundColor: theme.color.brandSoft }]}>
              <Icon name="cube-outline" size={19} color={theme.color.brand} />
            </View>
            <View style={styles.flex}>
              <Text variant="label">{ui.exocadAboutTitle}</Text>
              <Text variant="caption" tone="faint">
                {interpolate(ui.exocadFileCount, { count: EXOCAD_FILES.length })}
              </Text>
            </View>
          </View>
          <Text variant="caption" tone="muted">
            {ui.exocadAboutBody}
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(450)}>
        <Section title={ui.exocadChooseTitle}>
          {EXOCAD_FILES.length ? (
            <View style={styles.list}>
              {EXOCAD_FILES.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </View>
          ) : (
            <Card style={styles.empty}>
              <Icon name="folder-open-outline" size={26} color={theme.color.textFaint} />
              <Text variant="subheading" style={styles.centered}>
                {ui.exocadEmptyTitle}
              </Text>
              <Text variant="caption" tone="faint" style={styles.centered}>
                {ui.exocadEmptyBody}
              </Text>
            </Card>
          )}
        </Section>
      </Animated.View>
    </Screen>
  );
}

function FileRow({ file }: { file: ExocadFile }) {
  const theme = useTheme();
  const router = useRouter();
  const { isRtl, lang, ui } = useLanguage();
  const title = localized(file.title, lang);

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.exocadOpenAria, { name: title })}
      onPress={() => router.push({ pathname: '/demo-exocad/viewer', params: { id: file.id } })}>
      <Card style={styles.card}>
        <View style={[styles.cardTop, row(isRtl)]}>
          <View style={[styles.cardIcon, { backgroundColor: theme.color.brandSoft }]}>
            <Icon name="cube" size={20} color={theme.color.brand} />
          </View>
          <View style={styles.flex}>
            <Text variant="label" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" tone="faint" numberOfLines={1} ltr>
              {file.fileName}
            </Text>
          </View>
          <Icon name="chevron-forward" size={16} color={theme.color.textFaint} directional />
        </View>
        <Text variant="caption" tone="muted">
          {localized(file.description, lang)}
        </Text>
        <Badge label="HTML · 3D" tone="brand" style={{ alignSelf: selfStart(isRtl) }} />
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { textAlign: 'center' },
  about: { gap: spacing.md },
  aboutTop: { alignItems: 'center', gap: spacing.md },
  aboutIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: spacing.md },
  card: { gap: spacing.sm },
  cardTop: { alignItems: 'center', gap: spacing.md },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['2xl'] },
});
