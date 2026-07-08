import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Wallet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Entry {
  id: string;
  entry_date: string;
  description: string | null;
  amount: number;
  reference: string | null;
  status: string;
  matched_client_id: string | null;
}

const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const daysBetween = (a: string) => Math.floor((Date.now() - new Date(a).getTime()) / 86400000);

export default function UnallocatedCash() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bank_file_entries")
      .select("id, entry_date, description, amount, reference, status, matched_client_id")
      .in("status", ["unmatched", "suspense"])
      .order("entry_date", { ascending: false })
      .limit(500);
    setEntries((data as Entry[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    let credits = 0, debits = 0;
    for (const e of entries) {
      const a = Number(e.amount || 0);
      if (a >= 0) credits += a; else debits += a;
    }
    return { credits, debits, net: credits + debits, count: entries.length };
  }, [entries]);

  const suspense = async (id: string) => {
    await supabase.from("bank_file_entries").update({ status: "suspense" }).eq("id", id);
    toast({ title: "Moved to suspense", description: "Entry parked pending investigation." });
    load();
  };

  const stale = entries.filter((e) => daysBetween(e.entry_date) > 5).length;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Wallet className="h-7 w-7" /> Unallocated cash / suspense</h1>
        <p className="text-muted-foreground mt-1">Bank statement lines with no matched client. Must be cleared daily to keep CASS 7 records clean.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Items</div><div className="text-2xl font-semibold">{totals.count}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Credits</div><div className="text-2xl font-semibold">{gbp(totals.credits)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Debits</div><div className="text-2xl font-semibold">{gbp(totals.debits)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Net</div><div className={`text-2xl font-semibold ${totals.net < 0 ? "text-destructive" : ""}`}>{gbp(totals.net)}</div></CardContent></Card>
      </div>

      {stale > 0 && (
        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{stale} item(s) older than 5 days</AlertTitle><AlertDescription>Investigate and allocate promptly — persistent suspense balances risk a CASS breach.</AlertDescription></Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Suspense queue</CardTitle><CardDescription>Match to a client via CASS reconciliation, or park in suspense with a note.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Age</TableHead><TableHead>Description</TableHead><TableHead>Reference</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
              {!loading && entries.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No unallocated entries. Book is clean.</TableCell></TableRow>}
              {entries.map((e) => {
                const d = daysBetween(e.entry_date);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{e.entry_date}</TableCell>
                    <TableCell><Badge variant={d > 5 ? "destructive" : d > 2 ? "secondary" : "outline"}>{d}d</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{e.description || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{e.reference || "—"}</TableCell>
                    <TableCell className={`text-right font-medium ${Number(e.amount) < 0 ? "text-destructive" : ""}`}>{gbp(Number(e.amount || 0))}</TableCell>
                    <TableCell><Badge variant={e.status === "suspense" ? "secondary" : "outline"}>{e.status}</Badge></TableCell>
                    <TableCell>
                      {e.status !== "suspense" && <Button size="sm" variant="outline" onClick={() => suspense(e.id)}>Park</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
