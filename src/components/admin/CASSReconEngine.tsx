import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import { Play, FileSignature, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

type Recon = {
  id: string;
  recon_date: string;
  ledger_balance: number | null;
  bank_balance: number | null;
  custody_balance: number | null;
  variance: number | null;
  status: string | null;
  signed_off_at: string | null;
  signed_off_by: string | null;
  resolution_notes: string | null;
  firm_id: string | null;
};

type Breach = {
  id: string;
  recon_id: string;
  breach_type: string;
  severity: string;
  amount: number | null;
  description: string | null;
  status: string;
};

const gbp = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n));

export default function CASSReconEngine() {
  const { firmId, firm } = useFirm();
  const [runs, setRuns] = useState<Recon[]>([]);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [reconDate, setReconDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<Recon | null>(null);
  const [signOffName, setSignOffName] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: r } = await supabase
      .from("cass_reconciliations")
      .select("*")
      .order("recon_date", { ascending: false })
      .limit(50);
    setRuns((r ?? []) as Recon[]);
    const { data: b } = await supabase
      .from("cass_breaches")
      .select("*")
      .order("breach_date", { ascending: false })
      .limit(50);
    setBreaches((b ?? []) as Breach[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runEngine = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("cass-recon-run", {
        body: { firm_id: firmId, recon_date: reconDate },
      });
      if (error) throw error;
      toast.success(
        data?.recon?.status === "reconciled"
          ? "Reconciled — no breaks detected"
          : `Break detected · variance ${gbp(data?.recon?.variance)}`,
      );
      await load();
      setSelected(data?.recon ?? null);
    } catch (e: any) {
      toast.error(e.message ?? "Recon failed");
    } finally {
      setRunning(false);
    }
  };

  const signOff = async () => {
    if (!selected || !signOffName.trim()) {
      toast.error("Enter your name to sign off");
      return;
    }
    const { error } = await supabase
      .from("cass_reconciliations")
      .update({
        signed_off_at: new Date().toISOString(),
        signed_off_by: signOffName.trim(),
        reviewed_by: signOffName.trim(),
        resolution_notes: notes || null,
        status: selected.status === "break" ? "break_acknowledged" : "signed_off",
      })
      .eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Reconciliation signed off");
    setSignOffName(""); setNotes("");
    await load();
    setSelected(null);
  };

  const openBreaks = breaches.filter(b => b.status === "open").length;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="CASS 7 Daily Reconciliation"
        description="Reconciles internal ledger against bank and custodian balances. Breaks raise a reportable record under CASS 7.15."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Run reconciliation</span>
            {firm && <Badge variant="outline">Firm · {firm.name}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Recon date</div>
            <Input type="date" value={reconDate} onChange={e => setReconDate(e.target.value)} className="w-44" />
          </div>
          <Button onClick={runEngine} disabled={running} className="gap-2">
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running…" : "Run engine"}
          </Button>
          <div className="ml-auto flex gap-2">
            <Badge variant={openBreaks > 0 ? "destructive" : "outline"} className="gap-1">
              <AlertTriangle className="h-3 w-3" /> {openBreaks} open break{openBreaks === 1 ? "" : "s"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent runs</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Ledger</TableHead>
                  <TableHead className="text-right">Bank</TableHead>
                  <TableHead className="text-right">Custody</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sign-off</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map(r => (
                  <TableRow key={r.id} className={selected?.id === r.id ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{r.recon_date}</TableCell>
                    <TableCell className="text-right">{gbp(r.ledger_balance ?? null)}</TableCell>
                    <TableCell className="text-right">{gbp(r.bank_balance ?? null)}</TableCell>
                    <TableCell className="text-right">{gbp(r.custody_balance ?? null)}</TableCell>
                    <TableCell className={`text-right tabular-nums ${Math.abs(Number(r.variance ?? 0)) > 0 ? "text-destructive" : ""}`}>
                      {gbp(r.variance ?? null)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "reconciled" || r.status === "signed_off" ? "outline" : "destructive"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.signed_off_at ? (
                        <span className="text-muted-foreground inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          {r.signed_off_by} · {format(new Date(r.signed_off_at), "dd MMM HH:mm")}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {!r.signed_off_at && (
                        <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                          <FileSignature className="h-3.5 w-3.5 mr-1" />Sign off
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!runs.length && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No runs yet — click <strong>Run engine</strong>.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign off {selected.recon_date}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-muted-foreground text-xs">Ledger</div>{gbp(selected.ledger_balance)}</div>
              <div><div className="text-muted-foreground text-xs">Bank</div>{gbp(selected.bank_balance)}</div>
              <div><div className="text-muted-foreground text-xs">Custody</div>{gbp(selected.custody_balance)}</div>
              <div><div className="text-muted-foreground text-xs">Variance</div>
                <span className={Math.abs(Number(selected.variance ?? 0)) > 0 ? "text-destructive" : ""}>{gbp(selected.variance)}</span>
              </div>
            </div>
            <Input placeholder="Your name (CF10a / SMF18)" value={signOffName} onChange={e => setSignOffName(e.target.value)} />
            <Textarea placeholder="Resolution notes or remediation plan…" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button onClick={signOff} className="gap-2"><FileSignature className="h-4 w-4" />Sign off</Button>
              <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Open breaks register</CardTitle></CardHeader>
        <CardContent>
          {breaches.filter(b => b.status === "open").length === 0 ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> No open breaks.
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Type</TableHead><TableHead>Severity</TableHead>
                <TableHead className="text-right">Amount</TableHead><TableHead>Description</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {breaches.filter(b => b.status === "open").map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{b.breach_type}</TableCell>
                    <TableCell><Badge variant={b.severity === "high" ? "destructive" : "outline"}>{b.severity}</Badge></TableCell>
                    <TableCell className="text-right">{gbp(b.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
