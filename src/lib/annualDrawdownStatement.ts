// Annual Drawdown Statement — UK regulatory compliant guide
// Aligns with FCA COBS 16A (statements), COBS 19.10 (drawdown reviews),
// COBS 13 Annex 2 (SMPI projections — 2/5/8% nominal, 2% CPI real terms),
// and the statutory Pension Wise / MoneyHelper guidance reminder.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatGBP } from "./pensionCalculations";

export interface DrawdownStatementInput {
  // Client
  clientName: string;
  clientRef: string;
  dateOfBirth?: string;        // ISO
  address?: string;
  niNumber?: string;
  // Plan
  productName?: string;        // e.g. "Airgead SIPP – Flexi-Access Drawdown"
  planNumber?: string;
  adviserName?: string;
  adviserFirm?: string;
  statementPeriodFrom: string; // ISO
  statementPeriodTo: string;   // ISO
  // Valuations
  openingValue: number;
  closingValue: number;
  contributionsIn: number;
  transfersIn: number;
  investmentGrowth: number;     // net of charges
  charges: number;              // total product+adviser charges in period
  // Drawdown activity
  pclsTakenInPeriod: number;
  pclsTakenLifetime: number;
  pclsRemaining: number;        // 25% allowance left
  taxableIncomeGross: number;
  paye: number;
  netIncomePaid: number;
  ufplsTakenInPeriod?: number;
  // Allowances
  lsaUsed: number;              // Lump Sum Allowance used to date
  lsdbaUsed: number;            // Lump Sum & Death Benefit Allowance used to date
  mpaaTriggered: boolean;
  mpaaTriggerDate?: string;
  // Drawdown sustainability (FCA COBS 19.10 review)
  currentAnnualIncome: number;
  reviewAgeYears: number;       // current age
  // Holdings (top-level)
  holdings: { name: string; value: number; allocationPct: number }[];
  // Charges breakdown
  chargeBreakdown?: { label: string; amount: number; pct?: number }[];
  // Optional adviser commentary
  commentary?: string;
}

const NRB_PERSONAL_ALLOWANCE = 12_570;
const LSA = 268_275;
const LSDBA = 1_073_100;
const MPAA = 10_000;
const CPI = 2;
const RATES = [2, 5, 8] as const;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

const realProject = (start: number, contrib: number, years: number, grossRate: number, charge: number) => {
  const net = (grossRate - charge) / 100;
  let v = start;
  for (let i = 0; i < years; i++) v = v * (1 + net) + contrib;
  return v / Math.pow(1 + CPI / 100, years);
};

export function generateAnnualDrawdownStatementPDF(s: DrawdownStatementInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const ensure = (need: number) => {
    if (y + need > pageH - 60) {
      doc.addPage();
      y = margin;
    }
  };
  const h1 = (t: string) => {
    ensure(28);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(15, 27, 61);
    doc.text(t, margin, y);
    y += 16;
    doc.setDrawColor(15, 27, 61);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
  };
  const p = (t: string, size = 9) => {
    doc.setFont("helvetica", "normal").setFontSize(size).setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(t, pageW - margin * 2);
    ensure(lines.length * 11 + 2);
    doc.text(lines, margin, y);
    y += lines.length * (size + 2);
  };

  // ─── Cover header ───────────────────────────────────────────────────────
  doc.setFillColor(15, 27, 61);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold").setFontSize(18);
  doc.text("Annual Drawdown Statement", margin, 38);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text("Pension Navigator by Airgead", margin, 56);
  doc.setFontSize(9);
  doc.text(
    `Statement period: ${fmtDate(s.statementPeriodFrom)} to ${fmtDate(s.statementPeriodTo)}`,
    margin,
    72
  );
  doc.text(`Issued: ${new Date().toLocaleDateString("en-GB")}`, pageW - margin, 38, { align: "right" });
  doc.text(`Plan: ${s.planNumber || "—"}`, pageW - margin, 56, { align: "right" });
  doc.text(`Ref: ${s.clientRef}`, pageW - margin, 72, { align: "right" });

  y = 110;
  doc.setTextColor(0, 0, 0);

  // ─── Client & plan details ──────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      ["Member", s.clientName, "Date of birth", s.dateOfBirth ? fmtDate(s.dateOfBirth) : "—"],
      ["NI number", s.niNumber || "—", "Address", s.address || "—"],
      ["Product", s.productName || "Flexi-access drawdown", "Adviser", s.adviserName || "—"],
    ],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      2: { fontStyle: "bold", cellWidth: 80 },
    },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ─── Headline summary ───────────────────────────────────────────────────
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, pageW - margin * 2, 78, "F");
  const col = (pageW - margin * 2) / 3;
  const tile = (label: string, value: string, i: number) => {
    doc.setFontSize(8).setFont("helvetica", "bold").setTextColor(80, 80, 80);
    doc.text(label.toUpperCase(), margin + col * i + 12, y + 20);
    doc.setFontSize(14).setTextColor(15, 27, 61);
    doc.text(value, margin + col * i + 12, y + 46);
  };
  tile("Opening value", formatGBP(s.openingValue), 0);
  tile("Closing value", formatGBP(s.closingValue), 1);
  tile("Net income paid", formatGBP(s.netIncomePaid), 2);
  doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(80, 80, 80);
  doc.text(
    `Investment growth (net of charges): ${formatGBP(s.investmentGrowth)}   •   Charges in period: ${formatGBP(s.charges)}`,
    margin + 12,
    y + 68
  );
  y += 92;
  doc.setTextColor(0, 0, 0);

  // ─── 1. Plan valuation reconciliation ───────────────────────────────────
  h1("1. Plan valuation");
  autoTable(doc, {
    startY: y,
    head: [["Movement", "Amount"]],
    body: [
      ["Opening value", formatGBP(s.openingValue)],
      ["Contributions received", formatGBP(s.contributionsIn)],
      ["Transfers in", formatGBP(s.transfersIn)],
      ["Investment growth (net of charges)", formatGBP(s.investmentGrowth)],
      ["Charges", `- ${formatGBP(s.charges)}`],
      ["Tax-free cash paid (PCLS)", `- ${formatGBP(s.pclsTakenInPeriod)}`],
      ["Taxable income paid (gross)", `- ${formatGBP(s.taxableIncomeGross)}`],
      [
        { content: "Closing value", styles: { fontStyle: "bold" } },
        { content: formatGBP(s.closingValue), styles: { fontStyle: "bold" } },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ─── 2. Income paid in period (with PAYE) ──────────────────────────────
  h1("2. Income paid in the period");
  autoTable(doc, {
    startY: y,
    head: [["Item", "Amount"]],
    body: [
      ["Tax-free cash (PCLS) paid", formatGBP(s.pclsTakenInPeriod)],
      ["Taxable income drawn (gross)", formatGBP(s.taxableIncomeGross)],
      ["UFPLS taken", formatGBP(s.ufplsTakenInPeriod || 0)],
      ["PAYE deducted", `- ${formatGBP(s.paye)}`],
      [
        { content: "Net amount paid to you", styles: { fontStyle: "bold" } },
        { content: formatGBP(s.netIncomePaid), styles: { fontStyle: "bold" } },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  p(
    "PAYE has been deducted under HMRC instruction using the tax code held on your record at the time of each payment. If you believe the code is incorrect, contact HMRC quoting your NI number; we will apply any revised code from the next payroll date."
  );
  y += 6;

  // ─── 3. Allowance usage ─────────────────────────────────────────────────
  h1("3. Allowance usage (Lump Sum / Death Benefit Allowance)");
  const lsaPct = (s.lsaUsed / LSA) * 100;
  const lsdbaPct = (s.lsdbaUsed / LSDBA) * 100;
  autoTable(doc, {
    startY: y,
    head: [["Allowance", "Limit", "Used to date", "Remaining", "% used"]],
    body: [
      ["Lump Sum Allowance (LSA)", formatGBP(LSA), formatGBP(s.lsaUsed), formatGBP(LSA - s.lsaUsed), `${lsaPct.toFixed(1)}%`],
      [
        "Lump Sum & Death Benefit Allowance (LSDBA)",
        formatGBP(LSDBA),
        formatGBP(s.lsdbaUsed),
        formatGBP(LSDBA - s.lsdbaUsed),
        `${lsdbaPct.toFixed(1)}%`,
      ],
      ["25% tax-free cash remaining on this plan", "—", formatGBP(s.pclsTakenLifetime), formatGBP(s.pclsRemaining), "—"],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  if (s.mpaaTriggered) {
    p(
      `Money Purchase Annual Allowance (MPAA) of ${formatGBP(MPAA)} per tax year applies to you${s.mpaaTriggerDate ? ` (triggered ${fmtDate(s.mpaaTriggerDate)})` : ""}. Money purchase contributions above this amount will incur an annual allowance charge.`
    );
  } else {
    p(`The MPAA of ${formatGBP(MPAA)} per tax year has not been triggered on this plan.`);
  }
  y += 4;

  // ─── 4. Holdings ────────────────────────────────────────────────────────
  h1("4. Holdings at period end");
  autoTable(doc, {
    startY: y,
    head: [["Holding", "Value", "Allocation"]],
    body: [
      ...s.holdings.map((h) => [h.name, formatGBP(h.value), `${h.allocationPct.toFixed(1)}%`]),
      [
        { content: "Total", styles: { fontStyle: "bold" } },
        { content: formatGBP(s.holdings.reduce((a, b) => a + b.value, 0)), styles: { fontStyle: "bold" } },
        { content: "100.0%", styles: { fontStyle: "bold" } },
      ],
    ],
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ─── 5. Charges ─────────────────────────────────────────────────────────
  h1("5. Charges in period (MiFID II / COBS 6.1ZA disclosure)");
  const breakdown =
    s.chargeBreakdown && s.chargeBreakdown.length
      ? s.chargeBreakdown
      : [
          { label: "Platform / product charge", amount: s.charges * 0.45 },
          { label: "Investment / fund OCF", amount: s.charges * 0.35 },
          { label: "Ongoing adviser charge", amount: s.charges * 0.2 },
        ];
  const avgValue = (s.openingValue + s.closingValue) / 2 || 1;
  autoTable(doc, {
    startY: y,
    head: [["Charge", "Amount (£)", "% of average value"]],
    body: [
      ...breakdown.map((b) => [
        b.label,
        formatGBP(b.amount),
        `${((b.amount / avgValue) * 100).toFixed(2)}%`,
      ]),
      [
        { content: "Total charges", styles: { fontStyle: "bold" } },
        { content: formatGBP(s.charges), styles: { fontStyle: "bold" } },
        {
          content: `${((s.charges / avgValue) * 100).toFixed(2)}%`,
          styles: { fontStyle: "bold" },
        },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  p(
    "All charges and costs that have been levied on your plan during the period are shown above, including third-party fund costs and any ongoing adviser charges deducted from the plan."
  );
  y += 4;

  // ─── 6. Sustainability projection (COBS 19.10 review) ──────────────────
  h1("6. Sustainability of your drawdown income");
  const yearsTo90 = Math.max(1, 90 - s.reviewAgeYears);
  const projections = RATES.map((r) => {
    const totalCharge = (s.charges / avgValue) * 100; // % of value
    let v = s.closingValue;
    let lastYear = yearsTo90;
    for (let i = 1; i <= yearsTo90; i++) {
      const net = (r - totalCharge) / 100;
      v = v * (1 + net) - s.currentAnnualIncome;
      if (v <= 0) {
        lastYear = i;
        break;
      }
    }
    const realFundAt10 =
      realProject(s.closingValue, -s.currentAnnualIncome, Math.min(10, yearsTo90), r, totalCharge);
    return {
      rate: r,
      runOutAge: v > 0 ? `> ${90}` : `${s.reviewAgeYears + lastYear}`,
      fund10y: Math.max(0, realFundAt10),
    };
  });
  autoTable(doc, {
    startY: y,
    head: [
      [
        "Gross growth rate (p.a.)",
        "Projected fund in 10 yrs (real)",
        "Age fund could run out at current income",
      ],
    ],
    body: projections.map((pr) => [
      `${pr.rate}% (FCA standardised)`,
      formatGBP(pr.fund10y),
      pr.runOutAge,
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  p(
    `Projections use FCA COBS 13 Annex 2 standardised growth rates (2%, 5% and 8% p.a. gross) deflated by a 2% inflation assumption so figures are shown in today's money. Your current gross annual income from this plan is ${formatGBP(s.currentAnnualIncome)}. These figures are not guaranteed.`
  );
  y += 4;

  if (s.commentary) {
    h1("7. Adviser commentary");
    p(s.commentary);
    y += 4;
  }

  // ─── Risk warnings & Pension Wise (statutory) ───────────────────────────
  h1("Important risk warnings");
  const warnings = [
    "Drawdown is not guaranteed for life. The value of your investments and the income you take can go down as well as up, and you could run out of money in retirement.",
    "Taking high levels of income, poor investment performance or living longer than expected may exhaust your fund. We recommend reviewing your income rate at least annually.",
    "Taxable income drawn is added to your other taxable income for the year and may push you into a higher Income Tax band. Large one-off withdrawals are often taxed on an emergency Month 1 basis until HMRC issues a corrected tax code.",
    "Triggering flexible income (other than tax-free cash only) restricts future pension contributions to the Money Purchase Annual Allowance of £10,000 per tax year.",
    "From 6 April 2027, most unused pension funds and death benefits are expected to fall within your estate for Inheritance Tax purposes.",
    "Charges, inflation and the order of investment returns ('sequence risk') all affect how long your fund will last.",
  ];
  warnings.forEach((w) => p("• " + w));
  y += 4;

  ensure(110);
  doc.setFillColor(232, 242, 254);
  doc.setDrawColor(70, 110, 200);
  const pwLines = doc.splitTextToSize(
    "Pension Wise, a service from MoneyHelper, offers free and impartial government guidance about your pension options. You should consider taking guidance from Pension Wise or regulated financial advice before taking further withdrawals. Book a free appointment at moneyhelper.org.uk/pensionwise or call 0800 138 3944.",
    pageW - margin * 2 - 20
  );
  const boxH = pwLines.length * 11 + 26;
  doc.rect(margin, y, pageW - margin * 2, boxH, "FD");
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(20, 50, 120);
  doc.text("Free and impartial guidance — Pension Wise / MoneyHelper", margin + 10, y + 16);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(20, 40, 90);
  doc.text(pwLines, margin + 10, y + 30);
  y += boxH + 10;

  ensure(90);
  doc.setFillColor(255, 247, 230);
  doc.setDrawColor(200, 140, 0);
  const cavLines = doc.splitTextToSize(
    "This statement is provided for information only and does not constitute personal financial, tax or legal advice. Figures are based on records held at the statement date and standardised regulatory assumptions; they may change. Past performance is not a reliable indicator of future results. You should not make decisions about your pension based solely on this document — please obtain regulated advice from a qualified financial adviser. Airgead Capital Ltd is authorised and regulated by the Financial Conduct Authority.",
    pageW - margin * 2 - 20
  );
  const cavH = cavLines.length * 11 + 26;
  doc.rect(margin, y, pageW - margin * 2, cavH, "FD");
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(120, 70, 0);
  doc.text("Guide only — not financial advice", margin + 10, y + 16);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(60, 40, 0);
  doc.text(cavLines, margin + 10, y + 30);
  y += cavH;

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(120, 120, 120);
    doc.text(
      `Pension Navigator by Airgead • Annual Drawdown Statement • ${s.clientName} • Page ${i} of ${pages}`,
      pageW / 2,
      pageH - 20,
      { align: "center" }
    );
  }

  return doc;
}

export function downloadAnnualDrawdownStatement(s: DrawdownStatementInput) {
  const doc = generateAnnualDrawdownStatementPDF(s);
  const safe = s.clientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`annual-drawdown-statement-${safe}-${s.statementPeriodTo.slice(0, 10)}.pdf`);
}
