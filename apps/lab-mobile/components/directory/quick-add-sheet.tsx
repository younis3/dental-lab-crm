import { useMemo, useState } from 'react';
import { StyleSheet, View, type KeyboardTypeOptions } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Icon, type IconName } from '@/components/ui/icon';
import { Chip } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { row } from '@/lib/rtl';
import { useLanguage } from '@/store/language-store';

export type QuickAddOption = { key: string; label: string };

export type QuickAddField = {
  key: string;
  label: string;
  icon: IconName;
  /** Turns the field into a chip picker; the first option starts selected. */
  options?: QuickAddOption[];
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  /** Keeps typed characters left-to-right, e.g. phone numbers. */
  ltr?: boolean;
  required?: boolean;
};

type QuickAddSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  fields: QuickAddField[];
  /** Values to open with, keyed by `field.key` — pass the row being edited. */
  initial?: Record<string, string>;
  /** Defaults to the add label. */
  submitLabel?: string;
  /** Receives the trimmed value of every field, keyed by `field.key`. */
  onSubmit: (values: Record<string, string>) => void;
};

/**
 * The add and edit sheet every directory table shares. A screen declares the
 * fields its rows need, so adding a doctor, a clinic, a patient or a work type —
 * or editing one — is the same gesture with a different form.
 */
export function QuickAddSheet({
  visible,
  onClose,
  title,
  fields,
  initial,
  submitLabel,
  onSubmit,
}: QuickAddSheetProps) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();

  const blank = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.key, field.options?.[0]?.key ?? ''])),
    [fields]
  );

  const opening = initial ? { ...blank, ...initial } : blank;

  const [values, setValues] = useState<Record<string, string>>(opening);
  const [missing, setMissing] = useState<string[]>([]);

  // Resetting during render (rather than in an effect) means the very first
  // frame of a reopened sheet already shows the right form. Nothing is cleared
  // on the way out, so the values stay put while the sheet animates away.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setValues(opening);
      setMissing([]);
    }
  }

  const edit = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMissing((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : prev));
  };

  const submit = () => {
    const trimmed: Record<string, string> = {};
    for (const field of fields) trimmed[field.key] = (values[field.key] ?? '').trim();

    const empty = fields.filter((field) => field.required && !trimmed[field.key]);
    if (empty.length > 0) {
      setMissing(empty.map((field) => field.key));
      return;
    }

    onSubmit(trimmed);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      footer={
        <>
          <View style={styles.flex}>
            <Button size="md" label={submitLabel ?? ui.quickAddSave} onPress={submit} />
          </View>
          <View style={styles.flex}>
            <Button size="md" variant="secondary" label={ui.actionCancel} onPress={onClose} />
          </View>
        </>
      }>
      {fields.map((field) => (
        <View key={field.key} style={styles.group}>
          {field.options ? (
            <>
              <View style={[styles.labelRow, row(isRtl)]}>
                <Icon name={field.icon} size={14} color={theme.color.textFaint} />
                <Text variant="caption" tone="muted">
                  {field.label}
                </Text>
              </View>
              <View style={[styles.chipRow, row(isRtl)]}>
                {field.options.map((option) => (
                  <Chip
                    key={option.key}
                    label={option.label}
                    selected={values[field.key] === option.key}
                    onPress={() => edit(field.key, option.key)}
                  />
                ))}
              </View>
            </>
          ) : (
            <>
              <Field
                size="sm"
                label={field.label}
                value={values[field.key] ?? ''}
                onChangeText={(value) => edit(field.key, value)}
                icon={field.icon}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType}
                ltr={field.ltr}
                invalid={missing.includes(field.key)}
              />
              {missing.includes(field.key) ? (
                <Text variant="caption" tone="danger">
                  {ui.quickAddRequired}
                </Text>
              ) : null}
            </>
          )}
        </View>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: spacing.xs },
  labelRow: { alignItems: 'center', gap: spacing.xs },
  chipRow: { flexWrap: 'wrap', gap: spacing.sm },
});
