import type { IconName } from '@/components/ui/icon';
import type { Tone } from '@/components/ui/pill';
import { DOCTORS } from '@/lib/directory-data';
import type { LocalizedText, MaybeLocalized, UiStrings } from '@/lib/i18n';

/**
 * Billing model for the lab. Two kinds of customer share one invoice shape: a
 * registered doctor who settles a monthly account, and a walk-in who pays for a
 * single job at the counter.
 *
 * Payments live in their own list instead of a `paid` field on the invoice, so a
 * balance is always the sum of what was actually received and can never drift.
 */

/** Israeli VAT, applied to every invoice the lab issues. */
export const VAT_RATE = 18;

export type CustomerKind = 'doctor' | 'walkin';
/** Monthly clients are billed per period; a counter sale is due immediately. */
export type PaymentTerm = 'monthly' | 'immediate';
/** How a finished invoice reaches the customer. */
export type SendChannel = 'email' | 'app';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'app';

/** Derived from the due date and the payments received — never stored. */
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';

export type InvoiceLine = {
  id: string;
  /** Catalog lines keep all three languages; typed-in lines are plain strings. */
  description: MaybeLocalized;
  /** Set when the line came from the service catalog, so it can be grouped. */
  serviceId?: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  /** Human invoice number, e.g. `INV-4471`. */
  id: string;
  customerKind: CustomerKind;
  /** Present for registered doctors only. */
  doctorId?: string;
  customerName: string;
  clinic: string;
  email: string;
  phone: string;
  lines: InvoiceLine[];
  /** Percent, kept per invoice so a historic rate stays correct. */
  taxRate: number;
  /** Seeded notes ship in all three languages; typed notes are plain strings. */
  notes: MaybeLocalized;
  terms: PaymentTerm;
  issuedAt: string;
  dueAt: string;
  /** `null` while the invoice is still a draft. */
  sentAt: string | null;
  sentVia: SendChannel | null;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  /** Cheque number, transfer reference or the last card digits. */
  reference: string;
};

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { labelKey: keyof UiStrings; tone: Tone; icon: IconName }
> = {
  draft: { labelKey: 'billingStatusDraft', tone: 'neutral', icon: 'document-outline' },
  sent: { labelKey: 'billingStatusSent', tone: 'brand', icon: 'paper-plane-outline' },
  partial: { labelKey: 'billingStatusPartial', tone: 'warning', icon: 'hourglass-outline' },
  paid: { labelKey: 'billingStatusPaid', tone: 'success', icon: 'checkmark-circle-outline' },
  overdue: { labelKey: 'billingStatusOverdue', tone: 'danger', icon: 'alert-circle-outline' },
};

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'cash',
  'card',
  'transfer',
  'check',
  'app',
];

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { labelKey: keyof UiStrings; icon: IconName }
> = {
  cash: { labelKey: 'payMethodCash', icon: 'cash-outline' },
  card: { labelKey: 'payMethodCard', icon: 'card-outline' },
  transfer: { labelKey: 'payMethodTransfer', icon: 'swap-horizontal-outline' },
  check: { labelKey: 'payMethodCheck', icon: 'document-text-outline' },
  app: { labelKey: 'payMethodApp', icon: 'phone-portrait-outline' },
};

export const PAYMENT_TERM_META: Record<
  PaymentTerm,
  { labelKey: keyof UiStrings; hintKey: keyof UiStrings; icon: IconName }
> = {
  monthly: {
    labelKey: 'billingTermsMonthly',
    hintKey: 'billingTermsMonthlyHint',
    icon: 'calendar-outline',
  },
  immediate: {
    labelKey: 'billingTermsImmediate',
    hintKey: 'billingTermsImmediateHint',
    icon: 'flash-outline',
  },
};

export type Service = {
  id: string;
  name: LocalizedText;
  price: number;
  /** Counter-friendly jobs a walk-in can buy on the spot. */
  overTheCounter: boolean;
};

/** Price list the front desk builds an invoice from. Prices are per unit. */
export const SERVICE_CATALOG: Service[] = [
  {
    id: 'sv-zirconia',
    name: { en: 'Zirconia crown', he: 'כתר זירקוניה' },
    price: 850,
    overTheCounter: false,
  },
  {
    id: 'sv-emax',
    name: { en: 'E-max veneer', he: 'ציפוי E-max' },
    price: 1100,
    overTheCounter: false,
  },
  {
    id: 'sv-pfm',
    name: { en: 'PFM crown', he: 'כתר חרסינה על מתכת' },
    price: 650,
    overTheCounter: false,
  },
  {
    id: 'sv-implant-crown',
    name: { en: 'Implant crown', he: 'כתר על שתל' },
    price: 1450,
    overTheCounter: false,
  },
  {
    id: 'sv-arch',
    name: {
      en: 'Full arch implant bridge',
      he: 'גשר על שתלים, קשת מלאה',
    },
    price: 6800,
    overTheCounter: false,
  },
  {
    id: 'sv-partial',
    name: { en: 'Partial denture', he: 'תותבת חלקית' },
    price: 2300,
    overTheCounter: false,
  },
  {
    id: 'sv-full-denture',
    name: { en: 'Full denture', he: 'תותבת שלמה' },
    price: 3200,
    overTheCounter: false,
  },
  {
    id: 'sv-inlay',
    name: { en: 'Inlay / onlay', he: 'אינליי / אונליי' },
    price: 700,
    overTheCounter: false,
  },
  {
    id: 'sv-night-guard',
    name: { en: 'Night guard', he: 'סד לילה' },
    price: 480,
    overTheCounter: true,
  },
  {
    id: 'sv-temp-crown',
    name: { en: 'Temporary crown', he: 'כתר זמני' },
    price: 260,
    overTheCounter: true,
  },
  {
    id: 'sv-model',
    name: { en: 'Model & dies', he: 'מודל ודייז' },
    price: 180,
    overTheCounter: true,
  },
  {
    id: 'sv-repair',
    name: { en: 'Repair & adjustment', he: 'תיקון והתאמה' },
    price: 220,
    overTheCounter: true,
  },
  {
    id: 'sv-rush',
    name: { en: 'Rush surcharge (24h)', he: 'תוספת דחיפות (24 שעות)' },
    price: 300,
    overTheCounter: true,
  },
];

export function serviceById(id: string | undefined): Service | undefined {
  if (!id) return undefined;
  return SERVICE_CATALOG.find((service) => service.id === id);
}

export const round2 = (value: number) => Math.round(value * 100) / 100;

export function lineTotal(line: InvoiceLine): number {
  return round2(line.quantity * line.unitPrice);
}

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
};

export function invoiceTotals(invoice: Invoice, paid = 0): InvoiceTotals {
  const subtotal = round2(invoice.lines.reduce((sum, line) => sum + lineTotal(line), 0));
  const tax = round2(subtotal * (invoice.taxRate / 100));
  const total = round2(subtotal + tax);
  return { subtotal, tax, total, paid, balance: round2(Math.max(0, total - paid)) };
}

export function invoiceStatus(invoice: Invoice, paid: number, now = Date.now()): InvoiceStatus {
  if (!invoice.sentAt) return 'draft';
  const { total } = invoiceTotals(invoice);
  if (paid >= total) return 'paid';
  if (paid > 0) return 'partial';
  return new Date(invoice.dueAt).getTime() < now ? 'overdue' : 'sent';
}

/** Monthly clients settle on the last day of the month after the invoice date. */
export function dueDateFor(terms: PaymentTerm, issued: Date): Date {
  if (terms === 'immediate') return issued;
  return new Date(issued.getFullYear(), issued.getMonth() + 2, 0, 17, 0, 0, 0);
}

export const INVOICE_PREFIX = 'INV-';

/** Next free invoice number, so two devices never collide on a demo id. */
export function nextInvoiceNumber(invoices: readonly Invoice[]): string {
  const highest = invoices.reduce((max, invoice) => {
    const value = Number(invoice.id.replace(INVOICE_PREFIX, ''));
    return Number.isFinite(value) && value > max ? value : max;
  }, 4400);
  return `${INVOICE_PREFIX}${highest + 1}`;
}

/**
 * Deterministic demo ledger. Rows are built from fixed pools with index
 * arithmetic rather than `Math.random`, and every date is relative to launch, so
 * the board always looks lived-in without ever expiring.
 */

type WalkIn = { name: string; email: string; phone: string };

const WALK_INS: WalkIn[] = [
  { name: 'Ronen Shaked', email: 'ronen.shaked@gmail.com', phone: '052-664-2018' },
  { name: 'Ibrahim Odeh', email: 'ibrahim.odeh@gmail.com', phone: '054-233-7719' },
  { name: 'Michal Peretz', email: 'michal.peretz@walla.co.il', phone: '053-901-4482' },
  { name: 'George Sabbagh', email: 'george.sabbagh@gmail.com', phone: '052-770-3164' },
  { name: 'Noa Ben-Ami', email: 'noa.benami@gmail.com', phone: '055-418-6620' },
  { name: 'Ahmad Zoabi', email: 'ahmad.zoabi@hotmail.com', phone: '054-508-9973' },
];

const COUNTER_SERVICES = SERVICE_CATALOG.filter((service) => service.overTheCounter);
const LAB_SERVICES = SERVICE_CATALOG.filter((service) => !service.overTheCounter);

const NOTES: LocalizedText[] = [
  { en: 'Thank you for your business.', he: 'תודה על העבודה המשותפת.' },
  {
    en: 'Includes the rush fee agreed by phone.',
    he: 'כולל תוספת הדחיפות שהוסכמה בטלפון.',
  },
  {
    en: 'Settled with the monthly account statement.',
    he: 'נכלל בריכוז החיובים החודשי.',
  },
];

function daysAgoIso(days: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.max(0, days));
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const SEED_SIZE = 46;

const ledger = (() => {
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];

  for (let index = 0; index < SEED_SIZE; index += 1) {
    const seed = index + 5;
    // Newest first: three days back, then roughly one invoice every five days.
    const age = 3 + index * 5 + (seed % 4);
    const id = `${INVOICE_PREFIX}${4430 + (SEED_SIZE - 1 - index)}`;
    const walkIn = seed % 5 === 2;
    const draft = seed % 17 === 5;

    const counter = COUNTER_SERVICES[seed % COUNTER_SERVICES.length];
    const lines: InvoiceLine[] = walkIn
      ? [
          {
            id: `${id}-l1`,
            description: counter.name,
            serviceId: counter.id,
            quantity: 1 + (seed % 2),
            unitPrice: counter.price,
          },
        ]
      : Array.from({ length: 1 + (seed % 3) }, (_, slot) => {
          const service = LAB_SERVICES[(seed * 7 + slot * 5) % LAB_SERVICES.length];
          return {
            id: `${id}-l${slot + 1}`,
            description: service.name,
            serviceId: service.id,
            quantity: 1 + ((seed + slot) % 3),
            unitPrice: service.price,
          };
        });

    const doctor = DOCTORS[(seed * 3) % DOCTORS.length];
    const walkInCustomer = WALK_INS[seed % WALK_INS.length];
    const terms: PaymentTerm = walkIn ? 'immediate' : 'monthly';
    const issuedAt = daysAgoIso(age, 9 + (seed % 8));
    const invoice: Invoice = {
      id,
      customerKind: walkIn ? 'walkin' : 'doctor',
      doctorId: walkIn ? undefined : doctor.id,
      customerName: walkIn ? walkInCustomer.name : doctor.name,
      clinic: walkIn ? '' : doctor.clinic,
      email: walkIn ? walkInCustomer.email : doctor.email,
      phone: walkIn ? walkInCustomer.phone : doctor.phone,
      lines,
      taxRate: VAT_RATE,
      notes: seed % 4 === 1 ? NOTES[seed % NOTES.length] : '',
      terms,
      issuedAt,
      dueAt: dueDateFor(terms, new Date(issuedAt)).toISOString(),
      sentAt: draft ? null : issuedAt,
      // A walk-in has no account to receive it in, so the counter always emails.
      sentVia: draft ? null : walkIn || seed % 3 === 0 ? 'email' : 'app',
    };

    invoices.push(invoice);

    // How much of the invoice came back, by age. One old account is left open on
    // purpose so the overdue column is never empty.
    const settled = draft
      ? 0
      : walkIn
        ? 1
        : age > 75
          ? seed % 13 === 4
            ? 0
            : 1
          : age > 40
            ? seed % 7 === 3
              ? 0.4
              : 1
            : age > 20
              ? [1, 0.5, 0][seed % 3]
              : 0;

    if (settled > 0) {
      const { total } = invoiceTotals(invoice);
      const receivedAge = walkIn ? age : Math.max(0, age - (4 + (seed % 10)));
      payments.push({
        id: `pay-${id}`,
        invoiceId: id,
        amount: round2(total * settled),
        method: PAYMENT_METHODS[seed % PAYMENT_METHODS.length],
        receivedAt: daysAgoIso(receivedAge, 12 + (seed % 5)),
        reference: `${1000 + ((seed * 137) % 8000)}`,
      });
    }
  }

  return { invoices, payments };
})();

export const SEED_INVOICES: Invoice[] = ledger.invoices;
export const SEED_PAYMENTS: Payment[] = ledger.payments;
