import { Directory, File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { invoiceTotals, lineTotal, type Invoice } from '@/lib/billing-data';
import { formatMoney } from '@/lib/format';
import { LOCALES, interpolate, isRtl, localized, type Lang, type UiStrings } from '@/lib/i18n';

const LAB_NAME = 'Nadeem Dental Lab';

/** Minimal HTML escaping so a customer name or note can never break the markup. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function longDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(LOCALES[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildHtml(invoice: Invoice, ui: UiStrings, lang: Lang, paid: number): string {
  const totals = invoiceTotals(invoice, paid);
  const dir = isRtl(lang) ? 'rtl' : 'ltr';
  const notes = localized(invoice.notes, lang);

  const rows = invoice.lines
    .map(
      (line) => `
        <tr>
          <td class="desc">${escape(localized(line.description, lang))}</td>
          <td class="num">${line.quantity}</td>
          <td class="num">${escape(formatMoney(line.unitPrice))}</td>
          <td class="num">${escape(formatMoney(lineTotal(line)))}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
        color: #15171C;
        margin: 0;
        padding: 40px;
      }
      .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
      .brand { font-size: 22px; font-weight: 800; color: #8A6E62; }
      .brand small { display: block; font-size: 12px; font-weight: 500; color: #8D929B; margin-top: 4px; }
      .doc { text-align: ${isRtl(lang) ? 'left' : 'right'}; }
      .doc h1 { font-size: 26px; margin: 0; letter-spacing: -0.5px; }
      .doc .num { color: #5B6069; font-size: 14px; margin-top: 4px; }
      .parties { display: flex; gap: 40px; margin-bottom: 28px; }
      .parties h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8D929B; margin: 0 0 6px; }
      .parties p { margin: 0; font-size: 14px; line-height: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { text-align: ${isRtl(lang) ? 'right' : 'left'}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #8D929B; border-bottom: 2px solid #EEF0F3; padding: 8px 10px; }
      th.num, td.num { text-align: ${isRtl(lang) ? 'left' : 'right'}; direction: ltr; }
      td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #F1F2F4; }
      td.desc { width: 55%; }
      .totals { width: 260px; margin-${isRtl(lang) ? 'right' : 'left'}: auto; }
      .totals .row { display: flex; justify-content: space-between; padding: 6px 10px; font-size: 14px; }
      .totals .row.grand { border-top: 2px solid #EEF0F3; margin-top: 6px; padding-top: 12px; font-size: 18px; font-weight: 800; }
      .totals .amount { direction: ltr; }
      .notes { margin-top: 34px; padding: 16px; background: #F7F5F3; border-radius: 12px; font-size: 13px; color: #5B6069; }
      .notes h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8D929B; margin: 0 0 6px; }
      .foot { margin-top: 40px; text-align: center; font-size: 12px; color: #8D929B; }
    </style>
  </head>
  <body>
    <div class="head">
      <div class="brand">${LAB_NAME}<small>${escape(LAB_NAME)}</small></div>
      <div class="doc">
        <h1>${escape(ui.pdfInvoiceTitle)}</h1>
        <div class="num">${escape(invoice.id)}</div>
      </div>
    </div>

    <div class="parties">
      <div>
        <h2>${escape(ui.pdfBillTo)}</h2>
        <p>${escape(invoice.customerName)}</p>
        ${invoice.clinic ? `<p>${escape(invoice.clinic)}</p>` : ''}
        ${invoice.email ? `<p>${escape(invoice.email)}</p>` : ''}
        ${invoice.phone ? `<p>${escape(invoice.phone)}</p>` : ''}
      </div>
      <div>
        <h2>${escape(ui.pdfIssued)}</h2>
        <p>${escape(longDate(invoice.issuedAt, lang))}</p>
        <h2 style="margin-top:12px">${escape(ui.pdfDue)}</h2>
        <p>${escape(longDate(invoice.dueAt, lang))}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="desc">${escape(ui.pdfColItem)}</th>
          <th class="num">${escape(ui.pdfColQty)}</th>
          <th class="num">${escape(ui.pdfColUnit)}</th>
          <th class="num">${escape(ui.pdfColAmount)}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>${escape(ui.invoiceSubtotal)}</span><span class="amount">${escape(
        formatMoney(totals.subtotal)
      )}</span></div>
      <div class="row"><span>${escape(
        interpolate(ui.invoiceVat, { rate: invoice.taxRate })
      )}</span><span class="amount">${escape(formatMoney(totals.tax))}</span></div>
      <div class="row grand"><span>${escape(ui.invoiceTotal)}</span><span class="amount">${escape(
        formatMoney(totals.total)
      )}</span></div>
    </div>

    ${
      notes
        ? `<div class="notes"><h2>${escape(ui.pdfNotes)}</h2>${escape(notes)}</div>`
        : ''
    }

    <div class="foot">${escape(ui.pdfThanks)}</div>
  </body>
</html>`;
}

/**
 * Renders the invoice to a PDF file and hands it to the OS share sheet. Returns
 * `false` only when the file could not be produced; a cancelled share still
 * counts as success because the PDF was created.
 */
export async function exportInvoicePdf(
  invoice: Invoice,
  ui: UiStrings,
  lang: Lang,
  paid = 0
): Promise<boolean> {
  try {
    const { uri } = await Print.printToFileAsync({ html: buildHtml(invoice, ui, lang, paid) });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: interpolate(ui.billingDetailTitle, { id: invoice.id }),
        UTI: 'com.adobe.pdf',
      });
    }
    return true;
  } catch {
    return false;
  }
}

/** A filesystem-safe file name for the invoice, e.g. `Invoice-INV-001.pdf`. */
function pdfFileName(invoice: Invoice): string {
  const safeId = invoice.id.replace(/[^\w.-]+/g, '-');
  return `Invoice-${safeId}.pdf`;
}

export type SavePdfResult = 'saved' | 'cancelled' | 'error';

/**
 * Renders the invoice to a PDF and writes it into a folder the user picks on
 * their device (Files on iOS, any Storage Access Framework location such as
 * Downloads on Android). Returns `'cancelled'` when the folder picker is
 * dismissed and `'error'` when the file could not be produced or written.
 */
export async function saveInvoicePdf(
  invoice: Invoice,
  ui: UiStrings,
  lang: Lang,
  paid = 0
): Promise<SavePdfResult> {
  let source: File;
  try {
    const { uri } = await Print.printToFileAsync({ html: buildHtml(invoice, ui, lang, paid) });
    source = new File(uri);
  } catch {
    return 'error';
  }

  let target: Awaited<ReturnType<typeof Directory.pickDirectoryAsync>>;
  try {
    target = await Directory.pickDirectoryAsync();
  } catch {
    // The picker rejects when the user backs out without choosing a folder.
    return 'cancelled';
  }
  if (!target) return 'cancelled';

  try {
    const destination = target.createFile(pdfFileName(invoice), 'application/pdf');
    destination.write(source.bytesSync());
    return 'saved';
  } catch {
    return 'error';
  }
}
