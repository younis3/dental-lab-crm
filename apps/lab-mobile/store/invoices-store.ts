import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';

import {
  SEED_INVOICES,
  SEED_PAYMENTS,
  VAT_RATE,
  dueDateFor,
  nextInvoiceNumber,
  round2,
  type Invoice,
  type Payment,
  type PaymentTerm,
  type SendChannel,
} from '@/lib/billing-data';
import { createStore } from '@/lib/store';

type BillingState = { invoices: Invoice[]; payments: Payment[] };

const STORAGE_KEY = 'lab-mobile:billing';

const store = createStore<BillingState>({
  invoices: SEED_INVOICES,
  payments: SEED_PAYMENTS,
});

/**
 * Invoices newest first, plus how much has been received against each one. The
 * paid amounts are derived from the payment list on every read, so a balance can
 * never disagree with the receipts behind it.
 */
export function useBilling() {
  const { invoices, payments } = store.use();

  return useMemo(() => {
    const paidByInvoice = new Map<string, number>();
    for (const payment of payments) {
      paidByInvoice.set(
        payment.invoiceId,
        round2((paidByInvoice.get(payment.invoiceId) ?? 0) + payment.amount)
      );
    }

    return {
      invoices: [...invoices].sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      ),
      payments: [...payments].sort(
        (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      ),
      paidByInvoice,
      paidFor: (invoiceId: string) => paidByInvoice.get(invoiceId) ?? 0,
    };
  }, [invoices, payments]);
}

function persist(state: BillingState) {
  void AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ invoices: state.invoices, payments: state.payments })
  );
}

export function invoiceById(id: string | undefined): Invoice | undefined {
  if (!id) return undefined;
  return store.get().invoices.find((invoice) => invoice.id === id);
}

/** Blank invoice with the next free number, ready for the composer. */
export function createInvoiceDraft(terms: PaymentTerm = 'monthly'): Invoice {
  const issuedAt = new Date();
  return {
    id: nextInvoiceNumber(store.get().invoices),
    customerKind: 'doctor',
    customerName: '',
    clinic: '',
    email: '',
    phone: '',
    lines: [],
    taxRate: VAT_RATE,
    notes: '',
    terms,
    issuedAt: issuedAt.toISOString(),
    dueAt: dueDateFor(terms, issuedAt).toISOString(),
    sentAt: null,
    sentVia: null,
  };
}

export function saveInvoice(invoice: Invoice) {
  store.set((prev) => {
    const exists = prev.invoices.some((row) => row.id === invoice.id);
    const invoices = exists
      ? prev.invoices.map((row) => (row.id === invoice.id ? invoice : row))
      : [invoice, ...prev.invoices];
    const next = { ...prev, invoices };
    persist(next);
    return next;
  });
}

/** Stamps the invoice as delivered. Re-sending only updates the channel. */
export function markInvoiceSent(id: string, channel: SendChannel) {
  store.set((prev) => {
    const invoices = prev.invoices.map((row) =>
      row.id === id
        ? { ...row, sentAt: row.sentAt ?? new Date().toISOString(), sentVia: channel }
        : row
    );
    const next = { ...prev, invoices };
    persist(next);
    return next;
  });
}

export function removeInvoice(id: string) {
  store.set((prev) => {
    const next = {
      ...prev,
      invoices: prev.invoices.filter((row) => row.id !== id),
      payments: prev.payments.filter((row) => row.invoiceId !== id),
    };
    persist(next);
    return next;
  });
}

export type PaymentDraft = Omit<Payment, 'id' | 'receivedAt'> & { receivedAt?: string };

export function recordPayment(draft: PaymentDraft) {
  store.set((prev) => {
    const payment: Payment = {
      ...draft,
      id: `pay-${Date.now().toString(36)}`,
      amount: round2(draft.amount),
      receivedAt: draft.receivedAt ?? new Date().toISOString(),
    };
    const next = { ...prev, payments: [payment, ...prev.payments] };
    persist(next);
    return next;
  });
}

export function removePayment(id: string) {
  store.set((prev) => {
    const next = { ...prev, payments: prev.payments.filter((row) => row.id !== id) };
    persist(next);
    return next;
  });
}

export async function hydrateBilling() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Partial<BillingState>;
    // An empty ledger would leave the demo with nothing to show, so the seed
    // stays in place unless the saved copy actually holds invoices.
    if (Array.isArray(parsed.invoices) && parsed.invoices.length > 0) {
      store.set({
        invoices: parsed.invoices,
        payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
