import { Redirect } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectoryToolbar } from '@/components/directory/directory-toolbar';
import { QuickAddSheet, type QuickAddField } from '@/components/directory/quick-add-sheet';
import { NumberCell, PrimaryCell, TextCell } from '@/components/directory/table-cells';
import { BackButton } from '@/components/ui/back-button';
import { IconButton } from '@/components/ui/button';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/pill';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { spacing } from '@/constants/design';
import { type Patient } from '@/lib/directory-data';
import { interpolate, localized } from '@/lib/i18n';
import { STAGE_META, type OrderStage } from '@/lib/mock-data';
import { usePermissions } from '@/store/auth-store';
import { addPatient, useDirectory } from '@/store/directory-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | OrderStage;

const FILTERS: Filter[] = ['all', 'design', 'production', 'quality', 'courier', 'delivered'];

/** Stands in for an age that was not recorded. */
const UNSET = '—';

export default function PatientsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const { patients, workTypes } = useDirectory();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const rows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return patients.filter((patient) => {
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
  }, [deferredQuery, filter, lang, patients]);

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
        align: 'center',
        sortValue: (patient) => patient.caseId,
        render: (patient) => <NumberCell value={patient.caseId} />,
      },
      {
        key: 'workType',
        title: ui.colWorkType,
        minWidth: 118,
        priority: 3,
        align: 'center',
        sortValue: (patient) => localized(patient.workType, lang),
        render: (patient) => <TextCell value={localized(patient.workType, lang)} />,
      },
      {
        key: 'age',
        title: ui.colAge,
        minWidth: 42,
        priority: 4,
        align: 'center',
        sortValue: (patient) => patient.age,
        render: (patient) => <NumberCell value={patient.age > 0 ? patient.age : UNSET} />,
      },
      {
        key: 'stage',
        title: ui.colStage,
        minWidth: 104,
        priority: 2,
        align: 'center',
        sortValue: (patient) => ui[STAGE_META[patient.stage].labelKey],
        render: (patient) => (
          <Badge
            label={ui[STAGE_META[patient.stage].labelKey]}
            tone={STAGE_META[patient.stage].tone}
            style={styles.centerBadge}
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
        count: key === 'all' ? patients.length : patients.filter((row) => row.stage === key).length,
      })),
    [patients, ui]
  );

  // Retired work types stay on old cases but are no longer offered for new ones.
  const offered = useMemo(
    () => workTypes.filter((workType) => workType.status !== 'inactive'),
    [workTypes]
  );

  const addFields = useMemo<QuickAddField[]>(
    () => [
      {
        key: 'name',
        label: ui.quickAddName,
        icon: 'person-outline',
        placeholder: ui.patientsAddNamePlaceholder,
        required: true,
      },
      {
        key: 'doctor',
        label: ui.colDoctor,
        icon: 'medkit-outline',
        placeholder: ui.patientsAddDoctorPlaceholder,
      },
      {
        key: 'clinic',
        label: ui.colClinic,
        icon: 'business-outline',
        placeholder: ui.clinicsAddNamePlaceholder,
      },
      {
        key: 'workType',
        label: ui.colWorkType,
        icon: 'construct-outline',
        options: offered.map((workType) => ({
          key: workType.id,
          label: localized(workType.name, lang),
        })),
      },
      {
        key: 'age',
        label: ui.colAge,
        icon: 'calendar-outline',
        placeholder: ui.patientsAddAgePlaceholder,
        keyboardType: 'number-pad',
        ltr: true,
      },
    ],
    [lang, offered, ui]
  );

  if (!can('viewPatients')) {
    return <Redirect href="/" />;
  }

  const add = (values: Record<string, string>) => {
    const picked = offered.find((workType) => workType.id === values.workType);
    const age = Number.parseInt(values.age, 10);

    addPatient({
      name: values.name,
      doctor: values.doctor,
      clinic: values.clinic,
      workType: picked?.name ?? '',
      age: Number.isFinite(age) && age > 0 ? age : 0,
    });
    // The new row sits at the top of the unfiltered list, so clear both.
    setQuery('');
    setFilter('all');
  };

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      contentStyle={styles.content}
      header={
        <ScreenHeader
          title={ui.patientsTitle}
          subtitle={interpolate(ui.patientsSubtitle, { count: patients.length })}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.patientsAdd}
              onPress={() => setAdding(true)}
            />
          }
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

      <QuickAddSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title={ui.patientsAddTitle}
        fields={addFields}
        onSubmit={add}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  centerBadge: { alignSelf: 'center' },
});
