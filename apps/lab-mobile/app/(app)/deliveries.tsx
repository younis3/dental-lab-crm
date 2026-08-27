import { Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon, type IconName } from '@/components/ui/icon';
import { Badge, Chip, useToneColors, type Tone } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { elevation, radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import {
  DELIVERY_DAYS,
  DELIVERY_STOPS,
  DRIVERS,
  driverById,
  type DeliveryStop,
  type Driver,
} from '@/lib/delivery-data';
import { initials } from '@/lib/format';
import { LOCALES, interpolate, localized, type Lang, type UiStrings } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';

type Scope = 'today' | 'week';

/** Sentinel for the "no driver filter" tab. */
const ALL = 'all';

type StopSection = { key: string; title: string; driver?: Driver; data: DeliveryStop[] };

/**
 * Stops carry a relative day slot, so the header never prints a calendar date —
 * day 0 and 1 get their own wording and the rest fall back to a weekday name.
 */
function dayLabel(day: number, lang: Lang, ui: UiStrings): string {
  if (day === 0) return ui.deliveriesToday;
  if (day === 1) return ui.deliveriesTomorrow;

  const date = new Date();
  date.setDate(date.getDate() + day);
  return date.toLocaleDateString(LOCALES[lang], { weekday: 'long' });
}

export default function DeliveriesScreen() {
  const insets = useSafeAreaInsets();
  const { isRtl, lang, ui } = useLanguage();
  const { can } = usePermissions();
  const [scope, setScope] = useState<Scope>('today');
  const [driverId, setDriverId] = useState<string>(ALL);

  const scoped = useMemo(
    () => (scope === 'today' ? DELIVERY_STOPS.filter((stop) => stop.day === 0) : DELIVERY_STOPS),
    [scope]
  );

  const visible = useMemo(
    () => (driverId === ALL ? scoped : scoped.filter((stop) => stop.driverId === driverId)),
    [driverId, scoped]
  );

  const tabs = useMemo(
    () => [
      { key: ALL, label: ui.deliveriesAllDrivers, count: scoped.length },
      ...DRIVERS.map((driver) => ({
        key: driver.id,
        label: driver.name,
        count: scoped.filter((stop) => stop.driverId === driver.id).length,
      })),
    ],
    [scoped, ui]
  );

  // Today groups by driver so a dispatcher reads one run at a time; the weekly
  // view groups by day instead, which is the axis that actually varies there.
  const sections = useMemo<StopSection[]>(() => {
    if (scope === 'week') {
      return Array.from({ length: DELIVERY_DAYS }, (_, day) => ({
        key: `day-${day}`,
        title: dayLabel(day, lang, ui),
        data: visible.filter((stop) => stop.day === day),
      })).filter((section) => section.data.length > 0);
    }

    return DRIVERS.map((driver) => ({
      key: driver.id,
      title: driver.name,
      driver,
      data: visible.filter((stop) => stop.driverId === driver.id),
    })).filter((section) => section.data.length > 0);
  }, [lang, scope, ui, visible]);

  const caseCount = visible.reduce((sum, stop) => sum + stop.cases, 0);
  const cityCount = new Set(visible.map((stop) => stop.city.en)).size;
  const selectedDriver = driverId === ALL ? undefined : driverById(driverId);
  /** Only the weekly, unfiltered board mixes drivers inside one section. */
  const taggedDrivers = scope === 'week' && driverId === ALL;
  /** One driver, one day — the driver card already titles the run. */
  const singleRun = scope === 'today' && Boolean(selectedDriver);

  if (!can('viewDeliveries')) {
    return <Redirect href="/" />;
  }

  return (
    <Screen
      scrollable={false}
      header={
        <ScreenHeader
          title={ui.deliveriesTitle}
          subtitle={interpolate(ui.deliveriesSubtitle, {
            stops: visible.length,
            drivers: DRIVERS.length,
          })}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <View style={styles.controls}>
        <View style={styles.scopeWrap}>
          <ScopeSwitch value={scope} onChange={setScope} />
        </View>

        <FlatList
          horizontal
          inverted={isRtl}
          data={tabs}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              count={item.count}
              selected={driverId === item.key}
              onPress={() => setDriverId(item.key)}
            />
          )}
        />
      </View>

      <SectionList
        style={styles.flex}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        ItemSeparatorComponent={() => <View style={styles.itemGap} />}
        ListHeaderComponent={
          <View style={[styles.listHeader, singleRun ? styles.listHeaderGap : null]}>
            {selectedDriver ? (
              <DriverCard driver={selectedDriver} stops={visible.length} />
            ) : null}
            <View style={[styles.summary, row(isRtl)]}>
              <SummaryTile
                icon="navigate-outline"
                value={visible.length}
                label={ui.deliveriesSummaryStops}
                tone="brand"
              />
              <SummaryTile
                icon="cube-outline"
                value={caseCount}
                label={ui.deliveriesSummaryCases}
                tone="accent"
              />
              <SummaryTile
                icon="location-outline"
                value={cityCount}
                label={ui.deliveriesSummaryCities}
                tone="success"
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title={ui.deliveriesEmptyTitle}
            hint={ui.deliveriesEmptyBody}
          />
        }
        renderSectionHeader={({ section }) =>
          singleRun ? null : <SectionHeading section={section} />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 40).duration(400)}>
            <StopCard
              stop={item}
              driver={taggedDrivers ? driverById(item.driverId) : undefined}
            />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

function ScopeSwitch({ value, onChange }: { value: Scope; onChange: (next: Scope) => void }) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();

  const options: { key: Scope; label: string; icon: IconName }[] = [
    { key: 'today', label: ui.deliveriesToday, icon: 'today-outline' },
    { key: 'week', label: ui.deliveriesThisWeek, icon: 'calendar-outline' },
  ];

  return (
    <View style={[styles.scope, row(isRtl), { backgroundColor: theme.color.surfaceMuted }]}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <PressableScale
            key={option.key}
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.key)}
            style={[
              styles.scopeOption,
              row(isRtl),
              active
                ? { backgroundColor: theme.color.surfaceRaised, ...elevation(1, theme.scheme) }
                : null,
            ]}>
            <Icon
              name={option.icon}
              size={15}
              color={active ? theme.color.brand : theme.color.textFaint}
            />
            <Text variant="label" color={active ? theme.color.text : theme.color.textFaint}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

function SummaryTile({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: number;
  label: string;
  tone: Tone;
}) {
  const theme = useTheme();
  const { isRtl } = useLanguage();
  const { fg, bg } = useToneColors(tone);

  return (
    <View
      style={[
        styles.tile,
        row(isRtl),
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.tileIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={15} color={fg} />
      </View>
      <View style={styles.flex}>
        <Text variant="label">{value}</Text>
        <Text variant="caption" tone="faint" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function DriverCard({ driver, stops }: { driver: Driver; stops: number }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();

  return (
    <Card style={styles.driverCard}>
      <View style={[styles.driverHead, row(isRtl)]}>
        <Avatar initials={initials(driver.name)} size={46} colors={[driver.color, driver.color]} />
        <View style={styles.flex}>
          <Text variant="subheading" numberOfLines={1}>
            {driver.name}
          </Text>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {localized(driver.region, lang)}
          </Text>
        </View>
        <Badge
          label={interpolate(ui.deliveriesStopsCount, { count: stops })}
          tone="brand"
          icon="navigate-outline"
        />
      </View>

      <View style={[styles.driverMeta, row(isRtl)]}>
        <View style={[styles.meta, row(isRtl)]}>
          <Icon name="car-outline" size={13} color={theme.color.textFaint} />
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {localized(driver.vehicle, lang)}
          </Text>
        </View>
        <View style={[styles.meta, row(isRtl)]}>
          <Icon name="call-outline" size={13} color={theme.color.textFaint} />
          <Text variant="caption" tone="muted" ltr numberOfLines={1}>
            {driver.phone}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function SectionHeading({ section }: { section: StopSection }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();

  return (
    <View style={[styles.sectionHead, row(isRtl)]}>
      {section.driver ? (
        <Avatar
          initials={initials(section.driver.name)}
          size={30}
          colors={[section.driver.color, section.driver.color]}
        />
      ) : (
        <View style={[styles.dayMark, { backgroundColor: theme.color.brandSoft }]}>
          <Icon name="calendar-outline" size={15} color={theme.color.brand} />
        </View>
      )}

      <View style={styles.flex}>
        <Text variant="label" numberOfLines={1}>
          {section.title}
        </Text>
        {section.driver ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {localized(section.driver.region, lang)}
          </Text>
        ) : null}
      </View>

      <Badge label={interpolate(ui.deliveriesStopsCount, { count: section.data.length })} />
    </View>
  );
}

function StopCard({ stop, driver }: { stop: DeliveryStop; driver?: Driver }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();

  const pickup = stop.kind === 'pickup';
  const tone: Tone = pickup ? 'accent' : 'brand';
  const { fg, bg } = useToneColors(tone);
  const city = localized(stop.city, lang);

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.deliveriesStopAria, { clinic: stop.clinic, city })}>
      <Card style={styles.stop}>
        <View style={[styles.stopTop, row(isRtl)]}>
          <View style={[styles.kindIcon, { backgroundColor: bg }]}>
            <Icon name={pickup ? 'arrow-down-outline' : 'cube-outline'} size={18} color={fg} />
          </View>

          <View style={styles.flex}>
            <View style={[styles.titleRow, row(isRtl)]}>
              <Text variant="subheading" numberOfLines={1} style={styles.flex}>
                {stop.clinic}
              </Text>
              {stop.urgent ? (
                <Badge label={ui.deliveriesRushBadge} tone="danger" icon="flash" />
              ) : null}
            </View>
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {stop.patient} · {stop.orderId}
            </Text>
          </View>

          <View style={[styles.time, { backgroundColor: theme.color.surfaceMuted }]}>
            <Text variant="label" tone="muted" ltr>
              {stop.time}
            </Text>
          </View>
        </View>

        <View style={[styles.stopMeta, row(isRtl)]}>
          <View style={[styles.meta, row(isRtl)]}>
            <Icon name="location-outline" size={13} color={theme.color.textFaint} />
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {interpolate(ui.deliveriesAddress, {
                street: localized(stop.street, lang),
                number: stop.houseNumber,
                city,
              })}
            </Text>
          </View>
          <View style={[styles.meta, row(isRtl)]}>
            <Icon name="layers-outline" size={13} color={theme.color.textFaint} />
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {interpolate(ui.deliveriesCasesCount, { count: stop.cases })}
            </Text>
          </View>
        </View>

        <View style={[styles.stopFoot, row(isRtl)]}>
          <Badge
            label={pickup ? ui.deliveriesKindPickup : ui.deliveriesKindDrop}
            tone={tone}
            icon={pickup ? 'arrow-down' : 'arrow-up'}
          />
          {driver ? (
            <View style={[styles.driverTag, row(isRtl)]}>
              <View style={[styles.driverDot, { backgroundColor: driver.color }]} />
              <Text variant="caption" tone="faint" numberOfLines={1}>
                {driver.name}
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controls: { gap: spacing.md, paddingBottom: spacing.md },
  scopeWrap: { paddingHorizontal: spacing.xl },
  scope: { padding: 4, borderRadius: radius.pill, gap: 4 },
  scopeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  tabRow: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs },
  listHeader: { gap: spacing.md },
  listHeaderGap: { marginBottom: spacing.lg },
  itemGap: { height: spacing.md },
  summary: { gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverCard: { gap: spacing.md },
  driverHead: { alignItems: 'center', gap: spacing.md },
  driverMeta: { flexWrap: 'wrap', gap: spacing.md },
  sectionHead: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dayMark: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stop: { gap: spacing.md },
  stopTop: { alignItems: 'center', gap: spacing.md },
  kindIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { alignItems: 'center', gap: spacing.sm },
  time: { paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: radius.pill },
  stopMeta: { flexWrap: 'wrap', gap: spacing.md },
  meta: { flexShrink: 1, alignItems: 'center', gap: 5 },
  stopFoot: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  driverTag: { flexShrink: 1, alignItems: 'center', gap: 5 },
  driverDot: { width: 8, height: 8, borderRadius: 4 },
});
