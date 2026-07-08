import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, Users, Calculator,
  ShieldCheck, Send, ArrowRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface ParsedRow {
  raw: Record<string, string>;
  niNumber: string;
  fullName: string;
  pensionablePay: number; // pence
  employeeContrib: number;
  employerContrib: number;
  avc: number;
  salarySacrifice: boolean;
  taxReliefMethod: "ras" | "net_pay";
  taxRelief: number;
  matchStatus: "matched" | "unmatched" | "excluded";
  memberClientId?: string;
  exceptionReason?: string;
}

const REQUIRED_FIELDS = [
  { key: "niNumber", label: "NI number" },
  { key: "fullName", label: "Full name" },
  { key: "pensionablePay", label: "Pensionable pay" },
  { key: "employeeContrib", label: "Employee contribution" },
  { key: "employerContrib", label: "Employer contribution" },
  { key: "avc", label: "AVC (optional)" },
  { key: "salarySacrifice", label: "Salary sacrifice flag (optional)" },
] as const;

const toPence = (v: string | number | undefined): number => {
  if (v === undefined || v === null || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[£,\s]/g, ""));
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
};

const gbp = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Parse & validate", icon: FileSpreadsheet },
  { id: 3, label: "Match members", icon: Users },
  { id: 4, label: "Calculate", icon: Calculator },
  { id: 5, label: "Review & approve", icon: ShieldCheck },
  { id: 6, label: "Hand off", icon: Send },
];

export default function PayrollProcessing() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [file, setFile] = useState<File | null>(null);
  const [employerName, setEmployerName] = useState("");
  const [schemeName, setSchemeName] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [payDate, setPayDate] = useState("");

  // Step 2
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Steps 3–5
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [members, setMembers] = useState<{ id: string; full_name: string | null; ni_number: string | null }[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // Load candidate members for matching
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("clients").select("id, full_name, ni_number").limit(500);
      if (data) setMembers(data as any);
    })();
  }, []);

  const totals = useMemo(() => {
    const active = rows.filter((r) => r.matchStatus !== "excluded");
    return {
      count: active.length,
      pensionablePay: active.reduce((s, r) => s + r.pensionablePay, 0),
      employee: active.reduce((s, r) => s + r.employeeContrib, 0),
      employer: active.reduce((s, r) => s + r.employerContrib, 0),
      avc: active.reduce((s, r) => s + r.avc, 0),
      taxRelief: active.reduce((s, r) => s + r.taxRelief, 0),
    };
  }, [rows]);

  // -------------------- STEP 1 --------------------
  const handleFile = async (f: File) => {
    setFile(f);
    const ext = f.name.toLowerCase().split(".").pop();
    if (ext === "csv") {
      Papa.parse(f, {
        header: true, skipEmptyLines: true,
        complete: (res) => {
          const rs = res.data as Record<string, string>[];
          setHeaders(res.meta.fields ?? []);
          setRawRows(rs);
          autoMap(res.meta.fields ?? []);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
      const hs = json.length ? Object.keys(json[0]) : [];
      setHeaders(hs);
      setRawRows(json.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))));
      autoMap(hs);
    } else {
      toast({ title: "Unsupported file", description: "Upload a CSV or XLSX payroll file.", variant: "destructive" });
    }
  };

  const autoMap = (hs: string[]) => {
    const guess = (patterns: RegExp[]) => hs.find((h) => patterns.some((p) => p.test(h))) ?? "";
    setMapping({
      niNumber: guess([/^ni\b/i, /national insurance/i, /nino/i]),
      fullName: guess([/name/i]),
      pensionablePay: guess([/pensionable/i, /^pay\b/i, /salary/i, /gross/i]),
      employeeContrib: guess([/ee\s*cont/i, /employee/i, /member/i]),
      employerContrib: guess([/er\s*cont/i, /employer/i, /company/i]),
      avc: guess([/avc/i]),
      salarySacrifice: guess([/sacrifice/i, /sal\s*sac/i]),
    });
  };

  const canStart = file && employerName && periodStart && periodEnd && payDate;

  // -------------------- STEP 2 -> 3 --------------------
  const commitMapping = () => {
    const missing = ["niNumber", "fullName", "pensionablePay", "employeeContrib", "employerContrib"]
      .filter((k) => !mapping[k]);
    if (missing.length) {
      toast({ title: "Mapping incomplete", description: `Map: ${missing.join(", ")}`, variant: "destructive" });
      return;
    }
    const parsed: ParsedRow[] = rawRows.map((r) => {
      const ss = mapping.salarySacrifice ? /^(y|yes|true|1)$/i.test(r[mapping.salarySacrifice] ?? "") : false;
      return {
        raw: r,
        niNumber: (r[mapping.niNumber] ?? "").trim().toUpperCase(),
        fullName: (r[mapping.fullName] ?? "").trim(),
        pensionablePay: toPence(r[mapping.pensionablePay]),
        employeeContrib: toPence(r[mapping.employeeContrib]),
        employerContrib: toPence(r[mapping.employerContrib]),
        avc: mapping.avc ? toPence(r[mapping.avc]) : 0,
        salarySacrifice: ss,
        taxReliefMethod: "ras",
        taxRelief: 0,
        matchStatus: "unmatched",
      };
    });
    // auto-match
    const byNi = new Map(members.filter((m) => m.ni_number).map((m) => [m.ni_number!.toUpperCase(), m]));
    const byName = new Map(members.filter((m) => m.full_name).map((m) => [m.full_name!.toLowerCase(), m]));
    parsed.forEach((p) => {
      const m = byNi.get(p.niNumber) ?? byName.get(p.fullName.toLowerCase());
      if (m) { p.memberClientId = m.id; p.matchStatus = "matched"; }
    });
    setRows(parsed);
    setStep(3);
  };

  const validation = useMemo(() => {
    const missingNi = rawRows.filter((r) => !((r[mapping.niNumber] ?? "").trim())).length;
    const dups = new Set<string>();
    const seen = new Set<string>();
    rawRows.forEach((r) => {
      const ni = (r[mapping.niNumber] ?? "").trim().toUpperCase();
      if (!ni) return;
      if (seen.has(ni)) dups.add(ni); else seen.add(ni);
    });
    return { total: rawRows.length, missingNi, duplicates: dups.size };
  }, [rawRows, mapping.niNumber]);

  // -------------------- STEP 4: Calculate --------------------
  const runCalculations = () => {
    const updated = rows.map((r) => {
      // RAS: gross-up 20% on employee net contribution (member contributes net; provider reclaims 20%)
      const taxRelief = r.taxReliefMethod === "ras" && !r.salarySacrifice
        ? Math.round(r.employeeContrib * 0.25) // 20% of gross = 25% of net
        : 0;
      return { ...r, taxRelief };
    });
    setRows(updated);
    setStep(5);
  };

  // -------------------- STEP 5 -> 6: Persist run + post contributions --------------------
  const approveAndPost = async () => {
    setPosting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;

      const { data: run, error: runErr } = await supabase
        .from("payroll_runs")
        .insert({
          scheme_name: schemeName || employerName,
          period_start: periodStart,
          period_end: periodEnd,
          pay_date: payDate,
          frequency,
          source_file_name: file?.name,
          status: "approved",
          totals: totals as any,
          column_mapping: mapping as any,
          uploaded_by: uid,
          approved_by: uid,
          approved_at: new Date().toISOString(),
        } as any)
        .select()
        .single();
      if (runErr) throw runErr;
      setRunId(run.id);

      const active = rows.filter((r) => r.matchStatus !== "excluded");
      const lines = active.map((r) => ({
        payroll_run_id: run.id,
        member_client_id: r.memberClientId ?? null,
        raw_row: r.raw as any,
        ni_number: r.niNumber,
        full_name: r.fullName,
        pensionable_pay_pence: r.pensionablePay,
        employee_contrib_pence: r.employeeContrib,
        employer_contrib_pence: r.employerContrib,
        avc_pence: r.avc,
        tax_relief_pence: r.taxRelief,
        salary_sacrifice: r.salarySacrifice,
        tax_relief_method: r.taxReliefMethod,
        match_status: r.matchStatus,
      }));
      if (lines.length) {
        const { error: linesErr } = await supabase.from("payroll_run_lines").insert(lines as any);
        if (linesErr) throw linesErr;
      }

      // Hand off matched members into contributions
      const contribRows = active
        .filter((r) => r.memberClientId)
        .map((r) => ({
          client_id: r.memberClientId!,
          contribution_type: "employer_payroll",
          amount: (r.employeeContrib + r.employerContrib + r.avc) / 100,
          tax_year: `${new Date(payDate).getFullYear()}/${(new Date(payDate).getFullYear() + 1).toString().slice(-2)}`,
          contribution_date: payDate,
          payroll_run_id: run.id,
        }));
      if (contribRows.length) {
        await supabase.from("contributions").insert(contribRows as any);
      }

      await supabase.from("payroll_runs").update({ status: "posted" } as any).eq("id", run.id);
      toast({ title: "Payroll posted", description: `${active.length} lines handed off to Contributions.` });
      setStep(6);
    } catch (e: any) {
      toast({ title: "Failed to post payroll", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const reset = () => {
    setStep(1); setFile(null); setEmployerName(""); setSchemeName("");
    setPeriodStart(""); setPeriodEnd(""); setPayDate("");
    setHeaders([]); setRawRows([]); setMapping({}); setRows([]); setRunId(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7" /> Payroll processing
          </h1>
          <p className="text-muted-foreground mt-1">
            End-to-end employer payroll workflow — upload, validate, match, calculate, approve and hand off to Contributions.
          </p>
        </div>
        {step > 1 && (
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" /> New run
          </Button>
        )}
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => s.id <= step && setStep(s.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                    active ? "border-primary bg-primary/5" : done ? "border-primary/40 bg-muted/40" : "border-border"
                  }`}
                >
                  <div className={`p-2 rounded-md ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20" : "bg-muted"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Step {s.id}</div>
                    <div className="text-sm font-medium truncate">{s.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <Progress value={(step / 6) * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* STEP 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Upload employer payroll file</CardTitle>
            <CardDescription>Accepts CSV or XLSX. All figures are held in pence internally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employer</Label>
                <Input value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Acme Ltd" />
              </div>
              <div className="space-y-2">
                <Label>Scheme name (optional)</Label>
                <Input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="Acme Group SIPP" />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                    <SelectItem value="four_weekly">Four-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pay date</Label>
                <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Period start</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Period end</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <Label htmlFor="payroll-file" className="cursor-pointer">
                <span className="text-primary underline">Choose payroll file</span>
                <span className="text-muted-foreground"> or drag & drop</span>
              </Label>
              <Input
                id="payroll-file" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file && <div className="mt-2 text-sm">Selected: <strong>{file.name}</strong> ({rawRows.length} rows)</div>}
            </div>
            <div className="flex justify-end">
              <Button disabled={!canStart} onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Parse & validate</CardTitle>
            <CardDescription>Map columns from the source file to payroll fields.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {REQUIRED_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label>{f.label}</Label>
                  <Select value={mapping[f.key] ?? ""} onValueChange={(v) => setMapping((m) => ({ ...m, [f.key]: v }))}>
                    <SelectTrigger><SelectValue placeholder="— unmapped —" /></SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-md bg-muted"><div className="text-xs text-muted-foreground">Rows</div><div className="text-xl font-semibold">{validation.total}</div></div>
              <div className="p-3 rounded-md bg-muted"><div className="text-xs text-muted-foreground">Missing NI</div><div className="text-xl font-semibold">{validation.missingNi}</div></div>
              <div className="p-3 rounded-md bg-muted"><div className="text-xs text-muted-foreground">Duplicates</div><div className="text-xl font-semibold">{validation.duplicates}</div></div>
            </div>
            {(validation.missingNi > 0 || validation.duplicates > 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Validation warnings</AlertTitle>
                <AlertDescription>Rows with missing NI or duplicates can still proceed — resolve during matching.</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={commitMapping}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Match members</CardTitle>
            <CardDescription>
              Matched: <Badge variant="secondary">{rows.filter((r) => r.matchStatus === "matched").length}</Badge>{" "}
              Unmatched: <Badge variant="destructive">{rows.filter((r) => r.matchStatus === "unmatched").length}</Badge>{" "}
              Excluded: <Badge variant="outline">{rows.filter((r) => r.matchStatus === "excluded").length}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>NI</TableHead>
                    <TableHead>Pay</TableHead>
                    <TableHead>Member link</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.fullName || <em className="text-muted-foreground">unknown</em>}</TableCell>
                      <TableCell className="font-mono text-xs">{r.niNumber || "—"}</TableCell>
                      <TableCell>{gbp(r.pensionablePay)}</TableCell>
                      <TableCell>
                        <Select
                          value={r.memberClientId ?? "none"}
                          onValueChange={(v) => setRows((rs) => rs.map((x, idx) => idx === i ? {
                            ...x, memberClientId: v === "none" ? undefined : v,
                            matchStatus: v === "none" ? "unmatched" : "matched",
                          } : x))}
                        >
                          <SelectTrigger className="w-56"><SelectValue placeholder="Select member" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— unmatched —</SelectItem>
                            {members.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.full_name ?? m.id.slice(0, 8)}{m.ni_number ? ` (${m.ni_number})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {r.matchStatus === "matched" && <Badge variant="secondary">Matched</Badge>}
                        {r.matchStatus === "unmatched" && <Badge variant="destructive">Unmatched</Badge>}
                        {r.matchStatus === "excluded" && <Badge variant="outline">Excluded</Badge>}
                        <Button
                          variant="ghost" size="sm" className="ml-2"
                          onClick={() => setRows((rs) => rs.map((x, idx) => idx === i ? {
                            ...x, matchStatus: x.matchStatus === "excluded" ? "unmatched" : "excluded",
                          } : x))}
                        >
                          {r.matchStatus === "excluded" ? "Include" : "Exclude"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>4. Calculate contributions</CardTitle>
            <CardDescription>Choose tax relief method per member. RAS grosses up 20% (25% of net) on non–salary-sacrifice contributions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>AVC</TableHead>
                    <TableHead>Sal-Sac</TableHead>
                    <TableHead>Relief method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.filter((r) => r.matchStatus !== "excluded").map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.fullName}</TableCell>
                      <TableCell>{gbp(r.employeeContrib)}</TableCell>
                      <TableCell>{gbp(r.employerContrib)}</TableCell>
                      <TableCell>{gbp(r.avc)}</TableCell>
                      <TableCell>{r.salarySacrifice ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Select
                          value={r.taxReliefMethod}
                          onValueChange={(v) => setRows((rs) => rs.map((x) => x === r ? { ...x, taxReliefMethod: v as any } : x))}
                        >
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ras">RAS</SelectItem>
                            <SelectItem value="net_pay">Net pay</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={runCalculations}><Calculator className="h-4 w-4 mr-2" /> Run calculations</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>5. Review & approve</CardTitle>
            <CardDescription>Confirm scheme-level totals before handoff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                ["Members", String(totals.count)],
                ["Pensionable pay", gbp(totals.pensionablePay)],
                ["Employee", gbp(totals.employee)],
                ["Employer", gbp(totals.employer)],
                ["AVC", gbp(totals.avc)],
                ["Tax relief (RAS)", gbp(totals.taxRelief)],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-md bg-muted">
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Four-eyes approval</AlertTitle>
              <AlertDescription>
                Approving posts contribution rows into the Contributions ledger and queues any RAS reclaim for HMRC.
              </AlertDescription>
            </Alert>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
              <Button disabled={posting} onClick={approveAndPost}>
                {posting ? "Posting…" : <>Approve & post <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Payroll run posted
            </CardTitle>
            <CardDescription>Run reference: <span className="font-mono">{runId}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {totals.count} lines have been handed off to the Contributions ledger and are ready for reconciliation.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/contributions")}>Open Contributions</Button>
              <Button variant="outline" onClick={reset}>Process another run</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
