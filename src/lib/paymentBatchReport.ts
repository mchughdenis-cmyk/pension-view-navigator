/**
 * IMAGO-style PaymentBatchReport XML generator.
 * Produces the flat <PaymentBatchReports> structure used by the bank/provider
 * alongside the ISO 20022 pain.001 Bacs file.
 */

export interface PaymentBatchReportRow {
  id: string;
  amount: number;
  policy_reference?: string | null;
  member_name?: string | null;
  transaction_type?: string | null;
  transaction_code?: string | null;
  date?: string | null; // YYYY-MM-DD
  transaction_reference?: string | null;
  gross_amount?: number | null;
  tax_amount?: number | null;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: number | null | undefined) =>
  (Math.round(Number(n || 0) * 100) / 100).toFixed(2);

/** Converts YYYY-MM-DD (or ISO) to DD/MM/YYYY as used in the batch report. */
export function toUkDate(value?: string | null): string {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function generatePaymentBatchReportXml(rows: PaymentBatchReportRow[]): string {
  const reports = rows
    .map(
      (r) => `
  <PaymentBatchReport>
    <PolicyReference>${esc(r.policy_reference ?? r.id.slice(0, 8).toUpperCase())}</PolicyReference>
    <MemberName>${esc(r.member_name ?? "")}</MemberName>
    <TransactionType>${esc(r.transaction_type ?? "Payroll : Member Income")}</TransactionType>
    <TransactionCode>${esc(r.transaction_code ?? "Income")}</TransactionCode>
    <Amount>${money(r.amount)}</Amount>
    <Date>${esc(toUkDate(r.date))}</Date>
    <TransactionReference>${esc(r.transaction_reference ?? "")}</TransactionReference>
    <GrossAmount>${money(r.gross_amount ?? r.amount)}</GrossAmount>
    <TaxAmount>${money(r.tax_amount ?? 0)}</TaxAmount>
  </PaymentBatchReport>`,
    )
    .join("");

  return `<?xml version="1.0"?>
<PaymentBatchReports xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${reports}
</PaymentBatchReports>`;
}

/** e.g. IMAGO_UK3202_PaymentBatchReport_29072026104917.xml */
export function paymentBatchReportFilename(prefix = "IMAGO_UK3202"): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${p(d.getDate())}${p(d.getMonth() + 1)}${d.getFullYear()}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `${prefix}_PaymentBatchReport_${stamp}.xml`;
}
