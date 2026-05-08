import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Banknote, Building2, Repeat, Zap, ShieldCheck, CheckCircle2, Loader2, Clock,
  ArrowRight, RefreshCw, Sparkles, Send, Calendar,
} from "lucide-react";
import { useDraft, loadDraft } from "@/hooks/useDraft";
import { ResumeBanner, SavedIndicator } from "@/components/ResumeBanner";

const BANKS = [
  { id: "lloyds",   name: "Lloyds Bank", color: "bg-emerald-600" },
  { id: "barclays", name: "Barclays",    color: "bg-sky-600" },
  { id: "hsbc",     name: "HSBC",        color: "bg-red-600" },
  { id: "natwest",  name: "NatWest",     color: "bg-violet-600" },
  { id: "santander",name: "Santander",   color: "bg-rose-600" },
  { id: "monzo",    name: "Monzo",       color: "bg-orange-600" },
];

const DEMO_CLIENT = "a1111111-1111-1111-1111-111111111111";
const DRAFT_KEY = "cash_onboarding_draft_v1";

interface CashDraft {
  tab: string;
  pisp: { amount: string; reference: string };
  dd: { holder: string; sort: string; account: string; amount: string; frequency: string };
}

export default function CashOnboarding() {
  const draft = loadDraft<CashDraft>(DRAFT_KEY);
  const [resumeOpen, setResumeOpen] = useState(!!draft);
  const [tab, setTab] = useState<string>(draft?.tab ?? "aisp");
  const [bankConnections, setBankConnections] = useState<any[]>([]);
  const [mandates, setMandates] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [linkingBank, setLinkingBank] = useState<string | null>(null);
  const [linkStep, setLinkStep] = useState<"select" | "consent" | "auth" | "accounts" | "done">("select");
  const [pisp, setPisp] = useState(draft?.pisp ?? { amount: "5000", reference: "PENSION TOPUP" });
  const [pispRunning, setPispRunning] = useState(false);
  const [dd, setDd] = useState(draft?.dd ?? { holder: "Alex Morgan", sort: "30-12-34", account: "12345678", amount: "500", frequency: "monthly" });
  const [ddSigning, setDdSigning] = useState(false);

  const { savedAt, clear: clearDraft } = useDraft<CashDraft>(DRAFT_KEY, { tab, pisp, dd });

  const handleDiscard = () => {
    clearDraft();
    setPisp({ amount: "5000", reference: "PENSION TOPUP" });
    setDd({ holder: "Alex Morgan", sort: "30-12-34", account: "12345678", amount: "500", frequency: "monthly" });
    setTab("aisp");
    setResumeOpen(false);
    toast.info("Draft discarded");
  };


  const load = async () => {
    const [{ data: bc }, { data: m }, { data: p }] = await Promise.all([
      supabase.from("bank_connections").select("*").order("created_at", { ascending: false }),
      supabase.from("dd_mandates").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_initiations").select("*").order("initiated_at", { ascending: false }),
    ]);
    setBankConnections(bc || []); setMandates(m || []); setPayments(p || []);
  };
  useEffect(() => { load(); }, []);

  const linkBank = async (bankId: string) => {
    const bank = BANKS.find(b => b.id === bankId)!;
    setLinkingBank(bankId);
    setLinkStep("consent");
    await new Promise(r => setTimeout(r, 800));
    setLinkStep("auth");
    await new Promise(r => setTimeout(r, 1200));
    setLinkStep("accounts");
    await new Promise(r => setTimeout(r, 800));
    const accts = [
      { id: crypto.randomUUID(), name: "Main Current", sort_code: "30-12-34", account_number: `****${Math.floor(1000 + Math.random() * 9000)}`, balance: Math.floor(5000 + Math.random() * 50000), currency: "GBP" },
      { id: crypto.randomUUID(), name: "Savings",      sort_code: "30-12-34", account_number: `****${Math.floor(1000 + Math.random() * 9000)}`, balance: Math.floor(1000 + Math.random() * 30000), currency: "GBP" },
    ];
    await supabase.from("bank_connections").insert({
      client_id: DEMO_CLIENT, provider: "TrueLayer (mock)", bank_name: bank.name, status: "active",
      consent_expires_at: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      accounts: accts, last_synced_at: new Date().toISOString(),
    });
    setLinkStep("done");
    toast.success(`${bank.name} connected via Open Banking (mock)`);
    await new Promise(r => setTimeout(r, 600));
    setLinkingBank(null); setLinkStep("select");
    load();
  };

  const initiatePayment = async () => {
    setPispRunning(true);
    const ref = `TOPUP-MK-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const { data } = await supabase.from("payment_initiations").insert({
      client_id: DEMO_CLIENT, provider: "TrueLayer Pay (mock)",
      amount: parseFloat(pisp.amount), reference: ref, status: "initiated",
    }).select().single();
    toast.info("Redirecting to bank for SCA…");
    await new Promise(r => setTimeout(r, 1500));
    toast.info("Strong Customer Authentication complete");
    await new Promise(r => setTimeout(r, 800));
    await supabase.from("payment_initiations").update({ status: "settled", settled_at: new Date().toISOString() }).eq("id", data!.id);
    toast.success(`£${pisp.amount} settled — ref ${ref}`);
    setPispRunning(false); load();
  };

  const signMandate = async () => {
    setDdSigning(true);
    const ref = `AIRGD-DD-${Math.floor(Math.random() * 9000) + 1000}`;
    await new Promise(r => setTimeout(r, 800));
    toast.info("GoCardless Bacs verification…");
    await new Promise(r => setTimeout(r, 1200));
    await supabase.from("dd_mandates").insert({
      client_id: DEMO_CLIENT, provider: "GoCardless (mock)", scheme: "bacs", reference: ref,
      account_holder: dd.holder, sort_code: dd.sort, account_number: `****${dd.account.slice(-4)}`,
      bank_name: "Customer bank", status: "active", signed_at: new Date().toISOString(),
      next_collection: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      amount: parseFloat(dd.amount), frequency: dd.frequency,
    });
    toast.success(`Direct Debit mandate ${ref} signed (Bacs)`);
    setDdSigning(false); load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash onboarding"
        description="Fund your pension via Open Banking, Direct Debit or one-off payment. Mock integrations for TrueLayer and GoCardless."
      />

      <Tabs defaultValue="aisp">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="aisp"><Building2 className="w-4 h-4 mr-2" />Link bank</TabsTrigger>
          <TabsTrigger value="pisp"><Zap className="w-4 h-4 mr-2" />One-off pay</TabsTrigger>
          <TabsTrigger value="dd"><Repeat className="w-4 h-4 mr-2" />Direct Debit</TabsTrigger>
          <TabsTrigger value="status"><ShieldCheck className="w-4 h-4 mr-2" />Status</TabsTrigger>
        </TabsList>

        <TabsContent value="aisp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Open Banking (AISP) <Badge variant="outline" className="gap-1"><Sparkles className="w-3 h-3" />Mock</Badge></CardTitle>
              <CardDescription>Connect your bank for read-only account data. Powered by TrueLayer (mock). Consent valid for 90 days under PSD2.</CardDescription>
            </CardHeader>
            <CardContent>
              {!linkingBank ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BANKS.map(b => (
                    <button key={b.id} onClick={() => linkBank(b.id)} className="border rounded-lg p-4 hover:bg-muted/50 text-left transition">
                      <div className={`w-10 h-10 rounded-lg ${b.color} mb-2 flex items-center justify-center text-white font-bold`}>{b.name[0]}</div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">Tap to connect</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-w-md mx-auto p-6 border rounded-lg bg-muted/30 space-y-4">
                  <div className="text-center font-medium">Connecting to {BANKS.find(b => b.id === linkingBank)?.name}</div>
                  <Progress value={linkStep === "consent" ? 25 : linkStep === "auth" ? 60 : linkStep === "accounts" ? 85 : 100} className="h-2" />
                  <div className="space-y-1.5 text-sm">
                    {[
                      { k: "consent",  l: "Reviewing consent (PSD2 SCA)" },
                      { k: "auth",     l: "Redirected to bank · biometric auth" },
                      { k: "accounts", l: "Fetching accounts & balances" },
                      { k: "done",     l: "Complete" },
                    ].map(s => {
                      const order = ["consent","auth","accounts","done"];
                      const idx = order.indexOf(linkStep); const sIdx = order.indexOf(s.k);
                      return (
                        <div key={s.k} className="flex items-center gap-2">
                          {sIdx < idx ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                            sIdx === idx ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> :
                            <Clock className="w-4 h-4 text-muted-foreground" />}
                          <span className={sIdx <= idx ? "" : "text-muted-foreground"}>{s.l}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {bankConnections.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Linked banks</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {bankConnections.map(bc => (
                  <div key={bc.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4" />{bc.bank_name}</div>
                        <div className="text-xs text-muted-foreground">{bc.provider} · expires {new Date(bc.consent_expires_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={bc.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}>{bc.status}</Badge>
                        <Button size="sm" variant="ghost"><RefreshCw className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    {Array.isArray(bc.accounts) && (
                      <div className="mt-2 space-y-1">
                        {bc.accounts.map((a: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded px-2 py-1.5">
                            <span>{a.name} · {a.sort_code} {a.account_number}</span>
                            <span className="font-mono">£{Number(a.balance).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pisp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Single payment (PISP) <Badge variant="outline" className="gap-1"><Sparkles className="w-3 h-3" />Mock</Badge></CardTitle>
              <CardDescription>One-off Faster Payment initiated directly from your bank. Settles in seconds.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label>Amount (£)</Label><Input type="number" value={pisp.amount} onChange={e => setPisp({ ...pisp, amount: e.target.value })} /></div>
              <div><Label>Reference</Label><Input value={pisp.reference} onChange={e => setPisp({ ...pisp, reference: e.target.value })} /></div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={initiatePayment} disabled={pispRunning}>
                  {pispRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Initiating…</> : <>Pay now <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
          {payments.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Send className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">£{Number(p.amount).toLocaleString()} · {p.reference}</div>
                        <div className="text-xs text-muted-foreground">{p.provider} · {new Date(p.initiated_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <Badge className={p.status === "settled" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-blue-500/15 text-blue-700 dark:text-blue-400"}>{p.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Direct Debit mandate <Badge variant="outline" className="gap-1"><Sparkles className="w-3 h-3" />Mock</Badge></CardTitle>
              <CardDescription>Set up a Bacs Direct Debit via GoCardless (mock) for regular contributions. Includes the Direct Debit Guarantee.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Account holder</Label><Input value={dd.holder} onChange={e => setDd({ ...dd, holder: e.target.value })} /></div>
              <div><Label>Sort code</Label><Input value={dd.sort} onChange={e => setDd({ ...dd, sort: e.target.value })} placeholder="30-12-34" /></div>
              <div><Label>Account number</Label><Input value={dd.account} onChange={e => setDd({ ...dd, account: e.target.value })} placeholder="12345678" /></div>
              <div><Label>Amount (£)</Label><Input type="number" value={dd.amount} onChange={e => setDd({ ...dd, amount: e.target.value })} /></div>
              <div>
                <Label>Frequency</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3" value={dd.frequency} onChange={e => setDd({ ...dd, frequency: e.target.value })}>
                  <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option><option value="one_off">One-off</option>
                </select>
              </div>
              <div className="md:col-span-2 text-xs text-muted-foreground p-3 rounded-md bg-muted/50">
                By signing this mandate you authorise <strong>Airgead Pension Trustees</strong> to instruct your bank to pay Direct Debits in accordance with the Direct Debit Guarantee.
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={signMandate} disabled={ddSigning}>
                  {ddSigning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing…</> : <>Sign mandate <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {mandates.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Mandates</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {mandates.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Repeat className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{m.account_holder} · £{Number(m.amount).toLocaleString()} {m.frequency}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-3">
                          <span>{m.reference}</span>·<span>{m.sort_code} {m.account_number}</span>
                          {m.next_collection && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(m.next_collection).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge className={m.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}>{m.status.replace("_", " ")}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Integration status</CardTitle><CardDescription>All connections in this demo are mocked. Real production integrations would replace these endpoints.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "TrueLayer (Open Banking AISP)", status: "Mock", note: "Account information & consent flow" },
                { name: "TrueLayer Pay (PISP)",          status: "Mock", note: "One-off payment initiation" },
                { name: "GoCardless (Bacs DD)",          status: "Mock", note: "Direct Debit mandates & collections" },
                { name: "Onfido",                        status: "Mock", note: "Document & liveness checks" },
                { name: "ComplyAdvantage",               status: "Mock", note: "PEP / sanctions / adverse media" },
                { name: "GBG ID3global",                 status: "Mock", note: "Address verification" },
                { name: "ClearBank / Modulr (rails)",    status: "Mock", note: "Faster Payments client account" },
              ].map(i => (
                <div key={i.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium flex items-center gap-2"><Banknote className="w-4 h-4" />{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.note}</div>
                  </div>
                  <Badge variant="outline">{i.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
