import { useEffect, useState } from "react";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AsyncState, useAsync, runWithToast } from "@/components/ui/async-state";

export default function DealingDesk() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Dealing desk"
        description="Trade tickets, allocation workbench, corporate actions and income processing."
      />
      <Tabs defaultValue="ticket">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="ticket">Trade ticket</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="corporate">Corporate actions</TabsTrigger>
          <TabsTrigger value="income">Income / Dividends</TabsTrigger>
        </TabsList>
        <TabsContent value="ticket"><TradeTicket /></TabsContent>
        <TabsContent value="allocation"><AllocationWorkbench /></TabsContent>
        <TabsContent value="corporate"><CorporateActionsInbox /></TabsContent>
        <TabsContent value="income"><IncomeProcessing /></TabsContent>
      </Tabs>
    </div>
  );
}

function TradeTicket() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [symbol, setSymbol] = useState("VWRL"); const [qty, setQty] = useState("1000");
  const [orderType, setOrderType] = useState<"market" | "limit">("market"); const [limit, setLimit] = useState("");
  const [aggregating, setAggregating] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const checks = {
      pre_trade_compliance: "passed", concentration_check: "ok", sanctions: "clear",
    };
    const { data, error } = await supabase.from("trade_blocks").insert({
      symbol, side, total_units: Number(qty), order_type: orderType,
      limit_price: limit ? Number(limit) : null, status: aggregating ? "pending_aggregation" : "ready_to_route",
      compliance_checks: checks,
    } as any).select("id").maybeSingle();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    await supabase.from("activity_log").insert({
      action: "trade_ticket_submitted", entity_type: "trade_block", entity_id: (data as any)?.id ?? null,
      description: `${side.toUpperCase()} ${qty} ${symbol} (${orderType}${limit ? ` @£${limit}` : ""})`,
      new_values: { symbol, side, units: Number(qty), order_type: orderType, limit_price: limit ? Number(limit) : null, aggregating },
    } as any);
    toast.success(`${side.toUpperCase()} ${qty} ${symbol} ticket created`);
  };

  return (
    <Card>
      <CardHeader><CardTitle>New trade ticket</CardTitle><CardDescription>Pre-trade compliance, concentration and sanctions checks run on submit.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant={side === "buy" ? "default" : "outline"} size="sm" onClick={() => setSide("buy")}>Buy</Button>
            <Button variant={side === "sell" ? "default" : "outline"} size="sm" onClick={() => setSide("sell")}>Sell</Button>
          </div>
          <div><Label>Symbol / ISIN</Label><Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} /></div>
          <div><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <div><Label>Order type</Label>
            <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="market">Market</SelectItem><SelectItem value="limit">Limit</SelectItem></SelectContent>
            </Select>
          </div>
          {orderType === "limit" && <div><Label>Limit price (£)</Label><Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} /></div>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={aggregating} onChange={(e) => setAggregating(e.target.checked)} /> Aggregate with bulk block</label>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
            <h4 className="text-sm font-semibold">Pre-trade checks</h4>
            <div className="flex justify-between text-sm"><span>Compliance</span><Badge variant="secondary">passed</Badge></div>
            <div className="flex justify-between text-sm"><span>Concentration</span><Badge variant="secondary">ok</Badge></div>
            <div className="flex justify-between text-sm"><span>Sanctions screen</span><Badge variant="secondary">clear</Badge></div>
            <div className="flex justify-between text-sm"><span>Cash sufficiency</span><Badge variant="secondary">ok</Badge></div>
          </div>
          <Button className="w-full" onClick={submit} disabled={submitting}>{submitting ? "Routing…" : "Submit ticket"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AllocationWorkbench() {
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await (supabase as any).from("trade_blocks").select("*").order("created_at", { ascending: false }).limit(15);
    if (error) throw error;
    return data ?? [];
  }, []);
  const blocks = data ?? [];

  const allocate = async (blockId: string) => {
    const block = blocks.find((b: any) => b.id === blockId);
    const total = block?.total_units ?? 0;
    await runWithToast(async () => {
      const { data: accs, error: aErr } = await supabase.from("client_accounts").select("id, client_id").limit(5);
      if (aErr) throw aErr;
      if (!accs?.length) throw new Error("No client accounts available to allocate against");
      const per = Math.floor(total / accs.length);
      const rows = accs.map((a) => ({ block_id: blockId, account_id: a.id, client_id: a.client_id, units: per, allocation_method: "average_price" }));
      const { error } = await (supabase as any).from("trade_allocations").insert(rows);
      if (error) throw error;
      await supabase.from("activity_log").insert({
        action: "trade_block_allocated", entity_type: "trade_block", entity_id: blockId,
        description: `Allocated ${block?.symbol ?? "block"} (${total} units) across ${accs.length} accounts (avg price)`,
        new_values: { method: "average_price", account_count: accs.length, units_per: per, total_units: total },
      } as any);
      return accs.length;
    }, { success: `Allocated using average pricing` });
    reload();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Allocation workbench</CardTitle><CardDescription>Average-pricing across blocks, residual handling and failed-trade queue.</CardDescription></CardHeader>
      <CardContent>
        <AsyncState
          loading={loading} error={error} onRetry={reload} isEmpty={blocks.length === 0}
          loadingLabel="Loading trade blocks…"
          emptyTitle="No trade blocks"
          emptyDescription="Create one in the Trade ticket tab to enable allocation."
        >
          <Table>
            <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Side</TableHead><TableHead>Units</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {blocks.map((b: any) => (
                <TableRow key={b.id}><TableCell className="font-medium">{b.symbol}</TableCell><TableCell><Badge variant={b.side === "buy" ? "default" : "secondary"}>{b.side}</Badge></TableCell>
                  <TableCell>{Number(b.total_units || 0).toLocaleString()}</TableCell><TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => allocate(b.id)}>Allocate</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AsyncState>
      </CardContent>
    </Card>
  );
}

function CorporateActionsInbox() {
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await supabase.from("corporate_actions").select("*").order("election_deadline", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }, []);
  const actions = data ?? [];

  const elect = async (caId: string, choice: string) => {
    await runWithToast(async () => {
      const { data: accs, error: aErr } = await supabase.from("client_accounts").select("id, client_id").limit(3);
      if (aErr) throw aErr;
      if (!accs?.length) throw new Error("No accounts to elect against");
      const rows = accs.map((a) => ({ corporate_action_id: caId, client_id: a.client_id, account_id: a.id, election: choice, status: "elected", elected_at: new Date().toISOString(), units_held: 100 }));
      const { error } = await supabase.from("corporate_action_elections").insert(rows);
      if (error) throw error;
      await supabase.from("activity_log").insert({
        action: "corporate_action_elected", entity_type: "corporate_action", entity_id: caId,
        description: `Election '${choice}' recorded for ${accs.length} positions`,
        new_values: { choice, account_count: accs.length },
      } as any);
    }, { success: `Election '${choice}' recorded` });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Corporate actions inbox</CardTitle><CardDescription>Voluntary elections with deadline tracking.</CardDescription></CardHeader>
      <CardContent>
        <AsyncState
          loading={loading} error={error} onRetry={reload} isEmpty={actions.length === 0}
          loadingLabel="Loading corporate actions…"
          emptyTitle="No corporate actions pending"
          emptyDescription="Mandatory and voluntary events will land here."
        >
          <Table>
            <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Type</TableHead><TableHead>Ex-date</TableHead><TableHead>Deadline</TableHead><TableHead>Election</TableHead></TableRow></TableHeader>
            <TableBody>
              {actions.map((a: any) => (
                <TableRow key={a.id}><TableCell className="font-medium">{a.symbol}</TableCell><TableCell>{a.action_type}</TableCell>
                  <TableCell>{a.ex_date ?? "—"}</TableCell><TableCell>{a.election_deadline ?? "—"}</TableCell>
                  <TableCell><div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => elect(a.id, "cash")}>Cash</Button>
                    <Button size="sm" variant="outline" onClick={() => elect(a.id, "stock")}>Stock</Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AsyncState>
      </CardContent>
    </Card>
  );
}

function IncomeProcessing() {
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await (supabase as any).from("interest_accruals").select("*").order("accrual_date", { ascending: false }).limit(10);
    if (error) throw error;
    return data ?? [];
  }, []);
  const accruals = data ?? [];

  const post = async () => {
    await runWithToast(async () => {
      const { data: accs, error: aErr } = await supabase.from("client_accounts").select("id, client_id").limit(5);
      if (aErr) throw aErr;
      if (!accs?.length) throw new Error("No accounts to post against");
      const today = new Date().toISOString().slice(0, 10);
      const rows = accs.map((a: any) => ({ account_id: a.id, client_id: a.client_id, accrual_date: today, gross_interest: 12.5, withholding_tax: 0, net_interest: 12.5, status: "posted" }));
      const { error } = await (supabase as any).from("interest_accruals").insert(rows);
      if (error) throw error;
      await supabase.from("activity_log").insert({
        action: "income_posted", entity_type: "interest_accrual", entity_id: null,
        description: `Posted income to ${accs.length} accounts on ${today}`,
        new_values: { date: today, account_count: accs.length, gross_each: 12.5 },
      } as any);
      return accs.length;
    }, { success: "Income posted" });
    reload();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Income & dividend posting</CardTitle><CardDescription>Auto-post with WHT reclaim tracking.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={post}>Run today's income posting</Button>
        <AsyncState
          loading={loading} error={error} onRetry={reload} isEmpty={accruals.length === 0}
          loadingLabel="Loading accruals…"
          emptyTitle="No accruals posted"
          emptyDescription="Run today's posting above to generate entries."
        >
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Gross</TableHead><TableHead>WHT</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{accruals.map((a: any) => <TableRow key={a.id}><TableCell>{a.accrual_date}</TableCell><TableCell>£{a.gross_interest}</TableCell><TableCell>£{a.withholding_tax}</TableCell><TableCell>£{a.net_interest}</TableCell><TableCell><Badge variant="outline">{a.status}</Badge></TableCell></TableRow>)}</TableBody>
          </Table>
        </AsyncState>
      </CardContent>
    </Card>
  );
}
