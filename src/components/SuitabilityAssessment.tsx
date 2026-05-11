import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import { FileText, ArrowRight, Download, CheckCircle2 } from "lucide-react";
import { exportToWord } from "@/lib/documentUtils";

// FCA COBS 9 generic — 8 questions covering objectives, K&E, financial situation, ATR.
type Q = { id: string; section: string; question: string; options: { label: string; score: number }[] };

const QUESTIONS: Q[] = [
  { id: "obj_horizon", section: "Objectives", question: "When do you plan to start drawing on this investment?",
    options: [
      { label: "Within 3 years", score: 1 },
      { label: "3–7 years", score: 3 },
      { label: "8–15 years", score: 5 },
      { label: "More than 15 years", score: 7 },
    ]},
  { id: "obj_goal", section: "Objectives", question: "What is the primary purpose of this money?",
    options: [
      { label: "Preserve capital — beat inflation only", score: 1 },
      { label: "Steady income in retirement", score: 3 },
      { label: "Long-term growth to fund retirement", score: 5 },
      { label: "Maximise growth, accept volatility", score: 7 },
    ]},
  { id: "ke_experience", section: "Knowledge & experience", question: "How would you describe your investment experience?",
    options: [
      { label: "None — first investment", score: 1 },
      { label: "Cash & bonds only", score: 3 },
      { label: "Funds & ETFs", score: 5 },
      { label: "Direct equities, derivatives, complex products", score: 7 },
    ]},
  { id: "ke_understanding", section: "Knowledge & experience", question: "How well do you understand that investments can fall as well as rise?",
    options: [
      { label: "I would be very uncomfortable with any loss", score: 1 },
      { label: "I understand but would worry", score: 3 },
      { label: "I accept losses are part of investing", score: 5 },
      { label: "I view drawdowns as buying opportunities", score: 7 },
    ]},
  { id: "fin_emergency", section: "Financial situation", question: "Do you have an emergency cash buffer of at least 6 months' expenditure?",
    options: [
      { label: "No — this money is my main savings", score: 1 },
      { label: "Some, but less than 6 months", score: 3 },
      { label: "Yes, 6–12 months", score: 5 },
      { label: "Yes, more than 12 months", score: 7 },
    ]},
  { id: "fin_capacity", section: "Capacity for loss", question: "If this investment fell 25% in a year, how would your standard of living be affected?",
    options: [
      { label: "Severely — could not meet essential costs", score: 1 },
      { label: "Noticeably — would need to cut back", score: 3 },
      { label: "Slightly — manageable", score: 5 },
      { label: "Not at all", score: 7 },
    ]},
  { id: "atr_reaction", section: "Attitude to risk", question: "If your portfolio dropped 20% in three months, you would most likely:",
    options: [
      { label: "Sell everything to stop further losses", score: 1 },
      { label: "Sell some to reduce risk", score: 3 },
      { label: "Hold and ride it out", score: 5 },
      { label: "Buy more at lower prices", score: 7 },
    ]},
  { id: "atr_preference", section: "Attitude to risk", question: "Which outcome appeals most over 10 years?",
    options: [
      { label: "+30% guaranteed, no chance of loss", score: 1 },
      { label: "+60% likely, up to 10% downside", score: 3 },
      { label: "+120% likely, up to 25% downside", score: 5 },
      { label: "+200% likely, up to 45% downside", score: 7 },
    ]},
];

const MAX_SCORE = QUESTIONS.length * 7;

function scoreToProfile(score: number): { atr: number; label: string; description: string } {
  const pct = score / MAX_SCORE;
  if (pct < 0.25) return { atr: 2, label: "Cautious", description: "Capital preservation with modest growth; low tolerance for short-term losses." };
  if (pct < 0.45) return { atr: 4, label: "Cautious-balanced", description: "Steady growth with limited volatility; suitable for shorter horizons." };
  if (pct < 0.65) return { atr: 6, label: "Balanced", description: "Diversified growth & income; tolerates moderate market drawdowns." };
  if (pct < 0.85) return { atr: 8, label: "Growth", description: "Equity-tilted, long-term growth; significant interim volatility accepted." };
  return { atr: 10, label: "Adventurous", description: "Maximum growth; high concentration in equities, frequent large drawdowns expected." };
}

type ModelPortfolio = {
  id: string;
  name: string;
  manager: string | null;
  risk_level: string | null;
  description: string | null;
  benchmark: string | null;
  ocf: number | null;
};

export default function SuitabilityAssessment() {
  const { firmId, firm } = useFirm();
  const [stage, setStage] = useState<"intro" | "questions" | "result">("intro");
  const [clientName, setClientName] = useState("");
  const [objectives, setObjectives] = useState("Build retirement income and preserve capital for beneficiaries.");
  const [horizon, setHorizon] = useState(15);
  const [capacity, setCapacity] = useState<"low" | "medium" | "high">("medium");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [models, setModels] = useState<ModelPortfolio[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("model_portfolios")
        .select("id, name, manager, risk_level, description, benchmark, ocf")
        .eq("status", "active")
        .order("risk_level");
      setModels((data ?? []) as ModelPortfolio[]);
    })();
  }, []);

  const score = useMemo(() => Object.values(answers).reduce((a, b) => a + b, 0), [answers]);
  const profile = useMemo(() => scoreToProfile(score), [score]);
  const answered = Object.keys(answers).length;
  const progress = (answered / QUESTIONS.length) * 100;

  const recommended = useMemo(() => {
    if (!models.length) return null;
    // map ATR 1-10 to nearest model risk_level if numeric, else by name keywords
    const targetAtr = profile.atr;
    const scored = models.map(m => {
      const num = Number(m.risk_level);
      let dist = 99;
      if (!Number.isNaN(num)) dist = Math.abs(num - targetAtr);
      else {
        const map: Record<string, number> = { cautious: 2, defensive: 3, "cautious-balanced": 4, balanced: 6, growth: 8, adventurous: 10 };
        const r = map[(m.risk_level || "").toLowerCase()] ?? map[(m.name || "").toLowerCase().split(" ")[0]] ?? 6;
        dist = Math.abs(r - targetAtr);
      }
      return { m, dist };
    }).sort((a, b) => a.dist - b.dist);
    return scored[0].m;
  }, [models, profile.atr]);

  const submit = async () => {
    if (answered < QUESTIONS.length) { toast.error("Please answer every question"); return; }
    if (!clientName.trim()) { toast.error("Enter the client's name"); return; }

    const rationale = [
      `Client ${clientName} scored ${score}/${MAX_SCORE} across the eight-question FCA COBS 9 framework, indicating a "${profile.label}" attitude to risk (ATR ${profile.atr}/10).`,
      `Capacity for loss is assessed as ${capacity} based on the financial-situation section. Time horizon ${horizon} years.`,
      recommended ? `The closest-fit model portfolio is "${recommended.name}" (manager: ${recommended.manager ?? "—"}, OCF ${recommended.ocf ?? "—"}%), benchmarked to ${recommended.benchmark ?? "n/a"}.` : "",
      `Client objectives: ${objectives}`,
      `Recommendation is consistent with COBS 9.2 — suitability test covering objectives, financial situation, knowledge & experience, and attitude to risk.`,
    ].filter(Boolean).join("\n\n");

    const { data, error } = await supabase
      .from("suitability_reports")
      .insert({
        recommendation: recommended ? `Invest into ${recommended.name}` : `Risk profile ${profile.label}`,
        rationale,
        risk_alignment: `${profile.label} (ATR ${profile.atr}/10)`,
        costs_summary: recommended?.ocf ? `OCF ${recommended.ocf}% pa` : "TBC",
        status: "draft",
        firm_id: firmId,
        atr_score: profile.atr,
        capacity_for_loss: capacity,
        objectives,
        time_horizon_years: horizon,
        recommended_portfolio_id: recommended?.id ?? null,
        responses: { answers, clientName },
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setSavedId(data.id);
    setStage("result");
    toast.success("Suitability assessment saved");
  };

  const exportReport = async () => {
    const body = [
      { type: "heading", text: "Suitability Report (COBS 9)" },
      { type: "paragraph", text: `Firm: ${firm?.name ?? "—"} · FRN ${firm?.fca_ref ?? "—"}` },
      { type: "paragraph", text: `Client: ${clientName}` },
      { type: "paragraph", text: `Date: ${new Date().toLocaleDateString("en-GB")}` },
      { type: "heading", text: "Risk profile" },
      { type: "paragraph", text: `${profile.label} (ATR ${profile.atr}/10) — ${profile.description}` },
      { type: "paragraph", text: `Score: ${score} / ${MAX_SCORE}` },
      { type: "paragraph", text: `Capacity for loss: ${capacity}` },
      { type: "paragraph", text: `Investment time horizon: ${horizon} years` },
      { type: "heading", text: "Objectives" },
      { type: "paragraph", text: objectives },
      { type: "heading", text: "Recommendation" },
      { type: "paragraph", text: recommended
        ? `Invest into ${recommended.name} (manager: ${recommended.manager ?? "—"}). OCF ${recommended.ocf ?? "—"}%. Benchmark ${recommended.benchmark ?? "—"}.`
        : `Risk profile ${profile.label}` },
      { type: "heading", text: "Rationale" },
      ...QUESTIONS.map(q => ({ type: "paragraph" as const, text: `${q.question} — ${q.options.find(o => o.score === answers[q.id])?.label ?? "—"}` })),
      { type: "paragraph", text: "Issued under FCA COBS 9 by Pension Navigator by Airgead. Guidance only — please discuss with your authorised adviser." },
    ];
    await exportToWord({ title: `Suitability Report - ${clientName}`, sections: body as any });
  };

  if (stage === "intro") {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
        <PageHeader
          title="Suitability assessment"
          description="FCA COBS 9 eight-question framework — objectives, knowledge & experience, financial situation, and attitude to risk."
        />
        <Card>
          <CardHeader><CardTitle className="text-base">Client details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Client name</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Alex Carter" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Time horizon (years)</Label><Input type="number" min={1} max={50} value={horizon} onChange={e => setHorizon(Number(e.target.value))} /></div>
              <div>
                <Label>Capacity for loss</Label>
                <RadioGroup value={capacity} onValueChange={v => setCapacity(v as any)} className="flex gap-3 mt-2">
                  {(["low","medium","high"] as const).map(c => (
                    <div key={c} className="flex items-center gap-1.5">
                      <RadioGroupItem value={c} id={`cap-${c}`} /><Label htmlFor={`cap-${c}`} className="capitalize text-sm">{c}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <div><Label>Objectives</Label><Textarea value={objectives} onChange={e => setObjectives(e.target.value)} rows={3} /></div>
            <Button onClick={() => setStage("questions")} disabled={!clientName.trim()} className="gap-2">
              Begin questionnaire <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "questions") {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
        <PageHeader title="Suitability assessment" description={`${answered} of ${QUESTIONS.length} questions answered`} />
        <Progress value={progress} className="h-2" />
        {QUESTIONS.map((q, i) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-sm">
                <Badge variant="outline" className="mr-2 text-[10px]">{q.section}</Badge>
                {i + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[q.id]?.toString() ?? ""}
                onValueChange={v => setAnswers(a => ({ ...a, [q.id]: Number(v) }))}
                className="space-y-2"
              >
                {q.options.map(o => (
                  <div key={o.label} className="flex items-start gap-2 p-2 rounded border hover:bg-muted/40 cursor-pointer">
                    <RadioGroupItem value={o.score.toString()} id={`${q.id}-${o.score}`} />
                    <Label htmlFor={`${q.id}-${o.score}`} className="text-sm font-normal cursor-pointer flex-1">{o.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStage("intro")}>Back</Button>
          <Button onClick={submit} disabled={answered < QUESTIONS.length} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Calculate & save
          </Button>
        </div>
      </div>
    );
  }

  // Result
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Suitability report" description={`Generated for ${clientName}`} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Risk profile</span>
            <Badge>{profile.label} · ATR {profile.atr}/10</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">{profile.description}</p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div><div className="text-xs text-muted-foreground">Score</div><div className="font-medium">{score} / {MAX_SCORE}</div></div>
            <div><div className="text-xs text-muted-foreground">Capacity</div><div className="font-medium capitalize">{capacity}</div></div>
            <div><div className="text-xs text-muted-foreground">Horizon</div><div className="font-medium">{horizon} yrs</div></div>
          </div>
        </CardContent>
      </Card>

      {recommended && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recommended model portfolio</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-semibold">{recommended.name}</div>
            <div className="text-xs text-muted-foreground">
              Manager: {recommended.manager ?? "—"} · Risk: {recommended.risk_level ?? "—"} · OCF: {recommended.ocf ?? "—"}%
            </div>
            <p className="pt-2">{recommended.description}</p>
            <div className="text-xs text-muted-foreground">Benchmark: {recommended.benchmark ?? "—"}</div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={exportReport} className="gap-2"><Download className="h-4 w-4" /> Export Word report</Button>
        <Button variant="outline" onClick={() => { setStage("intro"); setAnswers({}); setSavedId(null); }}>
          New assessment
        </Button>
      </div>
      {savedId && <div className="text-xs text-muted-foreground">Saved with ID {savedId.slice(0, 8)}…</div>}
    </div>
  );
}
