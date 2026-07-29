// UK Pension Calculations — 2026/27 tax year
// Single source of truth for tax, PCLS, UFPLS, AA/MPAA logic

export const TAX_YEAR = '2026/27'

// 2026/27 UK Income Tax (rUK — non-Scottish)
export const PERSONAL_ALLOWANCE = 12_570
export const PA_TAPER_THRESHOLD = 100_000
export const BASIC_RATE_LIMIT = 37_700 // taxed at 20% above PA
export const HIGHER_RATE_LIMIT = 125_140 // total income before 45% kicks in
export const BASIC_RATE = 0.20
export const HIGHER_RATE = 0.40
export const ADDITIONAL_RATE = 0.45

// Pension allowances
export const ANNUAL_ALLOWANCE = 60_000
export const MPAA_ALLOWANCE = 10_000
export const PCLS_PCT = 0.25 // 25% tax-free cash
export const LSA_LIMIT = 268_275 // Lump Sum Allowance (replaces LTA from Apr 2024)
export const NMPA = 55 // Normal Minimum Pension Age

export interface IncomeTaxBreakdown {
  taxableIncome: number
  personalAllowance: number
  basicRateTax: number
  higherRateTax: number
  additionalRateTax: number
  totalTax: number
  netIncome: number
  effectiveRate: number
}

/** Calculate UK income tax for 2026/27 on a given gross taxable income (rUK bands). */
export function calculateIncomeTax(grossTaxable: number, otherIncome: number = 0): IncomeTaxBreakdown {
  const totalIncome = Math.max(0, grossTaxable + otherIncome)

  // Personal allowance taper: reduce by £1 for every £2 above £100k
  let pa = PERSONAL_ALLOWANCE
  if (totalIncome > PA_TAPER_THRESHOLD) {
    pa = Math.max(0, PERSONAL_ALLOWANCE - (totalIncome - PA_TAPER_THRESHOLD) / 2)
  }

  // Apply other income against PA first
  const paUsedByOther = Math.min(otherIncome, pa)
  const paAvailable = pa - paUsedByOther
  const otherInBasic = Math.max(0, otherIncome - pa)

  // Now stack pension on top
  let remaining = grossTaxable
  const inPa = Math.min(remaining, paAvailable)
  remaining -= inPa

  const basicCapacity = Math.max(0, BASIC_RATE_LIMIT - otherInBasic)
  const inBasic = Math.min(remaining, basicCapacity)
  remaining -= inBasic

  const higherCapacity = Math.max(0, HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE - BASIC_RATE_LIMIT) // £87,440
  const higherUsedByOther = Math.max(0, otherInBasic - BASIC_RATE_LIMIT)
  const inHigher = Math.min(remaining, Math.max(0, higherCapacity - higherUsedByOther))
  remaining -= inHigher

  const inAdditional = Math.max(0, remaining)

  const basicRateTax = inBasic * BASIC_RATE
  const higherRateTax = inHigher * HIGHER_RATE
  const additionalRateTax = inAdditional * ADDITIONAL_RATE
  const totalTax = basicRateTax + higherRateTax + additionalRateTax

  return {
    taxableIncome: grossTaxable,
    personalAllowance: paAvailable,
    basicRateTax,
    higherRateTax,
    additionalRateTax,
    totalTax,
    netIncome: grossTaxable - totalTax,
    effectiveRate: grossTaxable > 0 ? totalTax / grossTaxable : 0,
  }
}

export interface PCLSResult {
  potValue: number
  pcls: number
  designatedToDrawdown: number
  maxPcls: number
  withinLSA: boolean
}

/** Calculate PCLS (25% tax-free) and amount designated to drawdown for an FAD crystallisation. */
export function calculatePCLS(potValue: number, requestedPcls?: number, lsaUsed: number = 0): PCLSResult {
  const maxPcls = Math.min(potValue * PCLS_PCT, Math.max(0, LSA_LIMIT - lsaUsed))
  const pcls = requestedPcls != null ? Math.min(Math.max(0, requestedPcls), maxPcls) : maxPcls
  const designatedToDrawdown = Math.max(0, potValue - pcls * 4) // crystallise pcls/0.25 to fund the lump sum
  // Simpler: designate (pcls + residual). When taking 25% of crystallised slice:
  const crystallised = pcls / PCLS_PCT // amount of fund crystallised
  return {
    potValue,
    pcls,
    designatedToDrawdown: Math.max(0, crystallised - pcls),
    maxPcls,
    withinLSA: lsaUsed + pcls <= LSA_LIMIT,
  }
}

export interface UFPLSResult {
  gross: number
  taxFreePortion: number
  taxablePortion: number
  tax: IncomeTaxBreakdown
  netPayment: number
}

/** UFPLS: 25% tax-free, 75% taxed at marginal rate. Triggers MPAA. */
export function calculateUFPLS(gross: number, otherIncome: number = 0): UFPLSResult {
  const taxFreePortion = gross * PCLS_PCT
  const taxablePortion = gross - taxFreePortion
  const tax = calculateIncomeTax(taxablePortion, otherIncome)
  return {
    gross,
    taxFreePortion,
    taxablePortion,
    tax,
    netPayment: taxFreePortion + tax.netIncome,
  }
}

export interface FADResult {
  income: number
  tax: IncomeTaxBreakdown
  netPayment: number
}

/** Flexi-Access Drawdown income from already-crystallised funds — fully taxable as PAYE. */
export function calculateFADIncome(grossIncome: number, otherIncome: number = 0): FADResult {
  const tax = calculateIncomeTax(grossIncome, otherIncome)
  return { income: grossIncome, tax, netPayment: tax.netIncome }
}

export interface AAStatus {
  used: number
  limit: number
  available: number
  mpaaTriggered: boolean
  carryForwardEligible: boolean
}

export function getAnnualAllowanceStatus(used: number, mpaaTriggered: boolean): AAStatus {
  const limit = mpaaTriggered ? MPAA_ALLOWANCE : ANNUAL_ALLOWANCE
  return {
    used,
    limit,
    available: Math.max(0, limit - used),
    mpaaTriggered,
    carryForwardEligible: !mpaaTriggered,
  }
}

/** Project a drawdown pot year-by-year. */
export function projectDrawdown(opts: {
  potValue: number
  annualIncome: number
  growthRate: number
  inflationRate: number
  years: number
  startAge: number
}) {
  const { potValue, annualIncome, growthRate, inflationRate, years, startAge } = opts
  const rows: { age: number; year: number; pot: number; income: number; realIncome: number }[] = []
  let pot = potValue
  for (let y = 0; y <= years; y++) {
    const realIncome = annualIncome / Math.pow(1 + inflationRate, y)
    rows.push({ age: startAge + y, year: y, pot: Math.max(0, Math.round(pot)), income: annualIncome, realIncome: Math.round(realIncome) })
    pot = pot * (1 + growthRate) - annualIncome
    if (pot < 0) pot = 0
  }
  return rows
}

export function formatGBP(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0)
}
