import { Redirect } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectoryToolbar } from '@/components/directory/directory-toolbar';
import { NumberCell, PrimaryCell, TextCell } from '@/components/directory/table-cells';
import { BackButton } from '@/components/ui/back-button';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/pill';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { spacing } from '@/constants/design';
import { DOCTORS, STATUS_META, type Doctor, type DirectoryStatus } from '@/lib/directory-data';
import { interpolate, localized } from '@/lib/i18n';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | DirectoryStatus;

const FILTERS: Filter[] = ['all', 'active', 'pending', 'inactive'];

export default function DoctorsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Keeps typing responsive: the list catches up a frame behind the input.
  const deferredQuery = useDeferredValue(query);

  const rows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return DOCTORS.filter((doctor) => {
      if (filter !== 'all' && doctor.status !== filter) return false;
      if (!search) return true;
      return [doctor.name, doctor.clinic, localized(doctor.specialty, lang), doctor.phone]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }, [deferredQuery, filter, lang]);

  const columns = useMemo<TableColumn<Doctor>[]>(
    () => [
      {
        key: 'name',
        title: ui.colDoctor,
        minWidth: 150,
        priority: 0,
        sortValue: (doctor) => doctor.name,
        render: (doctor) => <PrimaryCell title={doctor.name} subtitle={doctor.clinic} />,
      },
      {
        key: 'specialty',
        title: ui.colSpecialty,
        minWidth: 110,
        priority: 3,
        sortValue: (doctor) => localized(doctor.specialty, lang),
        render: (doctor) => <TextCell value={localized(doctor.specialty, lang)} />,
      },
      {
        key: 'active',
        title: ui.colActiveCases,
        minWidth: 56,
        priority: 1,
        align: 'end',
        sortValue: (doctor) => doctor.activeCases,
        render: (doctor) => <NumberCell value={doctor.activeCases} strong />,
      },
      {
        key: 'total',
        title: ui.colTotalCases,
        minWidth: 56,
        priority: 4,
        align: 'end',
        sortValue: (doctor) => doctor.totalCases,
        render: (doctor) => <NumberCell value={doctor.totalCases} />,
      },
      {
        key: 'status',
        title: ui.colStatus,
        minWidth: 88,
        priority: 2,
        align: 'end',
        sortValue: (doctor) => doctor.status,
        render: (doctor) => (
          <Badge
            label={ui[STATUS_META[doctor.status].labelKey]}
            tone={STATUS_META[doctor.status].tone}
          />
        ),
      },
    ],
    [lang, ui]
  );

  const filters = useMemo(
    () =>
      FILTERS.map((key) => ({
        key,
        label: key === 'all' ? ui.filterAll : ui[STATUS_META[key].labelKey],
        count: key === 'all' ? DOCTORS.length : DOCTORS.filter((row) => row.status === key).length,
      })),
    [ui]
  );

  if (!can('viewDoctors')) {
    return <Redirect href="/" />;
  }

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      contentStyle={styles.content}
      header={
        <ScreenHeader
          title={ui.doctorsTitle}
          subtitle={interpolate(ui.doctorsSubtitle, { count: DOCTORS.length })}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(doctor) => doctor.id}
        emptyTitle={ui.doctorsEmptyTitle}
        emptyHint={ui.doctorsEmptyBody}
        bottomInset={insets.bottom}
        toolbar={
          <DirectoryToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder={ui.doctorsSearch}
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
