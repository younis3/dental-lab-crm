import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/back-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { radius, spacing, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { formatRelative } from '@/lib/format';
import { interpolate, localized, type UiStrings } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import {
  markConversationRead,
  sendMessage,
  useConversation,
  type ChatAttachmentKind,
  type ChatBubble,
} from '@/store/chat-store';
import { useLanguage } from '@/store/language-store';

const ATTACH_ICON: Record<ChatAttachmentKind, IconName> = {
  image: 'image-outline',
  video: 'videocam-outline',
  scan: 'cube-outline',
  file: 'document-text-outline',
};

const ATTACH_OPTIONS: { kind: ChatAttachmentKind; labelKey: keyof UiStrings; extension: string }[] = [
  { kind: 'image', labelKey: 'threadAttachPhoto', extension: 'jpg' },
  { kind: 'video', labelKey: 'threadAttachVideo', extension: 'mp4' },
  { kind: 'file', labelKey: 'threadAttachFile', extension: 'pdf' },
];

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isRtl, lang, ui } = useLanguage();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const conversation = useConversation(id);
  const [draft, setDraft] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);

  useEffect(() => {
    if (id) markConversationRead(id);
  }, [id, conversation?.unread]);

  const send = useCallback(() => {
    if (!id || !draft.trim()) return;
    sendMessage(id, draft);
    setDraft('');
  }, [draft, id]);

  const pickFile = useCallback(async () => {
    if (!id) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    setAttachOpen(false);
    if (result.canceled) return;

    const asset = result.assets[0];
    const stamp = new Date().toISOString().slice(11, 16).replace(':', '');
    sendMessage(id, '', {
      kind: 'file',
      name: asset.name ?? `file_${stamp}.pdf`,
      uri: asset.uri,
    });
  }, [id]);

  const pickMedia = useCallback(
    async (kind: 'image' | 'video', extension: string) => {
      if (!id) return;
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setAttachOpen(false);
        Alert.alert(ui.threadPhotoDeniedTitle, ui.threadPhotoDeniedBody);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === 'video' ? ['videos'] : ['images'],
        quality: 0.8,
      });
      setAttachOpen(false);
      if (result.canceled) return;

      const asset = result.assets[0];
      const stamp = new Date().toISOString().slice(11, 16).replace(':', '');
      sendMessage(id, '', {
        kind,
        name: asset.fileName ?? `${kind}_${stamp}.${extension}`,
        uri: asset.uri,
      });
    },
    [id, ui.threadPhotoDeniedBody, ui.threadPhotoDeniedTitle]
  );

  if (!conversation) {
    return (
      <Screen
        withTabBarInset={false}
        header={<ScreenHeader title={ui.inboxTitle} leading={<BackButton />} showMenu={false} />}>
        <EmptyState
          icon="mail-open-outline"
          title={ui.threadNotFoundTitle}
          hint={ui.threadNotFoundBody}
        />
      </Screen>
    );
  }

  const ordered = [...conversation.bubbles].reverse();

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={localized(conversation.name, lang)}
          subtitle={localized(conversation.clinic, lang)}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 64}>
        {conversation.orderId ? (
          <PressableScale
            onPress={() =>
              router.push({ pathname: '/orders/[id]', params: { id: conversation.orderId! } })
            }
            accessibilityRole="button"
            accessibilityLabel={interpolate(ui.threadOpenCase, { id: conversation.orderId })}
            style={[
              styles.orderBanner,
              row(isRtl),
              { backgroundColor: theme.color.brandSoft, borderColor: theme.color.border },
            ]}>
            <Icon name="layers-outline" size={16} color={theme.color.brand} />
            <Text variant="label" tone="brand" style={styles.flex} numberOfLines={1}>
              {interpolate(ui.threadOpenCase, { id: conversation.orderId })}
            </Text>
            <Icon name="chevron-forward" size={15} color={theme.color.brand} directional />
          </PressableScale>
        ) : null}

        <FlatList
          data={ordered}
          inverted
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.thread}
          renderItem={({ item }) => <Bubble bubble={item} ui={ui} />}
        />

        <View
          style={[
            styles.composer,
            row(isRtl),
            {
              backgroundColor: theme.color.surface,
              borderTopColor: theme.color.border,
              paddingBottom: spacing.sm + insets.bottom,
            },
          ]}>
          <IconButton
            icon="attach-outline"
            accessibilityLabel={ui.threadAttach}
            onPress={() => setAttachOpen(true)}
          />
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
            ]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={ui.threadPlaceholder}
              placeholderTextColor={theme.color.textFaint}
              multiline
              style={[
                styles.input,
                { color: theme.color.text, textAlign: isRtl ? 'right' : 'left' },
              ]}
            />
          </View>
          <IconButton
            icon="send"
            tone="brand"
            accessibilityLabel={ui.threadSend}
            onPress={send}
          />
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={attachOpen} onClose={() => setAttachOpen(false)} title={ui.threadAttach}>
        <Text variant="caption" tone="faint">
          {ui.threadAttachHint}
        </Text>
        {ATTACH_OPTIONS.map((option) => (
          <PressableScale
            key={option.kind}
            onPress={() =>
              option.kind === 'image' || option.kind === 'video'
                ? void pickMedia(option.kind, option.extension)
                : void pickFile()
            }
            accessibilityRole="button"
            accessibilityLabel={ui[option.labelKey]}
            style={[
              styles.attachRow,
              row(isRtl),
              { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
            ]}>
            <View style={[styles.attachIcon, { backgroundColor: theme.color.brandSoft }]}>
              <Icon name={ATTACH_ICON[option.kind]} size={18} color={theme.color.brand} />
            </View>
            <Text variant="bodyMedium" style={styles.flex}>
              {ui[option.labelKey]}
            </Text>
            <Icon name="chevron-forward" size={15} color={theme.color.textFaint} directional />
          </PressableScale>
        ))}
      </BottomSheet>
    </Screen>
  );
}

function Bubble({ bubble, ui }: { bubble: ChatBubble; ui: UiStrings }) {
  const theme = useTheme();
  const { isRtl, lang } = useLanguage();
  const mine = bubble.author === 'me';
  const text = bubble.text ? localized(bubble.text, lang) : '';

  return (
    <View style={[styles.bubbleRow, { alignItems: mine ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: theme.color.brand, borderTopRightRadius: 4 }
            : {
                backgroundColor: theme.color.surfaceMuted,
                borderColor: theme.color.border,
                borderWidth: StyleSheet.hairlineWidth,
                borderTopLeftRadius: 4,
              },
        ]}>
        {bubble.attachment?.kind === 'image' && bubble.attachment.uri ? (
          <Image
            source={{ uri: bubble.attachment.uri }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
            accessibilityLabel={bubble.attachment.name}
          />
        ) : bubble.attachment ? (
          <View
            style={[
              styles.attachment,
              row(isRtl),
              {
                backgroundColor: mine ? 'rgba(255,255,255,0.16)' : theme.color.surface,
                borderColor: mine ? 'rgba(255,255,255,0.24)' : theme.color.border,
              },
            ]}>
            <Icon
              name={ATTACH_ICON[bubble.attachment.kind]}
              size={16}
              color={mine ? '#FFFFFF' : theme.color.brand}
            />
            <Text
              variant="caption"
              color={mine ? '#FFFFFF' : theme.color.text}
              numberOfLines={1}
              style={styles.flex}
              ltr>
              {bubble.attachment.name}
            </Text>
          </View>
        ) : null}
        {text ? (
          <Text variant="body" color={mine ? '#FFFFFF' : theme.color.text}>
            {text}
          </Text>
        ) : null}
        <Text
          variant="caption"
          color={mine ? 'rgba(255,255,255,0.7)' : theme.color.textFaint}
          style={styles.time}>
          {formatRelative(bubble.at, ui)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  orderBanner: {
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thread: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.sm },
  bubbleRow: { width: '100%' },
  bubble: {
    maxWidth: '84%',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  attachment: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  photo: { width: 200, height: 150, borderRadius: radius.sm },
  time: { alignSelf: 'flex-end' },
  composer: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { ...typeScale.body, paddingVertical: spacing.sm },
  attachRow: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  attachIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
