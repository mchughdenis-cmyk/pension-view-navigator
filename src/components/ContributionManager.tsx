import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/nav/PageHeader";
import { formatGBP } from "@/lib/pensionCalculations";
import { Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";

const AA = 60000;     // 2026/27 Annual Allowance
const MPAA = 10000;   // Money Purchase Annual Allowance
const TAPER_THRESHOLD = 260000; // Adjusted income threshold

export default function ContributionManager() {
  const [current, setCurrent] = useState(20000);
  const [prev1, setPrev1] = useState(30000);
  const [prev2, setPrev2] = useState(20000);
  const [prev3, setPrev3] = useState(10000);
  const [adjustedIncome, setAdjustedIncome] = useState(180000);
  const [mpaaTriggered, setMpaaTriggered] = useState(false);

  const taperedAA = useMemo(() => {
    if (adjustedIncome <= TAPER_THRESHOLD) return AA;
    const reduction = Math.min((adjustedIncome - TAPER_THRESHOLD) / 2, AA - 10000);
    return Math.max(10000, AA - reduction);
  }, [adjustedIncome]);

  const effectiveAA = mpaaTriggered ? MPAA : taperedAA;

  const carryForward = useMemo(() => {
    const unused = (n: number) => Math.max(0, AA - n);
    return { y1: unused(prev1), y2: unused(prev2), y3: unused(prev3) };
  }, [prev1, prev2, prev3]);

  const totalAvailable = effectiveAA + carryForward.y1 + carryForward.y2 + carryForward.y3;
  const remaining = totalAvailable - current;
  const utilisation = Math.min(100, (current / totalAvailable) * 100);
  const overContribution = current > totalAvailable;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Contribution manager"
        description="Track Annual Allowance (£60,000), tapering, MPAA, and 3-year carry-forward for 2026/27."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Contribution this year (2026/27)</Label>
              <Input type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">2023/24</Label><Input type="number" value={prev1} onChange={(e) => setPrev1(Number(e.target.value))} /></div>
              <div><Label className="text-xs">2022/23</Label><Input type="number" value={prev2} onChange={(e) => setPrev2(Number(e.target.value))} /></div>
              <div><Label className="text-xs">2021/22</Label><Input type="number" value={prev3} onChange={(e) => setPrev3(Number(e.target.value))} /></div>
            </div>
            <div>
              <Label>Adjusted income (for taper)</Label>
              <Input type="number" value={adjustedIncome} onChange={(e) => setAdjustedIncome(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground mt-1">Taper kicks in above £260,000. AA reduces by £1 for every £2 over, floor £10,000.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={mpaaTriggered} onChange={(e) => setMpaaTriggered(e.target.checked)} />
              MPAA triggered (UFPLS / flexible drawdown taken)
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allowance summary</CardTitle>
            <CardDescription>2026/27 effective limits and carry-forward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border rounded-lg p-3">
                <div className="text-muted-foreground text-xs">Effective AA</div>
                <div className="text-lg font-semibold">{formatGBP(effectiveAA)}</div>
                {mpaaTriggered && <Badge variant="secondary" className="mt-1">MPAA</Badge>}
                {!mpaaTriggered && taperedAA < AA && <Badge variant="secondary" className="mt-1">Tapered</Badge>}
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-muted-foreground text-xs">Carry-forward total</div>
                <div className="text-lg font-semibold">{formatGBP(carryForward.y1 + carryForward.y2 + carryForward.y3)}</div>
              </div>
              <div className="border rounded-lg p-3 col-span-2 bg-muted/30">
                <div className="text-muted-foreground text-xs">Total available this year</div>
                <div className="text-2xl font-bold">{formatGBP(totalAvailable)}</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Used {formatGBP(current)}</span>
                <span className={remaining < 0 ? "text-destructive" : "text-muted-foreground"}>
                  {remaining >= 0 ? `Remaining ${formatGBP(remaining)}` : `Over by ${formatGBP(-remaining)}`}
                </span>
              </div>
              <Progress value={utilisation} className={overContribution ? "[&>div]:bg-destructive" : ""} />
            </div>

            {overContribution ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Annual Allowance charge applies</p>
                  <p className="text-xs text-muted-foreground">The excess is taxed at your marginal rate. Report via Self Assessment or use scheme pays.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-3 flex gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>Within allowance. {formatGBP(remaining)} headroom before any charge.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
