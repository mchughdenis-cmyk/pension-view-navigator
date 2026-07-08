import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Mail, Clock, PoundSterling } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Row {
  id: string;
  client_id: string;
  contribution_type: string;
  net_amount: number;
  gross_amount: number;
  effective_date: string;
  reference: string | null;
  status: string;
  payroll_run_id: string | null;
}

const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const daysBetween = (a: string) => Math.floor((Date.now() - new Date(a).getTime()) / 86400000);

export default function ContributionChaser() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contributions")
      .select("id, client_id, contribution_type, net_amount, gross_amount, effective_date, reference, status, payroll_run_id")
      .in("status", ["expected", "overdue"])
      .lt("effective_date", new Date().toISOString().slice(0, 10))
      .order("effective_date", { ascending: true })
      .limit(500);
    setRows((data as Row[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const buckets = useMemo(() => {
    const out = { under30: 0, over30: 0, over90: 0, total: 0 };
    for (const r of rows) {
      const days = daysBetween(r.effective_date);
      out.total += Number(r.net_amount || 0);
      if (days >= 90) out.over90 += Number(r.net_amount || 0);
      else if (days >= 30) out.over30 += Number(r.net_amount || 0);
      else out.under30 += Number(r.net_amount || 0);
    }
    return out;
  }, [rows]);

  const chase = async (r: Row) => {
    await supabase.from("contributions").update({ status: "overdue", notes: `Chased ${new Date().toISOString().slice(0, 10)}` }).eq("id", r.id);
    toast({ title: "Chase logged", description: `Contribution ${r.reference || r.id.slice(0, 8)} marked overdue and chase recorded.` });
    load();
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Clock className="h-7 w-7" /> Contribution schedule chaser</h1>
        <p className="text-muted-foreground mt-1">Expected contributions past their effective date. TPR requires reporting late payments materially outstanding after 90 days.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Total overdue</div><div className="text-2xl font-semibold">{gbp(buckets.total)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Under 30 days</div><div className="text-2xl font-semibold">{gbp(buckets.under30)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">30–89 days</div><div className="text-2xl font-semibold text-amber-600">{gbp(buckets.over30)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">90+ days (TPR reportable)</div><div className="text-2xl font-semibold text-destructive">{gbp(buckets.over90)}</div></CardContent></Card>
      </div>

      {buckets.over90 > 0 && (
        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>TPR reportable exposure</AlertTitle><AlertDescription>{gbp(buckets.over90)} of contributions are more than 90 days overdue and may be materially significant to The Pensions Regulator.</AlertDescription></Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Overdue schedule</CardTitle><CardDescription>{rows.length} row(s) awaiting cash.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Effective</TableHead><TableHead>Age</TableHead><TableHead>Reference</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
              {!loading && rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No overdue contributions.</TableCell></TableRow>}
              {rows.map((r) => {
                const d = daysBetween(r.effective_date);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{r.effective_date}</TableCell>
                    <TableCell><Badge variant={d >= 90 ? "destructive" : d >= 30 ? "secondary" : "outline"}>{d}d</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{r.reference || r.id.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline">{r.contribution_type}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{gbp(Number(r.net_amount || 0))}</TableCell>
                    <TableCell><Badge variant={r.status === "overdue" ? "destructive" : "outline"}>{r.status}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => chase(r)}><Mail className="h-3 w-3 mr-1" /> Chase</Button></TableCell>
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
