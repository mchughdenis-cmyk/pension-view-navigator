// IHT Illustration PDF generator — guide only, not advice.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatGBP } from "./pensionCalculations";

export interface IHTAsset {
  label: string;
  category: string;
  value: number;
}

export interface IHTIllustrationInput {
  clientName?: string;
  clientRef?: string;
  assets: IHTAsset[];
  marriedSpouse: boolean;
  transferableNRB: number; // %
  passesToDescendants: boolean;
  charityPctOfEstate: number;
  sippToSpouse: boolean;
  totals: {
    grossEstate: number;
    sippTotal: number;
    estatePre: number;
    estatePost: number;
    baseNRB: number;
    pre: { charge: number; rnrb: number; allowances: number; taxable: number; rate: number; iht: number };
    post: { charge: number; rnrb: number; allowances: number; taxable: number; rate: number; iht: number };
    delta: number;
  };
}

const NRB = 325_000;
const RNRB = 175_000;

export function generateIHTIllustrationPDF(input: IHTIllustrationInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFillColor(15, 27, 61);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("Inheritance Tax Illustration", margin, 30);
  doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text("Pension Navigator by Airgead — Guide only, not financial advice", margin, 48);
  doc.text(new Date().toLocaleDateString("en-GB"), pageW - margin, 30, { align: "right" });

  y = 90;
  doc.setTextColor(0, 0, 0);

  // Client block
  doc.setFontSize(10).setFont("helvetica", "bold");
  doc.text("Prepared for", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(input.clientName || "Sample Client", margin + 80, y);
  if (input.clientRef) {
    doc.setFont("helvetica", "bold").text("Reference", margin + 280, y);
    doc.setFont("helvetica", "normal").text(input.clientRef, margin + 350, y);
  }
  y += 20;

  // Summary headline
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, pageW - margin * 2, 70, "F");
  doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(80, 80, 80);
  const col = (pageW - margin * 2) / 3;
  doc.text("GROSS ESTATE", margin + 10, y + 18);
  doc.text("IHT TODAY (PRE-2027)", margin + col + 10, y + 18);
  doc.text("IHT FROM 6 APR 2027", margin + col * 2 + 10, y + 18);
  doc.setFontSize(14).setTextColor(0, 0, 0);
  doc.text(formatGBP(input.totals.grossEstate), margin + 10, y + 42);
  doc.text(formatGBP(input.totals.pre.iht), margin + col + 10, y + 42);
  doc.setTextColor(input.totals.delta > 0 ? 200 : 0, input.totals.delta > 0 ? 30 : 0, 30);
  doc.text(formatGBP(input.totals.post.iht), margin + col * 2 + 10, y + 42);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8).setFont("helvetica", "normal");
  if (input.totals.delta > 0) {
    doc.text(`+${formatGBP(input.totals.delta)} additional IHT post-reform`, margin + col * 2 + 10, y + 58);
  }
  y += 90;

  // Inputs — assumptions
  doc.setFontSize(11).setFont("helvetica", "bold").text("Assumptions used", margin, y);
  y += 6;
  autoTable(doc, {
    startY: y + 4,
    head: [["Assumption", "Value"]],
    body: [
      ["Married / civil partnership", input.marriedSpouse ? "Yes" : "No"],
      ["SIPP passes to spouse on first death", input.sippToSpouse ? "Yes (spouse exemption applied)" : "No"],
      ["Transferable NRB from late spouse", `${input.transferableNRB}%`],
      ["Effective combined NRB", formatGBP(input.totals.baseNRB)],
      ["Home passes to direct descendants", input.passesToDescendants ? `Yes (RNRB up to ${formatGBP(RNRB)})` : "No"],
      ["Charitable legacy (% chargeable estate)", `${input.charityPctOfEstate}%`],
      ["Nil-Rate Band (statutory)", formatGBP(NRB)],
      ["Residence Nil-Rate Band (statutory)", formatGBP(RNRB)],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // Asset register
  doc.setFontSize(11).setFont("helvetica", "bold").text("Asset register", margin, y);
  autoTable(doc, {
    startY: y + 8,
    head: [["Asset", "Category", "Value"]],
    body: [
      ...input.assets.map((a) => [a.label, a.category, formatGBP(a.value)]),
      ["", "Total", formatGBP(input.assets.reduce((s, a) => s + a.value, 0))],
    ],
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  if (y > 680) { doc.addPage(); y = margin; }

  // Breakdown comparison
  doc.setFontSize(11).setFont("helvetica", "bold").text("IHT calculation: pre vs post 6 April 2027", margin, y);
  const row = (k: string, pre: string, post: string) => [k, pre, post];
  autoTable(doc, {
    startY: y + 8,
    head: [["", "Pre-6 Apr 2027 (pension excluded)", "From 6 Apr 2027 (pension included)"]],
    body: [
      row("Estate value", formatGBP(input.totals.estatePre), formatGBP(input.totals.estatePost)),
      row("Chargeable (after BR)", formatGBP(input.totals.pre.charge), formatGBP(input.totals.post.charge)),
      row("NRB + RNRB allowances", `- ${formatGBP(input.totals.pre.allowances)}`, `- ${formatGBP(input.totals.post.allowances)}`),
      row("Taxable estate", formatGBP(input.totals.pre.taxable), formatGBP(input.totals.post.taxable)),
      row("IHT rate", `${(input.totals.pre.rate * 100).toFixed(0)}%`, `${(input.totals.post.rate * 100).toFixed(0)}%`),
      row("IHT due", formatGBP(input.totals.pre.iht), formatGBP(input.totals.post.iht)),
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 27, 61], textColor: 255 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  if (y > 620) { doc.addPage(); y = margin; }

  // Notes & caveats
  doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(0, 0, 0);
  doc.text("Important notes", margin, y);
  y += 14;
  doc.setFontSize(9).setFont("helvetica", "normal");
  const notes = [
    "From 6 April 2027, most unused pension funds and death benefits will fall within the deceased's estate for Inheritance Tax (HM Treasury, October 2024 reform).",
    "Spouse exemption remains: pensions and other assets passing to a surviving spouse or civil partner remain IHT-free at first death.",
    "Residence Nil-Rate Band tapers by £1 for every £2 of estate above £2,000,000.",
    "A charitable legacy of 10% or more of the net chargeable estate reduces the IHT rate from 40% to 36%.",
    "Business Relief (BR) and Agricultural Property Relief (APR) reforms from April 2026 cap combined 100% relief at £1m; the excess attracts 50% relief.",
    "Beneficiaries of taxable pensions inherited after age 75 pay marginal income tax on drawdowns — this is in addition to any IHT charge.",
  ];
  notes.forEach((n) => {
    const lines = doc.splitTextToSize("• " + n, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 11 + 2;
  });

  y += 8;
  doc.setFillColor(255, 247, 230);
  doc.setDrawColor(200, 140, 0);
  const caveatLines = doc.splitTextToSize(
    "This illustration is a guide only and is based on the inputs and current understanding of UK tax law as at the date of preparation. It is not personal financial, tax or legal advice and must not be relied upon when making financial decisions. Tax rules, allowances and the planned 2027 pension reform may change. You should obtain regulated advice from a suitably qualified financial adviser and, where appropriate, a solicitor or tax specialist before acting on any of the figures shown.",
    pageW - margin * 2 - 20
  );
  const boxH = caveatLines.length * 11 + 20;
  if (y + boxH > 800) { doc.addPage(); y = margin; }
  doc.rect(margin, y, pageW - margin * 2, boxH, "FD");
  doc.setTextColor(120, 70, 0).setFont("helvetica", "bold").setFontSize(9);
  doc.text("Guide only — not financial advice", margin + 10, y + 14);
  doc.setFont("helvetica", "normal").setTextColor(60, 40, 0);
  doc.text(caveatLines, margin + 10, y + 28);

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setTextColor(120, 120, 120).setFont("helvetica", "normal");
    doc.text(`Pension Navigator by Airgead • IHT Illustration • Page ${i} of ${pages}`, pageW / 2, 825, { align: "center" });
  }

  return doc;
}

export function downloadIHTIllustration(input: IHTIllustrationInput) {
  const doc = generateIHTIllustrationPDF(input);
  const safe = (input.clientName || "client").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`iht-illustration-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
