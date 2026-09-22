// Import externally-held holdings for a probate valuation (CSV or XML).
import { ProbateHolding, HoldingType, Ownership } from "./probateValuation";

export interface ImportResult {
  holdings: ProbateHolding[];
  errors: string[];
  warnings: string[];
}

const TYPE_ALIASES: Record<string, HoldingType> = {
  "quoted-share": "quoted-share", share: "quoted-share", shares: "quoted-share", equity: "quoted-share",
  "investment-trust": "quoted-share", it: "quoted-share", etf: "quoted-share",
  "dual-priced-fund": "dual-priced-fund", "unit-trust": "dual-priced-fund", ut: "dual-priced-fund", "dual-priced": "dual-priced-fund",
  "single-priced-fund": "single-priced-fund", oeic: "single-priced-fund", fund: "single-priced-fund", "single-priced": "single-priced-fund",
  "gilt-bond": "gilt-bond", gilt: "gilt-bond", bond: "gilt-bond", "corporate-bond": "gilt-bond",
};

function normType(raw: string | undefined): HoldingType {
  const k = (raw || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  return TYPE_ALIASES[k] ?? "quoted-share";
}

function normOwnership(raw: string | undefined): Ownership {
  const k = (raw || "").trim().toLowerCase();
  return k.startsWith("t") ? "trust" : "estate";
}

function num(raw: any): number | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = Number(String(raw).replace(/[£,\s]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function bool(raw: any): boolean {
  const k = String(raw ?? "").trim().toLowerCase();
  return k === "y" || k === "yes" || k === "true" || k === "1" || k === "xd";
}

const FIELD_MAP: Record<string, string> = {
  name: "name", holding: "name", security: "name", description: "name", investment: "name",
  sedol: "sedol", isin: "sedol", reference: "sedol",
  type: "type", assettype: "type", instrumenttype: "type", securitytype: "type",
  ownership: "ownership", owner: "ownership", heldby: "ownership", wrapper: "ownership",
  units: "units", quantity: "units", shares: "units", holdingunits: "units", nominal: "units",
  low: "low", lowprice: "low", lowestquotation: "low", lowquote: "low", bidquote: "low",
  high: "high", highprice: "high", highestquotation: "high", highquote: "high", offerquote: "high",
  bid: "bid", bidprice: "bid",
  offer: "offer", offerprice: "offer",
  nav: "nav", navprice: "nav", price: "nav", singleprice: "nav",
  exdividend: "exDividend", xd: "exDividend", exdiv: "exDividend",
  dividendperunit: "dividendPerUnit", dividend: "dividendPerUnit", netdividendperunit: "dividendPerUnit",
  accruedincome: "accruedIncome", accrued: "accruedIncome", income: "accruedIncome",
};

const canon = (h: string) => FIELD_MAP[h.trim().toLowerCase().replace(/[^a-z0-9]/gi, "")] ?? "";

function rowToHolding(row: Record<string, any>, index: number, errors: string[]): ProbateHolding | null {
  const name = String(row.name ?? "").trim();
  const units = num(row.units);
  if (!name) { errors.push(`Row ${index}: holding name is missing — row skipped.`); return null; }
  if (units == null) { errors.push(`Row ${index} (${name}): units/quantity missing or not a number — row skipped.`); return null; }
  return {
    id: crypto.randomUUID(),
    name,
    sedol: row.sedol ? String(row.sedol).trim() : undefined,
    type: normType(row.type),
    ownership: normOwnership(row.ownership),
    units,
    low: num(row.low),
    high: num(row.high),
    bid: num(row.bid),
    offer: num(row.offer),
    nav: num(row.nav),
    exDividend: bool(row.exDividend),
    dividendPerUnit: num(row.dividendPerUnit),
    accruedIncome: num(row.accruedIncome),
  };
}

function validate(h: ProbateHolding, warnings: string[]) {
  if (h.ownership === "estate" && (h.type === "quoted-share" || h.type === "gilt-bond")) {
    if (h.low == null || h.high == null) warnings.push(`${h.name}: no low/high quotations supplied — quarter-up cannot be calculated.`);
    else if (h.high < h.low) warnings.push(`${h.name}: highest quotation is below the lowest — please check the prices.`);
  }
  if (h.type === "dual-priced-fund" && h.bid == null) warnings.push(`${h.name}: dual-priced fund with no bid price supplied.`);
  if (h.type === "single-priced-fund" && h.nav == null && h.bid == null) warnings.push(`${h.name}: single-priced fund with no NAV supplied.`);
  if (h.exDividend && !h.dividendPerUnit) warnings.push(`${h.name}: marked ex-dividend but no dividend per unit supplied.`);
}

/** Minimal RFC4180-tolerant CSV split (handles quoted fields and embedded commas). */
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

export function parseHoldingsCSV(text: string): ImportResult {
  const errors: string[] = [], warnings: string[] = [];
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return { holdings: [], errors: ["The file has no data rows."], warnings };

  const headers = splitCSVLine(lines[0]).map(canon);
  if (!headers.includes("name") || !headers.includes("units")) {
    return { holdings: [], errors: ["The file must include at least 'Name' and 'Units' columns."], warnings };
  }

  const holdings: ProbateHolding[] = [];
  lines.slice(1).forEach((line, i) => {
    const cells = splitCSVLine(line);
    const row: Record<string, any> = {};
    headers.forEach((h, j) => { if (h) row[h] = cells[j]; });
    const h = rowToHolding(row, i + 2, errors);
    if (h) { validate(h, warnings); holdings.push(h); }
  });
  return { holdings, errors, warnings };
}

export function parseHoldingsXML(text: string): ImportResult {
  const errors: string[] = [], warnings: string[] = [];
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) return { holdings: [], errors: ["The XML file could not be read — please check it is well-formed."], warnings };

  let nodes = Array.from(doc.querySelectorAll("Holding, holding, Asset, asset, Position, position, Investment, investment"));
  if (nodes.length === 0) {
    const root = doc.documentElement;
    nodes = Array.from(root?.children ?? []);
  }
  if (nodes.length === 0) return { holdings: [], errors: ["No holdings were found in the XML file."], warnings };

  const holdings: ProbateHolding[] = [];
  nodes.forEach((node, i) => {
    const row: Record<string, any> = {};
    Array.from(node.attributes).forEach((a) => { const k = canon(a.name); if (k) row[k] = a.value; });
    Array.from(node.children).forEach((c) => { const k = canon(c.tagName); if (k) row[k] = c.textContent ?? ""; });
    const h = rowToHolding(row, i + 1, errors);
    if (h) { validate(h, warnings); holdings.push(h); }
  });
  return { holdings, errors, warnings };
}

export function parseHoldingsFile(fileName: string, text: string): ImportResult {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".xml")) return parseHoldingsXML(text);
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) return parseHoldingsCSV(text);
  // Sniff content when the extension is unclear.
  return text.trim().startsWith("<") ? parseHoldingsXML(text) : parseHoldingsCSV(text);
}

export const CSV_TEMPLATE = [
  "Name,SEDOL,Type,Ownership,Units,Low,High,Bid,Offer,NAV,ExDividend,DividendPerUnit,AccruedIncome",
  "BP plc,0798059,quoted-share,estate,4200,4.12,4.36,,,,Y,0.068,",
  "Treasury 4.25% 2032,,gilt-bond,estate,25000,0.9712,0.9806,,,,N,,318.40",
  "Invesco Income,,dual-priced-fund,estate,9500,,,2.184,2.301,,N,,",
  "Vanguard LifeStrategy 60% Acc,,single-priced-fund,estate,6400,,,,,2.9147,N,,412.50",
  "Family Trust — Fidelity Global,,single-priced-fund,trust,12000,,,,,3.4021,N,,",
].join("\n");

export const XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<ProbateHoldings>
  <Holding>
    <Name>BP plc</Name>
    <SEDOL>0798059</SEDOL>
    <Type>quoted-share</Type>
    <Ownership>estate</Ownership>
    <Units>4200</Units>
    <Low>4.12</Low>
    <High>4.36</High>
    <ExDividend>Y</ExDividend>
    <DividendPerUnit>0.068</DividendPerUnit>
  </Holding>
  <Holding>
    <Name>Family Trust — Fidelity Global</Name>
    <Type>single-priced-fund</Type>
    <Ownership>trust</Ownership>
    <Units>12000</Units>
    <NAV>3.4021</NAV>
  </Holding>
</ProbateHoldings>`;
