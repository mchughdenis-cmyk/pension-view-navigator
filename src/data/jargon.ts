// Plain-English pension jargon definitions (UK 2024/25)
// Used by the <Jargon> component to render dotted-underline tooltips.

export const JARGON: Record<string, string> = {
  SIPP: "A Self-Invested Personal Pension — a UK pension wrapper you control, with wide investment choice and tax relief on contributions.",
  ISA: "Individual Savings Account — tax-free investment wrapper with a £20,000 annual allowance (2024/25).",
  GIA: "General Investment Account — an unwrapped account where gains may be subject to Capital Gains Tax above the £3,000 allowance.",
  "Annual Allowance": "The most you can pay into pensions each tax year with tax relief — £60,000 in 2024/25, tapering down for high earners.",
  "Carry Forward": "Use unused Annual Allowance from up to three previous tax years if you were a member of a registered UK pension scheme.",
  "Tapered Annual Allowance": "For adjusted income over £260,000, the Annual Allowance reduces by £1 for every £2 above the threshold, to a floor of £10,000.",
  "Flexi-Access Drawdown": "Taking variable income directly from your pension while the rest stays invested — flexible but exposed to market risk.",
  PCLS: "Pension Commencement Lump Sum — usually 25% of your pension taken tax-free, capped by your Lump Sum Allowance (£268,275).",
  UFPLS: "Uncrystallised Funds Pension Lump Sum — each withdrawal is 25% tax-free, 75% taxed as income. Triggers the MPAA.",
  Annuity: "A guaranteed income for life (or fixed term) bought with your pension pot. Removes investment risk but is usually irreversible.",
  "Nomination of Beneficiary": "A written instruction telling your pension provider who should receive benefits if you die. Essential to keep up to date.",
  "Pound Cost Averaging": "Investing fixed amounts regularly so you buy more units when prices are low and fewer when high — smooths timing risk.",
  "Sequence of Returns Risk": "The danger that poor investment returns early in retirement permanently shrink the pot, even if average returns are fine.",
  "Monte Carlo Simulation": "A projection method running thousands of randomised market scenarios to show the range of possible outcomes.",
  IRR: "Internal Rate of Return — the annualised return that makes all your contributions and withdrawals net to zero. The 'true' growth rate.",
  OCF: "Ongoing Charges Figure — the annual cost of running a fund, expressed as a percentage of assets (e.g. 0.22%).",
  Crystallisation: "The moment you take pension benefits (PCLS, drawdown income or annuity purchase). Uses your Lump Sum Allowance.",
  MPAA: "Money Purchase Annual Allowance — once triggered (typically by flexi-access drawdown income), defined contribution pension input is capped at £10,000/year.",
  "Pension Input Period": "The 12-month window in which contributions count toward the Annual Allowance — aligned with the UK tax year (6 April to 5 April).",
  LSA: "Lump Sum Allowance — total tax-free lump sums you can take across all pensions in your lifetime: £268,275 (2024/25).",
  LSDBA: "Lump Sum and Death Benefit Allowance — total tax-free lump sums, including on death: £1,073,100 (2024/25).",
  CETV: "Cash Equivalent Transfer Value — the cash value a defined benefit scheme will pay to transfer you out. Required for DB transfers.",
  "Safeguarded Benefits": "Guaranteed pension benefits (typically defined benefit). FCA rules require regulated advice before transferring out if value exceeds £30,000.",
};

export type JargonTerm = keyof typeof JARGON;
