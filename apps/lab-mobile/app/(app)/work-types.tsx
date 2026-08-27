import { Redirect } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectoryToolbar } from '@/components/directory/directory-toolbar';
import { QuickAddSheet, type QuickAddField } from '@/components/directory/quick-add-sheet';
import { EditCell, NumberCell, PrimaryCell } from '@/components/directory/table-cells';
import { BackButton } from '@/components/ui/back-button';
import { IconButton } from '@/components/ui/button';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/pill';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { spacing } from '@/constants/design';
import {
  CATEGORY_LABEL_KEYS,
  DIRECTORY_STATUSES,
  STATUS_META,
  WORK_TYPE_CATEGORIES,
  workTypeKey,
  type DirectoryStatus,
  type WorkType,
  type WorkTypeCategory,
} from '@/lib/directory-data';
import { formatMoney } from '@/lib/format';
import { interpolate, localized } from '@/lib/i18n';
import { usePermissions } from '@/store/auth-store';
import { addWorkType, updateWorkType, useDirectory } from '@/store/directory-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | WorkTypeCategory;

const FILTERS: Filter[] = ['all', ...WORK_TYPE_CATEGORIES];

/** Stands in for a price or a lead time that has not been set yet. */
const UNSET = '—';

/** Blank, negative and unparseable input all count as "not set". */
const numberFrom = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

/** Chip keys arrive as plain strings, so they are narrowed back on the way in. */
const categoryFrom = (value: string): WorkTypeCategory =>
  WORK_TYPE_CATEGORIES.find((category) => category === value) ?? 'crown';

const statusFrom = (value: string): DirectoryStatus =>
  DIRECTORY_STATUSES.find((status) => status === value) ?? 'active';

/** The lab's price list: what it makes, what it charges and how long it takes. */
export default function WorkTypesScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const { workTypes, patients } = useDirectory();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<WorkType | null>(null);

  const deferredQuery = useDeferredValue(query);

  // How many patient cases each entry is carrying right now.
  const casesByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const patient of patients) {
      const key = workTypeKey(patient.workType);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [patients]);

  const rows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return workTypes.filter((workType) => {
      if (filter !== 'all' && workType.category !== filter) return false;
      if (!search) return true;
      return [localized(workType.name, lang), ui[CATEGORY_LABEL_KEYS[workType.category]]]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }, [deferredQuery, filter, lang, ui, workTypes]);

  const columns = useMemo<TableColumn<WorkType>[]>(() => {
    const casesFor = (workType: WorkType) => casesByType.get(workTypeKey(workType.name)) ?? 0;

    return [
      {
        key: 'name',
        title: ui.colWorkType,
        minWidth: 152,
        priority: 0,
        sortValue: (workType) => localized(workType.name, lang),
        render: (workType) => (
          <PrimaryCell
            title={localized(workType.name, lang)}
            subtitle={ui[CATEGORY_LABEL_KEYS[workType.category]]}
          />
        ),
      },
      {
        key: 'price',
        title: ui.colPrice,
        minWidth: 92,
        priority: 1,
        align: 'center',
        sortValue: (workType) => workType.price,
        render: (workType) => (
          <NumberCell value={workType.price > 0 ? formatMoney(workType.price) : UNSET} strong />
        ),
      },
      {
        key: 'turnaround',
        title: ui.colTurnaround,
        minWidth: 54,
        priority: 3,
        align: 'center',
        sortValue: (workType) => workType.turnaround,
        render: (workType) => (
          <NumberCell value={workType.turnaround > 0 ? workType.turnaround : UNSET} />
        ),
      },
      {
        key: 'cases',
        title: ui.colActiveCases,
        minWidth: 72,
        priority: 4,
        align: 'center',
        sortValue: casesFor,
        render: (workType) => <NumberCell value={casesFor(workType)} />,
      },
      {
        key: 'status',
        title: ui.colStatus,
        minWidth: 88,
        priority: 2,
        align: 'center',
        sortValue: (workType) => workType.status,
        render: (workType) => (
          <Badge
            label={ui[STATUS_META[workType.status].labelKey]}
            tone={STATUS_META[workType.status].tone}
            style={styles.centerBadge}
          />
        ),
      },
      {
        key: 'edit',
        title: ui.colEdit,
        minWidth: 44,
        // Priority 0 keeps the button on the row on the narrowest phone.
        priority: 0,
        align: 'center',
        render: (workType) => (
          <EditCell
            label={interpolate(ui.workTypesEditAria, { name: localized(workType.name, lang) })}
            onPress={() => setEditing(workType)}
          />
        ),
      },
    ];
  }, [casesByType, lang, ui]);

  const filters = useMemo(
    () =>
      FILTERS.map((key) => ({
        key,
        label: key === 'all' ? ui.filterAll : ui[CATEGORY_LABEL_KEYS[key]],
        count:
          key === 'all'
            ? workTypes.length
            : workTypes.filter((row) => row.category === key).length,
      })),
    [ui, workTypes]
  );

  const addFields = useMemo<QuickAddField[]>(
    () => [
      {
        key: 'name',
        label: ui.colWorkType,
        icon: 'construct-outline',
        placeholder: ui.workTypesAddNamePlaceholder,
        required: true,
      },
      {
        key: 'category',
        label: ui.colCategory,
        icon: 'pricetags-outline',
        options: WORK_TYPE_CATEGORIES.map((category) => ({
          key: category,
          label: ui[CATEGORY_LABEL_KEYS[category]],
        })),
      },
      {
        key: 'price',
        label: ui.colPrice,
        icon: 'cash-outline',
        placeholder: ui.workTypesAddPricePlaceholder,
        keyboardType: 'decimal-pad',
        ltr: true,
      },
      {
        key: 'turnaround',
        label: ui.colTurnaround,
        icon: 'time-outline',
        placeholder: ui.workTypesAddDaysPlaceholder,
        keyboardType: 'number-pad',
        ltr: true,
      },
    ],
    [ui]
  );

  // Editing adds the status, which is how a work type is retired: an inactive
  // one keeps its old cases but stops being offered for new ones.
  const editFields = useMemo<QuickAddField[]>(
    () => [
      ...addFields,
      {
        key: 'status',
        label: ui.colStatus,
        icon: 'toggle-outline',
        options: DIRECTORY_STATUSES.map((status) => ({
          key: status,
          label: ui[STATUS_META[status].labelKey],
        })),
      },
    ],
    [addFields, ui]
  );

  const editValues = useMemo(
    () =>
      editing
        ? {
            name: localized(editing.name, lang),
            category: editing.category,
            price: editing.price > 0 ? String(editing.price) : '',
            turnaround: editing.turnaround > 0 ? String(editing.turnaround) : '',
            status: editing.status,
          }
        : undefined,
    [editing, lang]
  );

  if (!can('viewWorkTypes')) {
    return <Redirect href="/" />;
  }

  const add = (values: Record<string, string>) => {
    addWorkType({
      name: values.name,
      category: categoryFrom(values.category),
      price: numberFrom(values.price),
      turnaround: Math.round(numberFrom(values.turnaround)),
    });
    // The new row sits at the top of the unfiltered list, so clear both.
    setQuery('');
    setFilter('all');
  };

  const save = (values: Record<string, string>) => {
    if (!editing) return;

    const category = categoryFrom(values.category);
    // A name that was not touched keeps its translations instead of being
    // flattened to whichever language it happened to be viewed in.
    const renamed = values.name !== localized(editing.name, lang);

    updateWorkType(editing.id, {
      name: renamed ? values.name : editing.name,
      category,
      price: numberFrom(values.price),
      turnaround: Math.round(numberFrom(values.turnaround)),
      status: statusFrom(values.status),
    });

    // Widen the list rather than let the row the owner just edited fall out of
    // the active search or category filter.
    if (renamed) setQuery('');
    if (filter !== 'all' && filter !== category) setFilter('all');
  };

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      contentStyle={styles.content}
      header={
        <ScreenHeader
          title={ui.workTypesTitle}
          subtitle={interpolate(ui.workTypesSubtitle, { count: workTypes.length })}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.workTypesAdd}
              onPress={() => setAdding(true)}
            />
          }
        />
      }>
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(workType) => workType.id}
        emptyTitle={ui.workTypesEmptyTitle}
        emptyHint={ui.workTypesEmptyBody}
        bottomInset={insets.bottom}
        toolbar={
          <DirectoryToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder={ui.workTypesSearch}
            filters={filters}
            active={filter}
            onFilterChange={setFilter}
          />
        }
      />

      <QuickAddSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title={ui.workTypesAddTitle}
        fields={addFields}
        onSubmit={add}
      />

      <QuickAddSheet
        visible={editing !== null}
        onClose={() => setEditing(null)}
        title={ui.workTypesEditTitle}
        fields={editFields}
        initial={editValues}
        submitLabel={ui.actionSave}
        onSubmit={save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  centerBadge: { alignSelf: 'center' },
});
