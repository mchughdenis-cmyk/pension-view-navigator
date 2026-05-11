import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import {
  ShieldCheck, FileText, Camera, Globe, MapPin, AlertTriangle,
  CheckCircle2, Loader2, XCircle, Upload,
} from "lucide-react";

type CheckState = "pending" | "uploading" | "checking" | "clear" | "review" | "fail";

type StageId = "document" | "selfie" | "pep" | "sanctions" | "address";

interface Stage {
  id: StageId;
  title: string;
  description: string;
  icon: typeof FileText;
}

const STAGES: Stage[] = [
  { id: "document", title: "Identity document", description: "Upload passport or driving licence (front + back).", icon: FileText },
  { id: "selfie", title: "Liveness selfie", description: "Take a short selfie video to confirm liveness.", icon: Camera },
  { id: "pep", title: "PEP screening", description: "Cross-checked against global Politically Exposed Persons list.", icon: Globe },
  { id: "sanctions", title: "Sanctions screening", description: "OFAC, HM Treasury, EU and UN consolidated lists.", icon: ShieldCheck },
  { id: "address", title: "Address verification", description: "Recent utility bill or bank statement (≤3 months old).", icon: MapPin },
];

const STATUS_META: Record<CheckState, { label: string; tone: "default" | "outline" | "destructive"; icon: any }> = {
  pending:   { label: "Pending",       tone: "outline",     icon: AlertTriangle },
  uploading: { label: "Uploading",     tone: "outline",     icon: Loader2 },
  checking:  { label: "Checking",      tone: "outline",     icon: Loader2 },
  clear:     { label: "Clear",         tone: "default",     icon: CheckCircle2 },
  review:    { label: "Manual review", tone: "outline",     icon: AlertTriangle },
  fail:      { label: "Failed",        tone: "destructive", icon: XCircle },
};

/** Realistic mock KYC — visually faithful flow with simulated provider responses. */
export default function RealisticKYC() {
  const { firmId } = useFirm();
  const [clientId, setClientId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Carter");
  const [dob, setDob] = useState("1972-03-14");
  const [caseRef, setCaseRef] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [stageStates, setStageStates] = useState<Record<StageId, CheckState>>({
    document: "pending", selfie: "pending", pep: "pending", sanctions: "pending", address: "pending",
  });
  const [decision, setDecision] = useState<"clear" | "review" | "fail" | null>(null);

  const progress =
    (Object.values(stageStates).filter(s => s === "clear" || s === "review" || s === "fail").length / STAGES.length) * 100;

  const startCase = async () => {
    const ref = `KYC-${Date.now().toString(36).toUpperCase()}`;
    setCaseRef(ref);
    const { data, error } = await supabase
      .from("kyc_cases")
      .insert({
        provider: "Mock Verify (Onfido-style)",
        provider_ref: ref,
        status: "in_progress",
        firm_id: firmId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setCaseId(data.id);
    toast.success(`KYC case ${ref} opened`);
  };

  const runStage = async (stage: StageId) => {
    if (!caseId) { toast.error("Start a case first"); return; }
    setStageStates(s => ({ ...s, [stage]: stage === "document" || stage === "selfie" || stage === "address" ? "uploading" : "checking" }));
    await new Promise(r => setTimeout(r, stage === "document" ? 1400 : 900));
    setStageStates(s => ({ ...s, [stage]: "checking" }));
    await new Promise(r => setTimeout(r, 1100));

    // Simulated outcomes: 80% clear, 15% review, 5% fail — but PEP/Sanctions on synthetic name => always clear
    const roll = Math.random();
    const outcome: CheckState = roll < 0.8 ? "clear" : roll < 0.95 ? "review" : "fail";
    setStageStates(s => ({ ...s, [stage]: outcome }));

    await supabase.from("kyc_cases").update({
      [`${stage}_status`]: outcome,
    }).eq("id", caseId);
  };

  const finalise = async () => {
    const states = Object.values(stageStates);
    const anyFail = states.includes("fail");
    const anyReview = states.includes("review");
    const allDone = states.every(s => s === "clear" || s === "review" || s === "fail");
    if (!allDone) { toast.error("Run all checks first"); return; }
    const d = anyFail ? "fail" : anyReview ? "review" : "clear";
    setDecision(d);
    if (caseId) {
      await supabase.from("kyc_cases").update({
        status: d === "clear" ? "completed" : d === "review" ? "manual_review" : "rejected",
        decision: d,
        decision_reason: d === "clear"
          ? "All five checks clear — proceed to onboarding."
          : d === "review"
          ? "One or more checks require manual adjudication."
          : "Adverse finding — escalate to MLRO.",
        risk_level: d === "clear" ? "low" : d === "review" ? "medium" : "high",
        risk_score: d === "clear" ? 12 : d === "review" ? 55 : 88,
        completed_at: new Date().toISOString(),
      }).eq("id", caseId);
    }
    toast.success(`Case finalised: ${d.toUpperCase()}`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Identity verification (KYC)"
        description="Five-stage AML/KYC flow per JMLSG guidance — document, biometric liveness, PEP, sanctions, proof-of-address."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Applicant</span>
            {caseRef && <Badge variant="outline">Case · {caseRef}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>First name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} disabled={!!caseId} /></div>
            <div><Label>Last name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} disabled={!!caseId} /></div>
            <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={e => setDob(e.target.value)} disabled={!!caseId} /></div>
          </div>
          {!caseId ? (
            <Button onClick={startCase}>Open verification case</Button>
          ) : (
            <Progress value={progress} className="h-2" />
          )}
        </CardContent>
      </Card>

      {caseId && (
        <div className="grid grid-cols-1 gap-3">
          {STAGES.map(stage => {
            const Icon = stage.icon;
            const state = stageStates[stage.id];
            const meta = STATUS_META[state];
            const StatusIcon = meta.icon;
            const isBusy = state === "uploading" || state === "checking";
            return (
              <Card key={stage.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{stage.title}</div>
                    <div className="text-xs text-muted-foreground">{stage.description}</div>
                  </div>
                  <Badge variant={meta.tone} className="gap-1 capitalize">
                    <StatusIcon className={`h-3 w-3 ${isBusy ? "animate-spin" : ""}`} />
                    {meta.label}
                  </Badge>
                  <Button
                    size="sm"
                    variant={state === "clear" ? "outline" : "default"}
                    onClick={() => runStage(stage.id)}
                    disabled={isBusy}
                  >
                    {stage.id === "document" || stage.id === "selfie" || stage.id === "address" ? (
                      <Upload className="h-3.5 w-3.5 mr-1" />
                    ) : null}
                    {state === "pending" ? "Run" : state === "clear" ? "Re-run" : isBusy ? "…" : "Retry"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">Decision</div>
                <div className="text-xs text-muted-foreground">
                  {decision === null
                    ? "Run all five checks, then finalise."
                    : decision === "clear"
                    ? "All clear — proceed to onboarding."
                    : decision === "review"
                    ? "Manual review required — escalated to compliance."
                    : "Adverse finding — escalate to MLRO under POCA 2002."}
                </div>
              </div>
              {decision === null ? (
                <Button onClick={finalise}>Finalise case</Button>
              ) : (
                <Badge variant={decision === "clear" ? "default" : decision === "review" ? "outline" : "destructive"} className="text-xs">
                  {decision.toUpperCase()}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
