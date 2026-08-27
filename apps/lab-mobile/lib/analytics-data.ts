import {
  invoiceStatus,
  invoiceTotals,
  lineTotal,
  round2,
  type Invoice,
  type Payment,
  type PaymentMethod,
} from '@/lib/billing-data';
import type { MaybeLocalized, UiStrings } from '@/lib/i18n';

/**
 * Every number on the analytics screen is aggregated from the same ledger the
 * billing screen reads, so the two can never tell different stories. Only the
 * production quality figures are modelled, since the demo has no shop-floor
 * timestamps to measure — those are derived from the calendar month so they stay
 * stable between renders.
 */

export type RangeKey = 'month' | 'quarter' | 'half';

export const ANALYTICS_RANGES: { key: RangeKey; labelKey: keyof UiStrings; months: number }[] = [
  { key: 'month', labelKey: 'analyticsRangeMonth', months: 1 },
  { key: 'quarter', labelKey: 'analyticsRangeQuarter', months: 3 },
  { key: 'half', labelKey: 'analyticsRangeHalf', months: 6 },
];

export type MonthBucket = {
  /** `2026-07`, used as a list key. */
  key: string;
  year: number;
  monthIndex: number;
  invoiced: number;
  collected: number;
  /** Units produced, i.e. the quantities across every invoice line. */
  units: number;
  /** Share of cases that met their promised date, 0 – 1. */
  onTime: number;
  /** Average days from case received to case shipped. */
  turnaround: number;
};

export type ServiceSlice = { id: string; name: MaybeLocalized; amount: number; units: number };
export type DoctorSlice = { id: string; name: string; clinic: string; amount: number; count: number };
export type MethodSlice = { method: PaymentMethod; amount: number; count: number };

export type Analytics = {
  months: number;
  /** Invoiced, collected and produced inside the selected range. */
  invoiced: number;
  collected: number;
  units: number;
  invoiceCount: number;
  avgInvoice: number;
  /** Collected as a share of invoiced, clamped to 1. */
  collectionRate: number;
  /** Revenue share that came from walk-in counter sales. */
  counterShare: number;
  onTime: number;
  turnaround: number;
  /** Live snapshot across the whole ledger, not just the range. */
  outstanding: number;
  overdue: number;
  overdueCount: number;
  series: MonthBucket[];
  byService: ServiceSlice[];
  topDoctors: DoctorSlice[];
  byMethod: MethodSlice[];
};

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Stable stand-ins for shop-floor metrics the demo does not record. */
const onTimeFor = (year: number, monthIndex: number) =>
  round2(0.86 + (((year * 12 + monthIndex) * 7) % 12) / 100);

const turnaroundFor = (year: number, monthIndex: number) =>
  round2(3.2 + (((year * 12 + monthIndex) * 5) % 9) / 10);

export function buildAnalytics(
  invoices: readonly Invoice[],
  payments: readonly Payment[],
  paidByInvoice: ReadonlyMap<string, number>,
  months: number,
  now: Date = new Date()
): Analytics {
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).getTime();

  const buckets = new Map<string, MonthBucket>();
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.set(monthKey(date), {
      key: monthKey(date),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      invoiced: 0,
      collected: 0,
      units: 0,
      onTime: onTimeFor(date.getFullYear(), date.getMonth()),
      turnaround: turnaroundFor(date.getFullYear(), date.getMonth()),
    });
  }

  const services = new Map<string, ServiceSlice>();
  const doctors = new Map<string, DoctorSlice>();
  const methods = new Map<PaymentMethod, MethodSlice>();

  let invoiced = 0;
  let units = 0;
  let invoiceCount = 0;
  let counter = 0;
  let outstanding = 0;
  let overdue = 0;
  let overdueCount = 0;

  for (const invoice of invoices) {
    const paid = paidByInvoice.get(invoice.id) ?? 0;
    const { total, balance } = invoiceTotals(invoice, paid);
    const status = invoiceStatus(invoice, paid, now.getTime());

    if (status !== 'draft') {
      outstanding = round2(outstanding + balance);
      if (status === 'overdue') {
        overdue = round2(overdue + balance);
        overdueCount += 1;
      }
    }

    const issued = new Date(invoice.issuedAt).getTime();
    if (status === 'draft' || issued < start) continue;

    invoiced = round2(invoiced + total);
    invoiceCount += 1;
    if (invoice.customerKind === 'walkin') counter = round2(counter + total);

    const bucket = buckets.get(monthKey(new Date(issued)));
    if (bucket) bucket.invoiced = round2(bucket.invoiced + total);

    for (const line of invoice.lines) {
      units += line.quantity;
      if (bucket) bucket.units += line.quantity;

      const id = line.serviceId ?? 'custom';
      const slice = services.get(id) ?? {
        id,
        name: line.description,
        amount: 0,
        units: 0,
      };
      services.set(id, {
        ...slice,
        amount: round2(slice.amount + lineTotal(line)),
        units: slice.units + line.quantity,
      });
    }

    if (invoice.doctorId) {
      const slice = doctors.get(invoice.doctorId) ?? {
        id: invoice.doctorId,
        name: invoice.customerName,
        clinic: invoice.clinic,
        amount: 0,
        count: 0,
      };
      doctors.set(invoice.doctorId, {
        ...slice,
        amount: round2(slice.amount + total),
        count: slice.count + 1,
      });
    }
  }

  let collected = 0;
  for (const payment of payments) {
    const received = new Date(payment.receivedAt).getTime();
    if (received < start) continue;

    collected = round2(collected + payment.amount);
    const bucket = buckets.get(monthKey(new Date(received)));
    if (bucket) bucket.collected = round2(bucket.collected + payment.amount);

    const slice = methods.get(payment.method) ?? { method: payment.method, amount: 0, count: 0 };
    methods.set(payment.method, {
      ...slice,
      amount: round2(slice.amount + payment.amount),
      count: slice.count + 1,
    });
  }

  const series = [...buckets.values()];
  const weight = series.length || 1;

  return {
    months,
    invoiced,
    collected,
    units,
    invoiceCount,
    avgInvoice: invoiceCount === 0 ? 0 : round2(invoiced / invoiceCount),
    collectionRate: invoiced === 0 ? 0 : Math.min(1, round2(collected / invoiced)),
    counterShare: invoiced === 0 ? 0 : round2(counter / invoiced),
    onTime: round2(series.reduce((sum, month) => sum + month.onTime, 0) / weight),
    turnaround: round2(series.reduce((sum, month) => sum + month.turnaround, 0) / weight),
    outstanding,
    overdue,
    overdueCount,
    series,
    byService: [...services.values()].sort((a, b) => b.amount - a.amount),
    topDoctors: [...doctors.values()].sort((a, b) => b.amount - a.amount),
    byMethod: [...methods.values()].sort((a, b) => b.amount - a.amount),
  };
}
