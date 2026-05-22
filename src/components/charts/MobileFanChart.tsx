// PWA.3 — Mobile-optimised fan chart
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { haptic } from "@/utils/haptic";

type Scenario = "Cautious" | "Moderate" | "Adventurous";
const RATES: Record<Scenario, number> = { Cautious: 0.03, Moderate: 0.05, Adventurous: 0.07 };

interface Props {
  currentAge?: number;
  retirementAge?: number;
  currentPot?: number;
  annualContribution?: number;
}

export default function MobileFanChart({
  currentAge = 35,
  retirementAge = 67,
  currentPot = 45000,
  annualContribution = 6000,
}: Props) {
  const [scenario, setScenario] = useState<Scenario>("Moderate");

  const data = useMemo(() => {
    const rate = RATES[scenario];
    const rows: { age: number; value: number }[] = [];
    let v = currentPot;
    for (let age = currentAge; age <= 90; age++) {
      rows.push({ age, value: Math.round(v) });
      if (age < retirementAge) v = v * (1 + rate) + annualContribution;
      else v = v * (1 + rate * 0.5) - 20000;
    }
    return rows;
  }, [scenario, currentAge, retirementAge, currentPot, annualContribution]);

  const projected = data.find((d) => d.age === retirementAge)?.value || 0;

  return (
    <Card className="md:hidden">
      <CardContent className="p-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(RATES) as Scenario[]).map((s) => (
            <Button
              key={s}
              variant={scenario === s ? "default" : "outline"}
              className="h-auto flex-col py-2"
              onClick={() => { haptic.light(); setScenario(s); }}
            >
              <span className="text-xs">{s}</span>
              <span className="text-[10px] opacity-80">
                £{Math.round((data.find((d) => d.age === retirementAge)?.value || 0) / 1000)}k
              </span>
            </Button>
          ))}
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
              <XAxis dataKey="age" fontSize={11} />
              <YAxis tickFormatter={(v) => `£${Math.round(v / 1000)}k`} fontSize={11} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--primary))", fontSize: 13 }}
                formatter={(v: number) => [`£${v.toLocaleString()}`, "Pot"]}
                labelFormatter={(l) => `Age ${l}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <div className="font-semibold">£{Math.round(projected).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Projected pot at age {retirementAge} ({scenario})
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
