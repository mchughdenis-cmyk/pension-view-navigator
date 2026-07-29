import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

type TB = { account_id: string; account_code: string; account_name: string; account_type: string; total_debit: number; total_credit: number; balance: number };
type Entry = { id: string; value_date: string; debit: number; credit: number; narrative: string | null; account_id: string; source_type: string | null };

export default function GeneralLedger() {
  const [tb, setTb] = useState<TB[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const [tbr, er] = await Promise.all([
      supabase.from("trial_balance").select("*").order("account_code"),
      supabase.from("ledger_entries").select("*").order("value_date", { ascending: false }).limit(200),
    ]);
    setTb((tbr.data as TB[]) ?? []);
    setEntries((er.data as Entry[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const seed = async () => {
    // Seed a minimal chart of accounts + a demo posting
    const accs = [
      { account_code: "1000", account_name: "Client bank (trustee)", account_type: "client_money" },
      { account_code: "1001", account_name: "Firm bank", account_type: "firm_money" },
      { account_code: "2000", account_name: "Suspense (unallocated)", account_type: "suspense" },
      { account_code: "3000", account_name: "Contributions received", account_type: "income" },
      { account_code: "4000", account_name: "Benefit payments", account_type: "expense" },
      { account_code: "5000", account_name: "Adviser fee income", account_type: "income" },
    ];
    for (const a of accs) {
      await supabase.from("ledger_accounts").upsert(a, { onConflict: "tenant_id,account_code" });
    }
    toast({ title: "Chart of accounts seeded" });
    load();
  };

  const totalDebit = tb.reduce((s, r) => s + Number(r.total_debit), 0);
  const totalCredit = tb.reduce((s, r) => s + Number(r.total_credit), 0);
  const inBalance = Math.abs(totalDebit - totalCredit) < 0.01;

  const filtered = tb.filter(r =>
    !q || r.account_code.includes(q) || r.account_name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">General Ledger</h1>
          <p className="text-sm text-muted-foreground">Double-entry postings, trial balance, and CASS client-money separation.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seed}><Plus className="h-4 w-4 mr-2" />Seed chart of accounts</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Accounts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tb.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total debit / credit</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">£{totalDebit.toLocaleString()} / £{totalCredit.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Trial balance</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={inBalance ? "default" : "destructive"}>{inBalance ? "In balance" : "Out of balance"}</Badge>
          </CardContent></Card>
      </div>

      <Tabs defaultValue="tb">
        <TabsList>
          <TabsTrigger value="tb">Trial balance</TabsTrigger>
          <TabsTrigger value="entries">Recent entries</TabsTrigger>
        </TabsList>
        <TabsContent value="tb">
          <Card>
            <CardHeader>
              <Input placeholder="Filter by code or name…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Code</TableHead><TableHead>Account</TableHead><TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.account_id}>
                      <TableCell className="font-mono">{r.account_code}</TableCell>
                      <TableCell>{r.account_name}</TableCell>
                      <TableCell className="capitalize text-xs">{r.account_type.replace(/_/g," ")}</TableCell>
                      <TableCell className="text-right tabular-nums">£{Number(r.total_debit).toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">£{Number(r.total_credit).toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">£{Number(r.balance).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      No accounts yet — click "Seed chart of accounts" to start.
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="entries">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Value date</TableHead><TableHead>Narrative</TableHead>
                  <TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {entries.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>{e.value_date}</TableCell>
                      <TableCell>{e.narrative || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{e.debit ? `£${Number(e.debit).toLocaleString()}` : ""}</TableCell>
                      <TableCell className="text-right tabular-nums">{e.credit ? `£${Number(e.credit).toLocaleString()}` : ""}</TableCell>
                      <TableCell className="text-xs">{e.source_type || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {entries.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No postings yet.
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
