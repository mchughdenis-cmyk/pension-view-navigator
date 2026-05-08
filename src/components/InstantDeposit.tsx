import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useClients, useClientDetail } from "@/hooks/useClientData";
import { ANNUAL_ALLOWANCE, MPAA_ALLOWANCE, formatGBP } from "@/lib/pensionCalculations";
import { supabase } from "@/integrations/supabase/client";
import {
  Banknote, Building2, Clock, CheckCircle2, Shield, ArrowRight, Eye, EyeOff, PiggyBank
} from "lucide-react";

import { DEMO_BANK_ACCOUNTS, type DemoBankAccount } from "@/lib/demoBankAccounts";

type SourceAccount = DemoBankAccount;
const initialSources: SourceAccount[] = DEMO_BANK_ACCOUNTS;

const reliefMethods = [
  { value: "ras", label: "Relief at Source (basic)", rate: 0.20, hint: "Net member contribution; HMRC adds 20% basic-rate uplift directly to your pot." },
  { value: "ras_higher", label: "Relief at Source + higher-rate", rate: 0.40, hint: "20% added to pot; reclaim further 20% via Self-Assessment." },
  { value: "net_pay", label: "Net Pay (employer scheme)", rate: 0.20, hint: "Contribution deducted from gross salary — full marginal-rate relief at source." },
  { value: "employer", label: "Employer contribution", rate: 0, hint: "No personal relief; counts towards £60k Annual Allowance." },
];

export default function InstantDeposit() {
  const { toast } = useToast();
  const { clients } = useClients();
  const [clientId, setClientId] = useState<string | undefined>();
  useEffect(() => { if (!clientId && clients.length) setClientId(clients[0].id); }, [clients, clientId]);
  const { client, accounts, fetchAll } = useClientDetail(clientId);

  const sipp = accounts.find(a => a.account_type?.toLowerCase().includes("sipp"));
  const sippValue = Number(sipp?.total_value || 0);

  const [amount, setAmount] = useState("");
  const [reliefKey, setReliefKey] = useState("ras");
  const [sourceId, setSourceId] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sources, setSources] = useState<SourceAccount[]>(initialSources);
  const [showAdd, setShowAdd] = useState(false);
  const [newSource, setNewSource] = useState({ accountName: "", accountNumber: "", sortCode: "", bankName: "" });

  const relief = reliefMethods.find(r => r.value === reliefKey)!;
  const grossN = Math.max(0, parseFloat(amount) || 0);

  // Live calc
  const calc = useMemo(() => {
    const gross = grossN;
    if (reliefKey === "ras") {
      const net = gross; // member pays net, HMRC adds 25% (which is 20/80) of net
      const taxRelief = net * 0.25; // £80 net -> £20 relief = 25% of net
      return { net, gross: net + taxRelief, taxRelief, additionalRelief: 0, netCost: net };
    }
    if (reliefKey === "ras_higher") {
      const net = gross;
      const basicRelief = net * 0.25;
      const grossPot = net + basicRelief;
      const additional = grossPot * 0.20; // reclaim via SA
      return { net, gross: grossPot, taxRelief: basicRelief, additionalRelief: additional, netCost: net - additional };
    }
    if (reliefKey === "net_pay") {
      const taxSaved = gross * 0.40;
      return { net: gross, gross, taxRelief: taxSaved, additionalRelief: 0, netCost: gross - taxSaved };
    }
    return { net: gross, gross, taxRelief: 0, additionalRelief: 0, netCost: 0 };
  }, [grossN, reliefKey]);

  const aaCap = client?.mpaa_triggered ? MPAA_ALLOWANCE : ANNUAL_ALLOWANCE;
  const aaUsed = Number(client?.annual_allowance_used || 0);
  const aaRemaining = Math.max(0, aaCap - aaUsed);
  const exceedsAA = calc.gross > aaRemaining;

  const source = sources.find(s => s.id === sourceId);
  const insufficient = source && calc.netCost > source.balance;

  const mask = (s: string, keep = 4) => showDetails ? s : "•".repeat(Math.max(0, s.length - keep)) + s.slice(-keep);

  const handleAddSource = () => {
    if (!newSource.accountName || !newSource.accountNumber || !newSource.sortCode || !newSource.bankName) {
      toast({ title: "Missing details", description: "Fill all fields", variant: "destructive" });
      return;
    }
    setSources([...sources, { id: Date.now().toString(), ...newSource, isDefault: false, balance: 5000 }]);
    setNewSource({ accountName: "", accountNumber: "", sortCode: "", bankName: "" });
    setShowAdd(false);
    toast({ title: "Bank linked", description: "Account added via Open Banking (mock)." });
  };

  const handleDeposit = async () => {
    if (!grossN) return toast({ title: "Enter amount", variant: "destructive" });
    if (!source) return toast({ title: "Select source bank", variant: "destructive" });
    if (insufficient) return toast({ title: "Insufficient funds", variant: "destructive" });
    if (!clientId || !sipp) return toast({ title: "No SIPP", variant: "destructive" });

    setIsProcessing(true);
    const contributionType = reliefKey === "employer" ? "employer" : "member";
    const { error } = await supabase.from("contributions").insert({
      client_id: clientId,
      account_id: sipp.id,
      contribution_type: contributionType,
      gross_amount: calc.gross,
      net_amount: calc.net,
      tax_relief: calc.taxRelief,
      relief_method: reliefKey === "net_pay" ? "net_pay" : reliefKey === "employer" ? "employer" : "ras",
      tax_year: "2024/25",
      status: "received",
      reference: `DEP-${Date.now()}`,
      notes: `From ${source.bankName} ${mask(source.accountNumber)} via Open Banking`,
    } as any);

    if (!error) {
      // record cash transaction
      await supabase.from("transactions").insert({
        client_id: clientId,
        account_id: sipp.id,
        transaction_type: "contribution",
        amount: calc.gross,
        description: `Contribution from ${source.bankName} (${reliefKey})`,
        reference: `DEP-${Date.now()}`,
        status: "settled",
        effective_date: new Date().toISOString().slice(0, 10),
        tax_year: "2024/25",
        tax_relief_amount: calc.taxRelief,
      } as any);
    }

    setIsProcessing(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setSources(s => s.map(x => x.id === source.id ? { ...x, balance: x.balance - calc.netCost } : x));
      setAmount("");
      await fetchAll();
      toast({
        title: "Deposit successful",
        description: `${formatGBP(calc.gross)} added to your SIPP (incl. ${formatGBP(calc.taxRelief)} tax relief).`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton />
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Add Money to Your Pension</h1>
          <p className="text-muted-foreground">Open Banking transfer with live tax-relief calculation</p>
        </div>

        {clients.length > 1 && (
          <Card>
            <CardContent className="pt-6">
              <Label>Acting for client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PiggyBank className="w-5 h-5" /> Your SIPP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{formatGBP(sippValue)}</div>
            <p className="text-sm text-muted-foreground mt-1">{sipp?.account_number ?? "SIPP account"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contribution details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>You pay (£)</Label>
              <Input type="number" placeholder="500" value={amount} onChange={e => setAmount(e.target.value)} min={0} />
              <p className="text-xs text-muted-foreground">Annual Allowance remaining: {formatGBP(aaRemaining)}{client?.mpaa_triggered && <Badge variant="destructive" className="ml-2">MPAA active</Badge>}</p>
            </div>

            <div className="space-y-2">
              <Label>Tax relief method</Label>
              <Select value={reliefKey} onValueChange={setReliefKey}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{reliefMethods.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{relief.hint}</p>
            </div>

            {grossN > 0 && (
              <div className="rounded-lg border p-4 bg-muted/40 space-y-2">
                <div className="flex justify-between text-sm"><span>You pay (net)</span><span className="font-medium">{formatGBP(calc.net)}</span></div>
                {calc.taxRelief > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">+ Tax relief ({reliefKey === "net_pay" ? "marginal" : "basic 20%"})</span><span className="text-green-600 font-medium">+{formatGBP(calc.taxRelief)}</span></div>
                )}
                {calc.additionalRelief > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">+ Higher-rate reclaim (Self-Assessment)</span><span className="text-green-600 font-medium">+{formatGBP(calc.additionalRelief)}</span></div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold"><span>Total into SIPP</span><span>{formatGBP(calc.gross)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Effective net cost</span><span className="font-medium">{formatGBP(calc.netCost)}</span></div>
                {exceedsAA && <p className="text-xs text-destructive">⚠ Exceeds remaining Annual Allowance — consider carry-forward.</p>}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pay from</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{showDetails ? "Hide" : "Show"} details
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(true)}>+ Link bank</Button>
                </div>
              </div>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger><SelectValue placeholder="Choose source bank account" /></SelectTrigger>
                <SelectContent>
                  {sources.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{s.accountName} · {s.bankName}</span>
                        <span className="text-xs text-muted-foreground">{mask(s.sortCode, 2)} · {mask(s.accountNumber)} · Bal {formatGBP(s.balance)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {insufficient && <p className="text-xs text-destructive">Insufficient balance in selected account.</p>}
            </div>

            {showAdd && (
              <Card className="bg-muted">
                <CardHeader><CardTitle className="text-lg">Link a bank (Open Banking)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Account name</Label><Input value={newSource.accountName} onChange={e => setNewSource({ ...newSource, accountName: e.target.value })} /></div>
                    <div><Label>Bank</Label><Input value={newSource.bankName} onChange={e => setNewSource({ ...newSource, bankName: e.target.value })} /></div>
                    <div><Label>Account no.</Label><Input value={newSource.accountNumber} onChange={e => setNewSource({ ...newSource, accountNumber: e.target.value })} /></div>
                    <div><Label>Sort code</Label><Input value={newSource.sortCode} onChange={e => setNewSource({ ...newSource, sortCode: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2"><Button onClick={handleAddSource}>Link account</Button><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button></div>
                </CardContent>
              </Card>
            )}

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">FCA-regulated transfer</h4>
                <p className="text-sm text-muted-foreground">Funds debit your bank instantly via Faster Payments. Tax relief from HMRC arrives in 6–11 weeks (RAS).</p>
              </div>
            </div>

            <Button className="w-full" disabled={isProcessing || !grossN || !sourceId || exceedsAA || insufficient} onClick={handleDeposit}>
              {isProcessing ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Processing…</> : <><ArrowRight className="w-4 h-4 mr-2" />Pay {formatGBP(calc.netCost || calc.net)} now</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
