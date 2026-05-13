// Shared cash warning rules — keep in sync with src/components/CashWarnings.tsx

export type Severity = "high" | "medium" | "low" | "info";

export type RuleId =
  | "COBS_19_10_CASH_25PCT"
  | "NEGATIVE_CASH"
  | "FSCS_85K_BREACH"
  | "DRAWDOWN_BUFFER_LOW"
  | "FEES_INSUFFICIENT_CASH"
  | "EXCESSIVE_CASH_GIA";

export interface AccountLike {
  id: string;
  account_type: string | null;
  cash_balance: number | null;
  total_value: number | null;
}

export interface Warning {
  rule: RuleId;
  ruleName: string;
  basis: string;
  severity: Severity;
  detail: string;
  suggested: string;
}

export const RULE_META: Record<RuleId, { name: string; basis: string; severity: Severity }> = {
  COBS_19_10_CASH_25PCT: {
    name: "Non-workplace pension cash warning",
    basis: "FCA COBS 19.10 — cash holdings ≥ 25% of pension value",
    severity: "high",
  },
  NEGATIVE_CASH: {
    name: "Negative cash balance",
    basis: "CASS 7 — client money must not run negative",
    severity: "high",
  },
  FSCS_85K_BREACH: {
    name: "FSCS deposit limit exceeded",
    basis: "FSCS protection capped at £85,000 per banking licence",
    severity: "medium",
  },
  DRAWDOWN_BUFFER_LOW: {
    name: "Drawdown cash buffer low",
    basis: "Suggested 3 months of scheduled income kept as cash",
    severity: "medium",
  },
  FEES_INSUFFICIENT_CASH: {
    name: "Insufficient cash for upcoming fees",
    basis: "Annual platform/adviser fees due — cash short",
    severity: "medium",
  },
  EXCESSIVE_CASH_GIA: {
    name: "Excessive cash drag (GIA/ISA)",
    basis: "Cash > 30% of wrapper value — investment objective risk",
    severity: "low",
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export function evaluateAccountWarnings(a: AccountLike): Warning[] {
  const out: Warning[] = [];
  const cash = Number(a.cash_balance ?? 0);
  const total = Number(a.total_value ?? 0);
  const pct = total > 0 ? (cash / total) * 100 : 0;
  const type = (a.account_type ?? "").toUpperCase();

  if (cash < 0) {
    const m = RULE_META.NEGATIVE_CASH;
    out.push({
      rule: "NEGATIVE_CASH", ruleName: m.name, basis: m.basis, severity: m.severity,
      detail: `${type} cash balance is ${fmt(cash)} (overdrawn).`,
      suggested: "Sell assets or transfer cash in to clear the overdraft within 1 business day.",
    });
  }
  if (type === "SIPP" && total > 0 && pct >= 25) {
    const m = RULE_META.COBS_19_10_CASH_25PCT;
    out.push({
      rule: "COBS_19_10_CASH_25PCT", ruleName: m.name, basis: m.basis, severity: m.severity,
      detail: `Cash ${fmt(cash)} is ${pct.toFixed(1)}% of SIPP value (${fmt(total)}).`,
      suggested: "Issue COBS 19.10 cash warning to client and review investment objective.",
    });
  }
  if (cash > 85000) {
    const m = RULE_META.FSCS_85K_BREACH;
    out.push({
      rule: "FSCS_85K_BREACH", ruleName: m.name, basis: m.basis, severity: m.severity,
      detail: `${fmt(cash)} held — exceeds £85,000 FSCS limit by ${fmt(cash - 85000)}.`,
      suggested: "Diversify cash across additional deposit takers or invest the excess.",
    });
  }
  if ((type === "GIA" || type === "ISA") && total > 0 && pct >= 30) {
    const m = RULE_META.EXCESSIVE_CASH_GIA;
    out.push({
      rule: "EXCESSIVE_CASH_GIA", ruleName: m.name, basis: m.basis, severity: m.severity,
      detail: `${pct.toFixed(1)}% of ${type} held as cash — likely under-invested vs. mandate.`,
      suggested: "Review allocation with client; deploy cash per agreed model portfolio.",
    });
  }
  const annualFees = total * 0.01;
  if (annualFees > 0 && cash < annualFees * 0.25 && total > 5000) {
    const m = RULE_META.FEES_INSUFFICIENT_CASH;
    out.push({
      rule: "FEES_INSUFFICIENT_CASH", ruleName: m.name, basis: m.basis, severity: m.severity,
      detail: `Cash ${fmt(cash)} below quarterly fee provision (~${fmt(annualFees * 0.25)}).`,
      suggested: "Schedule disinvestment to top up cash before next fee run.",
    });
  }
  return out;
}

export const SEVERITY_BADGE: Record<Severity, "destructive" | "default" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
  info: "outline",
};

export const fmtGBP = fmt;
