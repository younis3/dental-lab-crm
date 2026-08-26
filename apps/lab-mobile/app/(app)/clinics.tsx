import { Redirect } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectoryToolbar } from '@/components/directory/directory-toolbar';
import { NumberCell, PrimaryCell } from '@/components/directory/table-cells';
import { BackButton } from '@/components/ui/back-button';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/pill';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { spacing } from '@/constants/design';
import { CLINICS, STATUS_META, type Clinic, type DirectoryStatus } from '@/lib/directory-data';
import { LOCALES, interpolate, localized } from '@/lib/i18n';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | DirectoryStatus;

const FILTERS: Filter[] = ['all', 'active', 'pending', 'inactive'];

export default function ClinicsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const deferredQuery = useDeferredValue(query);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(LOCALES[lang], {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0,
      }),
    [lang]
  );

  const rows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return CLINICS.filter((clinic) => {
      if (filter !== 'all' && clinic.status !== filter) return false;
      if (!search) return true;
      return [clinic.name, localized(clinic.city, lang), clinic.phone]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }, [deferredQuery, filter, lang]);

  const columns = useMemo<TableColumn<Clinic>[]>(
    () => [
      {
        key: 'name',
        title: ui.colClinic,
        minWidth: 150,
        priority: 0,
        sortValue: (clinic) => clinic.name,
        render: (clinic) => (
          <PrimaryCell title={clinic.name} subtitle={localized(clinic.city, lang)} />
        ),
      },
      {
        key: 'doctors',
        title: ui.colDoctorsCount,
        minWidth: 62,
        priority: 3,
        align: 'end',
        sortValue: (clinic) => clinic.doctors,
        render: (clinic) => <NumberCell value={clinic.doctors} />,
      },
      {
        key: 'active',
        title: ui.colActiveCases,
        minWidth: 56,
        priority: 1,
        align: 'end',
        sortValue: (clinic) => clinic.activeCases,
        render: (clinic) => <NumberCell value={clinic.activeCases} strong />,
      },
      {
        key: 'outstanding',
        title: ui.colOutstanding,
        minWidth: 92,
        priority: 4,
        align: 'end',
        sortValue: (clinic) => clinic.outstanding,
        render: (clinic) => <NumberCell value={currency.format(clinic.outstanding)} />,
      },
      {
        key: 'status',
        title: ui.colStatus,
        minWidth: 88,
        priority: 2,
        align: 'end',
        sortValue: (clinic) => clinic.status,
        render: (clinic) => (
          <Badge
            label={ui[STATUS_META[clinic.status].labelKey]}
            tone={STATUS_META[clinic.status].tone}
          />
        ),
      },
    ],
    [currency, lang, ui]
  );

  const filters = useMemo(
    () =>
      FILTERS.map((key) => ({
        key,
        label: key === 'all' ? ui.filterAll : ui[STATUS_META[key].labelKey],
        count: key === 'all' ? CLINICS.length : CLINICS.filter((row) => row.status === key).length,
      })),
    [ui]
  );

  if (!can('viewClinics')) {
    return <Redirect href="/" />;
  }

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      contentStyle={styles.content}
      header={
        <ScreenHeader
          title={ui.clinicsTitle}
          subtitle={interpolate(ui.clinicsSubtitle, { count: CLINICS.length })}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(clinic) => clinic.id}
        emptyTitle={ui.clinicsEmptyTitle}
        emptyHint={ui.clinicsEmptyBody}
        bottomInset={insets.bottom}
        toolbar={
          <DirectoryToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder={ui.clinicsSearch}
            filters={filters}
            active={filter}
            onFilterChange={setFilter}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
});
