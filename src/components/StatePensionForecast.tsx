import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/nav/PageHeader";
import { formatGBP } from "@/lib/pensionCalculations";
import { Crown, ExternalLink } from "lucide-react";

const FULL_NSP_WEEKLY = 221.20; // 2024/25 full new State Pension
const QUALIFYING_YEARS_FULL = 35;
const SPA = 67; // assumed
const TAX_YEAR = "2024/25";

export default function StatePensionForecast() {
  const [age, setAge] = useState(45);
  const [qualifyingYears, setQualifyingYears] = useState(20);
  const [stillWorking, setStillWorking] = useState(true);

  const yearsToSPA = Math.max(0, SPA - age);
  const projectedYears = Math.min(QUALIFYING_YEARS_FULL, qualifyingYears + (stillWorking ? yearsToSPA : 0));
  const fraction = projectedYears / QUALIFYING_YEARS_FULL;
  const weeklyAtSPA = FULL_NSP_WEEKLY * fraction;
  const annualAtSPA = weeklyAtSPA * 52;
  const shortfallYears = QUALIFYING_YEARS_FULL - projectedYears;
  const gapsToFill = Math.max(0, QUALIFYING_YEARS_FULL - qualifyingYears - (stillWorking ? yearsToSPA : 0));

  // Class 3 voluntary NICs 2024/25 = £17.45/week = £907.40/year
  const voluntaryCostPerYear = 907.40;
  const additionalWeeklyPerYear = FULL_NSP_WEEKLY / QUALIFYING_YEARS_FULL;
  const additionalAnnualPerYearOfNIC = additionalWeeklyPerYear * 52;
  const paybackYears = useMemo(() => voluntaryCostPerYear / additionalAnnualPerYearOfNIC, [additionalAnnualPerYearOfNIC]);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="State Pension forecast"
        description={`Projection based on ${TAX_YEAR} rates. Full new State Pension is ${formatGBP(FULL_NSP_WEEKLY)}/week (${formatGBP(FULL_NSP_WEEKLY * 52)}/year) at ${QUALIFYING_YEARS_FULL} qualifying years.`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crown className="h-4 w-4" /> Your details</CardTitle>
            <CardDescription>Check your actual record at gov.uk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Current age</Label><Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
            <div><Label>Qualifying years so far</Label><Input type="number" min={0} max={50} value={qualifyingYears} onChange={(e) => setQualifyingYears(Number(e.target.value))} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={stillWorking} onChange={(e) => setStillWorking(e.target.checked)} />
              I'll continue earning above the NI threshold until State Pension age ({SPA})
            </label>
            <Button variant="outline" asChild className="w-full">
              <a href="https://www.gov.uk/check-state-pension" target="_blank" rel="noreferrer">
                Check your real forecast on gov.uk <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected entitlement</CardTitle>
            <CardDescription>At age {SPA} ({yearsToSPA} years away).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{projectedYears} / {QUALIFYING_YEARS_FULL} qualifying years</span>
                <Badge variant={projectedYears >= QUALIFYING_YEARS_FULL ? "default" : "secondary"}>
                  {Math.round(fraction * 100)}% of full
                </Badge>
              </div>
              <Progress value={fraction * 100} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border rounded-lg p-3"><div className="text-muted-foreground text-xs">Per week</div><div className="text-lg font-semibold">{formatGBP(weeklyAtSPA)}</div></div>
              <div className="border rounded-lg p-3 bg-muted/30"><div className="text-muted-foreground text-xs">Per year</div><div className="text-lg font-bold">{formatGBP(annualAtSPA)}</div></div>
            </div>
            {gapsToFill > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
                <p className="font-medium">{gapsToFill} year{gapsToFill > 1 ? "s" : ""} short of the full amount</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Voluntary Class 3 NICs cost {formatGBP(voluntaryCostPerYear)} per missing year and add {formatGBP(additionalAnnualPerYearOfNIC)}/year for life.
                  Break-even is roughly {paybackYears.toFixed(1)} years after SPA.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
