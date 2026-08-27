import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_CLEARANCE } from '@/components/navigation/tab-bar';
import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Badge, Chip, useToneColors } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { radius, spacing, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { interpolate, localized, type UiStrings } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { ORDERS, STAGE_META, type Order, type OrderStage } from '@/lib/mock-data';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | 'rush' | 'favorites' | OrderStage;

const FILTERS: { key: Filter; labelKey: keyof UiStrings }[] = [
  { key: 'all', labelKey: 'ordersFilterAll' },
  { key: 'rush', labelKey: 'ordersFilterRush' },
  { key: 'favorites', labelKey: 'ordersFilterStarred' },
  { key: 'production', labelKey: 'stageShortProduction' },
  { key: 'quality', labelKey: 'stageShortQuality' },
  { key: 'courier', labelKey: 'stageShortCourier' },
  { key: 'delivered', labelKey: 'stageDelivered' },
];

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isRtl, lang, ui } = useLanguage();
  const { filter: requestedFilter } = useLocalSearchParams<{ filter?: string }>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useFocusEffect(
    useCallback(() => {
      if (requestedFilter !== 'rush') return;
      setFilter('rush');
      router.setParams({ filter: undefined });
    }, [requestedFilter, router])
  );
  const [favorites, setFavorites] = useState(() =>
    new Set(ORDERS.filter((order) => order.favorite).map((order) => order.id))
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const countFor = useCallback(
    (key: Filter) => {
      if (key === 'all') return ORDERS.length;
      if (key === 'rush') return ORDERS.filter((order) => order.urgent).length;
      if (key === 'favorites') return favorites.size;
      return ORDERS.filter((order) => order.stage === key).length;
    },
    [favorites]
  );

  const orders = useMemo(() => {
    const search = query.trim().toLowerCase();
    return ORDERS.filter((order) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'rush'
            ? order.urgent
            : filter === 'favorites'
              ? favorites.has(order.id)
              : order.stage === filter;

      const matchesSearch =
        !search ||
        [order.id, order.patient, order.clinic, localized(order.workType, lang), order.doctor]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [favorites, filter, lang, query]);

  return (
    <Screen
      scrollable={false}
      header={
        <ScreenHeader
          title={ui.ordersTitle}
          subtitle={interpolate(ui.ordersSubtitle, { shown: orders.length, total: ORDERS.length })}
          right={<IconButton icon="options-outline" accessibilityLabel={ui.ordersFilterSort} />}
        />
      }>
      <View style={styles.controls}>
        <View
          style={[
            styles.search,
            row(isRtl),
            { backgroundColor: theme.color.surface, borderColor: theme.color.border },
          ]}>
          <Icon name="search-outline" size={18} color={theme.color.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={ui.ordersSearch}
            placeholderTextColor={theme.color.textFaint}
            style={[
              styles.searchInput,
              { color: theme.color.text, textAlign: isRtl ? 'right' : 'left' },
            ]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 ? (
            <PressableScale
              onPress={() => setQuery('')}
              hitSlop={10}
              scaleTo={0.9}
              accessibilityRole="button"
              accessibilityLabel={ui.ordersClearSearch}>
              <Icon name="close-circle" size={17} color={theme.color.textFaint} />
            </PressableScale>
          ) : null}
        </View>

        <FlatList
          horizontal
          inverted={isRtl}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => (
            <Chip
              label={ui[item.labelKey]}
              count={countFor(item.key)}
              selected={filter === item.key}
              onPress={() => setFilter(item.key)}
            />
          )}
        />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <Card style={styles.empty}>
            <Icon name="file-tray-outline" size={30} color={theme.color.textFaint} />
            <Text variant="subheading">{ui.ordersEmptyTitle}</Text>
            <Text variant="caption" tone="muted" style={styles.emptyText}>
              {ui.ordersEmptyBody}
            </Text>
          </Card>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 6) * 45).duration(420)}
            layout={LinearTransition.springify().damping(18)}>
            <OrderCard
              order={item}
              favorite={favorites.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onOpen={() => router.push({ pathname: '/orders/[id]', params: { id: item.id } })}
            />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

type OrderCardProps = {
  order: Order;
  favorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
};

function OrderCard({ order, favorite, onToggleFavorite, onOpen }: OrderCardProps) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const stage = STAGE_META[order.stage];
  const { fg, bg } = useToneColors(stage.tone);

  return (
    <PressableScale
      onPress={onOpen}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.ordersCaseAria, { id: order.id, patient: order.patient })}>
      <Card style={styles.card}>
        <View style={[styles.cardTop, row(isRtl)]}>
          <View style={[styles.stageIcon, { backgroundColor: bg }]}>
            <Icon name={stage.icon} size={19} color={fg} />
          </View>

          <View style={styles.flex}>
            <View style={[styles.titleRow, row(isRtl)]}>
              <Text variant="subheading" numberOfLines={1} style={styles.flex}>
                {order.patient}
              </Text>
              {order.urgent ? <Badge label={ui.ordersRushBadge} tone="danger" icon="flash" /> : null}
            </View>
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {order.id} · {order.clinic}
            </Text>
          </View>

          <PressableScale
            onPress={onToggleFavorite}
            hitSlop={10}
            scaleTo={0.85}
            accessibilityRole="button"
            accessibilityLabel={favorite ? ui.ordersUnstar : ui.ordersStar}>
            <Icon
              name={favorite ? 'star' : 'star-outline'}
              size={20}
              color={favorite ? theme.color.warning : theme.color.textFaint}
            />
          </PressableScale>
        </View>

        <View style={[styles.metaRow, row(isRtl)]}>
          <Meta icon="construct-outline" label={localized(order.workType, lang)} />
          <Meta icon="color-filter-outline" label={interpolate(ui.ordersShade, { shade: order.shade })} />
          <Meta icon="git-commit-outline" label={localized(order.teeth, lang)} />
        </View>

        <ProgressBar value={order.progress} />

        <View style={[styles.cardBottom, row(isRtl)]}>
          <Badge label={ui[stage.labelKey]} tone={stage.tone} />
          <View style={[styles.due, row(isRtl)]}>
            <Icon
              name="calendar-outline"
              size={13}
              color={order.urgent ? theme.color.danger : theme.color.textFaint}
            />
            <Text variant="caption" tone={order.urgent ? 'danger' : 'faint'}>
              {localized(order.dueLabel, lang)}
            </Text>
          </View>
        </View>
      </Card>
    </PressableScale>
  );
}

function Meta({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();
  const { isRtl } = useLanguage();

  return (
    <View style={[styles.meta, row(isRtl)]}>
      <Icon name={icon} size={13} color={theme.color.textFaint} />
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controls: { gap: spacing.md, paddingBottom: spacing.md },
  search: {
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, ...typeScale.body, paddingVertical: 0 },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs },
  card: { gap: spacing.md },
  cardTop: { alignItems: 'center', gap: spacing.md },
  stageIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  titleRow: { alignItems: 'center', gap: spacing.sm },
  metaRow: { flexWrap: 'wrap', gap: spacing.md },
  meta: { alignItems: 'center', gap: 5, maxWidth: '100%' },
  cardBottom: { alignItems: 'center', justifyContent: 'space-between' },
  due: { alignItems: 'center', gap: 5 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['3xl'] },
  emptyText: { textAlign: 'center' },
});
