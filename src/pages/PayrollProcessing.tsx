import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Calculator, ShieldCheck, Send, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, Building2, Settings2, ClipboardList, MinusCircle,
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
  mpaa_triggered: boolean | null;
  annual_allowance_used: number | null;
}
interface Line {
  clientId: string;
  fullName: string;
  niNumber: string;
  included: boolean;
  excludeReason?: "leaver" | "opt_out" | "absent" | "other";
  isAdjustment: boolean;                 // A4: negative/refund/prior-period line
  adjustmentReason?: string;
  pensionablePayPence: number;
  employeeContribPence: number;
  employerContribPence: number;
  avcPence: number;
  salarySacrifice: boolean;
  taxReliefPence: number;
  mpaaTriggered: boolean;
  aaUsedYtd: number;                     // £, current tax year prior to this run
}

interface PriorRun {
  member_count: number;
  pay: number;
  employee: number;
  employer: number;
  avc: number;
}

const toPence = (v: number) => Math.round((Number(v) || 0) * 100);
const gbp = (p: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((p || 0) / 100);
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const AA_LIMIT = 60000;
const MPAA_LIMIT = 10000;

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

  // Step 1
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

  const [members, setMembers] = useState<Member[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [priorRun, setPriorRun] = useState<PriorRun | null>(null);   // A1

  // Approval
  const [preparer, setPreparer] = useState("");
  const [checker, setChecker] = useState("");
  const [checkerConfirmed, setCheckerConfirmed] = useState(false);

  // Output
  const [posting, setPosting] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<{ contribs: number; rtiId?: string; paymentIds: string[] } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, first_name, last_name, ni_number, employment_status, mpaa_triggered, annual_allowance_used")
        .eq("status", "active")
        .order("last_name")
        .limit(500);
      if (data) setMembers(data as any);
    })();
  }, []);

  const currentTaxYear = useMemo(() => {
    // UK tax year runs 6 Apr → 5 Apr
    if (!payDate) return "";
    const d = new Date(payDate);
    const y = d.getMonth() < 3 || (d.getMonth() === 3 && d.getDate() < 6) ? d.getFullYear() - 1 : d.getFullYear();
    return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
  }, [payDate]);

  const canAdvanceFromSetup = employerName.trim() && periodStart && periodEnd && payDate && runReference.trim();

  const goToMembers = async () => {
    if (!canAdvanceFromSetup) {
      toast({ title: "Missing setup", description: "Complete employer, period, pay date and run reference.", variant: "destructive" });
      return;
    }

    // Pull latest carry-forward for members in current tax year
    const memberIds = members.map((m) => m.id);
    const { data: aa } = await supabase
      .from("aa_carry_forward")
      .select("client_id, used_this_year")
      .in("client_id", memberIds)
      .eq("tax_year", currentTaxYear);
    const aaByMember = new Map((aa || []).map((r: any) => [r.client_id, Number(r.used_this_year || 0)]));

    const seeded: Line[] = members.map((m) => ({
      clientId: m.id,
      fullName: [m.first_name, m.last_name].filter(Boolean).join(" ") || "Unnamed",
      niNumber: (m.ni_number || "").toUpperCase(),
      included: (m.employment_status || "").toLowerCase() !== "leaver",
      isAdjustment: false,
      pensionablePayPence: 0,
      employeeContribPence: 0,
      employerContribPence: 0,
      avcPence: 0,
      salarySacrifice: false,
      taxReliefPence: 0,
      mpaaTriggered: !!m.mpaa_triggered,
      aaUsedYtd: aaByMember.get(m.id) ?? Number(m.annual_allowance_used || 0),
    }));
    setLines(seeded);

    // A1: fetch prior run for variance
    const { data: prior } = await supabase
      .from("payroll_runs")
      .select("totals")
      .eq("scheme_name", schemeName || employerName)
      .lt("period_end", periodStart)
      .order("period_end", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (prior?.totals) {
      const t = prior.totals as any;
      setPriorRun({
        member_count: t.member_count ?? 0,
        pay: (t.pensionable_pay_pence ?? 0) / 100,
        employee: (t.employee_contrib_pence ?? 0) / 100,
        employer: (t.employer_contrib_pence ?? 0) / 100,
        avc: (t.avc_pence ?? 0) / 100,
      });
    } else {
      setPriorRun(null);
    }

    setStep(2);
  };

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const applyDefaults = () => {
    setLines((prev) =>
      prev.map((l) => {
        if (!l.included || l.isAdjustment || l.pensionablePayPence <= 0) return l;
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
        let ee = l.employeeContribPence;
        let er = l.employerContribPence;
        // A3: Salary sacrifice — reclassify EE contribution as ER (sacrificed pay)
        if (l.salarySacrifice && ee > 0) {
          er += ee;
          ee = 0;
        }
        // RAS: 25% grossed-up on EE + AVC net (equivalent to 20% relief on gross)
        const relief =
          reliefMethod === "ras" ? Math.round((ee + l.avcPence) * 0.25) : 0;
        return { ...l, employeeContribPence: ee, employerContribPence: er, taxReliefPence: relief };
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
      adjustments: included.filter((l) => l.isAdjustment).length,
    };
  }, [lines]);

  // A1 variance vs prior run
  const variance = useMemo(() => {
    if (!priorRun) return null;
    const currPay = totals.pay / 100;
    const currContribs = (totals.ee + totals.er + totals.avc) / 100;
    const priorContribs = priorRun.employee + priorRun.employer + priorRun.avc;
    const pctChange = (a: number, b: number) => (b === 0 ? (a === 0 ? 0 : 100) : ((a - b) / b) * 100);
    return {
      headcount: { curr: totals.count, prior: priorRun.member_count, delta: totals.count - priorRun.member_count, pct: pctChange(totals.count, priorRun.member_count) },
      pay: { curr: currPay, prior: priorRun.pay, delta: currPay - priorRun.pay, pct: pctChange(currPay, priorRun.pay) },
      contribs: { curr: currContribs, prior: priorContribs, delta: currContribs - priorContribs, pct: pctChange(currContribs, priorContribs) },
    };
  }, [priorRun, totals]);

  const varianceFlagged = variance && (
    Math.abs(variance.headcount.pct) > 10 || Math.abs(variance.pay.pct) > 10 || Math.abs(variance.contribs.pct) > 10
  );

  // A2 AA / MPAA breaches
  const aaBreaches = useMemo(() => {
    return included
      .filter((l) => !l.isAdjustment)
      .map((l) => {
        const runContribs = (l.employeeContribPence + l.employerContribPence + l.avcPence + l.taxReliefPence) / 100;
        const projected = l.aaUsedYtd + runContribs;
        const limit = l.mpaaTriggered ? MPAA_LIMIT : AA_LIMIT;
        return { line: l, projected, limit, breach: projected > limit };
      })
      .filter((x) => x.breach);
  }, [lines]);

  const validation = useMemo(() => {
    const missingNi = included.filter((l) => !l.niNumber && !l.isAdjustment).map((l) => l.fullName);
    const zeroPay = included.filter((l) => !l.isAdjustment && l.pensionablePayPence <= 0).map((l) => l.fullName);
    const aeShortfall = included.filter((l) => {
      if (l.isAdjustment) return false;
      if (l.pensionablePayPence <= 0) return false;
      const totalPct = ((l.employeeContribPence + l.employerContribPence) / l.pensionablePayPence) * 100;
      return totalPct < 8;
    }).map((l) => l.fullName);
    const dupNis = new Set<string>();
    const seen = new Set<string>();
    included.forEach((l) => {
      if (!l.niNumber || l.isAdjustment) return;
      if (seen.has(l.niNumber)) dupNis.add(l.niNumber);
      else seen.add(l.niNumber);
    });
    return { missingNi, zeroPay, aeShortfall, duplicates: Array.from(dupNis) };
  }, [lines]);

  const hasBlockingIssues = validation.missingNi.length > 0 || validation.duplicates.length > 0 || aaBreaches.length > 0;

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
        adjustments: totals.adjustments,
      };
      const notesBody = [
        `Reference: ${runReference}`,
        `Employer: ${employerName}`,
        `Preparer: ${preparer}`,
        `Checker: ${checker}`,
        variance ? `Variance vs prior — headcount ${pct(variance.headcount.pct)}, pay ${pct(variance.pay.pct)}, contribs ${pct(variance.contribs.pct)}` : "No prior run for variance",
      ].join("\n");

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
          notes: notesBody,               // A7
          approved_at: new Date().toISOString(),
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
        exception_reason: l.isAdjustment ? `adjustment: ${l.adjustmentReason || "prior-period"}` : null,
      }));
      if (lineRows.length) {
        const { error: lErr } = await supabase.from("payroll_run_lines").insert(lineRows as any);
        if (lErr) throw lErr;
      }

      // Contribution schedule postings (per member) — supports negative refund lines
      const taxYear = currentTaxYear;
      const contribRows = included.flatMap((l) => {
        const rows: any[] = [];
        const eeNet = l.employeeContribPence / 100;
        if (eeNet !== 0) {
          rows.push({
            client_id: l.clientId,
            contribution_type: l.isAdjustment ? "refund" : "employee",
            gross_amount: (l.employeeContribPence + l.taxReliefPence) / 100,
            net_amount: eeNet,
            tax_relief: l.taxReliefPence / 100,
            relief_method: reliefMethod,
            tax_year: taxYear,
            effective_date: payDate,
            status: "expected",
            reference: `${runReference}-EE${l.isAdjustment ? "-ADJ" : ""}`,
            payroll_run_id: run.id,
          });
        }
        if (l.employerContribPence !== 0) {
          rows.push({
            client_id: l.clientId,
            contribution_type: l.isAdjustment ? "refund" : "employer",
            gross_amount: l.employerContribPence / 100,
            net_amount: l.employerContribPence / 100,
            tax_relief: 0,
            relief_method: reliefMethod,
            tax_year: taxYear,
            effective_date: payDate,
            status: "expected",
            reference: `${runReference}-ER${l.isAdjustment ? "-ADJ" : ""}`,
            payroll_run_id: run.id,
          });
        }
        if (l.avcPence !== 0) {
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
            reference: `${runReference}-AVC${l.isAdjustment ? "-ADJ" : ""}`,
            payroll_run_id: run.id,
          });
        }
        return rows;
      });
      if (contribRows.length) await supabase.from("contributions").insert(contribRows);

      // A9: create per-member cash collection instructions
      const paymentInits = included
        .filter((l) => (l.employeeContribPence + l.employerContribPence + l.avcPence) > 0)
        .map((l) => ({
          client_id: l.clientId,
          amount: (l.employeeContribPence + l.employerContribPence + l.avcPence) / 100,
          reference: `${runReference}-COLL`,
          status: "initiated",
          provider: "Bacs DD (payroll sweep)",
        }));
      let paymentIds: string[] = [];
      if (paymentInits.length) {
        const { data: pi } = await supabase.from("payment_initiations").insert(paymentInits).select("id");
        paymentIds = (pi || []).map((p: any) => p.id);
      }

      // A10: create draft RTI FPS submission
      const { data: rti } = await supabase
        .from("rti_submissions")
        .insert({
          submission_type: "FPS",
          tax_year: taxYear,
          period_end: periodEnd,
          client_count: totals.count,
          total_gross: (totals.pay) / 100,
          total_tax: 0,
          status: "draft",
          payload: {
            run_id: run.id,
            reference: runReference,
            employer: employerName,
            scheme: schemeName,
            pay_date: payDate,
            totals: totalsJson,
          },
        } as any)
        .select("id")
        .single();

      // Audit log entry
      try {
        await supabase.from("activity_log").insert({
          entity_type: "payroll_run",
          entity_id: run.id,
          action: "approved",
          actor: preparer,
          description: `Payroll ${runReference} approved by ${checker} — ${totals.count} members, ${gbp(totals.ee + totals.er + totals.avc)} contributions`,
        } as any);
      } catch { /* activity_log optional */ }

      setRunId(run.id);
      setHandoff({ contribs: contribRows.length, rtiId: rti?.id, paymentIds });
      setStep(6);
      toast({ title: "Payroll approved", description: `Run ${runReference} posted with ${lineRows.length} line(s), ${paymentIds.length} collection(s), 1 RTI draft.` });
    } catch (e: any) {
      toast({ title: "Post failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

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
            Book-of-business workflow: setup → members → inputs → calculate → approve → outputs.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card><CardContent className="pt-6"><Stepper /></CardContent></Card>

      {/* STEP 1 */}
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

      {/* STEP 2 */}
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
                  <TableHead className="w-16">Include</TableHead><TableHead>Member</TableHead><TableHead>NI number</TableHead><TableHead>MPAA</TableHead><TableHead>AA used YTD</TableHead><TableHead>Exclude reason</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {lines.map((l, i) => (
                    <TableRow key={l.clientId}>
                      <TableCell><Checkbox checked={l.included} onCheckedChange={(v) => setLine(i, { included: !!v })} /></TableCell>
                      <TableCell className="font-medium">{l.fullName}</TableCell>
                      <TableCell className="font-mono text-xs">{l.niNumber || <span className="text-destructive">missing</span>}</TableCell>
                      <TableCell>{l.mpaaTriggered ? <Badge variant="destructive">MPAA</Badge> : "—"}</TableCell>
                      <TableCell className="text-xs">{gbp(l.aaUsedYtd * 100)}</TableCell>
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
                  {!lines.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No enrolled members found.</TableCell></TableRow>}
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

      {/* STEP 3 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Contribution inputs</CardTitle>
            <CardDescription>Enter pensionable pay; mark refund/adjustment lines to allow negative amounts (short-service refunds, over-payments, prior-period corrections).</CardDescription>
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
                  <TableHead className="w-24">Adjustment</TableHead>
                  <TableHead className="text-right">Pensionable pay (£)</TableHead>
                  <TableHead className="text-right">EE (£)</TableHead>
                  <TableHead className="text-right">ER (£)</TableHead>
                  <TableHead className="text-right">AVC (£)</TableHead>
                  <TableHead>Sal-sac</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {lines.map((l, i) =>
                    !l.included ? null : (
                      <TableRow key={l.clientId} className={l.isAdjustment ? "bg-destructive/5" : ""}>
                        <TableCell className="font-medium">
                          {l.fullName}
                          {l.isAdjustment && <div className="text-[10px] text-destructive uppercase mt-0.5">Refund / adjustment</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Checkbox checked={l.isAdjustment} onCheckedChange={(v) => setLine(i, { isAdjustment: !!v })} />
                            {l.isAdjustment && <MinusCircle className="h-3 w-3 text-destructive" />}
                          </div>
                        </TableCell>
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
            <div className="text-xs text-muted-foreground">
              Salary sacrifice on = employee amount will be reclassified as employer at calculate step (no RAS relief on sacrificed portion).
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={calculate}>Calculate <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Calculate & validate</CardTitle>
            <CardDescription>Totals, variance vs prior run, tax relief and validation checks before approval.</CardDescription>
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

            {/* A1 Variance panel */}
            {variance && (
              <Card className={varianceFlagged ? "border-amber-500" : ""}>
                <CardHeader className="pb-2"><CardTitle className="text-base">Variance vs prior run</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead className="text-right">Prior</TableHead><TableHead className="text-right">This run</TableHead><TableHead className="text-right">Δ</TableHead><TableHead className="text-right">%</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Headcount</TableCell><TableCell className="text-right">{variance.headcount.prior}</TableCell><TableCell className="text-right">{variance.headcount.curr}</TableCell><TableCell className="text-right">{variance.headcount.delta}</TableCell><TableCell className={`text-right ${Math.abs(variance.headcount.pct) > 10 ? "text-amber-600 font-medium" : ""}`}>{pct(variance.headcount.pct)}</TableCell></TableRow>
                      <TableRow><TableCell>Pensionable pay</TableCell><TableCell className="text-right">{gbp(variance.pay.prior * 100)}</TableCell><TableCell className="text-right">{gbp(variance.pay.curr * 100)}</TableCell><TableCell className="text-right">{gbp(variance.pay.delta * 100)}</TableCell><TableCell className={`text-right ${Math.abs(variance.pay.pct) > 10 ? "text-amber-600 font-medium" : ""}`}>{pct(variance.pay.pct)}</TableCell></TableRow>
                      <TableRow><TableCell>Contributions</TableCell><TableCell className="text-right">{gbp(variance.contribs.prior * 100)}</TableCell><TableCell className="text-right">{gbp(variance.contribs.curr * 100)}</TableCell><TableCell className="text-right">{gbp(variance.contribs.delta * 100)}</TableCell><TableCell className={`text-right ${Math.abs(variance.contribs.pct) > 10 ? "text-amber-600 font-medium" : ""}`}>{pct(variance.contribs.pct)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                  {varianceFlagged && <div className="text-xs text-amber-700 mt-2">One or more metrics differ from the prior run by more than 10%. Review before approval.</div>}
                </CardContent>
              </Card>
            )}
            {!variance && (
              <div className="text-xs text-muted-foreground">No prior run found for {schemeName || employerName} — first run in this scheme.</div>
            )}

            {/* A2 AA / MPAA */}
            {aaBreaches.length > 0 && (
              <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Annual Allowance breach ({aaBreaches.length} member(s))</AlertTitle><AlertDescription>
                <div className="text-xs mt-1 space-y-0.5">
                  {aaBreaches.slice(0, 6).map((b) => (
                    <div key={b.line.clientId}>
                      {b.line.fullName}: projected {gbp(b.projected * 100)} vs limit {gbp(b.limit * 100)} ({b.line.mpaaTriggered ? "MPAA" : "AA"})
                    </div>
                  ))}
                  {aaBreaches.length > 6 && <div>…and {aaBreaches.length - 6} more</div>}
                </div>
              </AlertDescription></Alert>
            )}

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

      {/* STEP 5 */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Four-eyes approval</CardTitle>
            <CardDescription>Preparer and checker sign-off before posting to member accounts. Names are stored on the run and in the activity log.</CardDescription>
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
              {variance && <div><span className="text-muted-foreground">Variance vs prior:</span> headcount {pct(variance.headcount.pct)}, pay {pct(variance.pay.pct)}, contribs {pct(variance.contribs.pct)}</div>}
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

      {/* STEP 6 */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Outputs & hand-off</CardTitle>
            <CardDescription>Payroll run posted. Downstream artefacts created and available on the daily desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert><CheckCircle2 className="h-4 w-4" /><AlertTitle>Run {runReference} approved</AlertTitle><AlertDescription>Run ID {runId?.slice(0, 8)} · {handoff?.contribs ?? 0} contribution row(s), {handoff?.paymentIds.length ?? 0} cash collection(s), {handoff?.rtiId ? "1 RTI FPS draft" : "no RTI draft"}.</AlertDescription></Alert>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card><CardContent className="pt-4 space-y-2"><div className="font-medium">HMRC RTI (FPS)</div><div className="text-xs text-muted-foreground">Draft submission created for period ending {periodEnd}.</div><Button size="sm" variant="secondary" onClick={() => navigate("/paye")}>Open PAYE / RTI</Button></CardContent></Card>
              <Card><CardContent className="pt-4 space-y-2"><div className="font-medium">Cash collection</div><div className="text-xs text-muted-foreground">{handoff?.paymentIds.length ?? 0} collection instruction(s) totalling {gbp(totals.ee + totals.er + totals.avc)}.</div><Button size="sm" variant="secondary" onClick={() => navigate("/dealing")}>Open dealing desk</Button></CardContent></Card>
              <Card><CardContent className="pt-4 space-y-2"><div className="font-medium">Contribution allocation</div><div className="text-xs text-muted-foreground">Expected contributions posted, awaiting allocation on receipt of cash.</div><Button size="sm" variant="secondary" onClick={() => navigate("/contributions")}>Open contributions</Button></CardContent></Card>
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
