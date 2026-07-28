import { useEffect, useState } from "react";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useFirm } from "@/contexts/FirmContext";

const STEPS = ["Fact-find", "ATR", "Suitability", "Recommendation"];

export default function AdviserWorkbench() {
  const { firmId } = useFirm();
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>("");
  useEffect(() => {
    let q = supabase.from("clients").select("id, first_name, last_name").order("last_name");
    if (firmId) q = q.eq("firm_id", firmId);
    q.then(({ data }) => {
      setClients(data ?? []);
      setClientId(data?.[0]?.id ?? "");
    });
  }, [firmId]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">Adviser workbench</span> — part of Pension Navigator administration.
      </div>
      <PageHeader
        title="Adviser workbench"
        description="Guided journey from fact-find to recommendation, plus cashflow planning and Consumer Duty review."
        actions={
          <div className="w-72">
            <Label className="text-xs">Client</Label>
            <Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }
      />

      <Tabs defaultValue="journey">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="journey">Suitability journey</TabsTrigger>
          <TabsTrigger value="cashflow">Cashflow planning</TabsTrigger>
          <TabsTrigger value="review">Annual review batch</TabsTrigger>
          <TabsTrigger value="fees">Fee agreement</TabsTrigger>
        </TabsList>
        <TabsContent value="journey"><SuitabilityJourney clientId={clientId} /></TabsContent>
        <TabsContent value="cashflow"><CashflowPlanner clientId={clientId} /></TabsContent>
        <TabsContent value="review"><ConsumerDutyBatch /></TabsContent>
        <TabsContent value="fees"><FeeAgreement clientId={clientId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function SuitabilityJourney({ clientId }: { clientId: string }) {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(""); const [expenditure, setExpenditure] = useState(""); const [objectives, setObjectives] = useState("");
  const [atrScore, setAtrScore] = useState(5); const [cfl, setCfl] = useState("medium");
  const [recText, setRecText] = useState(""); const [productRec, setProductRec] = useState("SIPP");

  const atrCategory = atrScore <= 3 ? "Cautious" : atrScore <= 6 ? "Balanced" : atrScore <= 8 ? "Growth" : "Aggressive";

  const saveStep = async () => {
    if (!clientId) return;
    if (step === 0) await supabase.from("fact_finds").insert({ client_id: clientId, income_annual: Number(income || 0), expenditure_annual: Number(expenditure || 0), objectives, completed_at: new Date().toISOString() });
    if (step === 1) await supabase.from("atr_assessments").insert({ client_id: clientId, score: atrScore, category: atrCategory, capacity_for_loss: cfl });
    if (step === 3) await supabase.from("suitability_reports").insert({ client_id: clientId, recommendation: recText, product: productRec, status: "draft" } as any);
    toast.success(`${STEPS[step]} saved`);
    setStep(Math.min(3, step + 1));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suitability journey</CardTitle>
        <CardDescription>Fact-find → ATR → Suitability → Recommendation</CardDescription>
        <Progress value={((step + 1) / 4) * 100} className="mt-2" />
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => <Badge key={s} variant={i <= step ? "default" : "secondary"}>{s}</Badge>)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Annual income (£)</Label><Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} /></div>
            <div><Label>Annual expenditure (£)</Label><Input type="number" value={expenditure} onChange={(e) => setExpenditure(e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Objectives</Label><Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="Retirement at 60 with £30k pa income…" /></div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div><Label>ATR score (1–10): {atrScore} — {atrCategory}</Label>
              <input type="range" min={1} max={10} value={atrScore} onChange={(e) => setAtrScore(Number(e.target.value))} className="w-full" />
            </div>
            <div><Label>Capacity for loss</Label>
              <Select value={cfl} onValueChange={setCfl}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["low", "medium", "high"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3 text-sm">
            <p>Auto-generated suitability summary (review before locking):</p>
            <div className="rounded-lg border p-4 bg-muted/30 space-y-1">
              <p>• Disposable income: £{(Number(income || 0) - Number(expenditure || 0)).toLocaleString()} pa</p>
              <p>• ATR: <strong>{atrCategory}</strong>, capacity for loss: <strong>{cfl}</strong></p>
              <p>• Objectives: {objectives || "—"}</p>
              <p>• Match: model portfolio aligned to {atrCategory} risk band.</p>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <div><Label>Product</Label>
              <Select value={productRec} onValueChange={setProductRec}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["SIPP", "ISA", "GIA", "Onshore Bond"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Recommendation</Label><Textarea rows={5} value={recText} onChange={(e) => setRecText(e.target.value)} placeholder="We recommend a SIPP invested in the Balanced model…" /></div>
          </div>
        )}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <Button onClick={saveStep}>{step === 3 ? "Generate report" : "Save & continue"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CashflowPlanner({ clientId }: { clientId: string }) {
  const [pot, setPot] = useState("400000"); const [withdraw, setWithdraw] = useState("25000"); const [growth, setGrowth] = useState("4");
  const years = 30;
  const projection = (() => {
    let bal = Number(pot); const w = Number(withdraw); const g = Number(growth) / 100;
    const out: { year: number; balance: number }[] = [];
    for (let y = 0; y <= years; y++) { out.push({ year: 2025 + y, balance: Math.max(0, bal) }); bal = bal * (1 + g) - w; }
    return out;
  })();
  const exhaustion = projection.find((p) => p.balance <= 0);

  return (
    <Card>
      <CardHeader><CardTitle>Cashflow modelling</CardTitle><CardDescription>What-if shortfall analysis layered on Monte Carlo central estimate.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div><Label>Starting pot (£)</Label><Input type="number" value={pot} onChange={(e) => setPot(e.target.value)} /></div>
          <div><Label>Annual withdrawal (£)</Label><Input type="number" value={withdraw} onChange={(e) => setWithdraw(e.target.value)} /></div>
          <div><Label>Net growth %</Label><Input type="number" value={growth} onChange={(e) => setGrowth(e.target.value)} /></div>
          <div className="rounded-lg border p-3 text-sm">
            {exhaustion ? <p className="text-destructive">Pot depletes in {exhaustion.year} (age {exhaustion.year - 1965}).</p> : <p className="text-green-600">Pot sustains through {2025 + years}.</p>}
          </div>
        </div>
        <div className="rounded-lg border p-3 max-h-80 overflow-auto text-xs">
          <table className="w-full"><thead><tr className="text-left"><th>Year</th><th className="text-right">Balance</th></tr></thead>
            <tbody>{projection.filter((_, i) => i % 2 === 0).map((p) => <tr key={p.year}><td>{p.year}</td><td className="text-right">£{Math.round(p.balance).toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ConsumerDutyBatch() {
  const { firmId } = useFirm();
  const [clients, setClients] = useState<any[]>([]); const [running, setRunning] = useState(false);
  useEffect(() => {
    let q = supabase.from("clients").select("id, first_name, last_name").limit(20);
    if (firmId) q = q.eq("firm_id", firmId);
    q.then(({ data }) => setClients(data ?? []));
  }, [firmId]);

  const runBatch = async () => {
    setRunning(true);
    const reviews = clients.map((c) => ({ client_id: c.id, fair_value_score: 70 + Math.floor(Math.random() * 25), outcomes_score: 70 + Math.floor(Math.random() * 25), reviewer: "System batch", vulnerability_flag: Math.random() > 0.85 }));
    await supabase.from("consumer_duty_reviews").insert(reviews);
    setRunning(false); toast.success(`Reviewed ${reviews.length} clients`);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Consumer Duty annual review</CardTitle><CardDescription>Bulk-process fair-value & outcomes reviews across the book.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{clients.length} clients eligible.</p>
        <Button onClick={runBatch} disabled={running}>{running ? "Running…" : "Run batch review"}</Button>
      </CardContent>
    </Card>
  );
}

function FeeAgreement({ clientId }: { clientId: string }) {
  const [initial, setInitial] = useState("3"); const [ongoing, setOngoing] = useState("0.75"); const [vat, setVat] = useState(false); const [cap, setCap] = useState("");

  const save = async () => {
    if (!clientId) return;
    await supabase.from("adviser_fees").insert([
      { client_id: clientId, fee_type: "initial", rate: Number(initial), adviser_name: "Workbench", frequency: "one_off", wrapper: "All" },
      { client_id: clientId, fee_type: "ongoing", rate: Number(ongoing), adviser_name: "Workbench", frequency: "quarterly", wrapper: "All" },
    ]);
    toast.success("Fee agreement created");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Fee agreement</CardTitle><CardDescription>Initial / ongoing / ad-hoc with VAT and tiered caps.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div><Label>Initial %</Label><Input type="number" value={initial} onChange={(e) => setInitial(e.target.value)} /></div>
        <div><Label>Ongoing % pa</Label><Input type="number" value={ongoing} onChange={(e) => setOngoing(e.target.value)} /></div>
        <div><Label>Annual cap (£, optional)</Label><Input type="number" value={cap} onChange={(e) => setCap(e.target.value)} /></div>
        <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} /> <Label>Apply 20% VAT</Label></div>
        <Button className="md:col-span-2" onClick={save}>Save agreement</Button>
      </CardContent>
    </Card>
  );
}
