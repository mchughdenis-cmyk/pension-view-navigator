// SMPI (Statutory Money Purchase Illustration) engine
// FRC AS TM1 v5.0 (effective 1 Oct 2023) — standardised assumptions used
// for UK money purchase pension illustrations issued annually to members.
//
// Key TM1 v5.0 rules implemented here:
//  - Single nominal accumulation rate per fund, derived from a 5-year
//    volatility-banded asset class assumption (set on each fund in
//    fundUniverse.ts as `standardGrowthRate`).
//  - Inflation assumption: 2.5% per annum.
//  - Projection to selected retirement age, then annuitised using a
//    standardised annuity rate (single life, level, no guarantee) at
//    age 65 as the canonical example — annuity rate scaled by age.
//  - All figures shown in today's money (real terms) by deflating
//    the nominal projection by the inflation assumption.

import { FUND_UNIVERSE, type Fund } from "@/data/fundUniverse";

export const SMPI_INFLATION = 0.025;      // 2.5% — TM1 v5.0
export const SMPI_ANNUITY_RATE_65 = 0.055; // ~£5.50 income per £100 fund at 65, level, single life
export const SMPI_REGULAR_REVIEW = "FRC AS TM1 v5.0";

export interface SmpiInput {
  memberRef: string;
  memberName: string;
  age: number;
  retirementAge: number;
  potValue: number;
  annualContribution: number;       // gross, member + employer
  fundIsin?: string;                 // pick growth from fund universe
  growthRateOverride?: number;       // optional override (decimal)
}

export interface SmpiResult {
  input: SmpiInput;
  yearsToRetirement: number;
  growthRate: number;
  fundName: string;
  nominalFundAtRetirement: number;
  realFundAtRetirement: number;
  realAnnualIncome: number;          // today's money
  tm1Version: string;
  generatedAt: string;
}

/** Annuity rate scaled by retirement age (rough TM1-style adjustment). */
function annuityRateAt(age: number): number {
  // Approx ±0.0015 per year either side of 65, clamped sensibly.
  const adj = (age - 65) * 0.0015;
  return Math.max(0.035, Math.min(0.075, SMPI_ANNUITY_RATE_65 + adj));
}

export function runSmpi(input: SmpiInput): SmpiResult {
  const fund: Fund | undefined = input.fundIsin
    ? FUND_UNIVERSE.find((f) => f.isin === input.fundIsin)
    : undefined;
  const growth = input.growthRateOverride ?? fund?.standardGrowthRate ?? 0.04;
  const years = Math.max(0, input.retirementAge - input.age);

  // FV of pot + annuity of annual contributions, paid in arrears.
  const pv = input.potValue;
  const c = input.annualContribution;
  const fvPot = pv * Math.pow(1 + growth, years);
  const fvContribs = growth === 0
    ? c * years
    : c * ((Math.pow(1 + growth, years) - 1) / growth);
  const nominal = fvPot + fvContribs;
  const real = nominal / Math.pow(1 + SMPI_INFLATION, years);
  const annuity = annuityRateAt(input.retirementAge);

  return {
    input,
    yearsToRetirement: years,
    growthRate: growth,
    fundName: fund?.name ?? "Default (mixed)",
    nominalFundAtRetirement: Math.round(nominal),
    realFundAtRetirement: Math.round(real),
    realAnnualIncome: Math.round(real * annuity),
    tm1Version: SMPI_REGULAR_REVIEW,
    generatedAt: new Date().toISOString(),
  };
}
