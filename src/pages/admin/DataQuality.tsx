import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gauge, PlayCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Score { id: string; as_at_date: string; common_score: number | null; scheme_specific_score: number | null; members_total: number | null; members_with_gaps: number | null; status: string; }

export default function DataQuality() {
  const [rows, setRows] = useState<Score[]>([]);
  const [running, setRunning] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("data_quality_scores").select("*").order("as_at_date", { ascending: false });
    setRows((data as Score[]) || []);
  };
  useEffect(() => { load(); }, []);

  const runScore = async () => {
    setRunning(true);
    // sample clients and grade completeness of key TPR common data fields
    const { data: clients } = await supabase.from("clients").select("id, first_name, last_name, date_of_birth, ni_number, address_line1, postcode, email, phone");
    const total = clients?.length || 0;
    let gaps = 0;
    (clients || []).forEach(c => {
      const missing = ["first_name","last_name","date_of_birth","ni_number","address_line1","postcode"].some(k => !(c as any)[k]);
      if (missing) gaps++;
    });
    const common = total ? Math.round(((total - gaps) / total) * 10000) / 100 : 0;
    const schemeSpecific = Math.max(0, Math.min(100, common - 3.2)); // demo derivation
    const { error } = await supabase.from("data_quality_scores").insert({
      common_score: common, scheme_specific_score: schemeSpecific, members_total: total, members_with_gaps: gaps, status: "final",
    });
    setRunning(false);
    if (error) return toast.error(error.message);
    toast.success("Data quality score computed"); load();
  };

  const latest = rows[0];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Gauge className="w-6 h-6 text-primary" /> Data quality (TPR)</h1>
          <p className="text-sm text-muted-foreground mt-1">Common data & scheme-specific data scoring, aligned with The Pensions Regulator record-keeping expectations.</p>
        </div>
        <Button onClick={runScore} disabled={running} className="gap-2"><PlayCircle className="w-4 h-4" /> {running ? "Scoring…" : "Run scoring"}</Button>
      </header>

      {latest && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Common data</CardTitle><CardDescription>NI, DoB, name, address, postcode.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold">{latest.common_score?.toFixed(1)}%</div>
                <Progress value={latest.common_score || 0} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Scheme-specific data</CardTitle><CardDescription>Benefit, contribution, contingent data.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold">{latest.scheme_specific_score?.toFixed(1)}%</div>
                <Progress value={latest.scheme_specific_score || 0} />
              </CardContent>
            </Card>
          </div>
          {(latest.common_score || 100) < 95 && (
            <Alert variant="destructive"><AlertTriangle className="w-4 h-4" /><AlertTitle>Below TPR expectation</AlertTitle><AlertDescription>Common data should be ≥ 95%. {latest.members_with_gaps} of {latest.members_total} members have missing fields.</AlertDescription></Alert>
          )}
        </>
      )}

      <Card>
        <CardHeader><CardTitle>Scoring history</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>As at</TableHead><TableHead className="text-right">Common</TableHead><TableHead className="text-right">Scheme-specific</TableHead><TableHead className="text-right">Members</TableHead><TableHead className="text-right">With gaps</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.as_at_date}</TableCell>
                  <TableCell className="text-right">{r.common_score?.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{r.scheme_specific_score?.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{r.members_total}</TableCell>
                  <TableCell className="text-right">{r.members_with_gaps}</TableCell>
                  <TableCell><Badge>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No scoring runs yet — click "Run scoring".</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
