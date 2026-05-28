// UK dividend tax — 2024/25 rates.
// Dividend allowance: £500. Rates: 8.75% basic / 33.75% higher / 39.35% additional.

export const DIVIDEND_ALLOWANCE_2024_25 = 500;

export const DIVIDEND_RATES = {
  basic: 0.0875,
  higher: 0.3375,
  additional: 0.3935,
} as const;

export type TaxBand = keyof typeof DIVIDEND_RATES;

export interface DividendTaxResult {
  gross: number;
  allowance: number;
  taxable: number;
  rate: number;
  liability: number;
  band: TaxBand;
}

export function estimateDividendTax(
  grossDividends: number,
  band: TaxBand = "higher",
  allowance: number = DIVIDEND_ALLOWANCE_2024_25,
): DividendTaxResult {
  const taxable = Math.max(0, grossDividends - allowance);
  const rate = DIVIDEND_RATES[band];
  return {
    gross: grossDividends,
    allowance: Math.min(grossDividends, allowance),
    taxable,
    rate,
    liability: taxable * rate,
    band,
  };
}
