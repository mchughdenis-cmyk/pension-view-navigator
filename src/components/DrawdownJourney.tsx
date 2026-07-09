import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "sonner";
import {
  PiggyBank, TrendingUp, Calculator, Clock, AlertTriangle, CheckCircle,
  ArrowRight, Banknote, Calendar, Shield, Target, Info, Loader2, FileDown, ScrollText,
} from "lucide-react";

import { downloadAnnualDrawdownStatement } from "@/lib/annualDrawdownStatement";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useClients, useClientDetail, processDrawdown } from "@/hooks/useClientData";
import {
  calculatePCLS, calculateUFPLS, calculateFADIncome, calculateIncomeTax,
  projectDrawdown, getAnnualAllowanceStatus, formatGBP, NMPA, ANNUAL_ALLOWANCE, MPAA_ALLOWANCE,
} from "@/lib/pensionCalculations";

type Mode = "PCLS_FAD" | "UFPLS" | "ANNUITY";

const ageFromDOB = (dob?: string | null) => {
  if (!dob) return 60;
  const d = new Date(dob);
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

export default function DrawdownJourney() {
  const { clients, loading: clientsLoading } = useClients();
  const [clientId, setClientId] = useState<string | undefined>();

  useEffect(() => {
    if (!clientId && clients.length) setClientId(clients[0].id);
  }, [clients, clientId]);

  const { client, accounts, transactions, fetchAll, loading: detailLoading } = useClientDetail(clientId);

  const sipps = accounts.filter(a => a.account_type?.toLowerCase().includes("sipp"));
  const [accountId, setAccountId] = useState<string | undefined>();
  useEffect(() => {
    if (sipps.length && !sipps.find(a => a.id === accountId)) setAccountId(sipps[0]?.id);
  }, [sipps, accountId]);

  const account = sipps.find(a => a.id === accountId);
  const potValue = Number(account?.total_value || 0);
  const age = ageFromDOB(client?.date_of_birth);

  const [mode, setMode] = useState<Mode>("PCLS_FAD");
  const [pcls, setPcls] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(20000);
  const [ufplsGross, setUfplsGross] = useState(10000);
  const [otherIncome, setOtherIncome] = useState(11500); // typical state pension
  const [growth, setGrowth] = useState(4);
  const [inflation, setInflation] = useState(2.5);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  // FCA mandatory disclosures (COBS 19.7 / 19.7A — Pension Wise stronger nudge + retirement risk warnings)
  const [journeyType, setJourneyType] = useState<"advised" | "non_advised" | "">("");
  // Pension Wise / MoneyHelper "stronger nudge" — non-advised only
  const [pwOffered, setPwOffered] = useState(false);
  const [pwOutcome, setPwOutcome] = useState<"booked" | "received" | "optout" | "">("");
  const [pwOptOutReason, setPwOptOutReason] = useState("");
  // Retirement risk warnings (second line of defence) — both journeys
  const [rrw, setRrw] = useState<Record<string, boolean>>({
    health: true, marital: true, otherPensions: true, inflation: true,
    scams: true, debts: true, sustainability: true, tax: true,
    meansTested: true, charges: true, investmentChoice: true,
  });
  const [pwReference, setPwReference] = useState("");
  // Advised-journey suitability declarations
  const [adv, setAdv] = useState({
    factFind: true, atr: true, capacityForLoss: true, sustainability: true,
    cashflow: true, mpaaAck: true, lsaAck: true, alternatives: true,
    chargesDisclosed: true, suitabilityIssued: true,
  });
  const [advAtrCategory, setAdvAtrCategory] = useState("Balanced");
  const [advCfl, setAdvCfl] = useState<"low" | "medium" | "high">("medium");
  const [advNotes, setAdvNotes] = useState("");

  const rrwAllAck = Object.values(rrw).every(Boolean);
  const advAllAck = Object.values(adv).every(Boolean);
  const pwComplete = pwOutcome === "received" || pwOutcome === "booked"
    ? pwReference.trim().length >= 4
    : (pwOutcome === "optout" && pwOptOutReason.trim().length > 5);
  const disclosuresComplete = journeyType === "advised"
    ? (advAllAck && rrwAllAck)
    : journeyType === "non_advised"
      ? (pwOffered && pwComplete && rrwAllAck)
      : false;


  // Auto-set max PCLS when pot changes
  const maxPcls = useMemo(() => calculatePCLS(potValue).maxPcls, [potValue]);
  useEffect(() => { setPcls(maxPcls); }, [maxPcls]);

  const pclsCalc = useMemo(() => calculatePCLS(potValue, pcls), [potValue, pcls]);
  const fadCalc = useMemo(() => calculateFADIncome(annualIncome, otherIncome), [annualIncome, otherIncome]);
  const ufplsCalc = useMemo(() => calculateUFPLS(ufplsGross, otherIncome), [ufplsGross, otherIncome]);
  const aaStatus = getAnnualAllowanceStatus(Number(client?.annual_allowance_used || 0), !!client?.mpaa_triggered);

  const projection = useMemo(() => projectDrawdown({
    potValue: potValue - pcls,
    annualIncome,
    growthRate: growth / 100,
    inflationRate: inflation / 100,
    years: Math.max(1, 90 - age),
    startAge: age,
  }), [potValue, pcls, annualIncome, growth, inflation, age]);

  const eligible = age >= NMPA;

  const handleSubmit = async () => {
    if (!clientId || !accountId) { toast.error("Select a client and SIPP account"); return; }
    if (!eligible) { toast.error(`Client must be ${NMPA}+ to access drawdown`); return; }
    if (!disclosuresComplete) { toast.error("Complete the FCA mandatory disclosures (Step 0) first"); return; }
    setSubmitting(true);
    const result = await processDrawdown({
      clientId, accountId,
      mode: mode === "ANNUITY" ? "PCLS_FAD" : mode,
      potValue,
      pclsAmount: mode === "PCLS_FAD" ? pcls : undefined,
      drawdownIncome: mode === "PCLS_FAD" ? annualIncome : undefined,
      ufplsGross: mode === "UFPLS" ? ufplsGross : undefined,
      otherIncome,
      notes: `Drawdown journey: ${mode} | ${journeyType === "advised" ? "Advised (COBS 9/9A)" : "Non-advised (COBS 19.7A nudge)"} | RRW acknowledged | ${journeyType === "non_advised" ? `PW: ${pwOutcome}${(pwOutcome === "booked" || pwOutcome === "received") ? " — ref " + pwReference : ""}${pwOutcome === "optout" ? " — " + pwOptOutReason : ""}` : `ATR: ${advAtrCategory}, CFL: ${advCfl}`}${advNotes ? ` | Notes: ${advNotes}` : ""}`,
    });
    setSubmitting(false);
    if (result) {
      await fetchAll();
      setStep(7);
    }
  };

  if (clientsLoading) {
    return <div className="p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  if (!clients.length) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackButton />
        <Card className="max-w-2xl mx-auto mt-12">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto" />
            <p>No clients found. Create a client first via the Admin area.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton label="Back" />

        <div className="flex items-start justify-between gap-4">
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-3xl font-bold">Pension Drawdown Journey</h1>
            <p className="text-muted-foreground">UK 2024/25 — flexible drawdown, UFPLS, PCLS with full tax calculations</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!client || !account}
            onClick={() => {
              if (!client || !account) return;
              try {
                const periodTo = new Date();
                const periodFrom = new Date(periodTo);
                periodFrom.setFullYear(periodTo.getFullYear() - 1);
                const closing = potValue;
                const opening = closing * 0.94;
                const charges = closing * 0.0085;
                const growth = closing - opening - 0 + charges + annualIncome; // implied
                const grossIncome = mode === "UFPLS" ? ufplsGross * 0.75 : annualIncome;
                const tax = calculateIncomeTax(grossIncome + otherIncome).totalTax - calculateIncomeTax(otherIncome).totalTax;
                const pclsTaken = mode === "PCLS_FAD" ? pcls : (mode === "UFPLS" ? ufplsGross * 0.25 : 0);
                downloadAnnualDrawdownStatement({
                  clientName: `${client.first_name} ${client.last_name}`,
                  clientRef: client.id.slice(0, 8).toUpperCase(),
                  dateOfBirth: client.date_of_birth || undefined,
                  niNumber: (client as any).ni_number || undefined,
                  address: (client as any).address || undefined,
                  productName: `${account.account_type} — Flexi-access drawdown`,
                  planNumber: account.account_number || account.id.slice(0, 10).toUpperCase(),
                  adviserName: "Airgead Advisory Team",
                  adviserFirm: "Airgead Capital Ltd",
                  statementPeriodFrom: periodFrom.toISOString(),
                  statementPeriodTo: periodTo.toISOString(),
                  openingValue: opening,
                  closingValue: closing,
                  contributionsIn: 0,
                  transfersIn: 0,
                  investmentGrowth: Math.max(0, closing - opening + grossIncome + pclsTaken + charges),
                  charges,
                  pclsTakenInPeriod: pclsTaken,
                  pclsTakenLifetime: pclsTaken,
                  pclsRemaining: Math.max(0, closing * 0.25 - pclsTaken),
                  taxableIncomeGross: grossIncome,
                  paye: Math.max(0, tax),
                  netIncomePaid: grossIncome - Math.max(0, tax) + pclsTaken,
                  ufplsTakenInPeriod: mode === "UFPLS" ? ufplsGross : 0,
                  lsaUsed: pclsTaken,
                  lsdbaUsed: pclsTaken + grossIncome,
                  mpaaTriggered: mode !== "PCLS_FAD",
                  mpaaTriggerDate: mode !== "PCLS_FAD" ? periodFrom.toISOString() : undefined,
                  currentAnnualIncome: grossIncome,
                  reviewAgeYears: age,
                  holdings: [
                    { name: "Global Equity Index", value: closing * 0.5, allocationPct: 50 },
                    { name: "UK Gilts (short)", value: closing * 0.2, allocationPct: 20 },
                    { name: "Corporate Bonds", value: closing * 0.15, allocationPct: 15 },
                    { name: "Cash & MMF", value: closing * 0.15, allocationPct: 15 },
                  ],
                  commentary: `Income drawn this year of ${formatGBP(grossIncome)} represents ${((grossIncome / closing) * 100).toFixed(2)}% of closing fund. Review recommended annually under COBS 19.10.`,
                });
                toast.success("Annual drawdown statement downloaded");
              } catch (e) {
                console.error(e);
                toast.error("Could not generate statement");
              }
            }}
          >
            <FileDown className="w-4 h-4 mr-2" /> Annual statement
          </Button>
        </div>


        {/* Client / Account selector */}
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>SIPP Account</Label>
              <Select value={accountId} onValueChange={setAccountId} disabled={!sipps.length}>
                <SelectTrigger><SelectValue placeholder={sipps.length ? undefined : "No SIPP account"} /></SelectTrigger>
                <SelectContent>
                  {sipps.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} {a.account_number ? `· ${a.account_number}` : ''} — {formatGBP(Number(a.total_value || 0))}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Other annual income (£)</Label>
              <Input type="number" value={otherIncome} onChange={e => setOtherIncome(Number(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Pot Value</CardTitle><PiggyBank className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{formatGBP(potValue)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Max PCLS (25%)</CardTitle><Banknote className="h-4 w-4 text-success" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">{formatGBP(maxPcls)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Age</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{age}</div>
              <p className="text-xs text-muted-foreground">{eligible ? "Eligible for drawdown" : `Eligible at ${NMPA}`}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Annual Allowance</CardTitle><Shield className="h-4 w-4 text-warning" /></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatGBP(aaStatus.available)}</div>
              <p className="text-xs text-muted-foreground">{aaStatus.mpaaTriggered ? `MPAA: £${MPAA_ALLOWANCE.toLocaleString()}` : `AA: £${ANNUAL_ALLOWANCE.toLocaleString()}`}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main flow */}
        <Tabs value={`step${step}`} onValueChange={v => setStep(parseInt(v.replace("step", "")))}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="step0">
              0. Disclosures {disclosuresComplete && <CheckCircle className="w-3 h-3 ml-1 text-success" />}
            </TabsTrigger>
            <TabsTrigger value="step1" disabled={!disclosuresComplete}>1. Choose Option</TabsTrigger>
            <TabsTrigger value="step2" disabled={!disclosuresComplete}>2. Amount & Frequency</TabsTrigger>
            <TabsTrigger value="step3" disabled={!disclosuresComplete}>3. Tax Breakdown</TabsTrigger>
            <TabsTrigger value="step4" disabled={!disclosuresComplete}>4. Income Projection</TabsTrigger>
            <TabsTrigger value="step5" disabled={!disclosuresComplete}>5. Review & Apply</TabsTrigger>
          </TabsList>

          {/* Step 0: FCA mandatory disclosures (COBS 19.7 / 19.7A) */}
          <TabsContent value="step0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ScrollText className="w-5 h-5" /> FCA mandatory pre-drawdown disclosures</CardTitle>
                <CardDescription>
                  COBS 19.7 retirement risk warnings and, for non-advised journeys, the COBS 19.7A Pension Wise / MoneyHelper stronger nudge. All items must be completed before benefits can be crystallised.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Journey type</Label>
                  <RadioGroup value={journeyType} onValueChange={(v) => setJourneyType(v as any)} className="grid md:grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer ${journeyType === "advised" ? "ring-2 ring-primary" : ""}`}>
                      <RadioGroupItem value="advised" />
                      <div>
                        <div className="font-medium">Advised</div>
                        <p className="text-xs text-muted-foreground">A personal recommendation is being given. Suitability rules (COBS 9 / 9A) apply.</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer ${journeyType === "non_advised" ? "ring-2 ring-primary" : ""}`}>
                      <RadioGroupItem value="non_advised" />
                      <div>
                        <div className="font-medium">Non-advised / Insistent</div>
                        <p className="text-xs text-muted-foreground">No personal recommendation. Pension Wise stronger nudge and risk warnings are mandatory.</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                {journeyType === "non_advised" && (
                  <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">Pension Wise / MoneyHelper stronger nudge (COBS 19.7A)</h4>
                    </div>
                    <label className="flex items-start gap-2 text-sm">
                      <Checkbox checked={pwOffered} onCheckedChange={(c) => setPwOffered(!!c)} className="mt-0.5" />
                      <span>I confirm the client has been offered a free, impartial Pension Wise appointment (telephone or face-to-face via MoneyHelper).</span>
                    </label>
                    <div>
                      <Label className="text-xs">Outcome</Label>
                      <Select value={pwOutcome} onValueChange={(v) => setPwOutcome(v as any)}>
                        <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="received">Client already received Pension Wise / regulated advice</SelectItem>
                          <SelectItem value="booked">Appointment booked — reference recorded</SelectItem>
                          <SelectItem value="optout">Client opted out (record reason)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(pwOutcome === "booked" || pwOutcome === "received") && (
                      <div>
                        <Label className="text-xs">
                          {pwOutcome === "booked"
                            ? "Pension Wise appointment reference (mandatory)"
                            : "Pension Wise / advice reference (mandatory)"}
                        </Label>
                        <Input
                          value={pwReference}
                          onChange={(e) => setPwReference(e.target.value)}
                          placeholder="e.g. PW-2025-123456 or MoneyHelper booking ID"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Record the MoneyHelper booking reference, appointment date, or evidence of regulated advice received.
                        </p>
                      </div>
                    )}
                    {pwOutcome === "optout" && (
                      <div>
                        <Label className="text-xs">Opt-out reason (mandatory — must be explicit and recorded)</Label>
                        <Textarea
                          rows={2}
                          value={pwOptOutReason}
                          onChange={(e) => setPwOptOutReason(e.target.value)}
                          placeholder="E.g. Client confirmed they have already taken regulated advice from another firm on…"
                        />
                      </div>
                    )}
                  </div>
                )}

                {journeyType && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <h4 className="font-semibold text-sm">Retirement risk warnings — second line of defence (COBS 19.7)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Confirm each risk has been explained to the client and their answers documented:</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      {([
                        ["health", "Health & lifestyle (may affect annuity rate / longevity)"],
                        ["marital", "Marital status, dependants & survivor benefits"],
                        ["otherPensions", "Other pension provision and aggregate retirement income"],
                        ["inflation", "Inflation risk on long-term income"],
                        ["sustainability", "Sustainability of withdrawals vs life expectancy"],
                        ["investmentChoice", "Investment choice & volatility in drawdown"],
                        ["tax", "Income tax implications (incl. emergency tax on first payment)"],
                        ["charges", "Product, platform and adviser charges"],
                        ["debts", "Impact on debts / bankruptcy exposure"],
                        ["meansTested", "Effect on means-tested benefits"],
                        ["scams", "Pension scam awareness (FCA ScamSmart)"],
                      ] as [string, string][]).map(([k, label]) => (
                        <label key={k} className="flex items-start gap-2">
                          <Checkbox checked={!!rrw[k]} onCheckedChange={(c) => setRrw(prev => ({ ...prev, [k]: !!c }))} className="mt-0.5" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {journeyType === "advised" && (
                  <div className="rounded-lg border p-4 space-y-4 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">Advised suitability declarations (COBS 9 / 9A & PROD 4)</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">ATR category</Label>
                        <Select value={advAtrCategory} onValueChange={setAdvAtrCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Cautious", "Cautious-Balanced", "Balanced", "Balanced-Growth", "Growth", "Aggressive"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Capacity for loss</Label>
                        <Select value={advCfl} onValueChange={(v) => setAdvCfl(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["low", "medium", "high"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      {([
                        ["factFind", "Fact-find current within 12 months"],
                        ["atr", "Attitude to risk re-assessed for decumulation"],
                        ["capacityForLoss", "Capacity for loss assessed and documented"],
                        ["sustainability", "Sustainable withdrawal rate stress-tested"],
                        ["cashflow", "Cashflow plan produced and shared with client"],
                        ["mpaaAck", "MPAA implications discussed & acknowledged"],
                        ["lsaAck", "LSA / LSDBA position checked (£268,275 / £1,073,100)"],
                        ["alternatives", "Alternatives considered (annuity, blended, defer)"],
                        ["chargesDisclosed", "All charges (product, platform, adviser) disclosed"],
                        ["suitabilityIssued", "Suitability report will be issued before transaction"],
                      ] as [keyof typeof adv, string][]).map(([k, label]) => (
                        <label key={k} className="flex items-start gap-2">
                          <Checkbox checked={adv[k]} onCheckedChange={(c) => setAdv(prev => ({ ...prev, [k]: !!c }))} className="mt-0.5" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <Label className="text-xs">Adviser notes (rationale for recommendation)</Label>
                      <Textarea rows={3} value={advNotes} onChange={(e) => setAdvNotes(e.target.value)} placeholder="E.g. Client requires £25k pa flexible income to bridge to State Pension at 67…" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    {disclosuresComplete
                      ? <span className="text-success inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> All mandatory disclosures complete</span>
                      : "Complete all required items above to proceed."}
                  </div>
                  <Button onClick={() => setStep(1)} disabled={!disclosuresComplete}>
                    Continue to mode<ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Step 1: Mode */}
          <TabsContent value="step1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                { id: "PCLS_FAD", title: "PCLS + Flexi-Access Drawdown", desc: "Take 25% tax-free, designate rest to drawdown, take taxable income flexibly." },
                { id: "UFPLS", title: "UFPLS", desc: "Uncrystallised Funds Pension Lump Sum — 25% tax-free, 75% taxed at marginal rate. Triggers MPAA." },
                { id: "ANNUITY", title: "Annuity Purchase", desc: "Crystallise pot, take PCLS, use residual to buy a guaranteed lifetime income." },
              ] as const).map(o => (
                <Card key={o.id} className={`cursor-pointer transition-all hover:shadow ${mode === o.id ? "ring-2 ring-primary" : ""}`} onClick={() => setMode(o.id as Mode)}>
                  <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">{o.title}</CardTitle>{mode === o.id && <CheckCircle className="w-5 h-5 text-primary" />}</div></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{o.desc}</p></CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-6"><Button onClick={() => setStep(2)}>Continue<ArrowRight className="w-4 h-4 ml-2" /></Button></div>
          </TabsContent>

          {/* Step 2: Configure */}
          <TabsContent value="step2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" /> Configure Withdrawal</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {mode === "PCLS_FAD" && (
                  <>
                    <div>
                      <Label>Tax-Free Cash (PCLS): {formatGBP(pcls)}</Label>
                      <Slider value={[pcls]} onValueChange={v => setPcls(v[0])} max={maxPcls} step={1000} className="mt-2" />
                      <Input type="number" value={pcls} onChange={e => setPcls(Math.min(Number(e.target.value), maxPcls))} className="mt-2" />
                    </div>
                    <div>
                      <Label>Annual taxable drawdown income</Label>
                      <Input type="number" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value) || 0)} />
                    </div>
                  </>
                )}
                {mode === "UFPLS" && (
                  <div>
                    <Label>UFPLS gross payment</Label>
                    <Input type="number" value={ufplsGross} onChange={e => setUfplsGross(Number(e.target.value) || 0)} />
                    <p className="text-xs text-muted-foreground mt-1">25% tax-free + 75% taxed at marginal rate. Triggers MPAA.</p>
                  </div>
                )}
                {mode === "ANNUITY" && (
                  <>
                    <div>
                      <Label>PCLS: {formatGBP(pcls)}</Label>
                      <Slider value={[pcls]} onValueChange={v => setPcls(v[0])} max={maxPcls} step={1000} className="mt-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">Annuity rate ~5.5% would yield approx <strong>{formatGBP((potValue - pcls) * 0.055)}</strong> per year guaranteed.</p>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Growth assumption: {growth}%</Label><Slider value={[growth]} onValueChange={v => setGrowth(v[0])} max={8} min={0} step={0.5} /></div>
                  <div><Label>Inflation: {inflation}%</Label><Slider value={[inflation]} onValueChange={v => setInflation(v[0])} max={6} min={0} step={0.5} /></div>
                </div>

                <Button onClick={() => setStep(3)} className="w-full">View Tax Breakdown<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Tax breakdown */}
          <TabsContent value="step3">
            <Card>
              <CardHeader><CardTitle>UK 2024/25 Tax Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const tax = mode === "UFPLS" ? ufplsCalc.tax : fadCalc.tax;
                  const tf = mode === "UFPLS" ? ufplsCalc.taxFreePortion : pcls;
                  const taxable = mode === "UFPLS" ? ufplsCalc.taxablePortion : (mode === "PCLS_FAD" ? annualIncome : 0);
                  const net = tf + tax.netIncome;
                  return (
                    <>
                      <Row label="Tax-free portion" value={formatGBP(tf)} variant="success" />
                      <Row label="Taxable gross" value={formatGBP(taxable)} />
                      <Row label="Personal Allowance used" value={formatGBP(tax.personalAllowance)} muted />
                      <Row label="Basic rate (20%)" value={formatGBP(tax.basicRateTax)} muted />
                      <Row label="Higher rate (40%)" value={formatGBP(tax.higherRateTax)} muted />
                      <Row label="Additional rate (45%)" value={formatGBP(tax.additionalRateTax)} muted />
                      <Row label="Total tax" value={formatGBP(tax.totalTax)} variant="destructive" />
                      <Row label="Effective rate" value={`${(tax.effectiveRate * 100).toFixed(1)}%`} muted />
                      <div className="border-t pt-3" />
                      <Row label="Net to client" value={formatGBP(net)} variant="success" bold />
                    </>
                  );
                })()}
                {!aaStatus.mpaaTriggered && mode !== "PCLS_FAD" && (
                  <div className="bg-warning/10 border border-warning/20 rounded p-3 text-sm flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <span>This {mode === "UFPLS" ? "UFPLS" : "drawdown income"} will trigger the Money Purchase Annual Allowance (MPAA), reducing future contribution allowance to £{MPAA_ALLOWANCE.toLocaleString()}/year.</span>
                  </div>
                )}
                <Button onClick={() => setStep(4)} className="w-full">View Projection<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Projection */}
          <TabsContent value="step4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Pot Projection</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={projection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatGBP(Number(v))} />
                    <Line type="monotone" dataKey="pot" stroke="hsl(var(--primary))" strokeWidth={2} name="Remaining pot" />
                    <Line type="monotone" dataKey="realIncome" stroke="hsl(var(--accent))" strokeWidth={2} name="Real income" />
                  </LineChart>
                </ResponsiveContainer>
                <Button onClick={() => setStep(5)} className="w-full mt-4">Review &amp; Apply<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Apply */}
          <TabsContent value="step5">
            <Card>
              <CardHeader><CardTitle>Confirm &amp; Process</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <Row label="Client" value={`${client?.first_name || ''} ${client?.last_name || ''}`} />
                  <Row label="Account" value={account?.account_type || ''} />
                  <Row label="Mode" value={mode} />
                  <Row label="Pot value" value={formatGBP(potValue)} />
                  {mode !== "ANNUITY" && (
                    <>
                      <Row label="PCLS / tax-free" value={formatGBP(mode === "UFPLS" ? ufplsCalc.taxFreePortion : pcls)} variant="success" />
                      <Row label="Taxable" value={formatGBP(mode === "UFPLS" ? ufplsCalc.taxablePortion : annualIncome)} />
                      <Row label="Tax" value={formatGBP(mode === "UFPLS" ? ufplsCalc.tax.totalTax : fadCalc.tax.totalTax)} variant="destructive" />
                    </>
                  )}
                </div>
                <div className="rounded-lg border p-3 text-xs bg-muted/30 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div><strong>Journey:</strong> {journeyType === "advised" ? "Advised (COBS 9 / 9A)" : journeyType === "non_advised" ? "Non-advised (COBS 19.7A stronger nudge applied)" : "Not set"}</div>
                    <div><strong>Risk warnings:</strong> {rrwAllAck ? "All acknowledged" : "Incomplete"}</div>
                    {journeyType === "non_advised" && (
                      <div><strong>Pension Wise:</strong> {pwOutcome === "received" ? "Already received guidance/advice" : pwOutcome === "booked" ? "Appointment booked" : pwOutcome === "optout" ? "Opted out (reason recorded)" : "Not recorded"}</div>
                    )}
                  </div>
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting || !accountId || !eligible || !disclosuresComplete || mode === "ANNUITY"}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === "ANNUITY" ? "Annuity purchase — contact provider" : "Process drawdown"}
                </Button>
                {!accountId && <p className="text-sm text-destructive">Selected client has no SIPP account.</p>}
                {!eligible && <p className="text-sm text-destructive">Client is below NMPA ({NMPA}).</p>}
                {!disclosuresComplete && <p className="text-sm text-destructive">FCA mandatory disclosures (Step 0) must be completed before processing.</p>}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 7: Done */}
          <TabsContent value="step7">
            <Card>
              <CardContent className="pt-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-success mx-auto" />
                <h2 className="text-2xl font-bold">Drawdown processed</h2>
                <p className="text-muted-foreground">BCE event, crystallisation segment and transactions have been recorded.</p>
                <Button onClick={() => setStep(1)} variant="outline">Process another</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Recent transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {transactions.slice(0, 8).map(t => (
                  <div key={t.id} className="flex justify-between border-b py-1 last:border-0">
                    <span>{new Date(t.created_at).toLocaleDateString("en-GB")} · {t.transaction_type}</span>
                    <span className={Number(t.amount) < 0 ? "text-destructive" : "text-success"}>{formatGBP(Number(t.amount))}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, variant, muted, bold }: { label: string; value: string; variant?: "success" | "destructive"; muted?: boolean; bold?: boolean }) {
  const cls = variant === "success" ? "text-success" : variant === "destructive" ? "text-destructive" : muted ? "text-muted-foreground" : "";
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`font-medium ${cls}`}>{value}</span>
    </div>
  );
}
