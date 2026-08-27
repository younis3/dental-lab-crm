import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/back-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Icon, type IconName } from '@/components/ui/icon';
import { Badge, Chip, useToneColors, type Tone } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import {
  INVOICE_STATUS_META,
  PAYMENT_METHODS,
  PAYMENT_METHOD_META,
  PAYMENT_TERM_META,
  invoiceStatus,
  invoiceTotals,
  lineTotal,
  round2,
  type Invoice,
  type InvoiceStatus,
  type Payment,
  type PaymentMethod,
} from '@/lib/billing-data';
import { formatMoney, formatMoneyShort } from '@/lib/format';
import { LOCALES, interpolate, localized, type Lang } from '@/lib/i18n';
import { openInvoiceMail } from '@/lib/invoice-mail';
import { exportInvoicePdf, saveInvoicePdf } from '@/lib/invoice-pdf';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import {
  invoiceById,
  markInvoiceSent,
  recordPayment,
  removeInvoice,
  removePayment,
  useBilling,
} from '@/store/invoices-store';
import { useLanguage } from '@/store/language-store';

type BillingView = 'invoices' | 'payments';
type StatusFilter = InvoiceStatus | 'all';

const DAY = 86_400_000;

const FILTERS: readonly StatusFilter[] = ['all', 'overdue', 'sent', 'partial', 'paid', 'draft'];

function shortDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'short' });
}

function monthLabel(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(LOCALES[lang], { month: 'long', year: 'numeric' });
}

/**
 * The lab's ledger: what has been invoiced and what has actually come back.
 * Invoices and payments are two views of the same data, so they share one header
 * and one search box instead of living on separate screens.
 */
export default function BillingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isRtl, lang, ui } = useLanguage();
  const { can } = usePermissions();
  const { invoices, payments, paidByInvoice } = useBilling();

  const [view, setView] = useState<BillingView>('invoices');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      invoices.map((invoice) => {
        const paid = paidByInvoice.get(invoice.id) ?? 0;
        return {
          invoice,
          paid,
          status: invoiceStatus(invoice, paid),
          totals: invoiceTotals(invoice, paid),
        };
      }),
    [invoices, paidByInvoice]
  );

  const summary = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const outstanding = rows.reduce(
      (sum, entry) => (entry.status === 'draft' ? sum : sum + entry.totals.balance),
      0
    );
    const overdue = rows.reduce(
      (sum, entry) => (entry.status === 'overdue' ? sum + entry.totals.balance : sum),
      0
    );
    const collected = payments.reduce(
      (sum, payment) =>
        new Date(payment.receivedAt).getTime() >= monthStart.getTime() ? sum + payment.amount : sum,
      0
    );
    return {
      outstanding,
      overdue,
      collected,
      overdueCount: rows.filter((entry) => entry.status === 'overdue').length,
    };
  }, [payments, rows]);

  const needle = query.trim().toLowerCase();

  const visibleInvoices = useMemo(
    () =>
      rows.filter((entry) => {
        if (filter !== 'all' && entry.status !== filter) return false;
        if (!needle) return true;
        const { id, customerName, clinic } = entry.invoice;
        return `${id} ${customerName} ${clinic}`.toLowerCase().includes(needle);
      }),
    [filter, needle, rows]
  );

  const paymentSections = useMemo(() => {
    const groups = new Map<string, { key: string; title: string; total: number; data: Payment[] }>();

    for (const payment of payments) {
      const invoice = invoices.find((entry) => entry.id === payment.invoiceId);
      const haystack =
        `${payment.invoiceId} ${invoice?.customerName ?? ''} ${invoice?.clinic ?? ''}`.toLowerCase();
      if (needle && !haystack.includes(needle)) continue;

      const key = payment.receivedAt.slice(0, 7);
      const group = groups.get(key) ?? {
        key,
        title: monthLabel(payment.receivedAt, lang),
        total: 0,
        data: [],
      };
      group.total = round2(group.total + payment.amount);
      group.data.push(payment);
      groups.set(key, group);
    }

    return [...groups.values()];
  }, [invoices, lang, needle, payments]);

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>([['all', rows.length]]);
    for (const entry of rows) {
      map.set(entry.status, (map.get(entry.status) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  if (!can('viewBilling')) {
    return <Redirect href="/" />;
  }

  const header = (
    <View style={styles.header}>
      <View style={[styles.summary, row(isRtl)]}>
        <SummaryTile
          icon="wallet-outline"
          value={formatMoneyShort(summary.outstanding)}
          label={ui.billingSummaryOutstanding}
          tone="brand"
        />
        <SummaryTile
          icon="alert-circle-outline"
          value={formatMoneyShort(summary.overdue)}
          label={ui.billingSummaryOverdue}
          tone="danger"
        />
        <SummaryTile
          icon="trending-up-outline"
          value={formatMoneyShort(summary.collected)}
          label={ui.billingSummaryCollected}
          tone="success"
        />
      </View>

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { key: 'invoices', label: ui.billingViewInvoices, icon: 'receipt-outline' },
          { key: 'payments', label: ui.billingViewPayments, icon: 'cash-outline' },
        ]}
      />

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={ui.billingSearch}
        clearLabel={ui.searchClear}
      />

      {view === 'invoices' ? (
        <FlatList
          horizontal
          inverted={isRtl}
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <Chip
              label={item === 'all' ? ui.filterAll : ui[INVOICE_STATUS_META[item].labelKey]}
              count={counts.get(item) ?? 0}
              selected={filter === item}
              onPress={() => setFilter(item)}
            />
          )}
        />
      ) : null}
    </View>
  );

  const listPadding = { paddingBottom: insets.bottom + spacing['3xl'] };

  return (
    <Screen
      scrollable={false}
      header={
        <ScreenHeader
          title={ui.billingTitle}
          subtitle={interpolate(ui.billingSubtitle, {
            outstanding: formatMoneyShort(summary.outstanding),
            overdue: summary.overdueCount,
          })}
          leading={<BackButton />}
          showMenu={false}
          right={
            <IconButton
              icon="add"
              tone="brand"
              accessibilityLabel={ui.billingNewInvoice}
              onPress={() => router.push('/invoice-new')}
            />
          }
        />
      }>
      {view === 'invoices' ? (
        <FlatList
          data={visibleInvoices}
          keyExtractor={(item) => item.invoice.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.list, listPadding]}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={ui.billingEmptyInvoices}
              hint={ui.billingEmptyInvoicesHint}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 40).duration(360)}>
              <InvoiceCard
                invoice={item.invoice}
                status={item.status}
                paid={item.paid}
                onPress={() => setDetailId(item.invoice.id)}
              />
            </Animated.View>
          )}
        />
      ) : (
        <SectionList
          sections={paymentSections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.list, listPadding]}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title={ui.billingEmptyPayments}
              hint={ui.billingEmptyPaymentsHint}
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHead, row(isRtl)]}>
              <Text variant="label" style={styles.flex} numberOfLines={1}>
                {section.title}
              </Text>
              <Badge label={formatMoney(section.total)} tone="success" />
            </View>
          )}
          renderItem={({ item }) => (
            <PaymentCard payment={item} onPress={() => setDetailId(item.invoiceId)} />
          )}
        />
      )}

      <InvoiceSheet
        invoiceId={detailId}
        onClose={() => setDetailId(null)}
        onRecordPayment={(id) => {
          setDetailId(null);
          setPayingId(id);
        }}
      />
      <PaymentSheet invoiceId={payingId} onClose={() => setPayingId(null)} />
    </Screen>
  );
}

function SummaryTile({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: string;
  label: string;
  tone: Tone;
}) {
  const theme = useTheme();
  const { fg, bg } = useToneColors(tone);

  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.tileIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={15} color={fg} />
      </View>
      <Text variant="label" ltr numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" tone="faint" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function InvoiceCard({
  invoice,
  status,
  paid,
  onPress,
}: {
  invoice: Invoice;
  status: InvoiceStatus;
  paid: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const meta = INVOICE_STATUS_META[status];
  const { total, balance } = invoiceTotals(invoice, paid);
  const days = Math.round((new Date(invoice.dueAt).getTime() - Date.now()) / DAY);

  const timing =
    status === 'paid'
      ? ui.billingFullyPaid
      : status === 'overdue'
        ? interpolate(ui.billingOverdueDays, { count: Math.abs(days) })
        : status === 'draft'
          ? interpolate(ui.billingIssuedOn, { date: shortDate(invoice.issuedAt, lang) })
          : interpolate(ui.billingDueOn, { date: shortDate(invoice.dueAt, lang) });

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.billingInvoiceAria, {
        id: invoice.id,
        name: invoice.customerName,
      })}>
      <Card style={styles.invoice}>
        <View style={[styles.invoiceTop, row(isRtl)]}>
          <View style={styles.flex}>
            <Text variant="subheading" numberOfLines={1}>
              {invoice.customerName}
            </Text>
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {invoice.clinic || ui.billingWalkInBadge}
            </Text>
          </View>
          <Badge label={ui[meta.labelKey]} tone={meta.tone} icon={meta.icon} />
        </View>

        <View style={[styles.invoiceMeta, row(isRtl)]}>
          <View style={[styles.meta, row(isRtl)]}>
            <Icon name="pricetag-outline" size={13} color={theme.color.textFaint} />
            <Text variant="caption" tone="muted" ltr>
              {invoice.id}
            </Text>
          </View>
          <View style={[styles.meta, row(isRtl)]}>
            <Icon
              name={status === 'overdue' ? 'alert-circle-outline' : 'calendar-outline'}
              size={13}
              color={status === 'overdue' ? theme.color.danger : theme.color.textFaint}
            />
            <Text variant="caption" tone={status === 'overdue' ? 'danger' : 'muted'} numberOfLines={1}>
              {timing}
            </Text>
          </View>
        </View>

        {status === 'partial' ? (
          <View style={styles.partial}>
            <ProgressBar value={total === 0 ? 0 : paid / total} height={6} />
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {interpolate(ui.billingPaidOf, {
                paid: formatMoney(paid),
                total: formatMoney(total),
              })}
            </Text>
          </View>
        ) : null}

        <View style={[styles.invoiceFoot, row(isRtl), { borderTopColor: theme.color.border }]}>
          <Text variant="caption" tone="faint" style={styles.flex} numberOfLines={1}>
            {ui[PAYMENT_TERM_META[invoice.terms].labelKey]}
          </Text>
          <Text variant="subheading" ltr>
            {formatMoney(balance > 0 ? balance : total)}
          </Text>
        </View>
      </Card>
    </PressableScale>
  );
}

function PaymentCard({ payment, onPress }: { payment: Payment; onPress: () => void }) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const invoice = invoiceById(payment.invoiceId);
  const meta = PAYMENT_METHOD_META[payment.method];
  const { fg, bg } = useToneColors('success');

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={interpolate(ui.billingPaymentAria, {
        amount: formatMoney(payment.amount),
        name: invoice?.customerName ?? payment.invoiceId,
      })}
      style={[
        styles.payment,
        row(isRtl),
        { backgroundColor: theme.color.surface, borderColor: theme.color.border },
      ]}>
      <View style={[styles.paymentIcon, { backgroundColor: bg }]}>
        <Icon name={meta.icon} size={17} color={fg} />
      </View>
      <View style={styles.flex}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {invoice?.customerName ?? payment.invoiceId}
        </Text>
        <Text variant="caption" tone="faint" numberOfLines={1}>
          <Text variant="caption" tone="faint" ltr>
            {payment.invoiceId}
          </Text>
          {` · ${ui[meta.labelKey]} · ${shortDate(payment.receivedAt, lang)}`}
        </Text>
      </View>
      <Text variant="subheading" tone="success" ltr>
        {formatMoney(payment.amount)}
      </Text>
    </PressableScale>
  );
}

function InvoiceSheet({
  invoiceId,
  onClose,
  onRecordPayment,
}: {
  invoiceId: string | null;
  onClose: () => void;
  onRecordPayment: (id: string) => void;
}) {
  const theme = useTheme();
  const { isRtl, lang, ui } = useLanguage();
  const { payments, paidByInvoice } = useBilling();

  // The live row drives the numbers, while the last one seen keeps the body on
  // screen as the sheet animates out — including after a draft is deleted.
  const live = invoiceById(invoiceId ?? undefined);
  const [shown, setShown] = useState<Invoice | undefined>(live);
  if (live && live !== shown) setShown(live);

  const invoice = live ?? shown;
  const paid = invoice ? (paidByInvoice.get(invoice.id) ?? 0) : 0;
  const totals = invoice ? invoiceTotals(invoice, paid) : null;
  const status = invoice ? invoiceStatus(invoice, paid) : 'draft';
  const received = invoice
    ? payments.filter((payment) => payment.invoiceId === invoice.id)
    : [];
  const notes = invoice ? localized(invoice.notes, lang) : '';

  const resend = async () => {
    if (!invoice) return;
    await openInvoiceMail(invoice, ui, lang);
    markInvoiceSent(invoice.id, 'email');
  };

  const download = async () => {
    if (!invoice) return;
    const result = await saveInvoicePdf(invoice, ui, lang, paid);
    if (result === 'saved') {
      Alert.alert(ui.billingDownloadDoneTitle, ui.billingDownloadDoneBody);
    } else if (result === 'error') {
      Alert.alert(ui.billingDownloadFailTitle, ui.billingDownloadFailBody);
    }
  };

  return (
    <BottomSheet
      visible={Boolean(invoiceId)}
      onClose={onClose}
      title={interpolate(ui.billingDetailTitle, { id: invoice?.id ?? '' })}
      footer={
        <>
          {totals && totals.balance > 0 && invoice?.sentAt ? (
            <View style={styles.flex}>
              <Button
                size="md"
                label={ui.billingRecordPayment}
                icon="cash-outline"
                onPress={() => invoice && onRecordPayment(invoice.id)}
              />
            </View>
          ) : null}
          <View style={styles.flex}>
            <Button
              size="md"
              variant="secondary"
              label={invoice?.sentAt ? ui.billingResend : ui.billingSendNow}
              onPress={() => void resend()}
            />
          </View>
        </>
      }>
      {invoice && totals ? (
        <>
          <View style={[styles.sheetHead, row(isRtl)]}>
            <View style={styles.flex}>
              <Text variant="subheading" numberOfLines={1}>
                {invoice.customerName}
              </Text>
              <Text variant="caption" tone="faint" numberOfLines={1}>
                {invoice.clinic || ui.billingWalkInBadge}
              </Text>
              <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                {invoice.email}
              </Text>
            </View>
            <Badge
              label={ui[INVOICE_STATUS_META[status].labelKey]}
              tone={INVOICE_STATUS_META[status].tone}
              icon={INVOICE_STATUS_META[status].icon}
            />
          </View>

          <View style={[styles.sheetTags, row(isRtl)]}>
            <Badge
              label={ui[PAYMENT_TERM_META[invoice.terms].labelKey]}
              icon={PAYMENT_TERM_META[invoice.terms].icon}
            />
            <Badge
              label={interpolate(ui.billingIssuedOn, { date: shortDate(invoice.issuedAt, lang) })}
              icon="calendar-outline"
            />
            <Badge
              label={interpolate(ui.billingDueOn, { date: shortDate(invoice.dueAt, lang) })}
              icon="time-outline"
              tone={status === 'overdue' ? 'danger' : 'neutral'}
            />
            {invoice.sentVia ? (
              <Badge
                label={interpolate(ui.billingSentVia, {
                  channel:
                    invoice.sentVia === 'email' ? ui.invoiceChannelEmail : ui.invoiceChannelApp,
                })}
                icon="paper-plane-outline"
                tone="brand"
              />
            ) : null}
          </View>

          <Text variant="overline" tone="faint">
            {ui.billingDetailItems}
          </Text>
          <View style={styles.sheetLines}>
            {invoice.lines.map((line) => (
              <View key={line.id} style={[styles.sheetLine, row(isRtl)]}>
                <Text variant="body" style={styles.flex} numberOfLines={2}>
                  {localized(line.description, lang)}
                </Text>
                <Text variant="caption" tone="faint" ltr>
                  {`${line.quantity} × ${formatMoney(line.unitPrice)}`}
                </Text>
                <Text variant="bodyMedium" ltr style={styles.lineAmount}>
                  {formatMoney(lineTotal(line))}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.sheetTotals, { borderTopColor: theme.color.border }]}>
            <SheetRow label={ui.invoiceSubtotal} value={formatMoney(totals.subtotal)} />
            <SheetRow
              label={interpolate(ui.invoiceVat, { rate: invoice.taxRate })}
              value={formatMoney(totals.tax)}
            />
            <SheetRow label={ui.invoiceTotal} value={formatMoney(totals.total)} strong />
            <SheetRow label={ui.billingDetailPaid} value={formatMoney(totals.paid)} />
            <SheetRow label={ui.billingDetailBalance} value={formatMoney(totals.balance)} strong />
          </View>

          {notes ? (
            <View style={[styles.noteBox, { backgroundColor: theme.color.surfaceMuted }]}>
              <Text variant="overline" tone="faint">
                {ui.billingDetailNotes}
              </Text>
              <Text variant="body" tone="muted">
                {notes}
              </Text>
            </View>
          ) : null}

          <Text variant="overline" tone="faint">
            {ui.billingDetailPayments}
          </Text>
          {received.length === 0 ? (
            <Text variant="caption" tone="muted">
              {ui.billingDetailNoPayments}
            </Text>
          ) : (
            <View style={styles.sheetLines}>
              {received.map((payment) => (
                <View key={payment.id} style={[styles.sheetLine, row(isRtl)]}>
                  <Icon
                    name={PAYMENT_METHOD_META[payment.method].icon}
                    size={15}
                    color={theme.color.textFaint}
                  />
                  <Text variant="caption" tone="muted" style={styles.flex} numberOfLines={1}>
                    {`${ui[PAYMENT_METHOD_META[payment.method].labelKey]} · ${shortDate(
                      payment.receivedAt,
                      lang
                    )}`}
                  </Text>
                  <Text variant="bodyMedium" tone="success" ltr>
                    {formatMoney(payment.amount)}
                  </Text>
                  <IconButton
                    icon="close"
                    size={28}
                    shape="rounded"
                    accessibilityLabel={ui.billingRemovePayment}
                    onPress={() => removePayment(payment.id)}
                  />
                </View>
              ))}
            </View>
          )}

          <Button
            size="md"
            variant="secondary"
            label={ui.billingExportPdf}
            onPress={() => void exportInvoicePdf(invoice, ui, lang, paid)}
          />

          <Button
            size="md"
            variant="secondary"
            label={ui.billingDownloadPdf}
            onPress={() => void download()}
          />

          {!invoice.sentAt ? (
            <Button
              size="md"
              variant="danger"
              icon="trash-outline"
              label={ui.billingDeleteDraft}
              onPress={() => {
                removeInvoice(invoice.id);
                onClose();
              }}
            />
          ) : null}
        </>
      ) : null}
    </BottomSheet>
  );
}

function PaymentSheet({ invoiceId, onClose }: { invoiceId: string | null; onClose: () => void }) {
  const { isRtl, ui } = useLanguage();
  const { paidByInvoice } = useBilling();

  const live = invoiceById(invoiceId ?? undefined);
  const [shown, setShown] = useState<Invoice | undefined>(live);
  if (live && live !== shown) setShown(live);

  const invoice = live ?? shown;
  const paid = invoice ? (paidByInvoice.get(invoice.id) ?? 0) : 0;
  const balance = invoice ? invoiceTotals(invoice, paid).balance : 0;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('transfer');
  const [reference, setReference] = useState('');
  const [invalid, setInvalid] = useState(false);

  // Every invoice that opens the sheet starts from its own open balance.
  const [openKey, setOpenKey] = useState<string | null>(null);
  if (invoiceId !== openKey) {
    setOpenKey(invoiceId);
    if (invoiceId) {
      setAmount(balance > 0 ? String(balance) : '');
      setMethod('transfer');
      setReference('');
      setInvalid(false);
    }
  }

  const submit = () => {
    const value = Number(amount.replace(/[^\d.]/g, ''));
    if (!invoice || !Number.isFinite(value) || value <= 0 || value > balance + 0.01) {
      setInvalid(true);
      return;
    }
    recordPayment({
      invoiceId: invoice.id,
      amount: value,
      method,
      reference: reference.trim(),
    });
    onClose();
  };

  return (
    <BottomSheet
      visible={Boolean(invoiceId)}
      onClose={onClose}
      title={ui.billingPaymentTitle}
      footer={
        <>
          <View style={styles.flex}>
            <Button size="md" label={ui.billingPaymentSave} onPress={submit} />
          </View>
          <View style={styles.flex}>
            <Button size="md" variant="secondary" label={ui.actionCancel} onPress={onClose} />
          </View>
        </>
      }>
      <Text variant="body" tone="muted">
        {interpolate(ui.billingPaymentFor, {
          id: invoice?.id ?? '',
          balance: formatMoney(balance),
        })}
      </Text>

      <Field
        size="sm"
        ltr
        label={ui.billingPaymentAmount}
        value={amount}
        onChangeText={(value) => {
          setAmount(value);
          setInvalid(false);
        }}
        icon="cash-outline"
        placeholder="0"
        keyboardType="numeric"
        invalid={invalid}
      />
      {invalid ? (
        <Text variant="caption" tone="danger">
          {ui.billingPaymentInvalid}
        </Text>
      ) : null}

      <Text variant="caption" tone="muted">
        {ui.billingPaymentMethod}
      </Text>
      <View style={[styles.chipRow, row(isRtl)]}>
        {PAYMENT_METHODS.map((option) => (
          <Chip
            key={option}
            label={ui[PAYMENT_METHOD_META[option].labelKey]}
            selected={method === option}
            onPress={() => setMethod(option)}
          />
        ))}
      </View>

      <Field
        size="sm"
        label={ui.billingPaymentReference}
        value={reference}
        onChangeText={setReference}
        icon="document-text-outline"
        placeholder={ui.billingPaymentReferencePlaceholder}
      />
    </BottomSheet>
  );
}

function SheetRow({
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
    <View style={[styles.sheetTotalRow, row(isRtl)]}>
      <Text variant={strong ? 'bodyMedium' : 'body'} tone={strong ? 'default' : 'muted'} style={styles.flex}>
        {label}
      </Text>
      <Text variant={strong ? 'subheading' : 'bodyMedium'} ltr>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  summary: { gap: spacing.sm },
  tile: {
    flex: 1,
    gap: 2,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  filterRow: { gap: spacing.sm, paddingVertical: 2 },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs },
  gap: { height: spacing.md },
  sectionHead: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  invoice: { gap: spacing.md },
  invoiceTop: { alignItems: 'flex-start', gap: spacing.md },
  invoiceMeta: { flexWrap: 'wrap', gap: spacing.md },
  meta: { flexShrink: 1, alignItems: 'center', gap: 5 },
  partial: { gap: 5 },
  invoiceFoot: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  payment: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHead: { alignItems: 'flex-start', gap: spacing.md },
  sheetTags: { flexWrap: 'wrap', gap: spacing.xs },
  sheetLines: { gap: spacing.sm },
  sheetLine: { alignItems: 'center', gap: spacing.sm },
  lineAmount: { minWidth: 64, textAlign: 'right' },
  sheetTotals: { gap: 4, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  sheetTotalRow: { alignItems: 'center', gap: spacing.md },
  noteBox: { gap: 4, padding: spacing.md, borderRadius: radius.sm },
  chipRow: { flexWrap: 'wrap', gap: spacing.sm },
});
