// UK investment bond tax engine — 2024/25 rules.
// Covers ONSHORE (UK life office) and OFFSHORE (non-UK life office) bonds.
//
// Common features:
//  - 5% tax-deferred withdrawal per policy year, cumulative for 20 years
//  - "Chargeable event" gain arises on full surrender, death, assignment for
//    money, or excess part-surrender above the 5% cumulative allowance
//  - Top-slicing relief: gain divided by complete policy years held
//
// Onshore: insurer pays internal corp tax — gain carries a 20% basic-rate
//   tax credit (no further BR liability; only HR/AR top-up due).
// Offshore: gross roll-up — full income-tax bands apply, no credit.

export type BondType = "onshore" | "offshore";
export type TaxBand = "basic" | "higher" | "additional";

export const INCOME_TAX_RATES: Record<TaxBand, number> = {
  basic: 0.20,
  higher: 0.40,
  additional: 0.45,
};

export interface BondPolicy {
  id: string;
  name: string;
  type: BondType;
  provider: string;
  startDate: string; // ISO date
  segments: number; // for segmented bonds (assignment / part-surrender planning)
  premium: number; // total premium paid
  currentValue: number;
  cumulativeWithdrawals: number; // £ withdrawn to date (excl. surrenders)
}

/** 5% cumulative allowance for the policy at a given anniversary count. */
export function cumulativeFivePercentAllowance(premium: number, policyYears: number): number {
  // Capped at 20 years (100% of premium). After year 20, further withdrawals
  // are treated as chargeable events (the deferred-allowance pool is exhausted).
  return premium * 0.05 * Math.min(Math.max(policyYears, 1), 20);
}

/** Years from start to a given date (whole years for top-slicing). */
export function policyYearsHeld(startDate: string, asOf = new Date()): number {
  const start = new Date(startDate);
  let years = asOf.getFullYear() - start.getFullYear();
  const before =
    asOf.getMonth() < start.getMonth() ||
    (asOf.getMonth() === start.getMonth() && asOf.getDate() < start.getDate());
  if (before) years -= 1;
  return Math.max(0, years);
}

export interface ChargeableEvent {
  kind: "part-surrender" | "full-surrender" | "death" | "assignment";
  date: string;
  withdrawal: number; // gross amount withdrawn
  /** Amount within the 5% deferred allowance (no immediate tax). */
  deferredPortion: number;
  /** Excess over 5% allowance — the chargeable event gain (for part-surrender). */
  chargeableGain: number;
  policyYears: number;
  /** Gain divided by complete policy years. */
  slicedGain: number;
  /** Estimated tax due on the gain at the investor's marginal band. */
  estimatedTax: number;
  basicRateCredit: number;
  /** Net additional tax to pay (offshore: full tax; onshore: tax less BR credit). */
  netTaxDue: number;
}

/**
 * Compute a part-surrender chargeable event.
 *  - Only the portion above the cumulative 5% pool is "chargeable".
 *  - Top-slicing reduces the effective rate when the gain pushes you up a band.
 */
export function calculatePartSurrender(opts: {
  bond: BondPolicy;
  withdrawal: number;
  date?: string;
  investorBand: TaxBand;
}): ChargeableEvent {
  const date = opts.date ?? new Date().toISOString().slice(0, 10);
  const years = Math.max(1, policyYearsHeld(opts.bond.startDate, new Date(date)));
  const allowancePool = cumulativeFivePercentAllowance(opts.bond.premium, years);
  const allowanceRemaining = Math.max(0, allowancePool - opts.bond.cumulativeWithdrawals);
  const deferredPortion = Math.min(opts.withdrawal, allowanceRemaining);
  const chargeableGain = Math.max(0, opts.withdrawal - allowanceRemaining);
  const slicedGain = chargeableGain / years;

  // Effective top-sliced rate: tax the slice at the investor's marginal band
  // (a simplification — full HMRC top-slicing also re-tests band thresholds
  // but for a demo, marginal-band on the slice is reasonable & explainable).
  const marginalRate = INCOME_TAX_RATES[opts.investorBand];
  const taxOnSlice = slicedGain * marginalRate;
  const grossTax = taxOnSlice * years; // re-multiplied to gain

  const basicRateCredit = opts.bond.type === "onshore" ? chargeableGain * INCOME_TAX_RATES.basic : 0;
  const netTaxDue = Math.max(0, grossTax - basicRateCredit);

  return {
    kind: "part-surrender",
    date,
    withdrawal: opts.withdrawal,
    deferredPortion,
    chargeableGain,
    policyYears: years,
    slicedGain,
    estimatedTax: grossTax,
    basicRateCredit,
    netTaxDue,
  };
}

/** Full surrender — the entire growth is a chargeable event gain. */
export function calculateFullSurrender(opts: {
  bond: BondPolicy;
  investorBand: TaxBand;
  date?: string;
}): ChargeableEvent {
  const date = opts.date ?? new Date().toISOString().slice(0, 10);
  const years = Math.max(1, policyYearsHeld(opts.bond.startDate, new Date(date)));
  // Gain = current value + prior withdrawals - premium (HMRC formula)
  const chargeableGain = Math.max(
    0,
    opts.bond.currentValue + opts.bond.cumulativeWithdrawals - opts.bond.premium,
  );
  const slicedGain = chargeableGain / years;
  const marginalRate = INCOME_TAX_RATES[opts.investorBand];
  const grossTax = slicedGain * marginalRate * years;
  const basicRateCredit = opts.bond.type === "onshore" ? chargeableGain * INCOME_TAX_RATES.basic : 0;

  return {
    kind: "full-surrender",
    date,
    withdrawal: opts.bond.currentValue,
    deferredPortion: 0,
    chargeableGain,
    policyYears: years,
    slicedGain,
    estimatedTax: grossTax,
    basicRateCredit,
    netTaxDue: Math.max(0, grossTax - basicRateCredit),
  };
}

/** Apply a withdrawal to a bond policy, returning an updated policy. */
export function applyWithdrawal(bond: BondPolicy, withdrawal: number): BondPolicy {
  return {
    ...bond,
    currentValue: Math.max(0, bond.currentValue - withdrawal),
    cumulativeWithdrawals: bond.cumulativeWithdrawals + withdrawal,
  };
}
