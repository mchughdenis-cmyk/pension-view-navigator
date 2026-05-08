// LSA / LSDBA tracking — replaces LTA from 6 April 2024
export const LSA_LIMIT = 268_275      // Lump Sum Allowance
export const LSDBA_LIMIT = 1_073_100  // Lump Sum & Death Benefit Allowance

export interface LedgerEntry {
  event_type: string
  event_date: string
  lsa_used: number
  lsdba_used: number
}

export function summariseAllowances(entries: LedgerEntry[]) {
  const lsaUsed = entries.reduce((s, e) => s + Number(e.lsa_used || 0), 0)
  const lsdbaUsed = entries.reduce((s, e) => s + Number(e.lsdba_used || 0), 0)
  return {
    lsaUsed,
    lsdbaUsed,
    lsaRemaining: Math.max(0, LSA_LIMIT - lsaUsed),
    lsdbaRemaining: Math.max(0, LSDBA_LIMIT - lsdbaUsed),
    lsaPctUsed: lsaUsed / LSA_LIMIT,
    lsdbaPctUsed: lsdbaUsed / LSDBA_LIMIT,
  }
}

/** GAD-equivalent simplified lookup — % of fund permitted as max income (legacy capped DD).
 *  Real GAD tables vary by age and gilt yield; this is a demo approximation. */
export function gadMaxAnnual(ageYears: number, fundValue: number, giltYield = 0.04): number {
  const baseRate = 0.04 + (Math.max(0, ageYears - 55) * 0.0015) // ~4% at 55 rising
  const adjusted = baseRate * (1 + (giltYield - 0.04) * 2)
  return Math.round(fundValue * adjusted * 1.5) // 150% cap
}
