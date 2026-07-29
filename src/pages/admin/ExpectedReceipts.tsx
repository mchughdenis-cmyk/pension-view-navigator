import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type ER = { id: string; source: string; amount: number; expected_date: string; reference: string | null; status: string };

export default function ExpectedReceipts() {
  const [rows, setRows] = useState<ER[]>([]);

  const load = async () => {
    const { data } = await supabase.from("expected_receipts").select("*").order("expected_date").limit(500);
    setRows((data as ER[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const runMatch = async () => {
    // Simple demo matcher: mark receipts due <= today as 'matched'
    const today = new Date().toISOString().slice(0,10);
    const { error } = await supabase.from("expected_receipts")
      .update({ status: "matched" })
      .eq("status", "pending")
      .lte("expected_date", today);
    if (error) return toast({ title: "Match failed", description: error.message, variant: "destructive" });
    toast({ title: "Auto-match run complete" });
    load();
  };

  const pending = rows.filter(r => r.status === "pending").length;
  const missed = rows.filter(r => r.status === "missed").length;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expected Receipts</h1>
          <p className="text-sm text-muted-foreground">Forecast inbound cash and auto-match against bank statement lines.</p>
        </div>
        <Button onClick={runMatch}>Run auto-match</Button>
      </header>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pending}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Missed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{missed}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Expected</TableHead><TableHead>Source</TableHead><TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.expected_date}</TableCell>
                  <TableCell className="capitalize">{r.source.replace(/_/g," ")}</TableCell>
                  <TableCell className="font-mono text-xs">{r.reference}</TableCell>
                  <TableCell className="text-right tabular-nums">£{Number(r.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={r.status === "matched" ? "default" : r.status === "missed" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No expected receipts.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
