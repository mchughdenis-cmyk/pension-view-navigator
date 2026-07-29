import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/adminExportUtils";
import { ShieldCheck, FileDown, AlertTriangle, CheckCircle2 } from "lucide-react";

type Row = { account_code: string; account_name: string; account_type: string | null; balance: number };

const CLIENT_MONEY_TYPES = ["client_money", "cash", "bank"];

export default function CassDailyRecon() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bankBalance, setBankBalance] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("trial_balance")
      .select("account_code, account_name, account_type, balance")
      .in("account_type", CLIENT_MONEY_TYPES)
      .limit(500);
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows(((data ?? []) as any[]).map((r) => ({
      account_code: r.account_code ?? "",
      account_name: r.account_name ?? "",
      account_type: r.account_type,
      balance: Number(r.balance ?? 0),
    })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const ledgerTotal = useMemo(() => rows.reduce((s, r) => s + r.balance, 0), [rows]);
  const bankTotal = Number(bankBalance) || 0;
  const difference = bankTotal - ledgerTotal;
  const status: "match" | "break" | "empty" =
    bankBalance === "" ? "empty" : Math.abs(difference) < 0.01 ? "match" : "break";

  const exportCsv = () => {
    downloadCSV(
      `cass7-daily-recon-${date}`,
      ["Account code", "Account name", "Account type", "Balance (£)"],
      rows.map((r) => [r.account_code, r.account_name, r.account_type ?? "", r.balance.toFixed(2)]),
    );
  };

  const signOff = async () => {
    if (status !== "match") return toast({ title: "Cannot sign off with breaks", variant: "destructive" });
    toast({ title: "CASS 7 reconciliation signed off", description: `Balanced at £${ledgerTotal.toFixed(2)} on ${date}` });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> CASS 7 daily reconciliation</h1>
          <p className="text-sm text-muted-foreground">Client-money bank balance vs client-money ledger. Any shortfall must be corrected same-day per CASS 7.15.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><FileDown className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button onClick={signOff} disabled={status !== "match"}>Sign off</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Recon date</CardTitle></CardHeader>
          <CardContent><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Bank balance (£)</CardTitle></CardHeader>
          <CardContent>
            <Input type="number" step="0.01" value={bankBalance} onChange={(e) => setBankBalance(e.target.value)} placeholder="Cleared balance" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Ledger total (£)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold tabular-nums">£{ledgerTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></CardContent>
        </Card>
        <Card className={status === "match" ? "border-emerald-500/60" : status === "break" ? "border-destructive/60" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground flex items-center gap-1">
              {status === "match" ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> :
                status === "break" ? <AlertTriangle className="h-3 w-3 text-destructive" /> : null}
              Break / surplus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">£{difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <Badge variant={status === "match" ? "default" : status === "break" ? "destructive" : "outline"} className="mt-1">
              {status === "match" ? "In balance" : status === "break" ? "Break — investigate" : "Enter bank"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Client-money ledger accounts</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.account_code}>
                    <TableCell className="font-mono text-xs">{r.account_code}</TableCell>
                    <TableCell>{r.account_name}</TableCell>
                    <TableCell><Badge variant="outline">{r.account_type || "—"}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">£{r.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No client-money accounts. Add ledger accounts with account_type "client_money", "cash" or "bank".</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
