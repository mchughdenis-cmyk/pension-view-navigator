import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Calculator, ShieldCheck, Send, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, Building2, Settings2, ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  ni_number: string | null;
  employment_status: string | null;
}
interface Line {
  clientId: string;
  fullName: string;
  niNumber: string;
  included: boolean;
  excludeReason?: "leaver" | "opt_out" | "absent" | "other";
  pensionablePayPence: number;
  employeeContribPence: number;
  employerContribPence: number;
  avcPence: number;
  salarySacrifice: boolean;
  taxReliefPence: number;
}

const toPence = (v: number) => Math.round((Number(v) || 0) * 100);
const gbp = (p: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((p || 0) / 100);

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 1, label: "Setup", icon: Settings2 },
  { id: 2, label: "Members in scope", icon: Users },
  { id: 3, label: "Contribution inputs", icon: ClipboardList },
  { id: 4, label: "Calculate & validate", icon: Calculator },
  { id: 5, label: "Four-eyes approval", icon: ShieldCheck },
  { id: 6, label: "Outputs & hand-off", icon: Send },
];

export default function PayrollProcessing() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  // ── Step 1: setup ──
  const [employerName, setEmployerName] = useState("");
  const [schemeName, setSchemeName] = useState("Group SIPP");
  const [frequency, setFrequency] = useState("monthly");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [payDate, setPayDate] = useState("");
  const [reliefMethod, setReliefMethod] = useState<"ras" | "net_pay">("ras");
  const [eeDefaultPct, setEeDefaultPct] = useState(5);
  const [erDefaultPct, setErDefaultPct] = useState(3);
  const [runReference, setRunReference] = useState("");

  // ── Members ──
  const [members, setMembers] = useState<Member[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  // ── Approval ──
  const [preparer, setPreparer] = useState("");
  const [checker, setChecker] = useState("");
  const [checkerConfirmed, setCheckerConfirmed] = useState(false);

  // ── Output ──
  const [posting, setPosting] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<{ contribs: number; rti: boolean; cash: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, first_name, last_name, ni_number, employment_status")
        .eq("status", "active")
        .order("last_name")
        .limit(500);
      if (data) setMembers(data as any);
    })();
  }, []);

  const canAdvanceFromSetup = employerName.trim() && periodStart && periodEnd && payDate && runReference.trim();

  const goToMembers = () => {
    if (!canAdvanceFromSetup) {
      toast({ title: "Missing setup", description: "Complete employer, period, pay date and run reference.", variant: "destructive" });
      return;
    }
    const seeded: Line[] = members.map((m) => ({
      clientId: m.id,
      fullName: [m.first_name, m.last_name].filter(Boolean).join(" ") || "Unnamed",
      niNumber: (m.ni_number || "").toUpperCase(),
      included: (m.employment_status || "").toLowerCase() !== "leaver",
      pensionablePayPence: 0,
      employeeContribPence: 0,
      employerContribPence: 0,
      avcPence: 0,
      salarySacrifice: false,
      taxReliefPence: 0,
    }));
    setLines(seeded);
    setStep(2);
  };

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const applyDefaults = () => {
    setLines((prev) =>
      prev.map((l) => {
        if (!l.included || l.pensionablePayPence <= 0) return l;
        const ee = Math.round((l.pensionablePayPence * eeDefaultPct) / 100);
        const er = Math.round((l.pensionablePayPence * erDefaultPct) / 100);
        return { ...l, employeeContribPence: ee, employerContribPence: er };
      })
    );
    toast({ title: "Defaults applied", description: `EE ${eeDefaultPct}% / ER ${erDefaultPct}% applied to included members.` });
  };

  const calculate = () => {
    setLines((prev) =>
      prev.map((l) => {
        if (!l.included) return { ...l, taxReliefPence: 0 };
        // RAS: 20% relief added to net; net_pay: taken pre-tax so relief = 0 here
        const relief =
          reliefMethod === "ras" ? Math.round((l.employeeContribPence + l.avcPence) * 0.25) : 0;
        return { ...l, taxReliefPence: relief };
      })
    );
    setStep(4);
  };

  const included = lines.filter((l) => l.included);
  const totals = useMemo(() => {
    return {
      count: included.length,
      pay: included.reduce((s, l) => s + l.pensionablePayPence, 0),
      ee: included.reduce((s, l) => s + l.employeeContribPence, 0),
      er: included.reduce((s, l) => s + l.employerContribPence, 0),
      avc: included.reduce((s, l) => s + l.avcPence, 0),
      relief: included.reduce((s, l) => s + l.taxReliefPence, 0),
    };
  }, [lines]);

  const validation = useMemo(() => {
    const missingNi = included.filter((l) => !l.niNumber).map((l) => l.fullName);
    const zeroPay = included.filter((l) => l.pensionablePayPence <= 0).map((l) => l.fullName);
    const aeShortfall = included.filter((l) => {
      if (l.pensionablePayPence <= 0) return false;
      const totalPct = ((l.employeeContribPence + l.employerContribPence) / l.pensionablePayPence) * 100;
      return totalPct < 8;
    }).map((l) => l.fullName);
    const dupNis = new Set<string>();
    const seen = new Set<string>();
    included.forEach((l) => {
      if (!l.niNumber) return;
      if (seen.has(l.niNumber)) dupNis.add(l.niNumber);
      else seen.add(l.niNumber);
    });
    return { missingNi, zeroPay, aeShortfall, duplicates: Array.from(dupNis) };
  }, [lines]);

  const hasBlockingIssues = validation.missingNi.length > 0 || validation.duplicates.length > 0;

  const postRun = async () => {
    setPosting(true);
    try {
      const totalsJson = {
        member_count: totals.count,
        pensionable_pay_pence: totals.pay,
        employee_contrib_pence: totals.ee,
        employer_contrib_pence: totals.er,
        avc_pence: totals.avc,
        tax_relief_pence: totals.relief,
      };
      const { data: run, error } = await supabase
        .from("payroll_runs")
        .insert({
          scheme_name: schemeName || employerName,
          period_start: periodStart,
          period_end: periodEnd,
          pay_date: payDate,
          frequency,
          status: "approved",
          totals: totalsJson,
          source_file_name: runReference,
        } as any)
        .select()
        .single();
      if (error || !run) throw error || new Error("Failed to create run");

      const lineRows = included.map((l) => ({
        payroll_run_id: run.id,
        member_client_id: l.clientId,
        ni_number: l.niNumber || null,
        full_name: l.fullName,
        pensionable_pay_pence: l.pensionablePayPence,
        employee_contrib_pence: l.employeeContribPence,
        employer_contrib_pence: l.employerContribPence,
        avc_pence: l.avcPence,
        tax_relief_pence: l.taxReliefPence,
        salary_sacrifice: l.salarySacrifice,
        tax_relief_method: reliefMethod,
        match_status: "matched",
      }));
      if (lineRows.length) {
        const { error: lErr } = await supabase.from("payroll_run_lines").insert(lineRows as any);
        if (lErr) throw lErr;
      }

      // Contribution schedule postings (per member)
      const taxYear = payDate.slice(0, 4) + "/" + String((Number(payDate.slice(0, 4)) + 1) % 100).padStart(2, "0");
      const contribRows = included.flatMap((l) => {
        const rows: any[] = [];
        const net = l.employeeContribPence / 100;
        if (net > 0) {
          rows.push({
            client_id: l.clientId,
            contribution_type: "employee",
            gross_amount: (l.employeeContribPence + l.taxReliefPence) / 100,
            net_amount: net,
            tax_relief: l.taxReliefPence / 100,
            relief_method: reliefMethod,
            tax_year: taxYear,
            effective_date: payDate,
            status: "expected",
            reference: `${runReference}-EE`,
            payroll_run_id: run.id,
          });
        }
        if (l.employerContribPence > 0) {
          rows.push({
            client_id: l.clientId,
            contribution_type: "employer",
            gross_amount: l.employerContribPence / 100,
            net_amount: l.employerContribPence / 100,
            tax_relief: 0,
            relief_method: reliefMethod,
            tax_year: taxYear,
            effective_date: payDate,
            status: "expected",
            reference: `${runReference}-ER`,
            payroll_run_id: run.id,
          });
        }
        if (l.avcPence > 0) {
          rows.push({
            client_id: l.clientId,
            contribution_type: "avc",
            gross_amount: l.avcPence / 100,
            net_amount: l.avcPence / 100,
            tax_relief: 0,
            relief_method: reliefMethod,
            tax_year: taxYear,
            effective_date: payDate,
            status: "expected",
            reference: `${runReference}-AVC`,
            payroll_run_id: run.id,
          });
        }
        return rows;
      });
      if (contribRows.length) await supabase.from("contributions").insert(contribRows);

      setRunId(run.id);
      setHandoff({ contribs: contribRows.length, rti: true, cash: true });
      setStep(6);
      toast({ title: "Payroll approved", description: `Run ${runReference} posted with ${lineRows.length} lines.` });
    } catch (e: any) {
      toast({ title: "Post failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  // ── Step chrome ──
  const Stepper = () => (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const active = step === s.id;
        const done = step > s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center gap-2 min-w-fit">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                done ? "bg-primary text-primary-foreground" : active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <div className="text-xs">
              <div className="font-medium">{s.label}</div>
              <div className="text-muted-foreground">Step {s.id}</div>
            </div>
            {i < STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-3" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-7 w-7" /> Payroll processing
          </h1>
          <p className="text-muted-foreground mt-1">
            Book-of-business workflow: setup → members → inputs → calculate → approve → outputs. No file import needed.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card><CardContent className="pt-6"><Stepper /></CardContent></Card>

      {/* ── STEP 1: SETUP ── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Run setup</CardTitle>
            <CardDescription>Define the employer, scheme, pay period and scheme defaults for this run.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Employer</Label><Input value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Acme Ltd" /></div>
            <div><Label>Scheme</Label><Input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="Group SIPP" /></div>
            <div><Label>Run reference</Label><Input value={runReference} onChange={(e) => setRunReference(e.target.value)} placeholder="ACME-2026-07" /></div>
            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Period start</Label><Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></div>
            <div><Label>Period end</Label><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></div>
            <div><Label>Pay date</Label><Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} /></div>
            <div>
              <Label>Tax relief method</Label>
              <Select value={reliefMethod} onValueChange={(v: any) => setReliefMethod(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ras">Relief at source (RAS)</SelectItem>
                  <SelectItem value="net_pay">Net pay arrangement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Default EE contribution (%)</Label><Input type="number" step="0.1" value={eeDefaultPct} onChange={(e) => setEeDefaultPct(Number(e.target.value))} /></div>
            <div><Label>Default ER contribution (%)</Label><Input type="number" step="0.1" value={erDefaultPct} onChange={(e) => setErDefaultPct(Number(e.target.value))} /></div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <Button onClick={goToMembers} disabled={!canAdvanceFromSetup}>Continue to members <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: MEMBERS ── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Members in scope</CardTitle>
            <CardDescription>Include or exclude members from this pay run. Leavers are excluded by default.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline">{lines.length} enrolled</Badge>
              <Badge>{lines.filter((l) => l.included).length} included</Badge>
              <Badge variant="secondary">{lines.filter((l) => !l.included).length} excluded</Badge>
            </div>
            <div className="border rounded-md max-h-[480px] overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-16">Include</TableHead><TableHead>Member</TableHead><TableHead>NI number</TableHead><TableHead>Status</TableHead><TableHead>Exclude reason</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {lines.map((l, i) => (
                    <TableRow key={l.clientId}>
                      <TableCell><Checkbox checked={l.included} onCheckedChange={(v) => setLine(i, { included: !!v })} /></TableCell>
                      <TableCell className="font-medium">{l.fullName}</TableCell>
                      <TableCell className="font-mono text-xs">{l.niNumber || <span className="text-destructive">missing</span>}</TableCell>
                      <TableCell><Badge variant={l.included ? "default" : "outline"}>{l.included ? "In" : "Out"}</Badge></TableCell>
                      <TableCell>
                        {!l.included && (
                          <Select value={l.excludeReason || ""} onValueChange={(v: any) => setLine(i, { excludeReason: v })}>
                            <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Reason" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leaver">Leaver</SelectItem>
                              <SelectItem value="opt_out">Opt-out</SelectItem>
                              <SelectItem value="absent">Unpaid absence</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!lines.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No enrolled members found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={() => setStep(3)} disabled={!lines.some((l) => l.included)}>Continue to inputs <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: INPUTS ── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Contribution inputs</CardTitle>
            <CardDescription>Enter pensionable pay; apply scheme defaults or override per member.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3 text-sm">
              <div className="text-muted-foreground">Defaults: EE {eeDefaultPct}% · ER {erDefaultPct}%</div>
              <Button variant="secondary" size="sm" onClick={applyDefaults}>Apply defaults from pensionable pay</Button>
            </div>
            <div className="border rounded-md max-h-[480px] overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Pensionable pay (£)</TableHead>
                  <TableHead className="text-right">EE (£)</TableHead>
                  <TableHead className="text-right">ER (£)</TableHead>
                  <TableHead className="text-right">AVC (£)</TableHead>
                  <TableHead>Sal-sac</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {lines.map((l, i) =>
                    !l.included ? null : (
                      <TableRow key={l.clientId}>
                        <TableCell className="font-medium">{l.fullName}</TableCell>
                        <TableCell><Input type="number" step="0.01" className="h-8 text-right" value={l.pensionablePayPence / 100 || ""} onChange={(e) => setLine(i, { pensionablePayPence: toPence(Number(e.target.value)) })} /></TableCell>
                        <TableCell><Input type="number" step="0.01" className="h-8 text-right" value={l.employeeContribPence / 100 || ""} onChange={(e) => setLine(i, { employeeContribPence: toPence(Number(e.target.value)) })} /></TableCell>
                        <TableCell><Input type="number" step="0.01" className="h-8 text-right" value={l.employerContribPence / 100 || ""} onChange={(e) => setLine(i, { employerContribPence: toPence(Number(e.target.value)) })} /></TableCell>
                        <TableCell><Input type="number" step="0.01" className="h-8 text-right" value={l.avcPence / 100 || ""} onChange={(e) => setLine(i, { avcPence: toPence(Number(e.target.value)) })} /></TableCell>
                        <TableCell><Checkbox checked={l.salarySacrifice} onCheckedChange={(v) => setLine(i, { salarySacrifice: !!v })} /></TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={calculate}>Calculate <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4: CALCULATE & VALIDATE ── */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Calculate & validate</CardTitle>
            <CardDescription>Totals, tax relief and validation checks before approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: "Members", value: totals.count },
                { label: "Pensionable pay", value: gbp(totals.pay) },
                { label: "Employee", value: gbp(totals.ee) },
                { label: "Employer", value: gbp(totals.er) },
                { label: "AVC", value: gbp(totals.avc) },
                { label: `Tax relief (${reliefMethod.toUpperCase()})`, value: gbp(totals.relief) },
              ].map((s) => (
                <div key={s.label} className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-lg font-semibold">{s.value}</div>
                </div>
              ))}
            </div>

            {validation.missingNi.length > 0 && (
              <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Missing NI numbers</AlertTitle><AlertDescription>{validation.missingNi.length} member(s): {validation.missingNi.slice(0, 5).join(", ")}{validation.missingNi.length > 5 ? "…" : ""}</AlertDescription></Alert>
            )}
            {validation.duplicates.length > 0 && (
              <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Duplicate NI numbers</AlertTitle><AlertDescription>{validation.duplicates.join(", ")}</AlertDescription></Alert>
            )}
            {validation.zeroPay.length > 0 && (
              <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>Zero pensionable pay</AlertTitle><AlertDescription>{validation.zeroPay.length} included member(s) have zero pay.</AlertDescription></Alert>
            )}
            {validation.aeShortfall.length > 0 && (
              <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>AE minimum not met (8% combined)</AlertTitle><AlertDescription>{validation.aeShortfall.length} member(s) below the auto-enrolment minimum.</AlertDescription></Alert>
            )}
            {!hasBlockingIssues && !validation.zeroPay.length && !validation.aeShortfall.length && (
              <Alert><CheckCircle2 className="h-4 w-4" /><AlertTitle>All checks passed</AlertTitle><AlertDescription>Run is ready for approval.</AlertDescription></Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={() => setStep(5)} disabled={hasBlockingIssues}>Send for approval <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 5: APPROVAL ── */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Four-eyes approval</CardTitle>
            <CardDescription>Preparer and checker sign-off before posting to member accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Preparer name</Label><Input value={preparer} onChange={(e) => setPreparer(e.target.value)} placeholder="e.g. Sam Preparer" /></div>
              <div><Label>Checker name</Label><Input value={checker} onChange={(e) => setChecker(e.target.value)} placeholder="e.g. Alex Checker" /></div>
            </div>
            <Separator />
            <div className="text-sm space-y-1">
              <div><span className="text-muted-foreground">Run:</span> <b>{runReference}</b> · {employerName} · {schemeName}</div>
              <div><span className="text-muted-foreground">Period:</span> {periodStart} → {periodEnd} · pay date {payDate}</div>
              <div><span className="text-muted-foreground">Members:</span> {totals.count} · <span className="text-muted-foreground">Total contributions:</span> {gbp(totals.ee + totals.er + totals.avc)} (relief {gbp(totals.relief)})</div>
            </div>
            <div className="flex items-start gap-2 border rounded-md p-3">
              <Checkbox id="chk" checked={checkerConfirmed} onCheckedChange={(v) => setCheckerConfirmed(!!v)} />
              <label htmlFor="chk" className="text-sm">Checker confirms totals reconcile to the contribution schedule and cash collection is authorised.</label>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={postRun} disabled={!preparer || !checker || !checkerConfirmed || posting}>
                {posting ? "Posting…" : "Approve & post"} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 6: OUTPUTS ── */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Outputs & hand-off</CardTitle>
            <CardDescription>Payroll run posted. Downstream tasks are queued for the daily desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert><CheckCircle2 className="h-4 w-4" /><AlertTitle>Run {runReference} approved</AlertTitle><AlertDescription>Run ID {runId?.slice(0, 8)} · {handoff?.contribs ?? 0} contribution schedule row(s) created.</AlertDescription></Alert>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card><CardContent className="pt-4 space-y-2"><div className="font-medium">HMRC RTI (FPS)</div><div className="text-xs text-muted-foreground">Ready to submit for period ending {periodEnd}.</div><Button size="sm" variant="secondary" onClick={() => navigate("/paye")}>Open PAYE / RTI</Button></CardContent></Card>
              <Card><CardContent className="pt-4 space-y-2"><div className="font-medium">Cash collection</div><div className="text-xs text-muted-foreground">Direct debit sweep for {gbp(totals.ee + totals.er + totals.avc)}.</div><Button size="sm" variant="secondary" onClick={() => navigate("/dealing")}>Open dealing desk</Button></CardContent></Card>
              <Card><CardContent className="pt-4 space-y-2"><div className="font-medium">Contribution allocation</div><div className="text-xs text-muted-foreground">Allocate expected contributions to member accounts.</div><Button size="sm" variant="secondary" onClick={() => navigate("/contributions")}>Open contributions</Button></CardContent></Card>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => { setStep(1); setRunId(null); setHandoff(null); setCheckerConfirmed(false); }}>Start another run</Button>
              <Button onClick={() => navigate("/admin")}>Back to admin console</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
