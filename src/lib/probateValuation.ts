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
