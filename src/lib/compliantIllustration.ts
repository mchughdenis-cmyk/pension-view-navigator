// FCA COBS 13 Annex 2 compliant Key Features Illustration (KFI) generator.
// Produces a PDF showing standardised lower / intermediate / higher growth
// projections, effect of charges (Reduction in Yield), tax assumptions and
// the prescribed risk warnings for a personal pension / drawdown plan.
//
// Standardised projection rates follow FCA PS22/3 / COBS 13 Annex 2 2.1R:
//   Lower: 2% p.a.   Intermediate: 5% p.a.   Higher: 8% p.a.
// All monetary projections are shown in real terms (deflated by 2% p.a.
// CPI assumption, COBS 13 Annex 2 2.3R) so figures reflect today's money.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface IllustrationInput {
  potValue: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  drawdownRate: number;     // % of pot at start of year
  annuityRate: number;      // % of pot at vesting
  annualCharge?: number;    // total annual product + investment charge (RIY input), default 0.75%
  adviserFee?: number;      // ongoing adviser charge %, default 0.50%
  contribution?: number;    // annual regular contribution before retirement
  transferIn?: number;      // one-off transfer-in added to starting pot at year 0
  clientName?: string;
  clientRef?: string;
  productName?: string;
}


const INFLATION = 2;            // CPI assumption (real-terms basis)
const RATES = [2, 5, 8] as const;
const RATE_LABEL = { 2: "Lower (2%)", 5: "Intermediate (5%)", 8: "Higher (8%)" } as const;

const fmtGBP = (n: number) =>
  "£" + Math.round(n).toLocaleString("en-GB");

const realTerms = (nominal: number, years: number) =>
  nominal / Math.pow(1 + INFLATION / 100, years);

interface YearRow {
  age: number;
  year: number;
  potNominal: number;
  potReal: number;
  income: number;        // real-terms drawdown income
}

function projectAccumulation(
  start: number,
  contribution: number,
  years: number,
  grossRate: number,
  totalCharge: number,
) {
  // Net rate after total charges (product + adviser).
  const net = (grossRate - totalCharge) / 100;
  let pot = start;
  for (let y = 0; y < years; y++) {
    pot = pot * (1 + net) + contribution;
  }
  return pot;
}

function projectDrawdown(input: IllustrationInput, grossRate: number, totalCharge: number): YearRow[] {
  const yearsToRet = Math.max(0, input.retirementAge - input.currentAge);
  const drawdownYears = Math.max(1, input.lifeExpectancy - input.retirementAge);
  const charge = totalCharge;
  const startVesting = projectAccumulation(
    input.potValue + (input.transferIn ?? 0),
    input.contribution ?? 0,
    yearsToRet,
    grossRate,
    charge,
  );

  // 25% PCLS taken at vesting; remainder enters drawdown.
  const drawdownPot0 = startVesting * 0.75;
  const rows: YearRow[] = [];
  let pot = drawdownPot0;
  const net = (grossRate - charge) / 100;
  for (let y = 0; y <= drawdownYears; y++) {
    const incomeNominal = pot * (input.drawdownRate / 100);
    const totalYearsFromToday = yearsToRet + y;
    rows.push({
      age: input.retirementAge + y,
      year: y,
      potNominal: pot,
      potReal: realTerms(pot, totalYearsFromToday),
      income: realTerms(incomeNominal, totalYearsFromToday),
    });
    pot = Math.max(0, pot * (1 + net) - incomeNominal);
  }
  return rows;
}

// Reduction in Yield: difference between gross investment return and the net
// return the member actually receives, expressed as % p.a. (COBS 13 Annex 3).
function reductionInYield(
  start: number,
  yearsToRet: number,
  contribution: number,
  grossRate: number,
  totalCharge: number,
): number {
  if (yearsToRet <= 0) return totalCharge;
  const withCharges = projectAccumulation(start, contribution, yearsToRet, grossRate, totalCharge);
  const withoutCharges = projectAccumulation(start, contribution, yearsToRet, grossRate, 0);
  if (withoutCharges <= 0) return 0;
  // Implied annualised reduction.
  const ratio = withCharges / withoutCharges;
  return (1 - Math.pow(ratio, 1 / yearsToRet)) * 100;
}

export function generateCompliantIllustrationPdf(input: IllustrationInput) {
  const totalCharge = (input.annualCharge ?? 0.75) + (input.adviserFee ?? 0.5);
  const yearsToRet = Math.max(0, input.retirementAge - input.currentAge);
  const issueDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = M;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("Key Features Illustration", M, 32);
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text("Pension Navigator by Airgead  ·  Personal Pension & Drawdown", M, 50);
  doc.text(`Issue date: ${issueDate}`, W - M, 32, { align: "right" });
  doc.text("Prepared in accordance with FCA COBS 13 Annex 2", W - M, 50, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y = 90;

  // ── Client / plan summary ─────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4 },
    head: [["Plan & member details", ""]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: [
      ["Member name", input.clientName ?? "—"],
      ["Client reference", input.clientRef ?? "—"],
      ["Product", input.productName ?? "Airgead SIPP"],
      ["Current age / selected retirement age", `${input.currentAge} / ${input.retirementAge}`],
      ["Current fund value", fmtGBP(input.potValue)],
      ["Transfer-in at outset", fmtGBP(input.transferIn ?? 0)],
      ["Starting fund (incl. transfer)", fmtGBP(input.potValue + (input.transferIn ?? 0))],
      ["Regular gross contribution (p.a.)", fmtGBP(input.contribution ?? 0)],
      ["Term to retirement", `${yearsToRet} year(s)`],
    ],
    columnStyles: { 0: { cellWidth: 220, fontStyle: "bold" } },
    margin: { left: M, right: M },
  });

  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Charges & basis ───────────────────────────────────────────────────────
  const riy = reductionInYield(
    input.potValue + (input.transferIn ?? 0),
    yearsToRet,
    input.contribution ?? 0,
    5,
    totalCharge,
  );

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4 },
    head: [["Charges & assumptions", ""]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: [
      ["Product / investment charge", `${(input.annualCharge ?? 0.75).toFixed(2)}% p.a.`],
      ["Ongoing adviser charge", `${(input.adviserFee ?? 0.5).toFixed(2)}% p.a.`],
      ["Total ongoing charge (TER)", `${totalCharge.toFixed(2)}% p.a.`],
      ["Reduction in Yield (RIY) to retirement", `${riy.toFixed(2)}% p.a.`],
      ["Inflation (CPI) assumption", `${INFLATION}% p.a. — figures shown in today's money`],
      ["Standardised projection rates", "2% / 5% / 8% gross p.a. (COBS 13 Annex 2 2.1R)"],
      ["Tax-Free Cash (PCLS)", "25% taken at vesting (max £268,275 LSA, 2024/25)"],
      ["Annuity basis", `Single life, level, no guarantee — ${input.annuityRate.toFixed(2)}% rate`],
      ["Drawdown rate assumed", `${input.drawdownRate}% of fund at start of each year`],
    ],
    columnStyles: { 0: { cellWidth: 260, fontStyle: "bold" } },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Projection at retirement (3 rates) ────────────────────────────────────
  const startPot = input.potValue + (input.transferIn ?? 0);
  const fundAtRet = RATES.map(r => ({
    rate: r,
    grossFund: projectAccumulation(startPot, input.contribution ?? 0, yearsToRet, r, 0),
    netFund: projectAccumulation(startPot, input.contribution ?? 0, yearsToRet, r, totalCharge),
  }));


  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    head: [["Growth rate", "Fund at age " + input.retirementAge + " (no charges)", "Fund at age " + input.retirementAge + " (after charges)", "Effect of charges", "Tax-free cash (25%)", "Residual fund for drawdown / annuity"]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: fundAtRet.map(f => {
      const realNet = realTerms(f.netFund, yearsToRet);
      const effect = f.grossFund - f.netFund;
      return [
        RATE_LABEL[f.rate],
        fmtGBP(realTerms(f.grossFund, yearsToRet)),
        fmtGBP(realNet),
        fmtGBP(realTerms(effect, yearsToRet)),
        fmtGBP(realNet * 0.25),
        fmtGBP(realNet * 0.75),
      ];
    }),
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Income at retirement (annuity vs drawdown) ────────────────────────────
  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    head: [["Growth rate", "Annual annuity income (single life, level)", `Initial drawdown income (${input.drawdownRate}%)`, `Drawdown sustains to age`]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: fundAtRet.map(f => {
      const realResidual = realTerms(f.netFund, yearsToRet) * 0.75;
      const rows = projectDrawdown(input, f.rate, totalCharge);
      const lastFunded = [...rows].reverse().find(r => r.potNominal > 0);
      return [
        RATE_LABEL[f.rate],
        fmtGBP(realResidual * (input.annuityRate / 100)),
        fmtGBP(rows[0]?.income ?? 0),
        lastFunded ? `${lastFunded.age}` : "—",
      ];
    }),
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  if (y > 720) { doc.addPage(); y = M; }

  // ── Year-by-year drawdown schedule (intermediate rate) ───────────────────
  const sched = projectDrawdown(input, 5, totalCharge);
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.text("Drawdown schedule — intermediate (5%) projection, real terms", M, y);
  y += 6;
  autoTable(doc, {
    startY: y + 4,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    head: [["Age", "Year", "Fund (real)", "Income (real)"]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: sched.map(r => [r.age, r.year, fmtGBP(r.potReal), fmtGBP(r.income)]),
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  if (y > 680) { doc.addPage(); y = M; }

  // ── Risk warnings (COBS 13 Annex 2 / COBS 19) ─────────────────────────────
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.text("Important information & risk warnings", M, y);
  y += 14;
  doc.setFont("helvetica", "normal").setFontSize(9);
  const warnings = [
    "These figures are only examples and are not guaranteed — they are not minimum or maximum amounts. What you actually get back will depend on how your investment grows and the tax treatment of the investment.",
    "All projections use the standardised growth rates required by FCA COBS 13 Annex 2 (2%, 5% and 8% per annum). Actual returns may be higher or lower and you could get back less than you paid in.",
    "Figures are shown in today's money. An inflation assumption of 2% per annum has been applied; the real value of your pension may fall if inflation is higher than assumed.",
    "Charges and adviser fees are deducted from your fund and reduce the amount available at retirement. The Reduction in Yield shows the combined effect of all charges over the term to retirement.",
    "Drawdown income is not guaranteed. The fund could run out before life expectancy if investment returns are poor, charges rise, or withdrawals are higher than sustainable. You bear the investment and longevity risk.",
    "Annuity rates shown are illustrative single-life, level, no-guarantee rates and will depend on the rates available at the point of purchase, your health and your personal circumstances.",
    "Taking your tax-free cash and any taxable income may have tax consequences and could trigger the Money Purchase Annual Allowance (MPAA) of £10,000 (2024/25), restricting future pension contributions.",
    "The Lump Sum Allowance (LSA) of £268,275 and the Lump Sum and Death Benefit Allowance (LSDBA) of £1,073,100 apply for the 2024/25 tax year. Lump sums above these limits may be taxed at your marginal rate.",
    "You should consider taking guidance from Pension Wise or regulated financial advice before making decisions about your retirement options. Decisions to purchase an annuity are usually irreversible.",
    "This document is a Key Features Illustration; it is not a personal recommendation. Read it alongside the Key Features Document, Fund Factsheets and Terms & Conditions before deciding.",
  ];
  warnings.forEach(t => {
    const lines = doc.splitTextToSize("• " + t, W - M * 2);
    if (y + lines.length * 11 > 780) { doc.addPage(); y = M; }
    doc.text(lines, M, y);
    y += lines.length * 11 + 3;
  });

  // ── Footer on every page ──────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8).setTextColor(120);
    doc.text(
      "Pension Navigator by Airgead  ·  Authorised and regulated by the Financial Conduct Authority  ·  COBS 13 Annex 2 KFI",
      M,
      doc.internal.pageSize.getHeight() - 18,
    );
    doc.text(`Page ${p} of ${pageCount}`, W - M, doc.internal.pageSize.getHeight() - 18, { align: "right" });
  }

  const safeName = (input.clientName ?? "Member").replace(/[^a-z0-9]+/gi, "-");
  doc.save(`KFI-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateSummaryPdf(params: {
  potValue: number;
  transferIn: number;
  annualContribution: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  drawdownRate: number;
  annualGrowth: number;
  annuityRate: number;
  inflationRate: number;
  clientName?: string;
}) {
  const g = params.annualGrowth / 100;
  const accYears = Math.max(0, params.retirementAge - params.currentAge);
  const ddYears = Math.max(0, params.lifeExpectancy - params.retirementAge);
  const startPot = params.potValue + params.transferIn;

  // Accumulation phase (mirrors component logic — no charges)
  let pot = startPot;
  for (let y = 0; y < accYears; y++) {
    pot = pot * (1 + g) + params.annualContribution;
  }
  const vestingFund = pot;
  const drawdownPot0 = vestingFund * 0.75;
  const annuityIncome = (vestingFund * params.annuityRate) / 100;

  // Drawdown schedule (mirrors component logic)
  let drawdownPot = drawdownPot0;
  const schedule: { age: number; pot: number; income: number }[] = [];
  let totalDrawdownIncome = 0;
  for (let y = 0; y <= ddYears; y++) {
    const income = drawdownPot * (params.drawdownRate / 100);
    totalDrawdownIncome += income;
    schedule.push({ age: params.retirementAge + y, pot: drawdownPot, income });
    drawdownPot = Math.max(0, drawdownPot * (1 + g) - income);
  }
  const initialDrawdownIncome = schedule[0]?.income ?? 0;
  const finalDrawdownPot = schedule[schedule.length - 1]?.pot ?? 0;
  const totalAnnuityIncome = annuityIncome * (ddYears + 1);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = M;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14).setFont("helvetica", "bold");
  doc.text("Pension Illustration Summary", M, 30);
  doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text("Pension Navigator by Airgead", M, 46);
  doc.setTextColor(0, 0, 0);
  y = 80;

  // Assumptions
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4 },
    head: [["Assumptions", ""]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: [
      ["Member name", params.clientName ?? "—"],
      ["Current age / selected retirement age", `${params.currentAge} / ${params.retirementAge}`],
      ["Life expectancy", `${params.lifeExpectancy}`],
      ["Starting fund (incl. transfer)", fmtGBP(startPot)],
      ["Annual contribution", fmtGBP(params.annualContribution)],
      ["Annual growth rate", `${params.annualGrowth}%`],
      ["Drawdown rate", `${params.drawdownRate}%`],
      ["Annuity rate", `${params.annuityRate}%`],
      ["Inflation assumption", `${params.inflationRate}%`],
    ],
    columnStyles: { 0: { cellWidth: 220, fontStyle: "bold" } },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // Comparison table
  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    head: [["", "Flexible Drawdown", "Annuity"]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: [
      ["Initial annual income", fmtGBP(initialDrawdownIncome), fmtGBP(annuityIncome)],
      ["Total lifetime income", fmtGBP(totalDrawdownIncome), fmtGBP(totalAnnuityIncome)],
      ["Remaining pot at end", fmtGBP(finalDrawdownPot), "£0"],
      ["Winner", totalDrawdownIncome > totalAnnuityIncome ? "Drawdown" : "Annuity", ""],
    ],
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // Year-by-year schedule
  if (y > 500) { doc.addPage(); y = M; }
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.text("Year-by-year drawdown schedule", M, y);
  y += 6;
  autoTable(doc, {
    startY: y + 4,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    head: [["Age", "Fund", "Income"]],
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    body: schedule.map(r => [r.age, fmtGBP(r.pot), fmtGBP(r.income)]),
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // Important notes
  if (y > 650) { doc.addPage(); y = M; }
  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.text("Important notes", M, y);
  y += 12;
  doc.setFont("helvetica", "normal").setFontSize(8);
  const notes = [
    "These figures are examples only and are not guaranteed.",
    "All projections use the growth rate selected by the user; actual returns may differ.",
    "Drawdown income is not guaranteed and the fund could run out before life expectancy.",
    "Annuity rates are illustrative and will depend on rates available at purchase.",
    "Tax treatment depends on individual circumstances and may change in future.",
    "You should seek regulated financial advice before making decisions.",
  ];
  notes.forEach(t => {
    const lines = doc.splitTextToSize("• " + t, W - M * 2);
    if (y + lines.length * 10 > 780) { doc.addPage(); y = M; }
    doc.text(lines, M, y);
    y += lines.length * 10 + 2;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8).setTextColor(120);
    doc.text("Pension Navigator by Airgead · FCA COBS 13 compliant", M, doc.internal.pageSize.getHeight() - 18);
    doc.text(`Page ${p} of ${pageCount}`, W - M, doc.internal.pageSize.getHeight() - 18, { align: "right" });
  }

  const safeName = (params.clientName ?? "Member").replace(/[^a-z0-9]+/gi, "-");
  doc.save(`Illustration-Summary-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
