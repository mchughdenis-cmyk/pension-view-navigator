import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/nav/PageHeader";
import { Jargon } from "@/components/ui/jargon";
import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatGBP } from "@/lib/pensionCalculations";

interface Props {
  salaryAnnual?: number;
  employeePct?: number;        // current employee contribution %
  employerMatchPct?: number;   // max % the employer will match
  employerName?: string;
  embedded?: boolean;          // when true, suppress page header
}

export default function EmployerMatchingVisualiser({
  salaryAnnual = 85000,
  employeePct = 5,
  employerMatchPct = 8,
  employerName = "your employer",
  embedded = false,
}: Props) {
  const [salary, setSalary] = useState(salaryAnnual);
  const [empPct, setEmpPct] = useState(employeePct);
  const [matchCap, setMatchCap] = useState(employerMatchPct);
  const [open, setOpen] = useState(false);

  const calc = useMemo(() => {
    const monthlySalary = salary / 12;
    const yourMonthly = monthlySalary * (empPct / 100);
    const employerActual = monthlySalary * (Math.min(empPct, matchCap) / 100);
    const employerMax = monthlySalary * (matchCap / 100);
    const unclaimedMonthly = Math.max(0, employerMax - employerActual);
    const unclaimedAnnual = unclaimedMonthly * 12;
    // 10-yr compound at 5%
    const r = 0.05 / 12;
    const n = 10 * 12;
    const tenYr = unclaimedMonthly * (((1 + r) ** n - 1) / r);
    const needPct = Math.max(0, matchCap - empPct);
    const isMaxed = unclaimedMonthly < 0.5;
    return { yourMonthly, employerActual, employerMax, unclaimedMonthly, unclaimedAnnual, tenYr, needPct, isMaxed };
  }, [salary, empPct, matchCap]);

  const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatGBP(value)}/mo</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );

  const max = Math.max(calc.yourMonthly, calc.employerMax, 1);

  const card = (
    <Card className={calc.isMaxed ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {calc.isMaxed ? (
            <><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Full employer match claimed</>
          ) : (
            <><Sparkles className="h-5 w-5 text-amber-600" /> Free money you might be missing</>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Annual salary</Label>
            <Input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Your contribution (%)</Label>
            <Input type="number" value={empPct} onChange={(e) => setEmpPct(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Employer match cap (%)</Label>
            <Input type="number" value={matchCap} onChange={(e) => setMatchCap(Number(e.target.value) || 0)} />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Bar label="Your contribution" value={calc.yourMonthly} max={max} color="bg-primary" />
          <Bar label="Employer match (current)" value={calc.employerActual} max={max} color="bg-primary/60" />
          {!calc.isMaxed && <Bar label="Unclaimed employer match" value={calc.unclaimedMonthly} max={max} color="bg-amber-500 animate-pulse" />}
        </div>

        {!calc.isMaxed ? (
          <div className="rounded-md bg-card border p-4 space-y-2">
            <p className="text-2xl font-semibold">{formatGBP(calc.unclaimedMonthly)}/mo unclaimed</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{formatGBP(calc.unclaimedAnnual)}/year</span>
              {" · "}
              <span className="font-medium text-foreground">{formatGBP(calc.tenYr)}</span> over 10 years (5% growth)
            </p>
            <p className="text-xs text-muted-foreground">
              Increase your contribution by <strong>{calc.needPct.toFixed(1)}%</strong> of salary to capture the full match.
              Consider <Jargon term="UFPLS">salary sacrifice</Jargon> to also save National Insurance.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-2">Claim my full employer match</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>How to claim your full match</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Option A — Pre-filled letter</p>
                    <p className="text-muted-foreground">Download a PDF amendment letter and hand to payroll.</p>
                    <Button variant="outline" size="sm" className="mt-2"
                      onClick={() => toast.success("Letter generated", { description: "Demo only — would download a PDF in production." })}>
                      Download amendment letter
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Option B — Email template</p>
                    <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap">
{`Subject: Pension contribution change request

Hi Payroll,

Please increase my pension contribution from ${empPct}% to ${matchCap}% of salary
effective the next pay cycle, to take full advantage of the employer match
offered by ${employerName}.

Thanks,`}
                    </pre>
                    <Button variant="outline" size="sm" className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Subject: Pension contribution change request\n\nHi Payroll,\n\nPlease increase my pension contribution from ${empPct}% to ${matchCap}% of salary effective the next pay cycle, to take full advantage of the employer match offered by ${employerName}.\n\nThanks,`
                        );
                        toast.success("Copied to clipboard");
                      }}>
                      <Copy className="h-4 w-4" /> Copy template
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">We'll set a 30-day reminder to verify payroll has updated your contribution.</p>
                </div>
                <DialogFooter>
                  <Button onClick={() => { toast.success("Reminder set for 30 days"); setOpen(false); }}>Set 30-day reminder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4">
            <p className="text-sm">
              You're capturing the full <strong>{formatGBP(calc.employerActual)}/month</strong> employer contribution.
              That's <strong>{formatGBP(calc.employerActual * 12)}/year</strong> of free money working for you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (embedded) return card;
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Employer matching" description="See how much employer contribution you might be leaving on the table — and how to claim it." />
      {card}
    </div>
  );
}
