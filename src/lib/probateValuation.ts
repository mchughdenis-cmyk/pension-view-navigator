// Probate (date-of-death) valuation engine — IHT400 / IHT411 / IHT412 methodology.
// Guide only, not advice.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatGBP } from "./pensionCalculations";

export type HoldingType =
  | "quoted-share" // listed equity / investment trust — quarter-up vs mid-market
  | "dual-priced-fund" // unit trust with bid/offer spread
  | "single-priced-fund" // OEIC / single-priced fund — NAV
  | "gilt-bond";

export type Ownership = "estate" | "trust";

export interface ProbateHolding {
  id: string;
  name: string;
  sedol?: string;
  type: HoldingType;
  ownership: Ownership;
  units: number;
  /** Quoted shares: lowest & highest closing quotations on the valuation date */
  low?: number;
  high?: number;
  /** Fund pricing (pence or £ — must be consistent with units) */
  bid?: number;
  offer?: number;
  nav?: number;
  /** Marked ex-dividend at the date of death */
  exDividend?: boolean;
  /** Net dividend/interest per unit due but unpaid (added when xd) */
  dividendPerUnit?: number;
  /** Accrued income on accumulation units (total £) */
  accruedIncome?: number;
  /** Where the holding is administered — platform records or an external provider */
  source?: "platform" | "external";
  /** Provider / custodian name for externally-held assets */
  provider?: string;
}

export interface HoldingValuation {
  holding: ProbateHolding;
  quarterUp: number | null;
  midMarket: number | null;
  /** Price actually applied per unit */
  appliedPrice: number;
  basis: string;
  basisReason: string;
  capital: number;
  dividendDue: number;
  accrued: number;
  total: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Quarter-up: lower quotation + 1/4 of the difference between the two quotations. */
export function quarterUpPrice(low: number, high: number): number {
  return low + (high - low) / 4;
}

/** Mid-market: simple average of the two closing quotations. */
export function midMarketPrice(low: number, high: number): number {
  return (low + high) / 2;
}

export function valueHolding(h: ProbateHolding): HoldingValuation {
  const low = h.low ?? 0;
  const high = h.high ?? 0;
  const hasQuotes = h.low != null && h.high != null && high >= low && high > 0;

  let quarterUp: number | null = null;
  let midMarket: number | null = null;
  let appliedPrice = 0;
  let basis = "";
  let basisReason = "";

  if (h.ownership === "trust") {
    // Trust holdings are valued on the bid (realisation) basis; single-priced funds use NAV.
    if (h.type === "single-priced-fund") {
      appliedPrice = h.nav ?? h.bid ?? 0;
      basis = "NAV (single price)";
      basisReason = "Trust holding in a single-priced fund — net asset value applied.";
    } else {
      appliedPrice = h.bid ?? h.nav ?? (hasQuotes ? low : 0);
      basis = "Bid price";
      basisReason = "Trust holding — valued on the bid (realisation) basis.";
    }
  } else if (h.type === "quoted-share" || h.type === "gilt-bond") {
    if (hasQuotes) {
      quarterUp = quarterUpPrice(low, high);
      midMarket = midMarketPrice(low, high);
      appliedPrice = Math.min(quarterUp, midMarket);
      basis = quarterUp <= midMarket ? "Quarter-up (lower of two)" : "Mid-market (lower of two)";
      basisReason = `Quarter-up ${quarterUp.toFixed(4)} vs mid-market ${midMarket.toFixed(4)} — lower applied per IHT411 practice.`;
    } else {
      appliedPrice = h.nav ?? h.bid ?? 0;
      basisReason = "No closing quotations supplied — fallback price used.";
      basis = "Fallback price";
    }
  } else if (h.type === "dual-priced-fund") {
    appliedPrice = h.bid ?? 0;
    basis = "Bid price";
    basisReason = "Dual-priced unit trust — bid price applied (IHT412).";
  } else {
    appliedPrice = h.nav ?? h.bid ?? 0;
    basis = "NAV (single price)";
    basisReason = "Single-priced OEIC — net asset value applied.";
  }

  const capital = r2(appliedPrice * (h.units || 0));
  const dividendDue = h.exDividend ? r2((h.dividendPerUnit || 0) * (h.units || 0)) : 0;
  const accrued = r2(h.accruedIncome || 0);

  return {
    holding: h,
    quarterUp,
    midMarket,
    appliedPrice,
    basis,
    basisReason,
    capital,
    dividendDue,
    accrued,
    total: r2(capital + dividendDue + accrued),
  };
}

export interface ProbateSummary {
  rows: HoldingValuation[];
  estateCapital: number;
  trustCapital: number;
  income: number;
  grandTotal: number;
  quarterUpTotal: number;
  midMarketTotal: number;
  savingVsMid: number;
}

export function valuePortfolio(holdings: ProbateHolding[]): ProbateSummary {
  const rows = holdings.map(valueHolding);
  const estateCapital = r2(rows.filter((r) => r.holding.ownership === "estate").reduce((s, r) => s + r.capital, 0));
  const trustCapital = r2(rows.filter((r) => r.holding.ownership === "trust").reduce((s, r) => s + r.capital, 0));
  const income = r2(rows.reduce((s, r) => s + r.dividendDue + r.accrued, 0));
  const quarterUpTotal = r2(
    rows.reduce((s, r) => s + (r.quarterUp != null ? r.quarterUp * r.holding.units : r.capital), 0)
  );
  const midMarketTotal = r2(
    rows.reduce((s, r) => s + (r.midMarket != null ? r.midMarket * r.holding.units : r.capital), 0)
  );
  return {
    rows,
    estateCapital,
    trustCapital,
    income,
    grandTotal: r2(estateCapital + trustCapital + income),
    quarterUpTotal,
    midMarketTotal,
    savingVsMid: r2(midMarketTotal - quarterUpTotal),
  };
}

export interface ProbateReportInput {
  deceasedName: string;
  dateOfDeath: string;
  reference?: string;
  summary: ProbateSummary;
}

export function generateProbateValuationPDF(input: ProbateReportInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 36;

  doc.setFillColor(15, 27, 61);
  doc.rect(0, 0, pageW, 64, "F");
  doc.setTextColor(255, 255, 255).setFontSize(15).setFont("helvetica", "bold");
  doc.text("Probate Valuation of Investments", margin, 28);
  doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text("Pension Navigator by Airgead — IHT400 / IHT411 / IHT412 basis. Guide only, not advice.", margin, 46);
  doc.text(new Date().toLocaleDateString("en-GB"), pageW - margin, 28, { align: "right" });

  let y = 86;
  doc.setTextColor(0, 0, 0).setFontSize(10).setFont("helvetica", "bold");
  doc.text("Deceased", margin, y);
  doc.setFont("helvetica", "normal").text(input.deceasedName || "—", margin + 70, y);
  doc.setFont("helvetica", "bold").text("Date of death", margin + 300, y);
  doc.setFont("helvetica", "normal").text(input.dateOfDeath || "—", margin + 380, y);
  if (input.reference) {
    doc.setFont("helvetica", "bold").text("Reference", margin + 540, y);
    doc.setFont("helvetica", "normal").text(input.reference, margin + 610, y);
  }
  y += 18;

  const s = input.summary;
  autoTable(doc, {
    startY: y,
    head: [["Holding", "Type / ownership", "Units", "Quarter-up", "Mid-market", "Applied", "Basis", "Capital", "Income", "Total"]],
    body: s.rows.map((r) => [
      r.holding.name + (r.holding.sedol ? ` (${r.holding.sedol})` : ""),
      `${r.holding.type.replace(/-/g, " ")} · ${r.holding.ownership}`,
      r.holding.units.toLocaleString(),
      r.quarterUp != null ? r.quarterUp.toFixed(4) : "n/a",
      r.midMarket != null ? r.midMarket.toFixed(4) : "n/a",
      r.appliedPrice.toFixed(4),
      r.basis,
      formatGBP(r.capital),
      formatGBP(r.dividendDue + r.accrued),
      formatGBP(r.total),
    ]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 7: { halign: "right" }, 8: { halign: "right" }, 9: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 16;

  autoTable(doc, {
    startY: y,
    head: [["Summary", "Value"]],
    body: [
      ["Estate holdings (capital)", formatGBP(s.estateCapital)],
      ["Trust holdings (capital, bid/NAV basis)", formatGBP(s.trustCapital)],
      ["Dividends due and accrued income", formatGBP(s.income)],
      ["Total probate value", formatGBP(s.grandTotal)],
      ["Memo: portfolio on quarter-up throughout", formatGBP(s.quarterUpTotal)],
      ["Memo: portfolio on mid-market throughout", formatGBP(s.midMarketTotal)],
      ["Memo: reduction from applying the lower basis", formatGBP(s.savingVsMid)],
    ],
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: margin, right: margin },
    tableWidth: 420,
  });
  y = (doc as any).lastAutoTable.finalY + 18;

  if (y > 460) { doc.addPage(); y = margin; }
  doc.setFontSize(10).setFont("helvetica", "bold").text("Methodology", margin, y);
  y += 14;
  doc.setFontSize(8.5).setFont("helvetica", "normal");
  [
    "Quoted shares and securities are valued at the lower of the quarter-up price (lower quotation plus one quarter of the difference between the two quotations) and the mid-market price (average of the two quotations), consistent with HMRC form IHT411.",
    "Where a holding was marked ex-dividend at the date of death, the net dividend or interest due but unpaid is added as a separate estate asset.",
    "Dual-priced unit trusts are valued at the bid price; single-priced OEICs are valued at the published net asset value (IHT412).",
    "Holdings held within a trust are valued on the bid/realisation basis, with single-priced funds valued at net asset value.",
    "Accumulation units include accrued income to the date of death.",
    "Prices should be taken from the date of death; where markets were closed, the closing prices of either the last trading day before or the first after may be used — the executors may choose whichever is applied consistently.",
  ].forEach((n) => {
    const lines = doc.splitTextToSize("• " + n, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 10 + 2;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setTextColor(120, 120, 120);
    doc.text(`Pension Navigator by Airgead • Probate valuation • Page ${i} of ${pages}`, pageW / 2, 560, { align: "center" });
  }
  return doc;
}

export function downloadProbateValuation(input: ProbateReportInput) {
  const doc = generateProbateValuationPDF(input);
  const safe = (input.deceasedName || "estate").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`probate-valuation-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportProbateCSV(summary: ProbateSummary): string {
  const head = ["Holding", "SEDOL", "Type", "Ownership", "Units", "Low", "High", "Quarter-up", "Mid-market", "Applied price", "Basis", "Capital", "Dividend due", "Accrued income", "Total"];
  const lines = summary.rows.map((r) => [
    r.holding.name, r.holding.sedol ?? "", r.holding.type, r.holding.ownership, r.holding.units,
    r.holding.low ?? "", r.holding.high ?? "",
    r.quarterUp != null ? r.quarterUp.toFixed(4) : "", r.midMarket != null ? r.midMarket.toFixed(4) : "",
    r.appliedPrice.toFixed(4), r.basis, r.capital, r.dividendDue, r.accrued, r.total,
  ]);
  return [head, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

/* ------------------------------------------------------------------ */
/* Executor report — formal, shareable valuation pack                  */
/* ------------------------------------------------------------------ */

export interface ExecutorReportInput extends ProbateReportInput {
  executorName?: string;
  executorAddress?: string;
  preparedBy?: string;
  firmName?: string;
  contactEmail?: string;
  valuationDateNote?: string;
}

const NAVY: [number, number, number] = [15, 27, 61];

export function generateExecutorReportPDF(input: ExecutorReportInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const s = input.summary;
  const firm = input.firmName || "Airgead";
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  /* ---------- Cover ---------- */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 260, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text(firm.toUpperCase(), margin, 70);
  doc.setFontSize(26).setFont("helvetica", "bold");
  doc.text("Probate Valuation of", margin, 140);
  doc.text("Investments", margin, 170);
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Prepared for the executors of the estate", margin, 200);
  doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text(input.deceasedName || "—", margin, 224);

  let y = 300;
  doc.setTextColor(0, 0, 0);
  const pair = (k: string, v: string) => {
    doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(110, 110, 110);
    doc.text(k.toUpperCase(), margin, y);
    doc.setFontSize(11).setFont("helvetica", "normal").setTextColor(0, 0, 0);
    doc.text(v || "—", margin + 170, y);
    y += 22;
  };
  pair("Date of death", input.dateOfDeath);
  pair("Valuation date", input.dateOfDeath);
  pair("Report date", today);
  if (input.reference) pair("Our reference", input.reference);
  if (input.executorName) pair("Addressed to", input.executorName);
  if (input.preparedBy) pair("Prepared by", input.preparedBy);
  if (input.contactEmail) pair("Contact", input.contactEmail);

  y += 10;
  doc.setDrawColor(220, 220, 220).line(margin, y, pageW - margin, y);
  y += 26;

  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, pageW - margin * 2, 92, "F");
  doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(110, 110, 110);
  doc.text("TOTAL PROBATE VALUE OF INVESTMENTS", margin + 16, y + 26);
  doc.setFontSize(24).setFont("helvetica", "bold").setTextColor(...NAVY);
  doc.text(formatGBP(s.grandTotal), margin + 16, y + 58);
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(90, 90, 90);
  doc.text(
    `Estate holdings ${formatGBP(s.estateCapital)}  •  Trust holdings ${formatGBP(s.trustCapital)}  •  Income due ${formatGBP(s.income)}`,
    margin + 16, y + 78
  );
  y += 118;

  doc.setTextColor(60, 60, 60).setFontSize(9).setFont("helvetica", "normal");
  const intro = doc.splitTextToSize(
    `This report sets out the value of the investments listed below as at the date of death, prepared on the basis required by HM Revenue & Customs for forms IHT400, IHT411 and IHT412. Quoted investments are valued at the lower of the quarter-up and mid-market prices. Holdings recorded outside the ${firm} platform have been valued from the prices supplied to us and are identified in the schedule. This report is provided as a guide for the executors and their advisers; it is not financial, tax or legal advice.`,
    pageW - margin * 2
  );
  doc.text(intro, margin, y);

  /* ---------- Schedules ---------- */
  const scheduleRows = (rows: HoldingValuation[]) =>
    rows.map((r) => [
      r.holding.name + (r.holding.sedol ? `\n${r.holding.sedol}` : "") +
        (r.holding.source === "external" ? `\nExternally held${r.holding.provider ? ` — ${r.holding.provider}` : ""}` : ""),
      r.holding.units.toLocaleString(),
      r.quarterUp != null ? r.quarterUp.toFixed(4) : "—",
      r.midMarket != null ? r.midMarket.toFixed(4) : "—",
      `${r.appliedPrice.toFixed(4)}\n${r.basis}`,
      formatGBP(r.capital),
      formatGBP(r.dividendDue + r.accrued),
      formatGBP(r.total),
    ]);

  const schedule = (title: string, note: string, rows: HoldingValuation[], total: number) => {
    doc.addPage();
    let ty = margin;
    doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(...NAVY);
    doc.text(title, margin, ty);
    ty += 16;
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(90, 90, 90);
    const nl = doc.splitTextToSize(note, pageW - margin * 2);
    doc.text(nl, margin, ty);
    ty += nl.length * 11 + 8;
    autoTable(doc, {
      startY: ty,
      head: [["Holding", "Units", "Quarter-up", "Mid-market", "Price applied", "Capital", "Income", "Total"]],
      body: [...scheduleRows(rows), ["Total", "", "", "", "", "", "", formatGBP(total)]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, valign: "middle" },
      headStyles: { fillColor: NAVY, textColor: 255 },
      columnStyles: {
        1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" },
        4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" }, 7: { halign: "right", fontStyle: "bold" },
      },
      didParseCell: (d: any) => { if (d.row.index === rows.length) d.cell.styles.fontStyle = "bold"; },
      margin: { left: margin, right: margin },
    });
  };

  const estateRows = s.rows.filter((r) => r.holding.ownership === "estate");
  const trustRows = s.rows.filter((r) => r.holding.ownership === "trust");

  if (estateRows.length) {
    schedule(
      "Schedule 1 — Estate holdings",
      "Quoted shares, investment trusts and listed securities are valued at the lower of the quarter-up price and the mid-market price on the date of death (IHT411). Unit trusts are valued at the bid price and single-priced OEICs at net asset value (IHT412).",
      estateRows,
      s.estateCapital + estateRows.reduce((a, r) => a + r.dividendDue + r.accrued, 0)
    );
  }
  if (trustRows.length) {
    schedule(
      "Schedule 2 — Trust holdings",
      "Assets held within trust are valued on the bid (realisation) basis; single-priced funds are valued at the published net asset value. These are shown separately as they may fall outside the free estate.",
      trustRows,
      s.trustCapital + trustRows.reduce((a, r) => a + r.dividendDue + r.accrued, 0)
    );
  }

  const incomeRows = s.rows.filter((r) => r.dividendDue + r.accrued > 0);
  if (incomeRows.length) {
    doc.addPage();
    let iy = margin;
    doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(...NAVY);
    doc.text("Schedule 3 — Dividends due and accrued income", margin, iy);
    iy += 18;
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(90, 90, 90);
    const n = doc.splitTextToSize(
      "Where a holding was marked ex-dividend at the date of death, the net dividend due but unpaid forms a separate asset of the estate. Accumulation units include income accrued to the date of death.",
      pageW - margin * 2
    );
    doc.text(n, margin, iy);
    autoTable(doc, {
      startY: iy + n.length * 11 + 8,
      head: [["Holding", "Ex-dividend", "Dividend due", "Accrued income", "Total income"]],
      body: [
        ...incomeRows.map((r) => [r.holding.name, r.holding.exDividend ? "Yes" : "No", formatGBP(r.dividendDue), formatGBP(r.accrued), formatGBP(r.dividendDue + r.accrued)]),
        ["Total", "", "", "", formatGBP(s.income)],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: NAVY, textColor: 255 },
      columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  /* ---------- Summary, basis and declaration ---------- */
  doc.addPage();
  let sy = margin;
  doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(...NAVY);
  doc.text("Summary for IHT400", margin, sy);
  autoTable(doc, {
    startY: sy + 12,
    head: [["Item", "Value"]],
    body: [
      ["Estate holdings — capital", formatGBP(s.estateCapital)],
      ["Trust holdings — capital", formatGBP(s.trustCapital)],
      ["Dividends due and accrued income", formatGBP(s.income)],
      ["Total probate value of investments", formatGBP(s.grandTotal)],
      ["Memorandum: portfolio valued throughout on quarter-up", formatGBP(s.quarterUpTotal)],
      ["Memorandum: portfolio valued throughout on mid-market", formatGBP(s.midMarketTotal)],
      ["Memorandum: reduction from applying the lower basis per line", formatGBP(s.savingVsMid)],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: NAVY, textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  sy = (doc as any).lastAutoTable.finalY + 26;

  doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(...NAVY);
  doc.text("Basis of valuation", margin, sy);
  sy += 16;
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(50, 50, 50);
  [
    "Quoted shares and securities: the lower of (a) the quarter-up price — the lowest quotation plus one quarter of the difference between the lowest and highest quotations on the date of death — and (b) the mid-market price, being the average of the two quotations.",
    "Dual-priced unit trusts: the bid price published for the date of death. Single-priced OEICs: the published net asset value.",
    "Trust holdings: the bid (realisation) basis, with single-priced funds at net asset value.",
    "Ex-dividend holdings: the net dividend or interest due but unpaid is added as a separate asset of the estate.",
    "Where markets were closed on the date of death, the closing prices of the last trading day before or the first trading day after may be used, applied consistently throughout.",
    "Externally held assets: valued from prices and holdings supplied by the executors or the relevant provider, and marked accordingly in the schedules. These figures have not been independently verified.",
  ].forEach((t) => {
    const lines = doc.splitTextToSize("• " + t, pageW - margin * 2);
    if (sy + lines.length * 11 > pageH - 150) { doc.addPage(); sy = margin; }
    doc.text(lines, margin, sy);
    sy += lines.length * 11 + 4;
  });

  sy += 14;
  if (sy > pageH - 190) { doc.addPage(); sy = margin; }
  doc.setFillColor(255, 247, 230).setDrawColor(200, 140, 0);
  const caveat = doc.splitTextToSize(
    "This valuation is provided as a guide to assist the executors and their professional advisers in completing form IHT400 and obtaining the grant of representation. It is not financial, tax or legal advice and should be confirmed with the relevant registrars, fund managers or a probate specialist before submission to HM Revenue & Customs. Tax rules and published prices may be subject to correction.",
    pageW - margin * 2 - 20
  );
  const boxH = caveat.length * 11 + 34;
  doc.rect(margin, sy, pageW - margin * 2, boxH, "FD");
  doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(120, 70, 0);
  doc.text("Important — guide only, not advice", margin + 10, sy + 16);
  doc.setFont("helvetica", "normal").setTextColor(60, 40, 0);
  doc.text(caveat, margin + 10, sy + 30);
  sy += boxH + 30;

  if (sy > pageH - 120) { doc.addPage(); sy = margin; }
  doc.setTextColor(0, 0, 0).setFontSize(10).setFont("helvetica", "bold");
  doc.text("Prepared by", margin, sy);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(input.preparedBy || firm, margin, sy + 16);
  if (input.contactEmail) doc.text(input.contactEmail, margin, sy + 30);
  doc.setDrawColor(150, 150, 150);
  doc.line(margin + 300, sy + 34, pageW - margin, sy + 34);
  doc.setFontSize(8).setTextColor(120, 120, 120);
  doc.text("Signature / date", margin + 300, sy + 46);

  /* ---------- Footers ---------- */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    if (i === 1) continue;
    doc.setFontSize(8).setTextColor(130, 130, 130).setFont("helvetica", "normal");
    doc.text(`${firm} • Probate valuation • ${input.deceasedName || ""}`, margin, pageH - 28);
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 28, { align: "right" });
  }
  return doc;
}

export function downloadExecutorReport(input: ExecutorReportInput) {
  const doc = generateExecutorReportPDF(input);
  const safe = (input.deceasedName || "estate").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`executor-probate-report-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
