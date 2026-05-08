import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TABS = [
  ["dealing", "Dealing"],
  ["cash", "Cash Mgmt"],
  ["tax", "Tax Engine"],
  ["statements", "Statements"],
  ["workflow", "Workflow"],
  ["docs", "Documents"],
  ["adviser", "Adviser"],
  ["client", "Client Portal"],
  ["api", "API"],
  ["esg", "ESG"],
  ["ai", "AI Insights"],
] as const;

const QUERIES: Record<string, { table: string; cols?: string }> = {
  dealing: { table: "trade_blocks" },
  cash: { table: "interest_accruals" },
  tax: { table: "paye_calculations" },
  statements: { table: "statements" },
  workflow: { table: "workflow_instances" },
  docs: { table: "esign_envelopes" },
  adviser: { table: "suitability_reports" },
  client: { table: "secure_messages" },
  api: { table: "api_keys" },
  esg: { table: "esg_fund_data" },
  ai: { table: "ai_insights" },
};

function DataPanel({ tab }: { tab: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cfg = QUERIES[tab];

  useEffect(() => {
    setLoading(true);
    (supabase as any)
      .from(cfg.table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25)
      .then(({ data, error }: any) => {
        if (error) toast.error(error.message);
        setRows(data ?? []);
        setLoading(false);
      });
  }, [tab]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">No records yet — use the actions above to create some.</p>;

  const cols = Object.keys(rows[0]).filter((k) => !["id", "created_at", "updated_at", "raw", "payload", "context", "questionnaire", "assets", "liabilities", "trades_generated", "drift_summary"].includes(k)).slice(0, 6);
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>{cols.map((c) => <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2">
                  {typeof r[c] === "boolean" ? (r[c] ? "Yes" : "No")
                    : r[c] === null || r[c] === undefined ? "—"
                    : typeof r[c] === "object" ? JSON.stringify(r[c]).slice(0, 40)
                    : String(r[c]).slice(0, 60)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EnterpriseSuite() {
  const [busy, setBusy] = useState<string | null>(null);

  async function runPaye() {
    setBusy("paye");
    const { data, error } = await supabase.functions.invoke("paye-calculator", {
      body: { client_id: "a6666666-6666-6666-6666-666666666666", payment_type: "UFPLS", gross_amount: 8000, emergency: true },
    });
    setBusy(null);
    error ? toast.error(error.message) : toast.success(`PAYE calc: tax £${data?.calc?.income_tax}, net £${data?.calc?.net_amount}`);
  }
  async function runAi() {
    setBusy("ai");
    const { data, error } = await supabase.functions.invoke("ai-insights", { body: { scope: "platform" } });
    setBusy(null);
    error ? toast.error(error.message) : toast.success(`Generated ${data?.generated ?? 0} insights`);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Suite</h1>
          <p className="text-muted-foreground">Dealing · Cash · Tax · Statements · Workflow · Documents · Adviser · Client · API · ESG · AI</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={runPaye} disabled={busy === "paye"} variant="outline" size="sm">{busy === "paye" ? "Calculating…" : "Run UFPLS PAYE demo"}</Button>
          <Button onClick={runAi} disabled={busy === "ai"} size="sm">{busy === "ai" ? "Thinking…" : "Generate AI insights"}</Button>
        </div>
      </div>

      <Tabs defaultValue="dealing" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map(([k, label]) => (<TabsTrigger key={k} value={k}>{label}</TabsTrigger>))}
        </TabsList>
        {TABS.map(([k, label]) => (
          <TabsContent key={k} value={k}>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{label}</CardTitle>
                <Badge variant="secondary">{QUERIES[k].table}</Badge>
              </CardHeader>
              <CardContent><DataPanel tab={k} /></CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
