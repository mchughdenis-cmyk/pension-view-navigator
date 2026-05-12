import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, ShieldAlert, Banknote, TrendingDown, Info, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useNavigate } from "react-router-dom";

type Severity = "high" | "medium" | "low" | "info";
type RuleId =
  | "COBS_19_10_CASH_25PCT"
  | "NEGATIVE_CASH"
  | "FSCS_85K_BREACH"
  | "DRAWDOWN_BUFFER_LOW"
  | "FEES_INSUFFICIENT_CASH"
  | "EXCESSIVE_CASH_GIA";

type Warning = {
  id: string;
  clientId: string;
  clientName: string;
  accountType: string;
  rule: RuleId;
  ruleName: string;
  basis: string;
  severity: Severity;
  detail: string;
  suggested: string;
};

const RULE_META: Record<RuleId, { name: string; basis: string; severity: Severity }> = {
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

const SEV_BADGE: Record<Severity, "destructive" | "default" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
  info: "outline",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default function CashWarnings() {
  const { firmId, firm } = useFirm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [tab, setTab] = useState<Severity | "all">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      let cq = supabase.from("clients").select("id, first_name, last_name, firm_id");
      if (firmId) cq = cq.eq("firm_id", firmId);
      const { data: clients } = await cq;
      const ids = (clients ?? []).map((c: any) => c.id);
      if (ids.length === 0) {
        setWarnings([]);
        setLoading(false);
        return;
      }
      const { data: accounts } = await supabase
        .from("client_accounts")
        .select("id, client_id, account_type, cash_balance, total_value, status")
        .in("client_id", ids);

      const byClient = new Map<string, any>();
      (clients ?? []).forEach((c: any) =>
        byClient.set(c.id, `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Unnamed client"),
      );

      const out: Warning[] = [];
      (accounts ?? []).forEach((a: any) => {
        const name = byClient.get(a.client_id) ?? "Unknown";
        const cash = Number(a.cash_balance ?? 0);
        const total = Number(a.total_value ?? 0);
        const pct = total > 0 ? (cash / total) * 100 : 0;
        const type = (a.account_type ?? "").toUpperCase();

        if (cash < 0) {
          const meta = RULE_META.NEGATIVE_CASH;
          out.push({
            id: `${a.id}-neg`,
            clientId: a.client_id,
            clientName: name,
            accountType: type,
            rule: "NEGATIVE_CASH",
            ruleName: meta.name,
            basis: meta.basis,
            severity: meta.severity,
            detail: `${type} cash balance is ${fmt(cash)} (overdrawn).`,
            suggested: "Sell assets or transfer cash in to clear the overdraft within 1 business day.",
          });
        }

        if (type === "SIPP" && total > 0 && pct >= 25) {
          const meta = RULE_META.COBS_19_10_CASH_25PCT;
          out.push({
            id: `${a.id}-cash25`,
            clientId: a.client_id,
            clientName: name,
            accountType: type,
            rule: "COBS_19_10_CASH_25PCT",
            ruleName: meta.name,
            basis: meta.basis,
            severity: meta.severity,
            detail: `Cash ${fmt(cash)} is ${pct.toFixed(1)}% of SIPP value (${fmt(total)}).`,
            suggested: "Issue COBS 19.10 cash warning to client and review investment objective.",
          });
        }

        if (cash > 85000) {
          const meta = RULE_META.FSCS_85K_BREACH;
          out.push({
            id: `${a.id}-fscs`,
            clientId: a.client_id,
            clientName: name,
            accountType: type,
            rule: "FSCS_85K_BREACH",
            ruleName: meta.name,
            basis: meta.basis,
            severity: meta.severity,
            detail: `${fmt(cash)} held — exceeds £85,000 FSCS limit per banking licence by ${fmt(cash - 85000)}.`,
            suggested: "Diversify cash across additional deposit takers or invest the excess.",
          });
        }

        if ((type === "GIA" || type === "ISA") && total > 0 && pct >= 30) {
          const meta = RULE_META.EXCESSIVE_CASH_GIA;
          out.push({
            id: `${a.id}-drag`,
            clientId: a.client_id,
            clientName: name,
            accountType: type,
            rule: "EXCESSIVE_CASH_GIA",
            ruleName: meta.name,
            basis: meta.basis,
            severity: meta.severity,
            detail: `${pct.toFixed(1)}% of ${type} held as cash — likely under-invested vs. mandate.`,
            suggested: "Review allocation with client; deploy cash per agreed model portfolio.",
          });
        }

        // Heuristic fees check: assume 1% pa of total value due as combined platform/adviser fees
        const annualFees = total * 0.01;
        if (annualFees > 0 && cash < annualFees * 0.25 && total > 5000) {
          const meta = RULE_META.FEES_INSUFFICIENT_CASH;
          out.push({
            id: `${a.id}-fees`,
            clientId: a.client_id,
            clientName: name,
            accountType: type,
            rule: "FEES_INSUFFICIENT_CASH",
            ruleName: meta.name,
            basis: meta.basis,
            severity: meta.severity,
            detail: `Cash ${fmt(cash)} below quarterly fee provision (~${fmt(annualFees * 0.25)}).`,
            suggested: "Schedule disinvestment to top up cash before next fee run.",
          });
        }
      });

      // sort high → low
      const order: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };
      out.sort((a, b) => order[a.severity] - order[b.severity]);
      setWarnings(out);
      setLoading(false);
    })();
  }, [firmId]);

  const counts = useMemo(() => {
    const c: Record<Severity | "all", number> = { all: warnings.length, high: 0, medium: 0, low: 0, info: 0 };
    warnings.forEach((w) => (c[w.severity] += 1));
    return c;
  }, [warnings]);

  const filtered = tab === "all" ? warnings : warnings.filter((w) => w.severity === tab);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="Regulatory Cash Warnings"
        subtitle={firm ? `${firm.name} — FCA-aligned cash monitoring` : "FCA-aligned cash monitoring"}
        badge={<Badge variant="outline" className="gap-1"><ShieldAlert className="w-3 h-3" /> COBS 19.10 · CASS 7 · FSCS</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2"><CardDescription>High severity</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{counts.high}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Medium</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-warning">{counts.medium}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Low</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{counts.low}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Total accounts flagged</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{counts.all}</div></CardContent>
          </Card>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How these warnings are derived</AlertTitle>
          <AlertDescription className="text-sm">
            Each rule maps to a specific UK regulatory or prudential basis: <b>COBS 19.10</b> (non-workplace pension cash warning),{" "}
            <b>CASS 7</b> (client money), the <b>£85,000 FSCS</b> per-licence deposit limit, and adviser-fee provisioning.
            Rerun this view after every cash movement.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" /> Findings</CardTitle>
            <CardDescription>Filter by severity. Click a finding to open the client's admin view.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="high">High ({counts.high})</TabsTrigger>
                <TabsTrigger value="medium">Medium ({counts.medium})</TabsTrigger>
                <TabsTrigger value="low">Low ({counts.low})</TabsTrigger>
              </TabsList>
              <TabsContent value={tab} className="space-y-3">
                {loading && <p className="text-sm text-muted-foreground">Evaluating rules…</p>}
                {!loading && filtered.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Banknote className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No cash warnings at this severity.
                  </div>
                )}
                {filtered.map((w) => (
                  <div key={w.id} className="border rounded-lg p-4 hover:bg-accent/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant={SEV_BADGE[w.severity]} className="uppercase text-[10px]">{w.severity}</Badge>
                          <Badge variant="outline" className="text-[10px]">{w.accountType}</Badge>
                          <span className="font-medium">{w.clientName}</span>
                        </div>
                        <p className="text-sm font-medium">{w.ruleName}</p>
                        <p className="text-sm text-muted-foreground">{w.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Basis:</span> {w.basis}</p>
                        <p className="text-xs mt-2"><TrendingDown className="inline w-3 h-3 mr-1" /> <span className="font-medium">Suggested action:</span> {w.suggested}</p>
                      </div>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => navigate(`/client-admin/${w.clientId}`)}
                        className="shrink-0"
                      >
                        Open client <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
