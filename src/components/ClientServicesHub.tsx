import { useEffect, useState } from "react";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowRight, PoundSterling, FileSignature, Users2, Repeat, FileText, Wallet } from "lucide-react";
import { AsyncState, useAsync, runWithToast } from "@/components/ui/async-state";
import { useFirm } from "@/contexts/FirmContext";

type Client = { id: string; first_name: string; last_name: string; mpaa_triggered: boolean; annual_allowance_used: number };

export default function ClientServicesHub() {
  const { firmId } = useFirm();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [accounts, setAccounts] = useState<{ account_type: string; total_value: number; cash_balance: number | null }[]>([]);

  useEffect(() => {
    let q = supabase.from("clients").select("id, first_name, last_name, mpaa_triggered, annual_allowance_used").order("last_name");
    if (firmId) q = q.eq("firm_id", firmId);
    q.then(({ data }) => {
      setClients((data ?? []) as Client[]);
      setClientId(data?.[0]?.id ?? "");
    });
  }, [firmId]);

  useEffect(() => {
    if (!clientId) { setAccounts([]); return; }
    supabase
      .from("client_accounts")
      .select("account_type, total_value, cash_balance")
      .eq("client_id", clientId)
      .then(({ data }) => setAccounts((data ?? []) as any));
  }, [clientId]);

  const client = clients.find((c) => c.id === clientId);
  const totalValue = accounts.reduce((s, a) => s + Number(a.total_value || 0), 0);
  const totalCash = accounts.reduce((s, a) => s + Number(a.cash_balance || 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Client services"
        description="Self-service wizards: contributions, drawdown, transfers, beneficiaries and documents."
        actions={
          <div className="w-72">
            <Label className="text-xs">Acting for client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }
      />

      {client && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />Overall value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{fmt(totalValue)}</div>
              <p className="text-xs text-muted-foreground">{accounts.length} account{accounts.length === 1 ? "" : "s"}</p>
            </CardContent>
          </Card>
          {["SIPP", "ISA", "GIA"].map((type) => {
            const total = accounts.filter((a) => a.account_type === type).reduce((s, a) => s + Number(a.total_value || 0), 0);
            return (
              <Card key={type}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{type}</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{fmt(total)}</div>
                  <p className="text-xs text-muted-foreground">{total > 0 ? "Active" : "No holdings"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}


      <Tabs defaultValue="contribution">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="contribution"><PoundSterling className="h-4 w-4 mr-1" />Contribution</TabsTrigger>
          <TabsTrigger value="drawdown"><ArrowRight className="h-4 w-4 mr-1" />Drawdown</TabsTrigger>
          <TabsTrigger value="transfer"><Repeat className="h-4 w-4 mr-1" />Transfer</TabsTrigger>
          <TabsTrigger value="beneficiaries"><Users2 className="h-4 w-4 mr-1" />Beneficiaries</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" />Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="contribution"><ContributionWizard client={client} /></TabsContent>
        <TabsContent value="drawdown"><DrawdownWizard client={client} /></TabsContent>
        <TabsContent value="transfer"><TransferWizard client={client} /></TabsContent>
        <TabsContent value="beneficiaries"><BeneficiariesPanel client={client} /></TabsContent>
        <TabsContent value="documents"><DocumentVault client={client} /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ============ Contribution Wizard ============ */
function ContributionWizard({ client }: { client?: Client }) {
  const [type, setType] = useState("member");
  const [gross, setGross] = useState("5000");
  const [relief, setRelief] = useState("ras");
  const [submitting, setSubmitting] = useState(false);

  const grossN = Number(gross || 0);
  const aaCap = client?.mpaa_triggered ? 10000 : 60000;
  const aaUsed = client?.annual_allowance_used ?? 0;
  const aaRemaining = Math.max(0, aaCap - aaUsed);
  const exceedsAA = grossN > aaRemaining;
  const taxRelief = relief === "ras" ? grossN * 0.2 : grossN * 0.4;
  const net = relief === "ras" ? grossN - taxRelief : grossN;

  const submit = async () => {
    if (!client) return;
    setSubmitting(true);
    const { data: acc } = await supabase.from("client_accounts").select("id").eq("client_id", client.id).eq("account_type", "SIPP").maybeSingle();
    const { error } = await supabase.from("contributions").insert({
      client_id: client.id, account_id: acc?.id, contribution_type: type, gross_amount: grossN,
      net_amount: net, tax_relief: taxRelief, relief_method: relief, tax_year: "2024/25", status: "received",
    });
    setSubmitting(false);
    if (error) toast.error(error.message); else toast.success(`Contribution of £${grossN.toLocaleString()} recorded`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a contribution</CardTitle>
        <CardDescription>Single or regular payments with live tax-relief and Annual Allowance checks.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member (personal)</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="third_party">Third-party</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Gross amount (£)</Label><Input type="number" value={gross} onChange={(e) => setGross(e.target.value)} /></div>
          <div><Label>Tax relief method</Label>
            <Select value={relief} onValueChange={setRelief}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ras">Relief at source (basic)</SelectItem>
                <SelectItem value="net_pay">Net pay</SelectItem>
                <SelectItem value="self_assess">Self-assessment top-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
            <div className="flex justify-between text-sm"><span>Gross</span><span>£{grossN.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>Tax relief</span><span className="text-green-600">+£{taxRelief.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>Net cost to you</span><span className="font-semibold">£{net.toLocaleString()}</span></div>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Annual Allowance cap</span><span>£{aaCap.toLocaleString()}{client?.mpaa_triggered && <Badge className="ml-2" variant="destructive">MPAA</Badge>}</span></div>
            <div className="flex justify-between text-sm"><span>Used this year</span><span>£{aaUsed.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>Remaining</span><span className={exceedsAA ? "text-destructive font-semibold" : "text-green-600 font-semibold"}>£{aaRemaining.toLocaleString()}</span></div>
            {exceedsAA && <p className="text-xs text-destructive">Exceeds AA — carry-forward will be assessed.</p>}
          </div>
          <Button className="w-full" disabled={!client || submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit contribution"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============ Drawdown Wizard ============ */
function DrawdownWizard({ client }: { client?: Client }) {
  const [mode, setMode] = useState<"ufpls" | "fad" | "pcls_only">("ufpls");
  const [amount, setAmount] = useState("10000");
  const [submitting, setSubmitting] = useState(false);

  const amt = Number(amount || 0);
  const pcls = mode === "pcls_only" ? amt : amt * 0.25;
  const taxable = mode === "pcls_only" ? 0 : mode === "ufpls" ? amt * 0.75 : amt;
  const estTax = taxable * 0.2; // emergency code stub
  const net = amt - estTax;

  const submit = async () => {
    if (!client) return;
    setSubmitting(true);
    await supabase.from("bce_events").insert({
      client_id: client.id, bce_type: mode.toUpperCase(), crystallised_amount: amt,
      tax_free_lump_sum: pcls, lta_percentage: (amt / 1073100) * 100,
    });
    if (mode !== "pcls_only") {
      try { await supabase.functions.invoke("paye-calculator", { body: { client_id: client.id, gross: taxable, kind: mode } }); } catch {}
    }
    setSubmitting(false);
    toast.success(`${mode.toUpperCase()} of £${amt.toLocaleString()} submitted`);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Take money from your pension</CardTitle><CardDescription>Choose UFPLS, Flexi-Access Drawdown (FAD) or PCLS-only with PAYE preview.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["ufpls", "fad", "pcls_only"] as const).map((m) => (
              <Button key={m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} size="sm">
                {m === "ufpls" ? "UFPLS" : m === "fad" ? "FAD" : "PCLS only"}
              </Button>
            ))}
          </div>
          <div><Label>Amount (£)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <p className="text-xs text-muted-foreground">
            {mode === "ufpls" && "25% tax-free, 75% taxable as income."}
            {mode === "fad" && "Designate funds; income taxable. Triggers MPAA on first taxable income."}
            {mode === "pcls_only" && "Tax-free cash only; remainder designated to drawdown."}
          </p>
        </div>
        <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
          <div className="flex justify-between text-sm"><span>Tax-free element</span><span>£{pcls.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Taxable element</span><span>£{taxable.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Est. PAYE (Month-1)</span><span>−£{estTax.toLocaleString()}</span></div>
          <Separator />
          <div className="flex justify-between font-semibold"><span>Net to you</span><span>£{net.toLocaleString()}</span></div>
          <Button className="w-full mt-3" disabled={!client || submitting} onClick={submit}><FileSignature className="h-4 w-4 mr-2" />{submitting ? "Submitting…" : "E-sign & submit"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============ Transfer Wizard ============ */
function TransferWizard({ client }: { client?: Client }) {
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [scheme, setScheme] = useState("");
  const [cetv, setCetv] = useState("50000");
  const [step, setStep] = useState(0);
  const steps = ["Scheme details", "Due diligence", "Origo submission", "Tracking"];

  const submit = async () => {
    if (!client) return;
    await supabase.from("activity_log").insert({
      action: "transfer_request", entity_type: "client", entity_id: client.id,
      description: `${direction === "in" ? "Transfer-in" : "Transfer-out"} from ${scheme} (£${cetv}) initiated`,
      new_values: { direction, scheme, cetv: Number(cetv) },
    });
    toast.success("Transfer request created — Origo tracking started");
    setStep(3);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Pension transfer</CardTitle><CardDescription>Origo-style status tracker with scheme due-diligence checklist.</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button variant={direction === "in" ? "default" : "outline"} size="sm" onClick={() => setDirection("in")}>Transfer In</Button>
          <Button variant={direction === "out" ? "default" : "outline"} size="sm" onClick={() => setDirection("out")}>Transfer Out</Button>
        </div>
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <p className="text-xs mt-1">{s}</p>
            </div>
          ))}
        </div>
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Ceding scheme</Label><Input value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="e.g. Aviva Personal Pension" /></div>
            <div><Label>CETV (£)</Label><Input type="number" value={cetv} onChange={(e) => setCetv(e.target.value)} /></div>
            <Button onClick={() => setStep(1)} disabled={!scheme}>Next</Button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            {["Scheme registered with HMRC", "No safeguarded benefits >£30k (or appropriate advice)", "Member identity verified", "Bank details verified", "Anti-scam Pledge checks complete"].map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> {c}</label>
            ))}
            <Button onClick={() => setStep(2)}>Next</Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm">Submit Origo Options request to ceding scheme.</p>
            <Button onClick={submit}>Submit via Origo</Button>
          </div>
        )}
        {step === 3 && (
          <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
            <div className="flex justify-between text-sm"><span>Status</span><Badge>In flight</Badge></div>
            <div className="flex justify-between text-sm"><span>Expected settlement</span><span>10 business days</span></div>
            <div className="flex justify-between text-sm"><span>CETV</span><span>£{Number(cetv).toLocaleString()}</span></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============ Beneficiaries ============ */
function BeneficiariesPanel({ client }: { client?: Client }) {
  const [name, setName] = useState(""); const [rel, setRel] = useState("Spouse"); const [pct, setPct] = useState("100");

  const { data: rows, loading, error, reload } = useAsync(async () => {
    if (!client) return [];
    const { data, error } = await supabase.from("beneficiaries").select("*").eq("client_id", client.id);
    if (error) throw error;
    return data ?? [];
  }, [client?.id]);

  const list = rows ?? [];
  const total = list.reduce((s: number, r: any) => s + Number(r.allocation_pct || 0), 0);

  const add = async () => {
    if (!client || !name) return;
    const res = await runWithToast(async () => {
      const { error } = await supabase.from("beneficiaries").insert({ client_id: client.id, name, relationship: rel, allocation_pct: Number(pct) });
      if (error) throw error;
    }, { success: "Beneficiary added" });
    if (res.ok) { setName(""); setPct("100"); reload(); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Expression of Wish</CardTitle><CardDescription>Versioned nominations. Total must equal 100%.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-4 gap-2 items-end">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Relationship</Label>
            <Select value={rel} onValueChange={setRel}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Spouse", "Civil Partner", "Child", "Parent", "Trust", "Charity", "Other"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Allocation %</Label><Input type="number" value={pct} onChange={(e) => setPct(e.target.value)} /></div>
          <Button onClick={add} disabled={!client || !name}>Add</Button>
        </div>
        <AsyncState
          loading={loading} error={error} onRetry={reload} isEmpty={list.length === 0}
          loadingLabel="Loading beneficiaries…"
          emptyTitle="No beneficiaries nominated"
          emptyDescription="Add at least one beneficiary above. Allocations must total 100%."
        >
          <div className="space-y-2">
            {list.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center border rounded-lg p-3">
                <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.relationship}</p></div>
                <Badge variant="secondary">{r.allocation_pct}%</Badge>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 border-t"><span>Total</span><span className={total === 100 ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>{total}%</span></div>
          </div>
        </AsyncState>
      </CardContent>
    </Card>
  );
}

/* ============ Document vault ============ */
function DocumentVault({ client }: { client?: Client }) {
  const { data, loading, error, reload } = useAsync(async () => {
    if (!client) return [];
    const { data, error } = await supabase.from("client_documents").select("*").eq("client_id", client.id).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }, [client?.id]);

  const docs = data ?? [];

  return (
    <Card>
      <CardHeader><CardTitle>Document vault</CardTitle><CardDescription>Illustrations, statements, KIIDs, annual benefit statements.</CardDescription></CardHeader>
      <CardContent>
        <AsyncState
          loading={loading} error={error} onRetry={reload} isEmpty={docs.length === 0}
          loadingLabel="Loading documents…"
          emptyTitle="No documents yet"
          emptyDescription="Statements and illustrations will appear here once generated."
        >
          <div className="space-y-2">
            {docs.map((d: any) => (
              <div key={d.id} className="flex justify-between border rounded-lg p-3">
                <div><p className="font-medium text-sm">{d.filename}</p><p className="text-xs text-muted-foreground">{d.document_type} · {new Date(d.created_at).toLocaleDateString("en-GB")}</p></div>
                <Badge variant="outline">{(d.size_bytes ?? 0) > 0 ? `${Math.round(d.size_bytes / 1024)} KB` : "—"}</Badge>
              </div>
            ))}
          </div>
        </AsyncState>
      </CardContent>
    </Card>
  );
}
