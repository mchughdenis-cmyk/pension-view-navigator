import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useClients, useClientDetail, processDrawdown } from "@/hooks/useClientData";
import { calculateUFPLS, formatGBP } from "@/lib/pensionCalculations";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_BANK_ACCOUNTS, maskAccount } from "@/lib/demoBankAccounts";
import { Banknote, Clock, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function InstantWithdrawal() {
  const { toast } = useToast();
  const { clients } = useClients();
  const [clientId, setClientId] = useState<string | undefined>();
  useEffect(() => { if (!clientId && clients.length) setClientId(clients[0].id); }, [clients, clientId]);
  const { client, accounts, fetchAll } = useClientDetail(clientId);
  const sipp = accounts.find(a => a.account_type?.toLowerCase().includes("sipp"));
  const availableBalance = Number(sipp?.total_value || 0);

  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [otherIncome, setOtherIncome] = useState(11500);
  const [selectedAccount, setSelectedAccount] = useState<string>(DEMO_BANK_ACCOUNTS[0].id);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const ufpls = useMemo(
    () => calculateUFPLS(parseFloat(withdrawalAmount) || 0, otherIncome),
    [withdrawalAmount, otherIncome]
  );

  // Emergency Month-1 PAYE estimate: 1/12th of allowances applied to first payment
  const emergencyTax = useMemo(() => {
    const tax = parseFloat(withdrawalAmount) || 0;
    if (tax <= 0) return 0;
    const monthlyPA = 12570 / 12;
    const monthlyBasic = 37700 / 12;
    const taxable = Math.max(0, ufpls.taxablePortion - monthlyPA);
    const inBasic = Math.min(taxable, monthlyBasic);
    const inHigher = Math.min(Math.max(0, taxable - monthlyBasic), 87440 / 12);
    const inAdd = Math.max(0, taxable - monthlyBasic - 87440 / 12);
    return inBasic * 0.20 + inHigher * 0.40 + inAdd * 0.45;
  }, [ufpls.taxablePortion, withdrawalAmount]);

  const loadHistory = async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("client_id", clientId)
      .in("transaction_type", ["pcls", "ufpls_taxable", "drawdown", "tax_withheld"])
      .order("effective_date", { ascending: false })
      .limit(8);
    setHistory(data || []);
  };
  useEffect(() => { loadHistory(); }, [clientId]);

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    const account = DEMO_BANK_ACCOUNTS.find(a => a.id === selectedAccount);
    if (!amount || amount <= 0) return toast({ title: "Invalid amount", variant: "destructive" });
    if (amount > availableBalance) return toast({ title: "Insufficient funds", variant: "destructive" });
    if (!account) return toast({ title: "Select bank", variant: "destructive" });
    if (!clientId || !sipp) return toast({ title: "No SIPP", variant: "destructive" });

    setIsProcessing(true);
    const result = await processDrawdown({
      clientId, accountId: sipp.id,
      mode: "UFPLS", potValue: availableBalance, ufplsGross: amount, otherIncome,
      notes: `UFPLS to ${account.bankName} ${maskAccount(account.accountNumber, false)}`,
    });

    // Record explicit bank transfer leg for traceability
    if (result) {
      const netToBank = result.pclsAmount + result.net;
      await supabase.from("transactions").insert({
        client_id: clientId,
        account_id: sipp.id,
        transaction_type: "bank_transfer",
        amount: -netToBank,
        description: `Net payment to ${account.bankName} ${maskAccount(account.accountNumber, false)}`,
        reference: `BANK-${Date.now()}`,
        status: "settled",
        effective_date: new Date().toISOString().slice(0, 10),
        notes: `Sort ${account.sortCode}, A/C ${account.accountNumber}`,
      } as any);
    }

    setIsProcessing(false);
    if (result) {
      setWithdrawalAmount("");
      await fetchAll();
      await loadHistory();
      toast({
        title: "Withdrawal processed",
        description: `${formatGBP(result.pclsAmount + result.net)} to ${account.bankName} (after PAYE ${formatGBP(result.tax)}).`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton />
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Instant Withdrawal</h1>
          <p className="text-muted-foreground">UFPLS to your linked bank with realtime PAYE breakdown</p>
        </div>

        {clients.length > 1 && (
          <Card><CardContent className="pt-6">
            <Label>Acting for client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent></Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Available pension balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{formatGBP(availableBalance)}</div>
            <p className="text-sm text-muted-foreground mt-1">SIPP {sipp?.account_number ?? ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Request UFPLS withdrawal</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gross amount (£)</Label>
                <Input type="number" placeholder="10000" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} min={0} max={availableBalance} />
                <p className="text-xs text-muted-foreground">Max: {formatGBP(availableBalance)}</p>
              </div>
              <div className="space-y-2">
                <Label>Other taxable income this year (£)</Label>
                <Input type="number" value={otherIncome} onChange={e => setOtherIncome(Number(e.target.value) || 0)} />
                <p className="text-xs text-muted-foreground">Used for marginal-rate PAYE estimate.</p>
              </div>
            </div>

            {parseFloat(withdrawalAmount) > 0 && (
              <div className="rounded-lg border p-4 bg-muted/40 space-y-2 text-sm">
                <div className="flex justify-between"><span className="font-medium">Tax-free 25% (PCLS)</span><span className="text-green-600 font-semibold">+{formatGBP(ufpls.taxFreePortion)}</span></div>
                <div className="flex justify-between"><span className="font-medium">Taxable 75%</span><span>{formatGBP(ufpls.taxablePortion)}</span></div>
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground uppercase tracking-wide">PAYE breakdown — annualised</div>
                <div className="flex justify-between"><span>Personal Allowance used</span><span>{formatGBP(ufpls.tax.personalAllowance)}</span></div>
                <div className="flex justify-between"><span>Basic rate (20%)</span><span>−{formatGBP(ufpls.tax.basicRateTax)}</span></div>
                <div className="flex justify-between"><span>Higher rate (40%)</span><span>−{formatGBP(ufpls.tax.higherRateTax)}</span></div>
                <div className="flex justify-between"><span>Additional rate (45%)</span><span>−{formatGBP(ufpls.tax.additionalRateTax)}</span></div>
                <div className="flex justify-between border-t pt-1"><span className="font-semibold">Total PAYE (annualised)</span><span className="text-destructive font-semibold">−{formatGBP(ufpls.tax.totalTax)}</span></div>
                <div className="flex justify-between text-xs"><span>HMRC Month-1 emergency tax (estimated first payment)</span><span className="text-amber-600">−{formatGBP(emergencyTax)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base"><span className="font-semibold">Net to your bank</span><span className="font-semibold">{formatGBP(ufpls.netPayment)}</span></div>
                <p className="text-xs text-muted-foreground">UFPLS triggers MPAA — future contributions capped at £10,000 p.a.</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pay to bank</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAccountNumbers(!showAccountNumbers)}>
                  {showAccountNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{showAccountNumbers ? "Hide" : "Show"} details
                </Button>
              </div>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEMO_BANK_ACCOUNTS.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{a.accountName} · {a.bankName}</span>
                        <span className="text-xs text-muted-foreground">{maskAccount(a.sortCode, showAccountNumbers, 2)} · {maskAccount(a.accountNumber, showAccountNumbers)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Faster Payments mock</h4>
                <p className="text-sm text-muted-foreground">Net amount lands in your bank within 1–2 working days. PAYE is remitted to HMRC under your scheme reference.</p>
              </div>
            </div>

            <Button className="w-full" disabled={isProcessing || !withdrawalAmount} onClick={handleWithdrawal}>
              {isProcessing ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Processing…</> : <><ArrowRight className="w-4 h-4 mr-2" />Withdraw {formatGBP(ufpls.netPayment)} to {DEMO_BANK_ACCOUNTS.find(a => a.id === selectedAccount)?.bankName}</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent pension cash-out activity</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No withdrawal activity yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{h.description}</p>
                      <p className="text-xs text-muted-foreground">{h.reference} · {h.effective_date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${Number(h.amount) < 0 ? "text-destructive" : "text-green-600"}`}>{formatGBP(Math.abs(Number(h.amount)))}</p>
                      <Badge variant="secondary" className="text-xs">{h.transaction_type.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
