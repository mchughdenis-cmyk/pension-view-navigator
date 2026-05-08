import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, ShieldCheck,
  Building2, Repeat, Zap, Sparkles, FileSignature, ClipboardList,
} from "lucide-react";

const DEMO_CLIENT = "a1111111-1111-1111-1111-111111111111";

type StepState = "complete" | "in_progress" | "blocked" | "todo";

interface Step {
  id: string;
  title: string;
  description: string;
  state: StepState;
  detail?: string;
  cta?: { label: string; to: string };
  icon: typeof ShieldCheck;
}

const STATE_STYLES: Record<StepState, { badge: string; label: string; icon: any }> = {
  complete:    { badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Complete",    icon: CheckCircle2 },
  in_progress: { badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400",          label: "In progress", icon: Clock },
  blocked:     { badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400",       label: "Action needed", icon: AlertTriangle },
  todo:        { badge: "bg-muted text-muted-foreground",                            label: "Not started", icon: Circle },
};

export default function OnboardingTracker() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: kyc }, { data: bc }, { data: dd }, { data: pi }] = await Promise.all([
      supabase.from("kyc_cases").select("*").eq("client_id", DEMO_CLIENT).order("started_at", { ascending: false }).limit(1),
      supabase.from("bank_connections").select("*").eq("client_id", DEMO_CLIENT),
      supabase.from("dd_mandates").select("*").eq("client_id", DEMO_CLIENT),
      supabase.from("payment_initiations").select("*").eq("client_id", DEMO_CLIENT),
    ]);

    const k = kyc?.[0];
    const activeBank = (bc || []).find(b => b.status === "active");
    const expiredBank = (bc || []).find(b => b.status === "expired");
    const activeDd = (dd || []).find(m => m.status === "active");
    const settledPi = (pi || []).find(p => p.status === "settled");

    const out: Step[] = [
      {
        id: "personal",
        title: "Personal details",
        description: "Tell us who you are and how to reach you.",
        state: "complete",
        detail: "Provided during sign-up",
        icon: ClipboardList,
      },
      {
        id: "kyc",
        title: "Identity verification (KYC)",
        description: "Upload an ID document, take a liveness selfie, and pass AML screening.",
        state: !k ? "todo"
          : k.status === "verified" ? "complete"
          : k.status === "review" ? "blocked"
          : "in_progress",
        detail: k
          ? `${k.provider} · risk ${k.risk_score}/100 · ${k.status}`
          : "Required before you can fund your account",
        cta: !k || k.status !== "verified" ? { label: "Continue KYC", to: "/kyc" } : { label: "View result", to: "/kyc" },
        icon: ShieldCheck,
      },
      {
        id: "bank",
        title: "Link your bank (Open Banking)",
        description: "Securely connect your bank to fund and verify your account.",
        state: activeBank ? "complete" : expiredBank ? "blocked" : "todo",
        detail: activeBank
          ? `${activeBank.bank_name} · consent expires ${new Date(activeBank.consent_expires_at).toLocaleDateString()}`
          : expiredBank
          ? `${expiredBank.bank_name} consent expired — please reconnect`
          : "TrueLayer (mock) · 90-day consent",
        cta: { label: activeBank ? "Manage banks" : "Link bank", to: "/cash-onboarding" },
        icon: Building2,
      },
      {
        id: "fund",
        title: "Make your first contribution",
        description: "One-off Faster Payment via PISP, or skip if you prefer Direct Debit only.",
        state: settledPi ? "complete" : "todo",
        detail: settledPi
          ? `£${Number(settledPi.amount).toLocaleString()} settled · ${settledPi.reference}`
          : "TrueLayer Pay (mock) · settles in seconds",
        cta: settledPi ? undefined : { label: "Pay now", to: "/cash-onboarding" },
        icon: Zap,
      },
      {
        id: "dd",
        title: "Set up regular contributions",
        description: "Optional: sign a Bacs Direct Debit for monthly top-ups.",
        state: activeDd ? "complete" : "todo",
        detail: activeDd
          ? `£${Number(activeDd.amount).toLocaleString()} ${activeDd.frequency} · next ${activeDd.next_collection ? new Date(activeDd.next_collection).toLocaleDateString() : "—"}`
          : "GoCardless (mock) · Direct Debit Guarantee applies",
        cta: activeDd ? { label: "Manage mandate", to: "/cash-onboarding" } : { label: "Set up Direct Debit", to: "/cash-onboarding" },
        icon: Repeat,
      },
      {
        id: "welcome",
        title: "Welcome pack & T&Cs",
        description: "Review your scheme rules, key features and illustrations.",
        state: settledPi || activeDd ? "complete" : "todo",
        detail: "Digitally signed and stored in your Document Vault",
        cta: { label: "Open welcome pack", to: "/welcome-pack" },
        icon: FileSignature,
      },
    ];

    setSteps(out);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const completed = steps.filter(s => s.state === "complete").length;
  const blocked = steps.filter(s => s.state === "blocked").length;
  const pct = steps.length ? (completed / steps.length) * 100 : 0;
  const nextStep = steps.find(s => s.state !== "complete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your onboarding progress"
        description="Track each step to get fully set up. We'll guide you through anything outstanding."
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="text-3xl font-bold">{completed} of {steps.length} steps complete</div>
              <div className="text-sm text-muted-foreground">
                {blocked > 0
                  ? `${blocked} step${blocked > 1 ? "s" : ""} need your attention`
                  : nextStep
                  ? `Next up: ${nextStep.title}`
                  : "All done — welcome aboard."}
              </div>
            </div>
            {nextStep?.cta && (
              <Button asChild>
                <Link to={nextStep.cta.to}>
                  {nextStep.cta.label} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      {blocked > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-amber-700 dark:text-amber-400">Action needed</div>
              <div className="text-muted-foreground">
                One or more steps require your input. Resolve the highlighted items below to continue.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {steps.map((s, i) => {
          const Style = STATE_STYLES[s.state];
          const StateIcon = Style.icon;
          return (
            <Card
              key={s.id}
              className={
                s.state === "blocked"
                  ? "border-amber-500/30"
                  : s.state === "complete"
                  ? "border-emerald-500/20"
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        s.state === "complete"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : s.state === "blocked"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : s.state === "in_progress"
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StateIcon className="w-5 h-5" />
                    </div>
                    {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-2 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <s.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          Step {i + 1}: {s.title}
                        </span>
                      </div>
                      <Badge className={Style.badge}>{Style.label}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{s.description}</div>
                    {s.detail && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> {s.detail}
                      </div>
                    )}
                    {s.cta && (
                      <Button
                        asChild
                        size="sm"
                        variant={s.state === "complete" ? "outline" : "default"}
                        className="mt-3"
                      >
                        <Link to={s.cta.to}>
                          {s.cta.label} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
