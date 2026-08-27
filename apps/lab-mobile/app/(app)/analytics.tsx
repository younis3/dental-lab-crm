import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon, type IconName } from '@/components/ui/icon';
import { Badge, useToneColors, type Tone } from '@/components/ui/pill';
import { ProgressBar, ProgressRing } from '@/components/ui/progress';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import {
  ANALYTICS_RANGES,
  buildAnalytics,
  type MonthBucket,
  type RangeKey,
} from '@/lib/analytics-data';
import { PAYMENT_METHOD_META } from '@/lib/billing-data';
import { formatMoney, formatMoneyShort, initials } from '@/lib/format';
import { LOCALES, interpolate, localized } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import { useBilling } from '@/store/invoices-store';
import { useLanguage } from '@/store/language-store';

const CHART_HEIGHT = 132;
/** Keeps an empty month visible as a sliver instead of nothing at all. */
const MIN_BAR = 0.03;

const percent = (value: number) => Math.round(value * 100);

/**
 * Owner's view of the numbers. Everything is derived from the same invoices and
 * payments the billing screen lists, so the money here always reconciles with
 * the ledger it came from.
 */
export default function AnalyticsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const { can } = usePermissions();
  const { invoices, payments, paidByInvoice } = useBilling();

  const [range, setRange] = useState<RangeKey>('quarter');
  const months = ANALYTICS_RANGES.find((option) => option.key === range)?.months ?? 3;

  const data = useMemo(
    () => buildAnalytics(invoices, payments, paidByInvoice, months),
    [invoices, months, paidByInvoice, payments]
  );

  if (!can('viewAnalytics')) {
    return <Redirect href="/" />;
  }

  const collectedShare = percent(data.collectionRate);

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={ui.analyticsTitle}
          subtitle={ui.analyticsSubtitle}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="receipt-outline"
              accessibilityLabel={ui.navBilling}
              onPress={() => router.push('/billing')}
            />
          }
        />
      }>
      <Animated.View entering={FadeInDown.duration(380)}>
        <Segmented
          value={range}
          onChange={setRange}
          options={ANALYTICS_RANGES.map((option) => ({
            key: option.key,
            label: ui[option.labelKey],
          }))}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(460)}>
        <LinearGradient
          colors={theme.gradient.hero}
          start={{ x: isRtl ? 1 : 0, y: 0 }}
          end={{ x: isRtl ? 0 : 1, y: 1 }}
          style={[styles.hero, { shadowColor: theme.color.brand }, elevation(3, theme.scheme)]}>
          <View style={[styles.heroRow, row(isRtl)]}>
            <View style={styles.flex}>
              <Text variant="overline" color="rgba(255,255,255,0.72)">
                {ui.analyticsHeroInvoiced}
              </Text>
              <Text variant="display" tone="inverse" ltr>
                {formatMoneyShort(data.invoiced)}
              </Text>
              <View style={[styles.heroPill, row(isRtl)]}>
                <Icon name="trending-up-outline" size={13} color="#FFFFFF" />
                <Text variant="caption" tone="inverse" ltr>
                  {formatMoney(data.collected)}
                </Text>
              </View>
              <Text variant="caption" color="rgba(255,255,255,0.78)">
                {ui.analyticsHeroCollected}
              </Text>
            </View>

            <ProgressRing
              value={data.collectionRate}
              size={104}
              stroke={10}
              trackColor="rgba(255,255,255,0.18)"
              colors={['#FFFFFF', 'rgba(255,255,255,0.45)'] as const}>
              <Text variant="heading" tone="inverse" ltr>
                {`${collectedShare}%`}
              </Text>
              <Text variant="caption" color="rgba(255,255,255,0.78)" style={styles.center}>
                {ui.analyticsCollectionRate}
              </Text>
            </ProgressRing>
          </View>
        </LinearGradient>
      </Animated.View>

      {data.invoiceCount === 0 ? (
        <EmptyState icon="stats-chart-outline" title={ui.analyticsEmpty} hint={ui.analyticsEmptyHint} />
      ) : (
        <>
          <Animated.View
            entering={FadeInDown.delay(120).duration(460)}
            style={[styles.kpiGrid, row(isRtl)]}>
            <Kpi
              icon="wallet-outline"
              tone="brand"
              value={formatMoneyShort(data.outstanding)}
              label={ui.analyticsKpiOutstanding}
            />
            <Kpi
              icon="alert-circle-outline"
              tone="danger"
              value={formatMoneyShort(data.overdue)}
              label={ui.analyticsKpiOverdue}
              hint={interpolate(ui.analyticsOverdueCount, { count: data.overdueCount })}
            />
            <Kpi
              icon="receipt-outline"
              tone="accent"
              value={formatMoneyShort(data.avgInvoice)}
              label={ui.analyticsKpiAvgInvoice}
              hint={interpolate(ui.analyticsInvoiceCount, { count: data.invoiceCount })}
            />
            <Kpi
              icon="cube-outline"
              tone="success"
              value={String(data.units)}
              label={ui.analyticsKpiUnits}
              hint={interpolate(ui.analyticsCounterShare, { percent: percent(data.counterShare) })}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(460)}>
            <Section title={ui.analyticsRevenueTitle}>
              <Card style={styles.chartCard}>
                <MonthlyChart series={data.series} />
                <View style={[styles.legend, row(isRtl)]}>
                  <Legend color={theme.color.brand} label={ui.analyticsLegendInvoiced} />
                  <Legend color={theme.color.success} label={ui.analyticsLegendCollected} />
                </View>
              </Card>
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(460)}>
            <Section title={ui.analyticsQualityTitle}>
              <View style={[styles.qualityRow, row(isRtl)]}>
                <Card style={styles.qualityCard}>
                  <Text variant="metric" ltr>
                    {`${percent(data.onTime)}%`}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {ui.analyticsKpiOnTime}
                  </Text>
                  <ProgressBar value={data.onTime} height={6} />
                </Card>
                <Card style={styles.qualityCard}>
                  <Text variant="metric" ltr>
                    {data.turnaround.toFixed(1)}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {ui.analyticsKpiTurnaround}
                  </Text>
                  <Text variant="caption" tone="faint">
                    {ui.analyticsTurnaroundHint}
                  </Text>
                </Card>
              </View>
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(460)}>
            <Section title={ui.analyticsServicesTitle}>
              <Card style={styles.listCard}>
                {data.byService.slice(0, 5).map((service, index) => (
                  <ShareRow
                    key={service.id}
                    title={localized(service.name, lang)}
                    hint={interpolate(ui.analyticsServiceUnits, { count: service.units })}
                    value={formatMoney(service.amount)}
                    ratio={service.amount / (data.byService[0]?.amount || 1)}
                    delay={index * 90}
                  />
                ))}
              </Card>
            </Section>
          </Animated.View>

          {data.topDoctors.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(360).duration(460)}>
              <Section title={ui.analyticsDoctorsTitle}>
                <Card style={styles.listCard}>
                  {data.topDoctors.slice(0, 4).map((doctor) => (
                    <View key={doctor.id} style={[styles.doctorRow, row(isRtl)]}>
                      <Avatar initials={initials(doctor.name)} size={38} />
                      <View style={styles.flex}>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {doctor.name}
                        </Text>
                        <Text variant="caption" tone="faint" numberOfLines={1}>
                          {doctor.clinic}
                        </Text>
                      </View>
                      <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
                        <Text variant="bodyMedium" ltr>
                          {formatMoney(doctor.amount)}
                        </Text>
                        <Text variant="caption" tone="faint">
                          {interpolate(ui.analyticsInvoiceCount, { count: doctor.count })}
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </Section>
            </Animated.View>
          ) : null}

          {data.byMethod.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(420).duration(460)}>
              <Section title={ui.analyticsMethodsTitle}>
                <Card style={styles.listCard}>
                  {data.byMethod.map((slice, index) => (
                    <ShareRow
                      key={slice.method}
                      icon={PAYMENT_METHOD_META[slice.method].icon}
                      title={ui[PAYMENT_METHOD_META[slice.method].labelKey]}
                      hint={interpolate(ui.analyticsMethodCount, { count: slice.count })}
                      value={formatMoney(slice.amount)}
                      ratio={data.collected === 0 ? 0 : slice.amount / data.collected}
                      delay={index * 90}
                    />
                  ))}
                </Card>
              </Section>
            </Animated.View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function Kpi({
  icon,
  tone,
  value,
  label,
  hint,
}: {
  icon: IconName;
  tone: Tone;
  value: string;
  label: string;
  hint?: string;
}) {
  const { fg, bg } = useToneColors(tone);

  return (
    <Card style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={16} color={fg} />
      </View>
      <Text variant="heading" ltr numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
      {hint ? (
        <Text variant="caption" color={fg} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
}

/** Paired bars per month: what was invoiced against what actually came in. */
function MonthlyChart({ series }: { series: MonthBucket[] }) {
  const theme = useTheme();
  const { isRtl, lang } = useLanguage();
  const peak = Math.max(...series.map((month) => Math.max(month.invoiced, month.collected)), 1);

  return (
    <View style={[styles.chart, row(isRtl)]}>
      {series.map((month, index) => (
        <View key={month.key} style={styles.chartColumn}>
          <View style={[styles.chartBars, row(isRtl)]}>
            <Bar ratio={month.invoiced / peak} color={theme.color.brand} delay={index * 80} />
            <Bar ratio={month.collected / peak} color={theme.color.success} delay={index * 80 + 40} />
          </View>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {new Date(month.year, month.monthIndex, 1).toLocaleDateString(LOCALES[lang], {
              month: 'short',
            })}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Bar({ ratio, color, delay }: { ratio: number; color: string; delay: number }) {
  const height = useSharedValue(0);

  useEffect(() => {
    const target = Math.max(MIN_BAR, Math.min(1, ratio)) * CHART_HEIGHT;
    height.set(withDelay(delay, withTiming(target, { duration: 720 })));
  }, [delay, height, ratio]);

  const style = useAnimatedStyle(() => ({ height: height.get() }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  const { isRtl } = useLanguage();

  return (
    <View style={[styles.legendItem, row(isRtl)]}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

function ShareRow({
  icon,
  title,
  hint,
  value,
  ratio,
  delay,
}: {
  icon?: IconName;
  title: string;
  hint: string;
  value: string;
  ratio: number;
  delay: number;
}) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <View style={styles.shareRow}>
      <View style={[styles.shareTop, row(isRtl)]}>
        {icon ? <Icon name={icon} size={15} color={theme.color.textFaint} /> : null}
        <View style={styles.flex}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {hint}
          </Text>
        </View>
        <Badge label={value} />
      </View>
      <ProgressBar value={ratio} height={6} delay={delay} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  hero: { padding: spacing['2xl'], borderRadius: radius['2xl'], overflow: 'hidden' },
  heroRow: { alignItems: 'center', gap: spacing.lg },
  heroPill: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  kpiGrid: { flexWrap: 'wrap', gap: spacing.md },
  kpi: { width: '47.6%', flexGrow: 1, gap: 2 },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  chartCard: { gap: spacing.lg },
  chart: { alignItems: 'flex-end', gap: spacing.sm },
  chartColumn: { flex: 1, alignItems: 'center', gap: spacing.sm },
  chartBars: { height: CHART_HEIGHT, alignItems: 'flex-end', gap: 3 },
  bar: { width: 11, borderRadius: 6 },
  legend: { flexWrap: 'wrap', gap: spacing.lg },
  legendItem: { alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  qualityRow: { gap: spacing.md },
  qualityCard: { flex: 1, gap: spacing.xs },
  listCard: { gap: spacing.lg },
  shareRow: { gap: spacing.sm },
  shareTop: { alignItems: 'center', gap: spacing.sm },
  doctorRow: { alignItems: 'center', gap: spacing.md },
});
