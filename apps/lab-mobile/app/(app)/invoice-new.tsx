import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Badge, Chip, withAlpha } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import {
  PAYMENT_TERM_META,
  SERVICE_CATALOG,
  dueDateFor,
  invoiceTotals,
  lineTotal,
  type CustomerKind,
  type Invoice,
  type InvoiceLine,
  type PaymentTerm,
  type SendChannel,
  type Service,
} from '@/lib/billing-data';
import { type Doctor } from '@/lib/directory-data';
import { formatMoney, initials } from '@/lib/format';
import { LOCALES, interpolate, localized, type Lang } from '@/lib/i18n';
import { openInvoiceMail } from '@/lib/invoice-mail';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import { useDirectory } from '@/store/directory-store';
import { createInvoiceDraft, saveInvoice } from '@/store/invoices-store';
import { useLanguage } from '@/store/language-store';

type LineSheetState = { mode: 'new' } | { mode: 'edit'; line: InvoiceLine };
type Outcome = { kind: 'sent' | 'draft'; invoice: Invoice; mailFailed: boolean };
type FormError = 'customer' | 'email' | 'lines';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const numeric = (text: string) => {
  const value = Number(text.replace(/[^\d.]/g, ''));
  return Number.isFinite(value) ? value : 0;
};

function longDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(LOCALES[lang], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Counter desk invoice composer. The same form covers a registered doctor, who
 * runs a monthly account, and a walk-in who pays for one job on the spot — the
 * customer type decides the default terms and which delivery channels exist.
 */
export default function NewInvoiceScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const { can } = usePermissions();

  const [draft, setDraft] = useState<Invoice>(() => createInvoiceDraft());
  const [channel, setChannel] = useState<SendChannel>('email');
  const [lineSheet, setLineSheet] = useState<LineSheetState | null>(null);
  const [doctorSheet, setDoctorSheet] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const totals = invoiceTotals(draft);
  const registered = draft.customerKind === 'doctor';
  const named = draft.customerName.trim().length > 0;

  // Counter jobs come first for a walk-in, since that is what they can buy.
  const catalog = useMemo(
    () =>
      registered
        ? SERVICE_CATALOG
        : [...SERVICE_CATALOG].sort(
            (a, b) => Number(b.overTheCounter) - Number(a.overTheCounter)
          ),
    [registered]
  );

  if (!can('viewBilling')) {
    return <Redirect href="/" />;
  }

  const patch = (values: Partial<Invoice>) => {
    setError(null);
    setDraft((prev) => ({ ...prev, ...values }));
  };

  const setTerms = (terms: PaymentTerm) => {
    const dueAt = dueDateFor(terms, new Date(draft.issuedAt)).toISOString();
    patch({ terms, dueAt });
  };

  const setKind = (kind: CustomerKind) => {
    if (kind === draft.customerKind) return;
    const terms: PaymentTerm = kind === 'doctor' ? 'monthly' : 'immediate';
    setChannel('email');
    setError(null);
    setDraft((prev) => ({
      ...prev,
      customerKind: kind,
      doctorId: undefined,
      customerName: '',
      clinic: '',
      email: '',
      phone: '',
      terms,
      dueAt: dueDateFor(terms, new Date(prev.issuedAt)).toISOString(),
    }));
  };

  const pickDoctor = (doctor: Doctor) => {
    setDoctorSheet(false);
    patch({
      doctorId: doctor.id,
      customerName: doctor.name,
      clinic: doctor.clinic,
      email: doctor.email,
      phone: doctor.phone,
    });
  };

  /** Tapping a service the invoice already carries just adds one more unit. */
  const addService = (service: Service) => {
    setError(null);
    setDraft((prev) => {
      const existing = prev.lines.find((line) => line.serviceId === service.id);
      if (existing) {
        return {
          ...prev,
          lines: prev.lines.map((line) =>
            line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line
          ),
        };
      }
      return {
        ...prev,
        lines: [
          ...prev.lines,
          {
            id: `${prev.id}-l${prev.lines.length + 1}-${Date.now().toString(36)}`,
            description: service.name,
            serviceId: service.id,
            quantity: 1,
            unitPrice: service.price,
          },
        ],
      };
    });
  };

  const submitLine = (line: InvoiceLine) => {
    setError(null);
    setDraft((prev) => ({
      ...prev,
      lines: prev.lines.some((row) => row.id === line.id)
        ? prev.lines.map((row) => (row.id === line.id ? line : row))
        : [...prev.lines, line],
    }));
    setLineSheet(null);
  };

  const removeLine = (id: string) => {
    setDraft((prev) => ({ ...prev, lines: prev.lines.filter((line) => line.id !== id) }));
  };

  const changeQuantity = (id: string, delta: number) => {
    setDraft((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === id ? { ...line, quantity: Math.max(1, line.quantity + delta) } : line
      ),
    }));
  };

  const trimmed = (): Invoice => ({
    ...draft,
    customerName: draft.customerName.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    notes: typeof draft.notes === 'string' ? draft.notes.trim() : draft.notes,
  });

  const send = async () => {
    if (!named) {
      setError('customer');
      return;
    }
    if (channel === 'email' && !EMAIL_PATTERN.test(draft.email.trim())) {
      setError('email');
      return;
    }
    if (draft.lines.length === 0) {
      setError('lines');
      return;
    }

    const invoice: Invoice = {
      ...trimmed(),
      sentAt: new Date().toISOString(),
      sentVia: channel,
    };
    saveInvoice(invoice);
    const mailed = channel === 'email' ? await openInvoiceMail(invoice, ui, lang) : true;
    setOutcome({ kind: 'sent', invoice, mailFailed: !mailed });
  };

  const saveDraft = () => {
    if (!named) {
      setError('customer');
      return;
    }
    const invoice = trimmed();
    saveInvoice(invoice);
    setOutcome({ kind: 'draft', invoice, mailFailed: false });
  };

  const startOver = () => {
    setOutcome(null);
    setDraft(createInvoiceDraft());
    setChannel('email');
    setError(null);
  };

  const errorMessage =
    error === 'customer'
      ? ui.invoiceErrorCustomer
      : error === 'email'
        ? ui.invoiceErrorEmail
        : error === 'lines'
          ? ui.invoiceErrorLines
          : null;

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={ui.invoiceNewTitle}
          subtitle={interpolate(ui.invoiceNewSubtitle, { id: draft.id })}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <Animated.View entering={FadeInDown.duration(380)}>
        <Segmented
          value={draft.customerKind}
          onChange={setKind}
          options={[
            { key: 'doctor', label: ui.invoiceCustomerDoctor, icon: 'medkit-outline' },
            { key: 'walkin', label: ui.invoiceCustomerWalkIn, icon: 'person-outline' },
          ]}
        />
      </Animated.View>

      <Group title={ui.invoiceCustomerTitle} hint={registered ? ui.invoicePickDoctorHint : ui.invoiceWalkInHint}>
        {registered ? (
          draft.doctorId ? (
            <Card style={styles.recipient}>
              <View style={[styles.recipientHead, row(isRtl)]}>
                <Avatar initials={initials(draft.customerName)} size={44} />
                <View style={styles.flex}>
                  <Text variant="subheading" numberOfLines={1}>
                    {draft.customerName}
                  </Text>
                  <Text variant="caption" tone="faint" numberOfLines={1}>
                    {draft.clinic}
                  </Text>
                </View>
                <Button
                  size="md"
                  variant="secondary"
                  label={ui.invoiceChangeDoctor}
                  onPress={() => setDoctorSheet(true)}
                  style={styles.changeButton}
                />
              </View>
              <View style={[styles.recipientMeta, row(isRtl)]}>
                <View style={[styles.meta, row(isRtl)]}>
                  <Icon name="mail-outline" size={13} color={theme.color.textFaint} />
                  <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                    {draft.email}
                  </Text>
                </View>
                <View style={[styles.meta, row(isRtl)]}>
                  <Icon name="call-outline" size={13} color={theme.color.textFaint} />
                  <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                    {draft.phone}
                  </Text>
                </View>
              </View>
            </Card>
          ) : (
            <PressableScale
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={ui.invoicePickDoctor}
              onPress={() => setDoctorSheet(true)}
              style={[
                styles.picker,
                row(isRtl),
                {
                  borderColor: error === 'customer' ? theme.color.danger : theme.color.borderStrong,
                  backgroundColor: theme.color.surfaceMuted,
                },
              ]}>
              <View style={[styles.pickerIcon, { backgroundColor: theme.color.brandSoft }]}>
                <Icon name="search-outline" size={18} color={theme.color.brand} />
              </View>
              <Text variant="bodyMedium" style={styles.flex}>
                {ui.invoicePickDoctor}
              </Text>
              <Icon name="chevron-forward" size={16} color={theme.color.textFaint} directional />
            </PressableScale>
          )
        ) : (
          <View style={styles.fields}>
            <Field
              size="sm"
              label={ui.invoiceCustomerName}
              value={draft.customerName}
              onChangeText={(value) => patch({ customerName: value })}
              icon="person-outline"
              placeholder={ui.invoiceCustomerNamePlaceholder}
              invalid={error === 'customer'}
            />
            <Field
              size="sm"
              ltr
              label={ui.invoiceEmail}
              value={draft.email}
              onChangeText={(value) => patch({ email: value })}
              icon="mail-outline"
              placeholder={ui.invoiceEmailPlaceholder}
              keyboardType="email-address"
              invalid={error === 'email'}
            />
            <Field
              size="sm"
              ltr
              label={ui.invoicePhone}
              value={draft.phone}
              onChangeText={(value) => patch({ phone: value })}
              icon="call-outline"
              placeholder={ui.invoicePhonePlaceholder}
              keyboardType="phone-pad"
            />
          </View>
        )}
      </Group>

      <Group title={ui.invoiceItemsTitle} hint={ui.invoiceItemsHint}>
        <FlatList
          horizontal
          inverted={isRtl}
          data={catalog}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catalogRow}
          renderItem={({ item }) => <ServiceChip service={item} onPress={() => addService(item)} />}
        />

        {draft.lines.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title={ui.invoiceItemsEmpty}
            hint={ui.invoiceItemsEmptyHint}
          />
        ) : (
          <View style={styles.lines}>
            {draft.lines.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                onEdit={() => setLineSheet({ mode: 'edit', line })}
                onRemove={() => removeLine(line.id)}
                onQuantity={(delta) => changeQuantity(line.id, delta)}
              />
            ))}
          </View>
        )}

        <Button
          size="md"
          variant="secondary"
          icon="add"
          label={ui.invoiceCustomLine}
          onPress={() => setLineSheet({ mode: 'new' })}
        />
      </Group>

      <Group title={ui.invoiceTermsTitle} hint={ui[PAYMENT_TERM_META[draft.terms].hintKey]}>
        <View style={[styles.chipRow, row(isRtl)]}>
          {(['monthly', 'immediate'] as PaymentTerm[]).map((terms) => (
            <Chip
              key={terms}
              label={ui[PAYMENT_TERM_META[terms].labelKey]}
              selected={draft.terms === terms}
              onPress={() => setTerms(terms)}
            />
          ))}
        </View>
        <View style={[styles.meta, row(isRtl)]}>
          <Icon name="calendar-outline" size={13} color={theme.color.textFaint} />
          <Text variant="caption" tone="muted">
            {interpolate(ui.invoiceDueOn, { date: longDate(draft.dueAt, lang) })}
          </Text>
        </View>
      </Group>

      <Group title={ui.invoiceNotesTitle}>
        <TextInput
          value={typeof draft.notes === 'string' ? draft.notes : localized(draft.notes, lang)}
          onChangeText={(value) => patch({ notes: value })}
          placeholder={ui.invoiceNotesPlaceholder}
          placeholderTextColor={theme.color.textFaint}
          multiline
          numberOfLines={3}
          style={[
            styles.notes,
            {
              color: theme.color.text,
              backgroundColor: theme.color.surfaceMuted,
              borderColor: theme.color.border,
              textAlign: isRtl ? 'right' : 'left',
            },
          ]}
        />
      </Group>

      <Card style={styles.totals}>
        <TotalRow label={ui.invoiceSubtotal} value={formatMoney(totals.subtotal)} />
        <TotalRow
          label={interpolate(ui.invoiceVat, { rate: draft.taxRate })}
          value={formatMoney(totals.tax)}
        />
        <View style={[styles.totalDivider, { backgroundColor: theme.color.border }]} />
        <TotalRow label={ui.invoiceTotal} value={formatMoney(totals.total)} strong />
      </Card>

      <Group title={ui.invoiceSendTitle}>
        <View style={[styles.chipRow, row(isRtl)]}>
          <Chip
            label={ui.invoiceChannelEmail}
            selected={channel === 'email'}
            onPress={() => setChannel('email')}
          />
          {registered && draft.doctorId ? (
            <Chip
              label={ui.invoiceChannelApp}
              selected={channel === 'app'}
              onPress={() => setChannel('app')}
            />
          ) : null}
        </View>
        <Text variant="caption" tone="muted">
          {channel === 'email'
            ? ui.invoiceChannelEmailHint
            : interpolate(ui.invoiceChannelAppHint, { name: draft.customerName })}
        </Text>

        {errorMessage ? (
          <View
            style={[
              styles.error,
              row(isRtl),
              { backgroundColor: withAlpha(theme.color.danger, 0.1) },
            ]}>
            <Icon name="alert-circle" size={15} color={theme.color.danger} />
            <Text variant="caption" tone="danger" style={styles.flex}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Button label={ui.invoiceSend} icon="paper-plane-outline" onPress={() => void send()} />
        <Button
          size="md"
          variant="ghost"
          icon="document-outline"
          label={ui.invoiceSaveDraft}
          onPress={saveDraft}
        />
      </Group>

      <DoctorSheet
        visible={doctorSheet}
        onClose={() => setDoctorSheet(false)}
        onSelect={pickDoctor}
      />
      <LineSheet
        state={lineSheet}
        invoiceId={draft.id}
        onClose={() => setLineSheet(null)}
        onSubmit={submitLine}
      />
      <OutcomeSheet
        outcome={outcome}
        onAnother={startOver}
        onOpenBilling={() => {
          setOutcome(null);
          router.replace('/billing');
        }}
      />
    </Screen>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <Text variant="overline" tone="faint">
          {title}
        </Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function ServiceChip({ service, onPress }: { service: Service; onPress: () => void }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const name = localized(service.name, lang);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.invoiceAddServiceAria, { name })}
      style={[
        styles.serviceChip,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.serviceChipTop, row(isRtl)]}>
        <Icon name="add-circle-outline" size={14} color={theme.color.brand} />
        <Text variant="label" numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Text variant="caption" tone="faint" ltr>
        {formatMoney(service.price)}
      </Text>
    </PressableScale>
  );
}

function LineRow({
  line,
  onEdit,
  onRemove,
  onQuantity,
}: {
  line: InvoiceLine;
  onEdit: () => void;
  onRemove: () => void;
  onQuantity: (delta: number) => void;
}) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();

  return (
    <View
      style={[
        styles.line,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.lineTop, row(isRtl)]}>
        <PressableScale
          scaleTo={0.99}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={ui.invoiceLineSheetEdit}
          style={styles.flex}>
          <Text variant="bodyMedium" numberOfLines={2}>
            {localized(line.description, lang)}
          </Text>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {interpolate(ui.invoiceLineEach, { price: formatMoney(line.unitPrice) })}
          </Text>
        </PressableScale>
        <IconButton
          icon="trash-outline"
          size={34}
          shape="rounded"
          accessibilityLabel={ui.invoiceLineRemove}
          onPress={onRemove}
        />
      </View>

      <View style={[styles.lineBottom, row(isRtl)]}>
        <View style={[styles.stepper, row(isRtl), { borderColor: theme.color.border }]}>
          <IconButton
            icon="remove"
            size={30}
            shape="rounded"
            accessibilityLabel={ui.invoiceLineDecrease}
            onPress={() => onQuantity(-1)}
          />
          <Text variant="label" ltr style={styles.quantity}>
            {line.quantity}
          </Text>
          <IconButton
            icon="add"
            size={30}
            shape="rounded"
            accessibilityLabel={ui.invoiceLineIncrease}
            onPress={() => onQuantity(1)}
          />
        </View>
        <Text variant="subheading" ltr>
          {formatMoney(lineTotal(line))}
        </Text>
      </View>
    </View>
  );
}

function DoctorSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (doctor: Doctor) => void;
}) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const { doctors } = useDirectory();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = doctors.filter((doctor) => doctor.status !== 'inactive');
    if (!needle) return pool.slice(0, 12);
    return pool
      .filter((doctor) =>
        [doctor.name, doctor.clinic, localized(doctor.specialty, lang), doctor.email]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      )
      .slice(0, 20);
  }, [doctors, lang, query]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={ui.invoiceDoctorSheetTitle}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={ui.invoiceDoctorSearch}
        clearLabel={ui.searchClear}
      />

      {results.length === 0 ? (
        <EmptyState
          icon="medkit-outline"
          title={ui.invoiceDoctorEmpty}
          hint={ui.invoiceDoctorEmptyHint}
        />
      ) : (
        <View style={styles.doctorList}>
          {results.map((doctor) => (
            <PressableScale
              key={doctor.id}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={doctor.name}
              onPress={() => onSelect(doctor)}
              style={[
                styles.doctorRow,
                row(isRtl),
                { backgroundColor: theme.color.surfaceMuted, borderColor: theme.color.border },
              ]}>
              <Avatar initials={initials(doctor.name)} size={38} />
              <View style={styles.flex}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {doctor.name}
                </Text>
                <Text variant="caption" tone="faint" numberOfLines={1}>
                  {doctor.clinic}
                </Text>
              </View>
              <Icon name="chevron-forward" size={16} color={theme.color.textFaint} directional />
            </PressableScale>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

function LineSheet({
  state,
  invoiceId,
  onClose,
  onSubmit,
}: {
  state: LineSheetState | null;
  invoiceId: string;
  onClose: () => void;
  onSubmit: (line: InvoiceLine) => void;
}) {
  const { lang, ui } = useLanguage();
  const [shown, setShown] = useState<LineSheetState | null>(state);
  if (state && state !== shown) setShown(state);

  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [invalid, setInvalid] = useState(false);

  // Reload the form whenever a different line opens the sheet.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const currentKey = state ? (state.mode === 'edit' ? state.line.id : 'new') : null;
  if (currentKey !== openKey) {
    setOpenKey(currentKey);
    if (state) {
      const line = state.mode === 'edit' ? state.line : null;
      setDescription(line ? localized(line.description, lang) : '');
      setPrice(line ? String(line.unitPrice) : '');
      setQuantity(String(line?.quantity ?? 1));
      setInvalid(false);
    }
  }

  const submit = () => {
    const text = description.trim();
    const unitPrice = numeric(price);
    if (!text || unitPrice <= 0) {
      setInvalid(true);
      return;
    }
    const editing = shown?.mode === 'edit' ? shown.line : null;
    onSubmit({
      id: editing?.id ?? `${invoiceId}-c${Date.now().toString(36)}`,
      description: text,
      quantity: Math.max(1, Math.round(numeric(quantity)) || 1),
      unitPrice,
    });
  };

  return (
    <BottomSheet
      visible={Boolean(state)}
      onClose={onClose}
      title={shown?.mode === 'edit' ? ui.invoiceLineSheetEdit : ui.invoiceLineSheetNew}
      footer={
        <View style={styles.flex}>
          <Button size="md" label={ui.actionSave} icon="checkmark" onPress={submit} />
        </View>
      }>
      <Field
        size="sm"
        label={ui.invoiceLineDescription}
        value={description}
        onChangeText={(value) => {
          setDescription(value);
          setInvalid(false);
        }}
        icon="create-outline"
        placeholder={ui.invoiceLineDescriptionPlaceholder}
        invalid={invalid && description.trim().length === 0}
      />
      <Field
        size="sm"
        ltr
        label={ui.invoiceLineUnitPrice}
        value={price}
        onChangeText={(value) => {
          setPrice(value);
          setInvalid(false);
        }}
        icon="pricetag-outline"
        placeholder="0"
        keyboardType="numeric"
        invalid={invalid && numeric(price) <= 0}
      />
      <Field
        size="sm"
        ltr
        label={ui.invoiceLineQuantity}
        value={quantity}
        onChangeText={setQuantity}
        icon="layers-outline"
        placeholder="1"
        keyboardType="number-pad"
      />
      {invalid ? (
        <Text variant="caption" tone="danger">
          {ui.invoiceLineRequired}
        </Text>
      ) : null}
    </BottomSheet>
  );
}

function OutcomeSheet({
  outcome,
  onAnother,
  onOpenBilling,
}: {
  outcome: Outcome | null;
  onAnother: () => void;
  onOpenBilling: () => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const [shown, setShown] = useState<Outcome | null>(outcome);
  if (outcome && outcome !== shown) setShown(outcome);

  const sent = shown?.kind === 'sent';
  const total = shown ? formatMoney(invoiceTotals(shown.invoice).total) : '';

  return (
    <BottomSheet
      visible={Boolean(outcome)}
      onClose={onAnother}
      title={sent ? ui.invoiceSentTitle : ui.invoiceDraftSavedTitle}
      footer={
        <>
          <View style={styles.flex}>
            <Button size="md" variant="secondary" label={ui.invoiceAnother} onPress={onAnother} />
          </View>
          <View style={styles.flex}>
            <Button
              size="md"
              label={ui.invoiceOpenBilling}
              icon="receipt-outline"
              onPress={onOpenBilling}
            />
          </View>
        </>
      }>
      <View
        style={[
          styles.outcome,
          { backgroundColor: withAlpha(sent ? theme.color.success : theme.color.textMuted, 0.1) },
        ]}>
        <Icon
          name={sent ? 'checkmark-circle' : 'document-outline'}
          size={26}
          color={sent ? theme.color.success : theme.color.textMuted}
        />
        <Text variant="body" tone="muted" style={styles.outcomeText}>
          {sent
            ? interpolate(ui.invoiceSentBody, {
                id: shown?.invoice.id ?? '',
                total,
                name: shown?.invoice.customerName ?? '',
              })
            : interpolate(ui.invoiceDraftSavedBody, { id: shown?.invoice.id ?? '' })}
        </Text>
        {shown?.invoice.sentVia === 'app' ? (
          <Badge label={ui.invoiceChannelApp} tone="brand" icon="phone-portrait-outline" />
        ) : null}
      </View>

      {shown?.mailFailed ? (
        <View style={[styles.error, row(isRtl), { backgroundColor: withAlpha(theme.color.warning, 0.12) }]}>
          <Icon name="alert-circle" size={15} color={theme.color.warning} />
          <Text variant="caption" tone="warning" style={styles.flex}>
            {ui.invoiceMailFallback}
          </Text>
        </View>
      ) : null}
    </BottomSheet>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  const { isRtl } = useLanguage();

  return (
    <View style={[styles.totalRow, row(isRtl)]}>
      <Text variant={strong ? 'subheading' : 'body'} tone={strong ? 'default' : 'muted'} style={styles.flex}>
        {label}
      </Text>
      <Text variant={strong ? 'heading' : 'bodyMedium'} ltr>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: spacing.sm },
  groupHead: { gap: 2, marginBottom: spacing.xs },
  fields: { gap: spacing.sm },
  recipient: { gap: spacing.md },
  recipientHead: { alignItems: 'center', gap: spacing.md },
  recipientMeta: { flexWrap: 'wrap', gap: spacing.md },
  changeButton: { paddingHorizontal: spacing.md },
  meta: { flexShrink: 1, alignItems: 'center', gap: 5 },
  picker: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogRow: { gap: spacing.sm, paddingVertical: 2 },
  serviceChip: {
    minWidth: 138,
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  serviceChipTop: { alignItems: 'center', gap: 5 },
  lines: { gap: spacing.sm },
  line: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lineTop: { alignItems: 'flex-start', gap: spacing.md },
  lineBottom: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  stepper: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quantity: { minWidth: 24, textAlign: 'center' },
  chipRow: { flexWrap: 'wrap', gap: spacing.sm },
  notes: {
    minHeight: 88,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    textAlignVertical: 'top',
  },
  totals: { gap: spacing.sm },
  totalRow: { alignItems: 'center', gap: spacing.md },
  totalDivider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
  error: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  doctorList: { gap: spacing.xs },
  doctorRow: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  outcome: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  outcomeText: { textAlign: 'center' },
});
