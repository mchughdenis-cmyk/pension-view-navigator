/**
 * ISO 20022 pain.001.001.03 (Bacs / FPS Customer Credit Transfer Initiation)
 * Minimal generator suitable for demo/download from the Payments Hub.
 */

export interface BacsPayment {
  id: string;
  amount: number;
  currency?: string | null;
  beneficiary_name?: string | null;
  beneficiary_sort_code?: string | null;
  beneficiary_account?: string | null;
  beneficiary_reference?: string | null;
  requested_date?: string | null;
  payment_method?: string | null;
  purpose?: string | null;
}

export interface BacsOptions {
  debtorName: string;
  debtorSortCode: string;
  debtorAccount: string;
  msgId?: string;
  executionDate?: string; // YYYY-MM-DD
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const money = (n: number) => (Math.round(Number(n || 0) * 100) / 100).toFixed(2);

export function generateBacsPain001Xml(
  payments: BacsPayment[],
  opts: BacsOptions,
): string {
  const msgId = opts.msgId ?? `MSG-${Date.now()}`;
  const creDt = new Date().toISOString();
  const execDt = opts.executionDate ?? new Date().toISOString().slice(0, 10);
  const ccy = payments[0]?.currency ?? "GBP";
  const debtorSort = digits(opts.debtorSortCode);
  const debtorAcc = digits(opts.debtorAccount);

  const ctrlSum = money(payments.reduce((s, p) => s + Number(p.amount || 0), 0));
  const nbTx = payments.length;

  const txs = payments
    .map((p, i) => {
      const sort = digits(p.beneficiary_sort_code);
      const acc = digits(p.beneficiary_account);
      const svcLvl =
        (p.payment_method ?? "").toLowerCase() === "faster_payments" ? "SEPA" : "NURG";
      return `
      <CdtTrfTxInf>
        <PmtId>
          <InstrId>${esc(p.id)}</InstrId>
          <EndToEndId>${esc(p.beneficiary_reference || p.id).slice(0, 35)}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="${esc(p.currency ?? ccy)}">${money(p.amount)}</InstdAmt>
        </Amt>
        <Cdtr><Nm>${esc((p.beneficiary_name ?? "Beneficiary").slice(0, 70))}</Nm></Cdtr>
        <CdtrAcct>
          <Id><Othr><Id>${sort}${acc}</Id></Othr></Id>
        </CdtrAcct>
        <RmtInf><Ustrd>${esc((p.beneficiary_reference ?? p.purpose ?? "").slice(0, 140))}</Ustrd></RmtInf>
      </CdtTrfTxInf>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${esc(msgId)}</MsgId>
      <CreDtTm>${esc(creDt)}</CreDtTm>
      <NbOfTxs>${nbTx}</NbOfTxs>
      <CtrlSum>${ctrlSum}</CtrlSum>
      <InitgPty><Nm>${esc(opts.debtorName.slice(0, 70))}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${esc(msgId)}-1</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${nbTx}</NbOfTxs>
      <CtrlSum>${ctrlSum}</CtrlSum>
      <PmtTpInf><SvcLvl><Cd>NURG</Cd></SvcLvl></PmtTpInf>
      <ReqdExctnDt>${esc(execDt)}</ReqdExctnDt>
      <Dbtr><Nm>${esc(opts.debtorName.slice(0, 70))}</Nm></Dbtr>
      <DbtrAcct>
        <Id><Othr><Id>${debtorSort}${debtorAcc}</Id></Othr></Id>
      </DbtrAcct>
      <DbtrAgt><FinInstnId><Othr><Id>${debtorSort}</Id></Othr></FinInstnId></DbtrAgt>${txs}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

export function downloadBacsXml(payments: BacsPayment[], opts: BacsOptions, filename?: string) {
  const xml = generateBacsPain001Xml(payments, opts);
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `bacs-pain001-${new Date().toISOString().slice(0, 10)}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
