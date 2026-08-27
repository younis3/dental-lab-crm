import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BackButton } from '@/components/ui/back-button';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon, type IconName } from '@/components/ui/icon';
import { Badge, withAlpha } from '@/components/ui/pill';
import { ProgressRing } from '@/components/ui/progress';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { interpolate, localized, type UiStrings } from '@/lib/i18n';
import { ORDERS, STAGE_META, type Order, type OrderStage } from '@/lib/mock-data';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

/** Pipeline order the timeline walks through, first stage to last. */
const STAGE_FLOW: OrderStage[] = [
  'received',
  'design',
  'production',
  'quality',
  'courier',
  'delivered',
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ui } = useLanguage();
  const order = useMemo(() => ORDERS.find((item) => item.id === id), [id]);

  if (!order) {
    return (
      <Screen
        withTabBarInset={false}
        header={<ScreenHeader title={ui.ordersTitle} leading={<BackButton />} showMenu={false} />}>
        <EmptyState
          icon="file-tray-outline"
          title={ui.orderDetailNotFoundTitle}
          hint={ui.orderDetailNotFoundBody}
        />
      </Screen>
    );
  }

  return <OrderDetail order={order} ui={ui} />;
}

function OrderDetail({ order, ui }: { order: Order; ui: UiStrings }) {
  const theme = useTheme();
  const router = useRouter();
  const { isRtl, lang } = useLanguage();
  const [favorite, setFavorite] = useState(order.favorite);

  const stage = STAGE_META[order.stage];
  const percent = Math.round(order.progress * 100);
  const currentIndex = STAGE_FLOW.indexOf(order.stage);

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={order.id}
          subtitle={order.patient}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon={favorite ? 'star' : 'star-outline'}
              tone={favorite ? 'brand' : 'surface'}
              accessibilityLabel={favorite ? ui.ordersUnstar : ui.ordersStar}
              onPress={() => setFavorite((value) => !value)}
            />
          }
        />
      }>
      <Animated.View entering={FadeInDown.duration(420)}>
        <Section title={ui.orderDetailProgress}>
          <Card style={[styles.hero, row(isRtl)]}>
            <ProgressRing value={order.progress} size={104} stroke={10} colors={theme.gradient.brand}>
              <Text variant="metric" style={styles.ringValue}>
                {percent}
              </Text>
              <Text variant="caption" tone="faint">
                %
              </Text>
            </ProgressRing>

            <View style={styles.heroInfo}>
              <View style={[styles.heroBadges, row(isRtl)]}>
                <Badge label={ui[stage.labelKey]} tone={stage.tone} icon={stage.icon} />
                {order.urgent ? (
                  <Badge label={ui.ordersRushBadge} tone="danger" icon="flash" />
                ) : null}
              </View>
              <Text variant="heading" numberOfLines={2}>
                {localized(order.workType, lang)}
              </Text>
              <Text variant="caption" tone="muted">
                {interpolate(ui.orderDetailComplete, { percent })}
              </Text>
              <View style={[styles.heroDue, row(isRtl)]}>
                <Icon
                  name="calendar-outline"
                  size={14}
                  color={order.urgent ? theme.color.danger : theme.color.textFaint}
                />
                <Text variant="caption" tone={order.urgent ? 'danger' : 'muted'}>
                  {localized(order.dueLabel, lang)}
                </Text>
              </View>
            </View>
          </Card>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)}>
        <Section title={ui.orderDetailTimeline}>
          <Card>
            {STAGE_FLOW.map((key, index) => {
              const meta = STAGE_META[key];
              const isDone = index < currentIndex;
              const isCurrent = index === currentIndex;
              const last = index === STAGE_FLOW.length - 1;
              const dotColor = isDone
                ? theme.color.success
                : isCurrent
                  ? theme.color.brand
                  : theme.color.textFaint;

              return (
                <View key={key} style={[styles.stageRow, row(isRtl)]}>
                  <View style={styles.stageRail}>
                    <View
                      style={[
                        styles.stageDot,
                        {
                          backgroundColor: isDone || isCurrent ? dotColor : theme.color.surfaceMuted,
                          borderColor: dotColor,
                        },
                      ]}>
                      <Icon
                        name={isDone ? 'checkmark' : meta.icon}
                        size={13}
                        color={isDone || isCurrent ? '#FFFFFF' : theme.color.textFaint}
                      />
                    </View>
                    {!last ? (
                      <View
                        style={[
                          styles.stageLine,
                          { backgroundColor: isDone ? theme.color.success : theme.color.border },
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={styles.stageBody}>
                    <Text
                      variant={isCurrent ? 'subheading' : 'bodyMedium'}
                      tone={isDone || isCurrent ? 'default' : 'faint'}>
                      {ui[meta.labelKey]}
                    </Text>
                    {isCurrent ? (
                      <Badge label={ui.orderDetailStageCurrent} tone={stage.tone} />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </Card>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(420)}>
        <Section title={ui.orderDetailSpecTitle}>
          <Card padded={false}>
            <SpecRow icon="person-outline" label={ui.orderDetailPatient} value={order.patient} />
            <Divider />
            <SpecRow
              icon="construct-outline"
              label={ui.orderDetailWorkType}
              value={localized(order.workType, lang)}
            />
            <Divider />
            <SpecRow
              icon="color-filter-outline"
              label={ui.orderDetailShade}
              value={order.shade}
            />
            <Divider />
            <SpecRow
              icon="git-commit-outline"
              label={ui.orderDetailTeeth}
              value={localized(order.teeth, lang)}
            />
            <Divider />
            <SpecRow icon="medkit-outline" label={ui.orderDetailDoctor} value={order.doctor} />
            <Divider />
            <SpecRow icon="business-outline" label={ui.orderDetailClinic} value={order.clinic} />
          </Card>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(420)} style={styles.actions}>
        <Button
          label={ui.orderDetailMessageClinic}
          icon="chatbubbles-outline"
          onPress={() => router.navigate('/inbox')}
        />
        <Button
          label={ui.orderDetailViewFiles}
          icon="folder-open-outline"
          variant="secondary"
          onPress={() => router.navigate('/folders')}
        />
      </Animated.View>
    </Screen>
  );
}

function SpecRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <View style={[styles.specRow, row(isRtl)]}>
      <View style={[styles.specIcon, { backgroundColor: withAlpha(theme.color.brand, 0.12) }]}>
        <Icon name={icon} size={16} color={theme.color.brand} />
      </View>
      <Text variant="caption" tone="faint" style={styles.specLabel}>
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.specValue, { textAlign: isRtl ? 'left' : 'right' }]}
        numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.color.border }]} />;
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.lg },
  ringValue: { lineHeight: 34 },
  heroInfo: { flex: 1, gap: spacing.sm },
  heroBadges: { flexWrap: 'wrap', gap: spacing.sm },
  heroDue: { alignItems: 'center', gap: 5 },
  stageRow: { gap: spacing.md },
  stageRail: { alignItems: 'center', width: 26 },
  stageDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  stageLine: { width: 2, flex: 1, minHeight: 22, marginVertical: 2 },
  stageBody: { flex: 1, paddingBottom: spacing.lg, gap: spacing.xs, alignItems: 'flex-start' },
  specRow: { alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  specIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: { flex: 1 },
  specValue: { flexShrink: 1, maxWidth: '55%' },
  actions: { gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.lg },
});
