// UK CGT engine — share matching rules for 2026/27.
// Order of matching: (1) same-day, (2) bed & breakfast (30 days after),
// (3) s104 pooled holding (average cost).
// CGT annual exempt amount 2026/27: £3,000. Rates: 10% (basic) / 20% (higher).

export interface Lot {
  id: string;
  date: string; // ISO
  units: number;
  pricePerUnit: number; // £
  cost: number; // £ total (units * price + charges)
}

export interface Disposal {
  id: string;
  holdingName: string;
  date: string; // ISO
  units: number;
  proceeds: number; // £ net of charges
  costAllocated: number;
  gain: number; // proceeds - costAllocated
  matchedAgainst: ("same-day" | "30-day" | "s104")[];
}

export interface S104Pool {
  units: number;
  cost: number;
}

export const CGT_ALLOWANCE_2026_27 = 3000;
export const CGT_RATE_BASIC = 0.10;
export const CGT_RATE_HIGHER = 0.20;

/** Apply HMRC matching rules to compute a disposal's allocated cost. */
export function matchDisposal(opts: {
  disposalDate: string;
  disposalUnits: number;
  disposalProceeds: number;
  pool: S104Pool;
  sameDayAcquisitions: Lot[]; // acquired same day
  next30DayAcquisitions: Lot[]; // acquired in 30 days AFTER disposal
}): { costAllocated: number; updatedPool: S104Pool; matched: Disposal["matchedAgainst"] } {
  let remainingUnits = opts.disposalUnits;
  let costAllocated = 0;
  const matched: Disposal["matchedAgainst"] = [];
  const pool = { ...opts.pool };

  // 1. Same day
  for (const lot of opts.sameDayAcquisitions) {
    if (remainingUnits <= 0) break;
    const take = Math.min(lot.units, remainingUnits);
    costAllocated += (lot.cost / lot.units) * take;
    remainingUnits -= take;
    if (!matched.includes("same-day")) matched.push("same-day");
  }

  // 2. 30-day (bed & breakfast)
  for (const lot of opts.next30DayAcquisitions) {
    if (remainingUnits <= 0) break;
    const take = Math.min(lot.units, remainingUnits);
    costAllocated += (lot.cost / lot.units) * take;
    remainingUnits -= take;
    if (!matched.includes("30-day")) matched.push("30-day");
  }

  // 3. s104 pool
  if (remainingUnits > 0 && pool.units > 0) {
    const avg = pool.cost / pool.units;
    const take = Math.min(pool.units, remainingUnits);
    const takeCost = avg * take;
    costAllocated += takeCost;
    pool.units -= take;
    pool.cost -= takeCost;
    remainingUnits -= take;
    matched.push("s104");
  }

  return { costAllocated, updatedPool: pool, matched };
}

/** Estimate CGT liability for a tax year given a list of disposals. */
export function estimateCgt(
  disposals: Disposal[],
  taxBand: "basic" | "higher" = "higher",
  allowance = CGT_ALLOWANCE_2026_27,
): {
  gross: number;
  losses: number;
  netGain: number;
  taxable: number;
  liability: number;
  rate: number;
  allowanceUsed: number;
} {
  let gross = 0;
  let losses = 0;
  for (const d of disposals) {
    if (d.gain >= 0) gross += d.gain;
    else losses += -d.gain;
  }
  const netGain = Math.max(0, gross - losses);
  const allowanceUsed = Math.min(netGain, allowance);
  const taxable = Math.max(0, netGain - allowance);
  const rate = taxBand === "higher" ? CGT_RATE_HIGHER : CGT_RATE_BASIC;
  return {
    gross,
    losses,
    netGain,
    taxable,
    liability: taxable * rate,
    rate,
    allowanceUsed,
  };
}

/** Add an acquisition to a s104 pool. */
export function addToPool(pool: S104Pool, units: number, cost: number): S104Pool {
  return { units: pool.units + units, cost: pool.cost + cost };
}
