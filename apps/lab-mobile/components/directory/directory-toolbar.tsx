import { FlatList, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/pill';
import { SearchField } from '@/components/ui/search-field';
import { spacing } from '@/constants/design';
import { useLanguage } from '@/store/language-store';

export type DirectoryFilter<T extends string> = {
  key: T;
  label: string;
  count: number;
};

type DirectoryToolbarProps<T extends string> = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  filters: DirectoryFilter<T>[];
  active: T;
  onFilterChange: (key: T) => void;
};

/** Realtime search plus counted filter chips, shared by every directory table. */
export function DirectoryToolbar<T extends string>({
  query,
  onQueryChange,
  placeholder,
  filters,
  active,
  onFilterChange,
}: DirectoryToolbarProps<T>) {
  const { isRtl, ui } = useLanguage();

  return (
    <View style={styles.toolbar}>
      <SearchField
        value={query}
        onChangeText={onQueryChange}
        placeholder={placeholder}
        clearLabel={ui.searchClear}
      />
      <FlatList
        horizontal
        inverted={isRtl}
        data={filters}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item }) => (
          <Chip
            label={item.label}
            count={item.count}
            selected={active === item.key}
            onPress={() => onFilterChange(item.key)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: spacing.md },
  chipRow: { gap: spacing.sm },
});
