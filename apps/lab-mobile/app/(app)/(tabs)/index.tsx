import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Icon, type IconName } from '@/components/ui/icon';
import { LiveDot } from '@/components/ui/live-dot';
import { Badge, useToneColors, withAlpha, type Tone } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressRing, SegmentedBar } from '@/components/ui/progress';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';
import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { invoiceStatus, invoiceTotals } from '@/lib/billing-data';
import { formatMoneyShort } from '@/lib/format';
import { LOCALES, interpolate, localized, type UiStrings } from '@/lib/i18n';
import { ACTIVITY, ORDERS, PIPELINE, QUICK_ACTIONS, STAGE_META } from '@/lib/mock-data';
import { row, startSpacing } from '@/lib/rtl';
import { useAuth, usePermissions } from '@/store/auth-store';
import { useBilling } from '@/store/invoices-store';
import { useLanguage } from '@/store/language-store';
import { useNotifications } from '@/store/notifications-store';
import {
  clampCapacity,
  setOrderCapacity,
  useWorkPressure,
  workPressureLevel,
  workPressurePercent,
} from '@/store/work-pressure-store';

const OPEN_ORDERS = PIPELINE.reduce((sum, stage) => sum + stage.value, 0);

const RING_STROKE = {
  ok: ['#FFFFFF', 'rgba(255,255,255,0.45)'] as const,
  warning: ['#FFE082', '#F5C542'] as const,
  danger: ['#FF8A80', '#FF5252'] as const,
};

const RING_LABEL = {
  ok: 'rgba(255,255,255,0.78)',
  warning: '#FFE082',
  danger: '#FF8A80',
};

type Stat = {
  id: string;
  labelKey: keyof UiStrings;
  value: string;
  deltaKey: keyof UiStrings;
  deltaValues: Record<string, string | number>;
  icon: IconName;
  tone: Tone;
};

/** The money tile is added at render time, so it only ships real numbers. */
const STATS: Stat[] = [
  {
    id: 's1',
    labelKey: 'dashStatActive',
    value: '24',
    deltaKey: 'dashStatActiveDelta',
    deltaValues: { count: 3 },
    icon: 'layers-outline',
    tone: 'brand',
  },
  {
    id: 's2',
    labelKey: 'dashStatDue',
    value: '9',
    deltaKey: 'dashStatDueDelta',
    deltaValues: { count: 2 },
    icon: 'time-outline',
    tone: 'warning',
  },
  {
    id: 's3',
    labelKey: 'dashStatDelivered',
    value: '138',
    deltaKey: 'dashStatDeliveredDelta',
    deltaValues: { percent: 12 },
    icon: 'checkmark-done-outline',
    tone: 'success',
  },
];

function greetingKey(): keyof UiStrings {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashGreetingMorning';
  if (hour < 18) return 'dashGreetingAfternoon';
  return 'dashGreetingEvening';
}

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { can } = usePermissions();
  const { isRtl, lang, ui } = useLanguage();
  const { unread } = useNotifications();
  const { invoices, paidByInvoice } = useBilling();
  const { capacity } = useWorkPressure();
  const [refreshing, setRefreshing] = useState(false);
  const [pressureOpen, setPressureOpen] = useState(false);
  const workPressure = workPressurePercent(OPEN_ORDERS, capacity);
  const pressureLevel = workPressureLevel(workPressure);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  // Money is the front desk's business, so the tile and the invoice shortcut
  // only exist for the roles that are allowed to see the ledger.
  const money = useMemo(() => {
    let outstanding = 0;
    let open = 0;
    for (const invoice of invoices) {
      const paid = paidByInvoice.get(invoice.id) ?? 0;
      if (invoiceStatus(invoice, paid) === 'draft') continue;
      const { balance } = invoiceTotals(invoice, paid);
      if (balance <= 0) continue;
      outstanding += balance;
      open += 1;
    }
    return { outstanding, open };
  }, [invoices, paidByInvoice]);

  const stats: Stat[] = can('viewBilling')
    ? [
        ...STATS,
        {
          id: 's4',
          labelKey: 'dashStatOutstanding',
          value: formatMoneyShort(money.outstanding),
          deltaKey: 'dashStatOutstandingDelta',
          deltaValues: { count: money.open },
          icon: 'wallet-outline',
          tone: 'accent',
        },
      ]
    : STATS;

  const quickActions = QUICK_ACTIONS.filter(
    (action) => !action.permission || can(action.permission)
  );

  const today = new Date().toLocaleDateString(LOCALES[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const attention = ORDERS.filter((order) => order.urgent);
  const attentionLabel =
    attention.length === 1
      ? ui.dashAttentionOne
      : interpolate(ui.dashAttentionMany, { count: attention.length });

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentStyle={{ paddingTop: spacing.lg }}
      header={
        <ScreenHeader
          title={ui[greetingKey()]}
          subtitle={today}
          titleVariant={lang === 'en' ? 'greeting' : 'heading'}
          right={
            <View style={[styles.headerActions, row(isRtl)]}>
              <IconButton
                icon="notifications-outline"
                accessibilityLabel={ui.notificationsOpenAria}
                badge={unread}
                onPress={() => router.push('/notifications')}
              />
              <PressableScale accessibilityRole="button" accessibilityLabel={ui.dashProfile} scaleTo={0.92}>
                <Avatar initials={user?.initials ?? 'NY'} size={44} online />
              </PressableScale>
            </View>
          }
        />
      }>
      <Animated.View entering={FadeInDown.duration(520)}>
        <LinearGradient
          colors={theme.gradient.hero}
          start={{ x: isRtl ? 1 : 0, y: 0 }}
          end={{ x: isRtl ? 0 : 1, y: 1 }}
          style={[styles.hero, { shadowColor: theme.color.brand }, elevation(3, theme.scheme)]}>
          <View style={[styles.heroBlob, styles.heroBlobTop, isRtl ? { left: -60 } : { right: -60 }]} />
          <View style={[styles.heroBlob, styles.heroBlobBottom, isRtl ? { right: -36 } : { left: -36 }]} />

          <View style={[styles.heroContent, row(isRtl)]}>
            <View style={styles.flex}>
              <LiveDot label={ui.dashTodayAtLab} />
              <Text variant="display" tone="inverse" style={styles.heroValue} ltr>
                {OPEN_ORDERS}
              </Text>
              <Text variant="bodyMedium" color="rgba(255,255,255,0.88)">
                {ui.dashCasesInProduction}
              </Text>

              <View style={[styles.heroPills, row(isRtl)]}>
                <View style={[styles.heroPill, row(isRtl)]}>
                  <Icon name="flash" size={13} color="#FFFFFF" />
                  <Text variant="caption" tone="inverse">
                    {interpolate(ui.dashRushJobs, { count: attention.length })}
                  </Text>
                </View>
                <View style={[styles.heroPill, row(isRtl)]}>
                  <Icon name="car" size={13} color="#FFFFFF" />
                  <Text variant="caption" tone="inverse">
                    {interpolate(ui.dashPickups, { count: 3 })}
                  </Text>
                </View>
              </View>
            </View>

            <PressableScale
              scaleTo={0.94}
              accessibilityRole="button"
              accessibilityLabel={interpolate(ui.dashWorkPressureAria, {
                percent: workPressure,
                open: OPEN_ORDERS,
                capacity,
              })}
              onPress={() => setPressureOpen(true)}>
              <ProgressRing
                value={Math.min(workPressure / 100, 1)}
                size={90}
                stroke={9}
                trackColor="rgba(255,255,255,0.18)"
                colors={RING_STROKE[pressureLevel]}>
                <Text
                  variant="heading"
                  color={pressureLevel === 'ok' ? '#FFFFFF' : RING_LABEL[pressureLevel]}
                  style={styles.centerText}
                  ltr>
                  {interpolate(ui.dashWorkPressureValue, { percent: workPressure })}
                </Text>
                <Text
                  variant="caption"
                  color={RING_LABEL[pressureLevel]}
                  style={[styles.centerText, lang === 'en' && styles.ringLabelEn]}>
                  {ui.dashWorkPressure}
                </Text>
              </ProgressRing>
            </PressableScale>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(130).duration(500)} style={[styles.quickRow, row(isRtl)]}>
        {quickActions.map(({ id, labelKey, icon, tone, route }) => (
          <QuickAction
            key={id}
            label={ui[labelKey]}
            icon={icon}
            tone={tone}
            onPress={route ? () => router.navigate(route) : undefined}
          />
        ))}
      </Animated.View>

      {attention.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(190).duration(500)}>
          <PressableScale
            onPress={() => router.navigate({ pathname: '/orders', params: { filter: 'rush' } })}
            accessibilityRole="button"
            accessibilityLabel={ui.dashAttentionAria}
            style={[
              styles.alert,
              row(isRtl),
              {
                backgroundColor: withAlpha(theme.color.danger, theme.scheme === 'dark' ? 0.16 : 0.1),
                borderColor: withAlpha(theme.color.danger, 0.28),
              },
            ]}>
            <View style={[styles.alertIcon, { backgroundColor: withAlpha(theme.color.danger, 0.18) }]}>
              <Icon name="alert-circle" size={19} color={theme.color.danger} />
            </View>
            <View style={styles.flex}>
              <Text variant="label">{attentionLabel}</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={theme.color.textFaint} directional />
          </PressableScale>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(250).duration(500)} style={[styles.statGrid, row(isRtl)]}>
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(310).duration(500)}>
        <Section title={ui.dashPipeline}>
          <Card style={styles.pipelineCard}>
            <SegmentedBar
              segments={PIPELINE.map((stage) => ({
                key: stage.key,
                value: stage.value,
                color: toneColor(theme, stage.tone),
              }))}
            />
            <View style={[styles.legend, row(isRtl)]}>
              {PIPELINE.map((stage) => (
                <View key={stage.key} style={[styles.legendItem, row(isRtl)]}>
                  <View style={[styles.legendDot, { backgroundColor: toneColor(theme, stage.tone) }]} />
                  <Text variant="caption" tone="muted">
                    {ui[stage.labelKey]}
                  </Text>
                  <Text variant="caption">{stage.value}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(370).duration(500)}>
        <Section
          title={ui.dashInProgress}
          actionLabel={ui.dashSeeAll}
          onAction={() => router.navigate('/orders')}>
          <View style={styles.list}>
            {ORDERS.slice(0, 2).map((order) => (
              <Card key={order.id} style={styles.miniOrder}>
                <View style={[styles.miniOrderTop, row(isRtl)]}>
                  <View style={styles.flex}>
                    <Text variant="label">{order.patient}</Text>
                    <Text variant="caption" tone="faint">
                      {order.id} · {localized(order.workType, lang)}
                    </Text>
                  </View>
                  <Badge
                    label={ui[STAGE_META[order.stage].labelKey]}
                    tone={STAGE_META[order.stage].tone}
                    icon={STAGE_META[order.stage].icon}
                  />
                </View>
                <View style={[styles.miniOrderBottom, row(isRtl)]}>
                  <View style={[styles.track, row(isRtl), { backgroundColor: theme.color.surfaceMuted }]}>
                    <View
                      style={[
                        styles.trackFill,
                        { width: `${order.progress * 100}%`, backgroundColor: theme.color.brand },
                      ]}
                    />
                  </View>
                  <Text variant="caption" tone="muted">
                    {Math.round(order.progress * 100)}%
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(430).duration(500)}>
        <Section title={ui.dashRecentActivity}>
          <Card padded={false} style={styles.activityCard}>
            {ACTIVITY.map((item, index) => (
              <View key={item.id}>
                <View style={[styles.activityRow, row(isRtl)]}>
                  <ToneIcon icon={item.icon} tone={item.tone} />
                  <View style={styles.flex}>
                    <Text variant="bodyMedium" numberOfLines={1}>
                      {localized(item.title, lang)}
                    </Text>
                    <Text variant="caption" tone="faint" numberOfLines={1}>
                      {localized(item.detail, lang)}
                    </Text>
                  </View>
                  <Text variant="caption" tone="faint">
                    {localized(item.time, lang)}
                  </Text>
                </View>
                {index < ACTIVITY.length - 1 ? (
                  <View
                    style={[
                      styles.divider,
                      startSpacing(isRtl, 64),
                      { backgroundColor: theme.color.border },
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </Card>
        </Section>
      </Animated.View>

      <CapacitySheet
        visible={pressureOpen}
        capacity={capacity}
        openOrders={OPEN_ORDERS}
        onClose={() => setPressureOpen(false)}
      />
    </Screen>
  );
}

function CapacitySheet({
  visible,
  capacity,
  openOrders,
  onClose,
}: {
  visible: boolean;
  capacity: number;
  openOrders: number;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const [draft, setDraft] = useState(String(capacity));

  useEffect(() => {
    if (visible) setDraft(String(capacity));
  }, [visible, capacity]);

  const parsed = Number(draft);
  const valid = Number.isFinite(parsed) && parsed >= 1;
  const preview = workPressurePercent(openOrders, valid ? parsed : 0);
  const level = workPressureLevel(preview);

  const nudge = (delta: number) => {
    const current = Number.isFinite(parsed) ? parsed : capacity;
    setDraft(String(clampCapacity(current + delta)));
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={ui.dashCapacityTitle}
      footer={
        <View style={styles.flex}>
          <Button
            label={ui.actionSave}
            icon="checkmark"
            disabled={!valid}
            onPress={() => {
              if (!valid) return;
              setOrderCapacity(parsed);
              onClose();
            }}
          />
        </View>
      }>
      <Text variant="caption" tone="faint">
        {ui.dashCapacityHint}
      </Text>
      <Text variant="bodyMedium">
        {interpolate(ui.dashCapacityOpen, { count: openOrders })}
      </Text>
      <View style={[styles.capacityRow, row(isRtl)]}>
        <View style={styles.flex}>
          <Field
            size="sm"
            label={ui.dashCapacityLabel}
            value={draft}
            onChangeText={(text) => setDraft(text.replace(/[^\d]/g, ''))}
            icon="layers-outline"
            keyboardType="number-pad"
            ltr
            textAlign={isRtl ? 'right' : 'left'}
          />
        </View>
        <View style={[styles.capacitySteppers, row(isRtl)]}>
          <IconButton
            icon="remove"
            size={46}
            shape="rounded"
            accessibilityLabel={ui.dashCapacityDecrease}
            onPress={() => nudge(-1)}
          />
          <IconButton
            icon="add"
            size={46}
            shape="rounded"
            accessibilityLabel={ui.dashCapacityIncrease}
            onPress={() => nudge(1)}
          />
        </View>
      </View>
      <Text variant="caption" tone="muted" style={styles.centerText}>
        {ui.dashWorkPressure}
      </Text>
      <Text
        variant="metric"
        ltr
        color={level === 'ok' ? theme.color.text : level === 'warning' ? theme.color.warning : theme.color.danger}
        style={styles.centerText}>
        {interpolate(ui.dashWorkPressureValue, { percent: preview })}
      </Text>
    </BottomSheet>
  );
}

function QuickAction({
  label,
  icon,
  tone,
  onPress,
}: {
  label: string;
  icon: IconName;
  tone: Tone;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const { fg, bg } = useToneColors(tone);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.93}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.quickAction,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.quickIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={19} color={fg} />
      </View>
      <Text variant="caption" numberOfLines={1} style={styles.centerText}>
        {label}
      </Text>
    </PressableScale>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const { fg, bg } = useToneColors(stat.tone);
  const { ui } = useLanguage();

  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Icon name={stat.icon} size={17} color={fg} />
      </View>
      <Text variant="metric" style={styles.statValue}>
        {stat.value}
      </Text>
      <Text variant="caption" tone="muted">
        {ui[stat.labelKey]}
      </Text>
      <Text variant="caption" color={fg}>
        {interpolate(ui[stat.deltaKey], stat.deltaValues)}
      </Text>
    </Card>
  );
}

function ToneIcon({ icon, tone }: { icon: IconName; tone: Tone }) {
  const { fg, bg } = useToneColors(tone);

  return (
    <View style={[styles.toneIcon, { backgroundColor: bg }]}>
      <Icon name={icon} size={17} color={fg} />
    </View>
  );
}

function toneColor(theme: ReturnType<typeof useTheme>, tone: Tone) {
  const map: Record<Tone, string> = {
    brand: theme.color.brand,
    accent: theme.color.accent,
    success: theme.color.success,
    warning: theme.color.warning,
    danger: theme.color.danger,
    neutral: theme.color.textMuted,
  };
  return map[tone];
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerText: { textAlign: 'center' },
  ringLabelEn: { fontSize: 10, lineHeight: 12, width: 54 },
  headerActions: { alignItems: 'center', gap: spacing.sm },
  capacityRow: { alignItems: 'flex-end', gap: spacing.sm },
  capacitySteppers: { alignItems: 'center', gap: spacing.sm },
  hero: {
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
  },
  heroBlobTop: { width: 200, height: 200, top: -104 },
  heroBlobBottom: { width: 140, height: 140, bottom: -74 },
  heroContent: { alignItems: 'flex-start', gap: spacing.lg },
  heroValue: { marginTop: spacing.md },
  heroPills: { gap: spacing.sm, marginTop: spacing.lg },
  heroPill: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  quickRow: { gap: spacing.sm },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  alert: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  alertIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  statGrid: { flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47.6%', flexGrow: 1, gap: 2 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { marginBottom: 2 },
  pipelineCard: { gap: spacing.lg },
  legend: { flexWrap: 'wrap', gap: spacing.md },
  legendItem: { alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  list: { gap: spacing.md },
  miniOrder: { gap: spacing.md },
  miniOrderTop: { alignItems: 'flex-start', gap: spacing.md },
  miniOrderBottom: { alignItems: 'center', gap: spacing.md },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 3 },
  activityCard: { paddingVertical: spacing.xs },
  activityRow: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toneIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth },
});
