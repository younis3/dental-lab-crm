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
import { PATIENTS, type Patient } from '@/lib/directory-data';
import { interpolate, localized } from '@/lib/i18n';
import { STAGE_META, type OrderStage } from '@/lib/mock-data';
import { usePermissions } from '@/store/auth-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | OrderStage;

const FILTERS: Filter[] = ['all', 'design', 'production', 'quality', 'courier', 'delivered'];

export default function PatientsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const deferredQuery = useDeferredValue(query);

  const rows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return PATIENTS.filter((patient) => {
      if (filter !== 'all' && patient.stage !== filter) return false;
      if (!search) return true;
      return [
        patient.name,
        patient.caseId,
        patient.doctor,
        patient.clinic,
        localized(patient.workType, lang),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }, [deferredQuery, filter, lang]);

  const columns = useMemo<TableColumn<Patient>[]>(
    () => [
      {
        key: 'name',
        title: ui.colPatient,
        minWidth: 148,
        priority: 0,
        sortValue: (patient) => patient.name,
        render: (patient) => <PrimaryCell title={patient.name} subtitle={patient.clinic} />,
      },
      {
        key: 'case',
        title: ui.colCase,
        minWidth: 82,
        priority: 1,
        sortValue: (patient) => patient.caseId,
        render: (patient) => <NumberCell value={patient.caseId} />,
      },
      {
        key: 'workType',
        title: ui.colWorkType,
        minWidth: 118,
        priority: 3,
        sortValue: (patient) => localized(patient.workType, lang),
        render: (patient) => <TextCell value={localized(patient.workType, lang)} />,
      },
      {
        key: 'age',
        title: ui.colAge,
        minWidth: 42,
        priority: 4,
        align: 'end',
        sortValue: (patient) => patient.age,
        render: (patient) => <NumberCell value={patient.age} />,
      },
      {
        key: 'stage',
        title: ui.colStage,
        minWidth: 104,
        priority: 2,
        align: 'end',
        sortValue: (patient) => ui[STAGE_META[patient.stage].labelKey],
        render: (patient) => (
          <Badge
            label={ui[STAGE_META[patient.stage].labelKey]}
            tone={STAGE_META[patient.stage].tone}
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
        label: key === 'all' ? ui.filterAll : ui[STAGE_META[key].labelKey],
        count: key === 'all' ? PATIENTS.length : PATIENTS.filter((row) => row.stage === key).length,
      })),
    [ui]
  );

  if (!can('viewPatients')) {
    return <Redirect href="/" />;
  }

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      contentStyle={styles.content}
      header={
        <ScreenHeader
          title={ui.patientsTitle}
          subtitle={interpolate(ui.patientsSubtitle, { count: PATIENTS.length })}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(patient) => patient.id}
        emptyTitle={ui.patientsEmptyTitle}
        emptyHint={ui.patientsEmptyBody}
        bottomInset={insets.bottom}
        toolbar={
          <DirectoryToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder={ui.patientsSearch}
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
