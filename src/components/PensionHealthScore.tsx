import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartPulse, TrendingUp, AlertTriangle, CheckCircle2, Users } from "lucide-react";

interface Inputs {
  age: number;
  salary: number;
  potValue: number;
  monthlyContribution: number;
  employerMatch: number;
  hasExpressionOfWish: boolean;
  diversified: boolean;
  reviewedLast12m: boolean;
}

const cohortAverages: Record<string, { pot: number; contribPct: number }> = {
  "20-29": { pot: 12000, contribPct: 6 },
  "30-39": { pot: 48000, contribPct: 8 },
  "40-49": { pot: 122000, contribPct: 10 },
  "50-59": { pot: 230000, contribPct: 12 },
  "60+":   { pot: 310000, contribPct: 14 },
};

const cohortBand = (age: number) =>
  age < 30 ? "20-29" : age < 40 ? "30-39" : age < 50 ? "40-49" : age < 60 ? "50-59" : "60+";

function calcScore(i: Inputs) {
  const contribPct = ((i.monthlyContribution + i.employerMatch) * 12) / Math.max(i.salary, 1) * 100;
  const ageMultiplier = Math.max(1, (i.age - 22) * 0.6);
  const expectedPot = i.salary * ageMultiplier;
  const potRatio = i.potValue / Math.max(expectedPot, 1);

  const contribScore = Math.min(30, contribPct * 2);
  const potScore = Math.min(35, potRatio * 25);
  const diversifyScore = i.diversified ? 12 : 4;
  const reviewScore = i.reviewedLast12m ? 12 : 3;
  const eowScore = i.hasExpressionOfWish ? 11 : 2;

  const total = Math.round(contribScore + potScore + diversifyScore + reviewScore + eowScore);
  return {
    total: Math.min(100, total),
    breakdown: {
      Contributions: Math.round(contribScore),
      "Pot trajectory": Math.round(potScore),
      Diversification: diversifyScore,
      "Annual review": reviewScore,
      "Expression of wish": eowScore,
    },
    contribPct,
  };
}

const narrativeFor = (score: number) =>
  score >= 80 ? "You're tracking well above benchmark. Keep the discipline going."
  : score >= 60 ? "You're on a solid footing — a few targeted moves could lift you into the top quartile."
  : score >= 40 ? "There's meaningful headroom. Small contribution increases compound powerfully."
  : "Your plan needs attention. Let's tackle the highest-impact gaps first.";

export default function PensionHealthScore() {
  const [inputs, setInputs] = useState<Inputs>({
    age: 42,
    salary: 65000,
    potValue: 145000,
    monthlyContribution: 450,
    employerMatch: 325,
    hasExpressionOfWish: true,
    diversified: true,
    reviewedLast12m: false,
  });
  const [typed, setTyped] = useState("");

  const { total, breakdown, contribPct } = useMemo(() => calcScore(inputs), [inputs]);
  const cohort = cohortAverages[cohortBand(inputs.age)];
  const narrative = narrativeFor(total);

  useEffect(() => {
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      setTyped(narrative.slice(0, i++));
      if (i > narrative.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [narrative]);

  const tone = total >= 80 ? "text-emerald-500" : total >= 60 ? "text-primary" : total >= 40 ? "text-amber-500" : "text-destructive";

  const actions = [
    !inputs.reviewedLast12m && { label: "Book an annual review", icon: AlertTriangle, impact: "+12 pts" },
    contribPct < 10 && { label: "Increase contribution by 2%", icon: TrendingUp, impact: "+8 pts" },
    !inputs.hasExpressionOfWish && { label: "Complete expression of wish", icon: AlertTriangle, impact: "+9 pts" },
    !inputs.diversified && { label: "Diversify your holdings", icon: AlertTriangle, impact: "+8 pts" },
  ].filter(Boolean) as Array<{ label: string; icon: typeof TrendingUp; impact: string }>;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <header className="flex items-center gap-3">
        <HeartPulse className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Pension Health Score</h1>
          <p className="text-sm text-muted-foreground">A single number that tells you if you're on track.</p>
        </div>
      </header>

      <Card>
        <CardContent className="pt-6 grid md:grid-cols-[200px_1fr] gap-6 items-center">
          <div className="text-center">
            <div className={`text-7xl font-bold ${tone}`}>{total}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">out of 100</div>
          </div>
          <div className="space-y-3">
            <p className="text-lg leading-relaxed min-h-[60px]">
              {typed}<span className="animate-pulse">|</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Age {inputs.age}</Badge>
              <Badge variant="outline">Pot £{(inputs.potValue / 1000).toFixed(0)}k</Badge>
              <Badge variant="outline">{contribPct.toFixed(1)}% contributions</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Score breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{k}</span><span className="font-medium">{v}</span></div>
                <Progress value={(v / (k === "Pot trajectory" ? 35 : k === "Contributions" ? 30 : 12)) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Cohort comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Your pot</span><span className="font-medium">£{(inputs.potValue / 1000).toFixed(0)}k</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (inputs.potValue / cohort.pot) * 50)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Cohort avg £{(cohort.pot / 1000).toFixed(0)}k</span>
                <span>{inputs.potValue > cohort.pot ? "Above" : "Below"} average</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Your contributions</span><span className="font-medium">{contribPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (contribPct / cohort.contribPct) * 50)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Cohort avg {cohort.contribPct}%</span>
                <span>{contribPct > cohort.contribPct ? "Above" : "Below"} average</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {actions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Top actions to lift your score</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {actions.map((a) => (
              <div key={a.label} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <a.icon className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{a.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{a.impact}</Badge>
                  <Button size="sm" variant="outline">Take action</Button>
                </div>
              </div>
            ))}
            {actions.length === 0 && (
              <div className="flex items-center gap-2 text-emerald-500 text-sm">
                <CheckCircle2 className="h-4 w-4" /> All key actions complete — keep it up.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Adjust your scenario</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          {[
            ["age", "Age"],
            ["salary", "Salary (£)"],
            ["potValue", "Pot value (£)"],
            ["monthlyContribution", "Your monthly (£)"],
            ["employerMatch", "Employer monthly (£)"],
          ].map(([k, label]) => (
            <label key={k} className="space-y-1">
              <span className="text-muted-foreground">{label}</span>
              <input
                type="number"
                value={(inputs as any)[k]}
                onChange={(e) => setInputs({ ...inputs, [k]: Number(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-md border bg-background"
              />
            </label>
          ))}
          {[
            ["hasExpressionOfWish", "Expression of wish completed"],
            ["diversified", "Portfolio diversified"],
            ["reviewedLast12m", "Reviewed in last 12 months"],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(inputs as any)[k]}
                onChange={(e) => setInputs({ ...inputs, [k]: e.target.checked })}
              />
              <span>{label}</span>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
