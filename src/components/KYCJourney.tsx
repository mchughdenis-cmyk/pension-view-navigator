import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  ShieldCheck, IdCard, Camera, FileCheck2, Search, CheckCircle2, AlertTriangle,
  Loader2, ScanFace, Sparkles, FileText, Building2,
} from "lucide-react";
import { useDraft, loadDraft } from "@/hooks/useDraft";
import { ResumeBanner, SavedIndicator } from "@/components/ResumeBanner";

const STEPS = [
  { id: "personal",  label: "Personal details", icon: IdCard },
  { id: "document",  label: "ID document",      icon: FileCheck2 },
  { id: "selfie",    label: "Liveness selfie",  icon: ScanFace },
  { id: "address",   label: "Address proof",    icon: Building2 },
  { id: "screening", label: "AML screening",    icon: Search },
  { id: "decision",  label: "Decision",         icon: CheckCircle2 },
] as const;
type StepId = typeof STEPS[number]["id"];

const PROVIDERS = ["Onfido", "Veriff", "ComplyAdvantage", "GBG"];

const DRAFT_KEY = "kyc_journey_draft_v1";

interface KycDraft {
  step: StepId;
  caseId: string | null;
  details: { firstName: string; lastName: string; dob: string; nationality: string; address: string };
  docType: string;
  docFile: string | null;
  selfie: string | null;
  poaFile: string | null;
}

export default function KYCJourney() {
  const draft = loadDraft<KycDraft>(DRAFT_KEY);
  // Show resume banner if a draft exists AND it's not at the very first step
  const [resumeOpen, setResumeOpen] = useState(!!draft && draft.step !== "personal");

  const [step, setStep] = useState<StepId>("personal");
  const [running, setRunning] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [details, setDetails] = useState(draft?.details ?? {
    firstName: "Alex",
    lastName: "Morgan",
    dob: "1980-05-21",
    nationality: "United Kingdom",
    address: "12 Baker Street, London NW1 6XE",
  });
  const [docType, setDocType] = useState(draft?.docType ?? "passport");
  const [docFile, setDocFile] = useState<string | null>(draft?.docFile ?? null);
  const [selfie, setSelfie] = useState<string | null>(draft?.selfie ?? null);
  const [poaFile, setPoaFile] = useState<string | null>(draft?.poaFile ?? null);
  const [checks, setChecks] = useState<Record<string, "idle" | "running" | "pass" | "review" | "fail">>({
    document: "idle", liveness: "idle", address: "idle", pep: "idle", sanctions: "idle", adverse: "idle",
  });
  const [decision, setDecision] = useState<"verified" | "review" | "rejected" | null>(null);
  const [riskScore, setRiskScore] = useState(0);

  // Auto-save draft (excluding the resume banner state)
  const { savedAt, clear: clearDraft, hadDraft } = useDraft<KycDraft>(
    DRAFT_KEY,
    { step, caseId, details, docType, docFile, selfie, poaFile },
    { skip: step === "decision" && decision === "verified" } // stop saving after verified
  );

  const stepIndex = STEPS.findIndex(s => s.id === step);
  const progress = ((stepIndex) / (STEPS.length - 1)) * 100;

  const handleResume = () => {
    if (draft) {
      setStep(draft.step);
      setCaseId(draft.caseId);
    }
    setResumeOpen(false);
    toast.success("Welcome back — picking up where you left off");
  };
  const handleDiscard = () => {
    clearDraft();
    setResumeOpen(false);
    toast.info("Draft discarded");
  };

  // Clear draft once we hit a verified decision
  useEffect(() => {
    if (decision === "verified") clearDraft();
  }, [decision]);


  const startCase = async () => {
    const { data, error } = await supabase
      .from("kyc_cases")
      .insert({
        client_id: crypto.randomUUID(),
        provider: "Onfido (mock)",
        provider_ref: `ONF-MK-${Math.floor(Math.random() * 9000) + 1000}`,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select("id").single();
    if (error) { toast.error("Failed to start KYC case"); return null; }
    setCaseId(data.id);
    return data.id;
  };

  const next = async () => {
    if (step === "personal") { await startCase(); setStep("document"); return; }
    if (step === "document") setStep("selfie");
    else if (step === "selfie") setStep("address");
    else if (step === "address") setStep("screening");
    else if (step === "screening") setStep("decision");
  };

  const runScreening = async () => {
    setRunning(true);
    const order: (keyof typeof checks)[] = ["document", "liveness", "address", "pep", "sanctions", "adverse"];
    let score = 0;
    for (const k of order) {
      setChecks(c => ({ ...c, [k]: "running" }));
      await new Promise(r => setTimeout(r, 700));
      // Simulated PEP near-match for demo realism if surname is "morgan" etc; otherwise pass.
      const isPep = k === "pep" && details.lastName.toLowerCase() === "thompson";
      const result: "pass" | "review" = isPep ? "review" : "pass";
      if (result === "review") score += 40; else score += Math.floor(Math.random() * 8);
      setChecks(c => ({ ...c, [k]: result }));
    }
    setRiskScore(Math.min(100, score));
    const overall = score >= 60 ? "review" : "verified";
    setDecision(overall);
    if (caseId) {
      await supabase.from("kyc_cases").update({
        status: overall, risk_score: score, risk_level: score >= 60 ? "medium" : "low",
        completed_at: new Date().toISOString(),
      }).eq("id", caseId);
    }
    setRunning(false);
    setStep("decision");
  };

  const checkBadge = (s: keyof typeof checks) => {
    const v = checks[s];
    if (v === "idle") return <Badge variant="outline">Pending</Badge>;
    if (v === "running") return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
    if (v === "pass") return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Pass</Badge>;
    if (v === "review") return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">Manual review</Badge>;
    return <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity verification (KYC)"
        description="Verify your identity in minutes. Powered by Onfido, ComplyAdvantage and GBG (mock providers)."
      />

      <ResumeBanner
        show={resumeOpen}
        savedAt={savedAt}
        onResume={handleResume}
        onDiscard={handleDiscard}
        label="Resume your KYC verification"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${i <= stepIndex ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                  <s.icon className="w-3.5 h-3.5" /> {s.label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <SavedIndicator savedAt={savedAt} />
              <Badge variant="outline" className="gap-1"><Sparkles className="w-3 h-3" /> Mock</Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          {!resumeOpen && hadDraft && step !== "personal" && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => { handleDiscard(); setStep("personal"); setCaseId(null); }}>
                Start over
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {step === "personal" && (
        <Card>
          <CardHeader><CardTitle>Personal details</CardTitle><CardDescription>This must match your ID document.</CardDescription></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>First name</Label><Input value={details.firstName} onChange={e => setDetails({ ...details, firstName: e.target.value })} /></div>
            <div><Label>Last name</Label><Input value={details.lastName} onChange={e => setDetails({ ...details, lastName: e.target.value })} /></div>
            <div><Label>Date of birth</Label><Input type="date" value={details.dob} onChange={e => setDetails({ ...details, dob: e.target.value })} /></div>
            <div><Label>Nationality</Label><Input value={details.nationality} onChange={e => setDetails({ ...details, nationality: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Residential address</Label><Input value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })} /></div>
            <div className="md:col-span-2 flex justify-end"><Button onClick={next}>Continue</Button></div>
          </CardContent>
        </Card>
      )}

      {step === "document" && (
        <Card>
          <CardHeader><CardTitle>Upload an ID document</CardTitle><CardDescription>Onfido (mock) will extract MRZ and verify integrity.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={docType} onValueChange={setDocType} className="grid md:grid-cols-3 gap-3">
              {[["passport", "Passport"], ["driving_licence", "Driving licence"], ["national_id", "National ID"]].map(([v, l]) => (
                <Label key={v} className={`border rounded-lg p-3 flex items-center gap-2 cursor-pointer ${docType === v ? "border-primary bg-primary/5" : ""}`}>
                  <RadioGroupItem value={v} /> <FileText className="w-4 h-4" /> {l}
                </Label>
              ))}
            </RadioGroup>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {docFile ? <div className="flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 /> {docFile} uploaded</div> :
                <Button variant="outline" onClick={() => { setDocFile(`${docType}-${details.lastName.toLowerCase()}.jpg`); toast.success("Document uploaded — extracting data"); }}>
                  <FileCheck2 className="w-4 h-4 mr-2" />Capture / upload document
                </Button>}
            </div>
            <div className="flex justify-end"><Button onClick={next} disabled={!docFile}>Continue</Button></div>
          </CardContent>
        </Card>
      )}

      {step === "selfie" && (
        <Card>
          <CardHeader><CardTitle>Liveness selfie</CardTitle><CardDescription>We'll match your face to your ID. Mock face-match returns ~0.95.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {selfie ? <div className="flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 /> Face match {selfie}</div> :
                <Button variant="outline" onClick={() => setSelfie("0.95")}><Camera className="w-4 h-4 mr-2" />Take liveness selfie</Button>}
            </div>
            <div className="flex justify-end"><Button onClick={next} disabled={!selfie}>Continue</Button></div>
          </CardContent>
        </Card>
      )}

      {step === "address" && (
        <Card>
          <CardHeader><CardTitle>Proof of address</CardTitle><CardDescription>Utility bill or bank statement, dated within 3 months. GBG (mock) cross-references electoral roll & credit header.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {poaFile ? <div className="flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 /> {poaFile} uploaded</div> :
                <Button variant="outline" onClick={() => setPoaFile("utility-bill-oct-2024.pdf")}><FileCheck2 className="w-4 h-4 mr-2" />Upload proof of address</Button>}
            </div>
            <div className="flex justify-end"><Button onClick={next} disabled={!poaFile}>Continue</Button></div>
          </CardContent>
        </Card>
      )}

      {step === "screening" && (
        <Card>
          <CardHeader><CardTitle>AML screening</CardTitle><CardDescription>PEP, sanctions and adverse media via ComplyAdvantage (mock).</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {(["document","liveness","address","pep","sanctions","adverse"] as const).map(k => (
              <div key={k} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium capitalize">{k.replace("_"," ")}</div>
                    <div className="text-xs text-muted-foreground">{PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)]} (mock)</div>
                  </div>
                </div>
                {checkBadge(k)}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button onClick={runScreening} disabled={running}>
                {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running checks…</> : <>Run AML screening <Search className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "decision" && decision && (
        <Card className={decision === "verified" ? "border-emerald-500/30" : "border-amber-500/30"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {decision === "verified" ? <CheckCircle2 className="w-7 h-7 text-emerald-600" /> : <AlertTriangle className="w-7 h-7 text-amber-600" />}
              <div>
                <CardTitle>{decision === "verified" ? "Verified" : "Manual review required"}</CardTitle>
                <CardDescription>
                  {decision === "verified"
                    ? "All checks passed. Your account is ready to fund."
                    : "A potential PEP near-match was found. An adviser will review within 1 business day."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="text-sm">Risk score</div>
              <div className="font-semibold">{riskScore} / 100 ({riskScore >= 60 ? "medium" : "low"})</div>
            </div>
            <div className="flex gap-2">
              {decision === "verified" && <Button onClick={() => window.location.href = "/cash-onboarding"}>Fund my account →</Button>}
              <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Back to dashboard</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
