/**
 * UK pensions Annual Allowance calculations (2026/27 basis).
 * Pure functions — no side effects, fully unit-testable.
 */

export const STANDARD_AA = 60_000;
export const MPAA = 10_000;
export const TAPER_THRESHOLD_INCOME = 200_000;
export const TAPER_ADJUSTED_INCOME = 260_000;
export const TAPER_MIN_AA = 10_000;

/**
 * Tapered annual allowance:
 * - Only applies when BOTH threshold income > £200k AND adjusted income > £260k.
 * - AA reduced by £1 for every £2 adjusted income above £260k, floor £10k.
 */
export function taperedAnnualAllowance(thresholdIncome: number, adjustedIncome: number): number {
  if (thresholdIncome <= TAPER_THRESHOLD_INCOME) return STANDARD_AA;
  if (adjustedIncome <= TAPER_ADJUSTED_INCOME) return STANDARD_AA;
  const reduction = Math.floor((adjustedIncome - TAPER_ADJUSTED_INCOME) / 2);
  return Math.max(TAPER_MIN_AA, STANDARD_AA - reduction);
}

/**
 * Carry forward: unused AA from the 3 previous tax years can be used in the current year.
 * Rule: must use current-year AA first, then oldest available carry-forward first.
 * Returns { used, remaining, breakdown } for `contribution` against `currentYearAA` and
 * `priorUnused` = [oldest, middle, most-recent] (up to 3 entries, each >= 0).
 */
export function applyCarryForward(
  contribution: number,
  currentYearAA: number,
  priorUnused: number[],
): { used: number; excess: number; breakdown: { source: string; amount: number }[] } {
  const breakdown: { source: string; amount: number }[] = [];
  let remaining = contribution;

  const takeCurrent = Math.min(remaining, currentYearAA);
  remaining -= takeCurrent;
  if (takeCurrent > 0) breakdown.push({ source: "current", amount: takeCurrent });

  const ordered = priorUnused.slice(0, 3); // caller supplies oldest-first
  ordered.forEach((available, idx) => {
    const take = Math.min(remaining, Math.max(0, available));
    if (take > 0) {
      breakdown.push({ source: `carry_forward_-${ordered.length - idx}yr`, amount: take });
      remaining -= take;
    }
  });

  return { used: contribution - remaining, excess: remaining, breakdown };
}
