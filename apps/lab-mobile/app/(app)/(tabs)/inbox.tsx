import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Badge, Chip, withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { formatRelative } from '@/lib/format';
import { interpolate, localized, type UiStrings } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { useChat, type Conversation } from '@/store/chat-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | 'unread' | 'priority';

const FILTERS: { key: Filter; labelKey: keyof UiStrings }[] = [
  { key: 'all', labelKey: 'inboxFilterAll' },
  { key: 'unread', labelKey: 'inboxFilterUnread' },
  { key: 'priority', labelKey: 'inboxFilterPriority' },
];

export default function InboxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isRtl, ui } = useLanguage();
  const { conversations, unread } = useChat();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () =>
      conversations.filter((conversation) =>
        filter === 'unread'
          ? conversation.unread > 0
          : filter === 'priority'
            ? conversation.priority !== 'normal'
            : true
      ),
    [conversations, filter]
  );

  const countFor = (key: Filter) =>
    key === 'all'
      ? conversations.length
      : key === 'unread'
        ? conversations.filter((conversation) => conversation.unread > 0).length
        : conversations.filter((conversation) => conversation.priority !== 'normal').length;

  const openConversation = (id: string) =>
    router.push({ pathname: '/inbox/[id]', params: { id } });

  return (
    <Screen
      header={
        <ScreenHeader
          title={ui.inboxTitle}
          subtitle={unread > 0 ? interpolate(ui.inboxUnreadSubtitle, { count: unread }) : ui.inboxAllRead}
          right={
            <IconButton
              icon="create-outline"
              accessibilityLabel={ui.inboxNewMessage}
              tone="brand"
              onPress={() => router.push('/inbox/new')}
            />
          }
        />
      }>
      <View style={[styles.chipRow, row(isRtl)]}>
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={ui[item.labelKey]}
            count={countFor(item.key)}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={ui.inboxSupportAria}
        onPress={() => openConversation('support')}
        style={[styles.support, row(isRtl), { backgroundColor: withAlpha(theme.color.accent, 0.12) }]}>
        <View style={[styles.supportIcon, { backgroundColor: theme.color.accent }]}>
          <Icon name="headset-outline" size={19} color="#FFFFFF" />
        </View>
        <View style={styles.flex}>
          <Text variant="label">{ui.inboxSupport}</Text>
          <Text variant="caption" tone="muted">
            {ui.inboxSupportReply}
          </Text>
        </View>
        <Icon name="chevron-forward" size={16} color={theme.color.accent} directional />
      </PressableScale>

      <View style={styles.list}>
        {visible.map((conversation, index) => (
          <Animated.View key={conversation.id} entering={FadeInDown.delay(index * 55).duration(420)}>
            <MessageRow conversation={conversation} onPress={() => openConversation(conversation.id)} />
          </Animated.View>
        ))}

        {visible.length === 0 ? (
          <Card style={styles.empty}>
            <Icon name="mail-open-outline" size={30} color={theme.color.textFaint} />
            <Text variant="subheading">{ui.inboxEmptyTitle}</Text>
            <Text variant="caption" tone="muted" style={styles.emptyText}>
              {ui.inboxEmptyBody}
            </Text>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

function MessageRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const sender = localized(conversation.name, lang);
  const last = conversation.bubbles[conversation.bubbles.length - 1];

  const preview = last?.text
    ? localized(last.text, lang)
    : last?.attachment
      ? last.attachment.name
      : '';
  const previewIsMine = last?.author === 'me';

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.inboxConversationAria, { name: sender })}>
      <Card style={styles.row}>
        <View style={[styles.rowTop, row(isRtl)]}>
          <Avatar initials={conversation.initials} size={44} online={conversation.unread > 0} />

          <View style={styles.flex}>
            <View style={[styles.rowHeader, row(isRtl)]}>
              <Text variant="label" numberOfLines={1} style={styles.flex}>
                {sender}
              </Text>
              {last ? (
                <Text variant="caption" tone="faint">
                  {formatRelative(last.at, ui)}
                </Text>
              ) : null}
            </View>
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {localized(conversation.clinic, lang)}
            </Text>
          </View>
        </View>

        <View style={[styles.previewRow, row(isRtl)]}>
          {last?.attachment && !last.text ? (
            <Icon name="attach-outline" size={14} color={theme.color.textFaint} />
          ) : null}
          <Text
            variant="body"
            tone={conversation.unread > 0 ? 'default' : 'muted'}
            numberOfLines={2}
            style={styles.flex}
            ltr={Boolean(last?.attachment && !last?.text)}>
            {previewIsMine ? interpolate(ui.inboxYouPreview, { text: preview }) : preview}
          </Text>
        </View>

        <View style={[styles.rowFooter, row(isRtl)]}>
          <View style={[styles.tags, row(isRtl)]}>
            {conversation.priority === 'action' ? (
              <Badge label={ui.inboxActionRequired} tone="danger" icon="alert-circle" />
            ) : null}
            {conversation.priority === 'high' ? (
              <Badge label={ui.inboxHighPriority} tone="warning" icon="arrow-up" />
            ) : null}
            {conversation.orderId ? (
              <Badge label={conversation.orderId} tone="brand" icon="layers-outline" />
            ) : null}
          </View>
          {conversation.unread > 0 ? (
            <View style={[styles.dot, { backgroundColor: theme.color.brand }]} />
          ) : null}
        </View>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chipRow: { gap: spacing.sm },
  support: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  supportIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { gap: spacing.md },
  row: { gap: spacing.md },
  rowTop: { alignItems: 'center', gap: spacing.md },
  rowHeader: { alignItems: 'center', gap: spacing.sm },
  previewRow: { alignItems: 'flex-start', gap: spacing.xs, marginTop: -spacing.xs },
  rowFooter: { alignItems: 'center', justifyContent: 'space-between' },
  tags: { flexWrap: 'wrap', gap: spacing.sm, flex: 1 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['3xl'] },
  emptyText: { textAlign: 'center' },
});
