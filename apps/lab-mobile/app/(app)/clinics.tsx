import { Redirect } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectoryToolbar } from '@/components/directory/directory-toolbar';
import { QuickAddSheet, type QuickAddField } from '@/components/directory/quick-add-sheet';
import { NumberCell, PrimaryCell } from '@/components/directory/table-cells';
import { BackButton } from '@/components/ui/back-button';
import { IconButton } from '@/components/ui/button';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/pill';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { spacing } from '@/constants/design';
import {
  CITIES,
  DIRECTORY_STATUSES,
  STATUS_META,
  type Clinic,
  type DirectoryStatus,
} from '@/lib/directory-data';
import { LOCALES, interpolate, localized } from '@/lib/i18n';
import { usePermissions } from '@/store/auth-store';
import { addClinic, useDirectory } from '@/store/directory-store';
import { useLanguage } from '@/store/language-store';

type Filter = 'all' | DirectoryStatus;

const FILTERS: Filter[] = ['all', ...DIRECTORY_STATUSES];

export default function ClinicsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, ui } = useLanguage();
  const { can } = usePermissions();
  const { clinics } = useDirectory();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);

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
    return clinics.filter((clinic) => {
      if (filter !== 'all' && clinic.status !== filter) return false;
      if (!search) return true;
      return [clinic.name, localized(clinic.city, lang), clinic.phone]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }, [clinics, deferredQuery, filter, lang]);

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
        align: 'center',
        sortValue: (clinic) => clinic.doctors,
        render: (clinic) => <NumberCell value={clinic.doctors} />,
      },
      {
        key: 'active',
        title: ui.colActiveCases,
        minWidth: 72,
        priority: 1,
        align: 'center',
        sortValue: (clinic) => clinic.activeCases,
        render: (clinic) => <NumberCell value={clinic.activeCases} strong />,
      },
      {
        key: 'outstanding',
        title: ui.colOutstanding,
        minWidth: 92,
        priority: 4,
        align: 'center',
        sortValue: (clinic) => clinic.outstanding,
        render: (clinic) => <NumberCell value={currency.format(clinic.outstanding)} />,
      },
      {
        key: 'status',
        title: ui.colStatus,
        minWidth: 88,
        priority: 2,
        align: 'center',
        sortValue: (clinic) => clinic.status,
        render: (clinic) => (
          <Badge
            label={ui[STATUS_META[clinic.status].labelKey]}
            tone={STATUS_META[clinic.status].tone}
            style={styles.centerBadge}
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
        count: key === 'all' ? clinics.length : clinics.filter((row) => row.status === key).length,
      })),
    [clinics, ui]
  );

  const addFields = useMemo<QuickAddField[]>(
    () => [
      {
        key: 'name',
        label: ui.colClinic,
        icon: 'business-outline',
        placeholder: ui.clinicsAddNamePlaceholder,
        required: true,
      },
      {
        key: 'city',
        label: ui.colCity,
        icon: 'location-outline',
        options: CITIES.map((city) => ({ key: city.en, label: localized(city, lang) })),
      },
      {
        key: 'phone',
        label: ui.colPhone,
        icon: 'call-outline',
        placeholder: ui.quickAddPhonePlaceholder,
        keyboardType: 'phone-pad',
        ltr: true,
      },
    ],
    [lang, ui]
  );

  if (!can('viewClinics')) {
    return <Redirect href="/" />;
  }

  const add = (values: Record<string, string>) => {
    addClinic({
      name: values.name,
      city: CITIES.find((city) => city.en === values.city) ?? CITIES[0],
      phone: values.phone,
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
          title={ui.clinicsTitle}
          subtitle={interpolate(ui.clinicsSubtitle, { count: clinics.length })}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.clinicsAdd}
              onPress={() => setAdding(true)}
            />
          }
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

      <QuickAddSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title={ui.clinicsAddTitle}
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
