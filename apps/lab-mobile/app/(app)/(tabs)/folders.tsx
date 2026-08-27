import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useToneColors } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { interpolate, localized, type UiStrings } from '@/lib/i18n';
import { row, startSpacing } from '@/lib/rtl';
import { FOLDERS, STORAGE, type FileFolder, type RecentFile } from '@/lib/mock-data';
import { addRecentFile, useFiles, UPLOAD_META, type UploadKind } from '@/store/files-store';
import { useLanguage } from '@/store/language-store';

const UPLOAD_OPTIONS: { kind: UploadKind; labelKey: keyof UiStrings; hintKey: keyof UiStrings }[] = [
  { kind: 'scan', labelKey: 'filesUploadScan', hintKey: 'filesUploadScanHint' },
  { kind: 'photo', labelKey: 'filesUploadPhoto', hintKey: 'filesUploadPhotoHint' },
  { kind: 'document', labelKey: 'filesUploadDocument', hintKey: 'filesUploadDocumentHint' },
];

export default function FoldersScreen() {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const { recent } = useFiles();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <Screen
      header={
        <ScreenHeader
          title={ui.filesTitle}
          subtitle={ui.filesSubtitle}
          right={
            <IconButton
              icon="cloud-upload-outline"
              accessibilityLabel={ui.filesUpload}
              tone="brand"
              onPress={() => setUploadOpen(true)}
            />
          }
        />
      }>
      <Animated.View entering={FadeInDown.duration(450)}>
        <Card style={styles.storage}>
          <View style={[styles.storageTop, row(isRtl)]}>
            <View style={[styles.storageIcon, { backgroundColor: theme.color.brandSoft }]}>
              <Icon name="server-outline" size={19} color={theme.color.brand} />
            </View>
            <View style={styles.flex}>
              <Text variant="label">{ui.filesStorage}</Text>
              <Text variant="caption" tone="faint">
                {interpolate(ui.filesStorageUsed, { used: STORAGE.used, total: STORAGE.total })}
              </Text>
            </View>
            <Text variant="subheading" tone="brand">
              {Math.round(STORAGE.ratio * 100)}%
            </Text>
          </View>
          <ProgressBar value={STORAGE.ratio} height={9} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(450)}>
        <Section title={ui.filesFolders} actionLabel={ui.filesManage}>
          <View style={[styles.grid, row(isRtl)]}>
            {FOLDERS.map((folder) => (
              <FolderTile key={folder.id} folder={folder} />
            ))}
          </View>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(450)}>
        <Section title={ui.filesRecent} actionLabel={ui.filesSeeAll}>
          <Card padded={false} style={styles.recentCard}>
            {recent.map((file, index) => (
              <View key={file.id}>
                <RecentRow file={file} />
                {index < recent.length - 1 ? (
                  <View
                    style={[
                      styles.divider,
                      startSpacing(isRtl, 66),
                      { backgroundColor: theme.color.border },
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </Card>
        </Section>
      </Animated.View>

      <BottomSheet visible={uploadOpen} onClose={() => setUploadOpen(false)} title={ui.filesUpload}>
        <Text variant="caption" tone="faint">
          {ui.filesUploadHint}
        </Text>
        {UPLOAD_OPTIONS.map((option) => (
          <PressableScale
            key={option.kind}
            onPress={() => {
              addRecentFile(option.kind);
              setUploadOpen(false);
            }}
            accessibilityRole="button"
            accessibilityLabel={ui[option.labelKey]}
            style={[
              styles.uploadRow,
              row(isRtl),
              { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
            ]}>
            <View style={[styles.uploadIcon, { backgroundColor: theme.color.brandSoft }]}>
              <Icon name={UPLOAD_META[option.kind].icon} size={18} color={theme.color.brand} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyMedium" numberOfLines={1}>
                {ui[option.labelKey]}
              </Text>
              <Text variant="caption" tone="faint" numberOfLines={1}>
                {ui[option.hintKey]}
              </Text>
            </View>
            <Icon name="chevron-forward" size={15} color={theme.color.textFaint} directional />
          </PressableScale>
        ))}
      </BottomSheet>
    </Screen>
  );
}

function FolderTile({ folder }: { folder: FileFolder }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const { fg, bg } = useToneColors(folder.tone);
  const name = localized(folder.name, lang);

  return (
    <PressableScale
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.filesFolderAria, { name, count: folder.count })}
      style={styles.tileWrapper}>
      <Card style={styles.tile}>
        <View style={[styles.tileIcon, { backgroundColor: bg }]}>
          <Icon name={folder.icon} size={20} color={fg} />
        </View>
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" tone="faint" numberOfLines={2} style={styles.tileDescription}>
          {localized(folder.description, lang)}
        </Text>
        <View style={[styles.tileFooter, row(isRtl), { borderTopColor: theme.color.border }]}>
          <Text variant="caption" tone="muted">
            {interpolate(ui.filesCount, { count: folder.count })}
          </Text>
          <Text variant="caption" tone="faint">
            {folder.size}
          </Text>
        </View>
      </Card>
    </PressableScale>
  );
}

function RecentRow({ file }: { file: RecentFile }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const { fg, bg } = useToneColors(file.tone);

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={file.name}
      style={[styles.recentRow, row(isRtl)]}>
      <View style={[styles.recentIcon, { backgroundColor: bg }]}>
        <Icon name={file.icon} size={17} color={fg} />
      </View>
      <View style={styles.flex}>
        <Text variant="bodyMedium" numberOfLines={1} ltr>
          {file.name}
        </Text>
        <Text variant="caption" tone="faint">
          {localized(file.meta, lang)}
        </Text>
      </View>
      <PressableScale
        hitSlop={8}
        scaleTo={0.9}
        accessibilityRole="button"
        accessibilityLabel={ui.filesMore}>
        <Icon name="ellipsis-horizontal" size={18} color={theme.color.textFaint} />
      </PressableScale>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  storage: { gap: spacing.lg },
  storageTop: { alignItems: 'center', gap: spacing.md },
  storageIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  grid: { flexWrap: 'wrap', gap: spacing.md },
  tileWrapper: { width: '47.6%', flexGrow: 1 },
  tile: { gap: spacing.xs },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileDescription: { minHeight: 32 },
  tileFooter: {
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  recentCard: { paddingVertical: spacing.xs },
  recentRow: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  recentIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth },
  uploadRow: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  uploadIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
