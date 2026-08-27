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
import {
  DIRECTORY_STATUSES,
  SPECIALTIES,
  STATUS_META,
  type DirectoryStatus,
  type Doctor,
} from '@/lib/directory-data';
import { interpolate, localized } from '@/lib/i18n';
import { usePermissions } from '@/store/auth-store';
import { addDoctor, useDirectory } from '@/store/directory-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | DirectoryStatus;

const FILTERS: Filter[] = ['all', ...DIRECTORY_STATUSES];

/** The lab works from its current partners; dormant ones are a deliberate look. */
const DEFAULT_FILTER: Filter = 'active';

export default function DoctorsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const { doctors } = useDirectory();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [adding, setAdding] = useState(false);

  // Keeps typing responsive: the list catches up a frame behind the input.
  const deferredQuery = useDeferredValue(query);

  const rows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return doctors.filter((doctor) => {
      if (filter !== 'all' && doctor.status !== filter) return false;
      if (!search) return true;
      return [doctor.name, doctor.clinic, localized(doctor.specialty, lang), doctor.phone]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }, [deferredQuery, doctors, filter, lang]);

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
        align: 'center',
        sortValue: (doctor) => localized(doctor.specialty, lang),
        render: (doctor) => <TextCell value={localized(doctor.specialty, lang)} />,
      },
      {
        key: 'active',
        title: ui.colActiveCases,
        minWidth: 72,
        priority: 1,
        align: 'center',
        sortValue: (doctor) => doctor.activeCases,
        render: (doctor) => <NumberCell value={doctor.activeCases} strong />,
      },
      {
        key: 'total',
        title: ui.colTotalCases,
        minWidth: 56,
        priority: 4,
        align: 'center',
        sortValue: (doctor) => doctor.totalCases,
        render: (doctor) => <NumberCell value={doctor.totalCases} />,
      },
      {
        key: 'status',
        title: ui.colStatus,
        minWidth: 88,
        priority: 2,
        align: 'center',
        sortValue: (doctor) => doctor.status,
        render: (doctor) => (
          <Badge
            label={ui[STATUS_META[doctor.status].labelKey]}
            tone={STATUS_META[doctor.status].tone}
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
        label: key === 'all' ? ui.filterAll : ui[STATUS_META[key].labelKey],
        count: key === 'all' ? doctors.length : doctors.filter((row) => row.status === key).length,
      })),
    [doctors, ui]
  );

  const addFields = useMemo<QuickAddField[]>(
    () => [
      {
        key: 'name',
        label: ui.quickAddName,
        icon: 'person-outline',
        placeholder: ui.doctorsAddNamePlaceholder,
        required: true,
      },
      {
        key: 'clinic',
        label: ui.colClinic,
        icon: 'business-outline',
        placeholder: ui.doctorsAddClinicPlaceholder,
      },
      {
        key: 'specialty',
        label: ui.colSpecialty,
        icon: 'medkit-outline',
        options: SPECIALTIES.map((specialty) => ({
          key: specialty.en,
          label: localized(specialty, lang),
        })),
      },
      {
        key: 'phone',
        label: ui.colPhone,
        icon: 'call-outline',
        placeholder: ui.quickAddPhonePlaceholder,
        keyboardType: 'phone-pad',
        ltr: true,
      },
      {
        key: 'email',
        label: ui.quickAddEmail,
        icon: 'mail-outline',
        placeholder: ui.quickAddEmailPlaceholder,
        keyboardType: 'email-address',
        ltr: true,
      },
    ],
    [lang, ui]
  );

  if (!can('viewDoctors')) {
    return <Redirect href="/" />;
  }

  const add = (values: Record<string, string>) => {
    addDoctor({
      name: values.name,
      clinic: values.clinic,
      specialty: SPECIALTIES.find((specialty) => specialty.en === values.specialty) ?? SPECIALTIES[0],
      phone: values.phone,
      email: values.email,
    });
    // A new doctor is active, so the default tab already shows them.
    setQuery('');
    setFilter(DEFAULT_FILTER);
  };

  return (
    <Screen
      scrollable={false}
      withTabBarInset={false}
      contentStyle={styles.content}
      header={
        <ScreenHeader
          title={ui.doctorsTitle}
          subtitle={interpolate(ui.doctorsSubtitle, { count: doctors.length })}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.doctorsAdd}
              onPress={() => setAdding(true)}
            />
          }
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

      <QuickAddSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title={ui.doctorsAddTitle}
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
