import * as Linking from 'expo-linking';

import { invoiceTotals, lineTotal, type Invoice } from '@/lib/billing-data';
import { formatMoney } from '@/lib/format';
import { LOCALES, interpolate, localized, type Lang, type UiStrings } from '@/lib/i18n';

/**
 * Hands the finished invoice to the device mail app. A `mailto:` link keeps the
 * lab's own address as the sender and leaves a copy in their sent folder, which
 * is what a paper trail needs — no server involved.
 */
export async function openInvoiceMail(
  invoice: Invoice,
  ui: UiStrings,
  lang: Lang
): Promise<boolean> {
  const lines = invoice.lines
    .map(
      (line) =>
        `${line.quantity} × ${localized(line.description, lang)} — ${formatMoney(lineTotal(line))}`
    )
    .join('\n');

  const subject = interpolate(ui.invoiceMailSubject, { id: invoice.id });
  const body = interpolate(ui.invoiceMailBody, {
    name: invoice.customerName,
    id: invoice.id,
    total: formatMoney(invoiceTotals(invoice).total),
    due: new Date(invoice.dueAt).toLocaleDateString(LOCALES[lang], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    lines,
  });

  try {
    await Linking.openURL(
      `mailto:${encodeURIComponent(invoice.email)}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
    return true;
  } catch {
    return false;
  }
}
