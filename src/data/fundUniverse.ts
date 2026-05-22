// Seed fund universe & cohort benchmarks. Frontend-only seed for the
// projection engine, model portfolios, and Pension Health Score cohort
// comparisons. 40 funds across asset classes with 36-month synthetic
// price history generated deterministically per fund.

export interface Fund {
  isin: string;
  name: string;
  assetClass: "Equity" | "Bond" | "Multi-asset" | "Property" | "Money market" | "Alternative";
  region: "UK" | "US" | "EU" | "Asia" | "Global" | "EM";
  ocf: number; // %
  risk: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  esg: boolean;
  /** Standardised nominal accumulation rate (FRC AS TM1 v5.0 banded by
   * asset class & volatility) used for SMPIs and default projections. */
  standardGrowthRate: number;
}

/** TM1 v5.0 nominal growth band by asset class & risk score (decimal p.a.). */
export function tm1StandardGrowth(assetClass: Fund["assetClass"], risk: number): number {
  if (assetClass === "Money market") return 0.035;
  if (assetClass === "Bond") return risk <= 2 ? 0.04 : 0.045;
  if (assetClass === "Multi-asset") return risk <= 3 ? 0.045 : risk === 4 ? 0.05 : 0.055;
  if (assetClass === "Property") return 0.05;
  if (assetClass === "Alternative") return 0.05;
  return risk >= 7 ? 0.07 : risk === 6 ? 0.065 : 0.06; // Equity
}

const RAW_FUNDS: Omit<Fund, "standardGrowthRate">[] = [
  { isin: "GB00B3X7QG63", name: "Vanguard FTSE UK All Share Index", assetClass: "Equity", region: "UK", ocf: 0.06, risk: 5, esg: false },
  { isin: "GB00B5B71Q71", name: "HSBC FTSE 100 Index", assetClass: "Equity", region: "UK", ocf: 0.07, risk: 5, esg: false },
  { isin: "GB00BD3RZ582", name: "Fidelity Index UK", assetClass: "Equity", region: "UK", ocf: 0.06, risk: 5, esg: false },
  { isin: "GB00B5B74F71", name: "L&G UK Index Trust", assetClass: "Equity", region: "UK", ocf: 0.10, risk: 5, esg: false },
  { isin: "GB00B5B71H80", name: "HSBC American Index", assetClass: "Equity", region: "US", ocf: 0.06, risk: 5, esg: false },
  { isin: "GB00BD3RZ368", name: "Fidelity Index US", assetClass: "Equity", region: "US", ocf: 0.06, risk: 5, esg: false },
  { isin: "GB00B5B71Q22", name: "Vanguard US Equity Index", assetClass: "Equity", region: "US", ocf: 0.10, risk: 5, esg: false },
  { isin: "IE00B3XXRP09", name: "Vanguard S&P 500 UCITS ETF", assetClass: "Equity", region: "US", ocf: 0.07, risk: 5, esg: false },
  { isin: "GB00B5B71L66", name: "HSBC European Index", assetClass: "Equity", region: "EU", ocf: 0.08, risk: 5, esg: false },
  { isin: "GB00B5B74S01", name: "L&G European Index Trust", assetClass: "Equity", region: "EU", ocf: 0.12, risk: 5, esg: false },
  { isin: "GB00B5B74F38", name: "HSBC Pacific Index", assetClass: "Equity", region: "Asia", ocf: 0.18, risk: 6, esg: false },
  { isin: "GB00B84DY642", name: "Fidelity Index Pacific ex Japan", assetClass: "Equity", region: "Asia", ocf: 0.10, risk: 6, esg: false },
  { isin: "GB00B84DY536", name: "Fidelity Index Japan", assetClass: "Equity", region: "Asia", ocf: 0.10, risk: 5, esg: false },
  { isin: "GB00B84DY428", name: "Fidelity Index Emerging Markets", assetClass: "Equity", region: "EM", ocf: 0.20, risk: 6, esg: false },
  { isin: "IE00BKM4GZ66", name: "iShares Core MSCI EM IMI UCITS", assetClass: "Equity", region: "EM", ocf: 0.18, risk: 6, esg: false },
  { isin: "GB00B59G4Q73", name: "Vanguard FTSE Developed World ex-UK", assetClass: "Equity", region: "Global", ocf: 0.14, risk: 5, esg: false },
  { isin: "IE00B4L5Y983", name: "iShares Core MSCI World UCITS", assetClass: "Equity", region: "Global", ocf: 0.20, risk: 5, esg: false },
  { isin: "GB00BMVB5R75", name: "Baillie Gifford Global Discovery", assetClass: "Equity", region: "Global", ocf: 0.78, risk: 7, esg: false },
  { isin: "GB00B7VVL00", name: "Fundsmith Equity", assetClass: "Equity", region: "Global", ocf: 0.94, risk: 5, esg: false },
  { isin: "GB00BYXVGZ48", name: "Lindsell Train Global Equity", assetClass: "Equity", region: "Global", ocf: 0.65, risk: 5, esg: false },
  { isin: "IE00B3F81G20", name: "iShares MSCI World SRI UCITS", assetClass: "Equity", region: "Global", ocf: 0.20, risk: 5, esg: true },
  { isin: "GB00BMYDM358", name: "Royal London Sustainable World", assetClass: "Equity", region: "Global", ocf: 0.78, risk: 5, esg: true },
  { isin: "GB00B3K7XJ02", name: "Liontrust Sustainable Future Global", assetClass: "Equity", region: "Global", ocf: 0.85, risk: 5, esg: true },
  { isin: "GB00B59G4H82", name: "Vanguard UK Gilt Index", assetClass: "Bond", region: "UK", ocf: 0.12, risk: 3, esg: false },
  { isin: "GB00B84DY071", name: "Fidelity Index UK Gilts", assetClass: "Bond", region: "UK", ocf: 0.06, risk: 3, esg: false },
  { isin: "GB00B5B74803", name: "L&G All Stocks Gilt Index", assetClass: "Bond", region: "UK", ocf: 0.13, risk: 3, esg: false },
  { isin: "GB00BPN5P206", name: "Vanguard Global Bond Index", assetClass: "Bond", region: "Global", ocf: 0.15, risk: 3, esg: false },
  { isin: "IE00B3F81409", name: "iShares Global Corp Bond UCITS", assetClass: "Bond", region: "Global", ocf: 0.20, risk: 3, esg: false },
  { isin: "GB00B0M62T89", name: "M&G Corporate Bond", assetClass: "Bond", region: "UK", ocf: 0.66, risk: 3, esg: false },
  { isin: "GB00B5B74691", name: "L&G Short Dated Sterling Corp Bond", assetClass: "Bond", region: "UK", ocf: 0.14, risk: 2, esg: false },
  { isin: "GB00B41XG308", name: "Vanguard LifeStrategy 20% Equity", assetClass: "Multi-asset", region: "Global", ocf: 0.22, risk: 3, esg: false },
  { isin: "GB00B3TYHH97", name: "Vanguard LifeStrategy 40% Equity", assetClass: "Multi-asset", region: "Global", ocf: 0.22, risk: 4, esg: false },
  { isin: "GB00B3ZHN960", name: "Vanguard LifeStrategy 60% Equity", assetClass: "Multi-asset", region: "Global", ocf: 0.22, risk: 4, esg: false },
  { isin: "GB00B4PQW151", name: "Vanguard LifeStrategy 80% Equity", assetClass: "Multi-asset", region: "Global", ocf: 0.22, risk: 5, esg: false },
  { isin: "GB00B41XG191", name: "Vanguard LifeStrategy 100% Equity", assetClass: "Multi-asset", region: "Global", ocf: 0.22, risk: 5, esg: false },
  { isin: "GB00B0CNGN73", name: "Royal London Property", assetClass: "Property", region: "UK", ocf: 1.13, risk: 4, esg: false },
  { isin: "GB00BVG7F061", name: "L&G UK Property", assetClass: "Property", region: "UK", ocf: 0.94, risk: 4, esg: false },
  { isin: "GB00B7T78F32", name: "Royal London Short Term Money Market", assetClass: "Money market", region: "UK", ocf: 0.10, risk: 1, esg: false },
  { isin: "GB00B83DJB22", name: "L&G Cash Trust", assetClass: "Money market", region: "UK", ocf: 0.10, risk: 1, esg: false },
  { isin: "GB00B61RBT12", name: "Ruffer Diversified Return", assetClass: "Alternative", region: "Global", ocf: 1.10, risk: 4, esg: false },
];

export const FUND_UNIVERSE: Fund[] = RAW_FUNDS.map((f) => ({
  ...f,
  standardGrowthRate: tm1StandardGrowth(f.assetClass, f.risk),
}));

// Deterministic synthetic 36-month price history per fund.
// Geometric brownian motion with seeded RNG so the series is stable.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface PricePoint { month: string; price: number; }

export function priceHistoryFor(fund: Fund): PricePoint[] {
  const seed = fund.isin.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = seededRandom(seed);
  const annualReturn = fund.assetClass === "Equity" ? 0.07 : fund.assetClass === "Bond" ? 0.025 : fund.assetClass === "Money market" ? 0.04 : 0.05;
  const annualVol = ({ 1: 0.01, 2: 0.04, 3: 0.07, 4: 0.10, 5: 0.14, 6: 0.18, 7: 0.24 } as Record<number, number>)[fund.risk];
  const dt = 1 / 12;
  let price = 100;
  const out: PricePoint[] = [];
  const start = new Date();
  start.setMonth(start.getMonth() - 36);
  for (let i = 0; i < 36; i++) {
    const z = Math.sqrt(-2 * Math.log(rnd() || 0.0001)) * Math.cos(2 * Math.PI * rnd());
    price = price * Math.exp((annualReturn - 0.5 * annualVol * annualVol) * dt + annualVol * Math.sqrt(dt) * z);
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    out.push({ month: d.toISOString().slice(0, 7), price: Math.round(price * 100) / 100 });
  }
  return out;
}

// Cohort benchmarks by age band (used by Pension Health Score & dashboards).
export interface CohortBenchmark {
  band: string;
  avgPot: number;
  avgContributionPct: number;
  topQuartilePot: number;
}

export const COHORT_BENCHMARKS: CohortBenchmark[] = [
  { band: "20-29", avgPot: 12000, avgContributionPct: 6, topQuartilePot: 28000 },
  { band: "30-39", avgPot: 48000, avgContributionPct: 8, topQuartilePot: 95000 },
  { band: "40-49", avgPot: 122000, avgContributionPct: 10, topQuartilePot: 240000 },
  { band: "50-59", avgPot: 230000, avgContributionPct: 12, topQuartilePot: 460000 },
  { band: "60+", avgPot: 310000, avgContributionPct: 14, topQuartilePot: 620000 },
];

// Demo personas — referenced by PersonaSelector & seed data.
export const SEED_PERSONAS = [
  { id: "early", name: "Early career", age: 26, pot: 14000, salary: 32000, contribPct: 5 },
  { id: "saver", name: "Steady saver", age: 38, pot: 65000, salary: 48000, contribPct: 8 },
  { id: "exec", name: "High-earner exec", age: 47, pot: 285000, salary: 145000, contribPct: 15 },
  { id: "preret", name: "Pre-retiree", age: 58, pot: 410000, salary: 72000, contribPct: 12 },
];
