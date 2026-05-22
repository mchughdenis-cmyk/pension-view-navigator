// MP.2 — Employer 5-step setup wizard
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calculator, CheckCircle2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/utils/haptic";

const STEPS = ["Company", "Scheme", "Employees", "Review", "Confirm"];

export default function EmployerSetupWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    chNumber: "",
    companyName: "",
    address: "",
    authorised: "yes",
    pensionType: "workplace",
    stagingDate: "",
    employeePct: 5,
    employerPct: 3,
    matching: false,
    matchPct: 100,
    matchCap: 5,
    salarySacrifice: false,
    csvEmployees: 0,
    manualEmployees: 0,
  });

  const total = data.csvEmployees + data.manualEmployees;
  const avgSalary = 35000;
  const monthlyEmployerCost = Math.round((avgSalary * (data.employerPct / 100) * Math.max(total, 1)) / 12);

  const next = () => { haptic.light(); setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const lookupCompany = () => {
    if (!data.chNumber) return;
    setData((d) => ({
      ...d,
      companyName: "Acme Trading Ltd",
      address: "1 Demo Street, London EC1A 1AA",
    }));
    toast.success("Company found at Companies House");
  };

  const finish = () => {
    haptic.success();
    localStorage.setItem("airgead.employerScheme", JSON.stringify({ ...data, createdAt: new Date().toISOString() }));
    toast.success("Your pension scheme is ready!");
    setStep(STEPS.length - 1);
  };

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" /> Set up your company pension scheme
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Five steps. About 10 minutes.</p>
      </header>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? "text-primary font-semibold" : ""}>{i + 1}. {s}</span>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <Card>
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Let's set up your company pension scheme</CardTitle>
              <CardDescription>We need to verify your company first — takes 2 minutes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Companies House number</Label>
                <div className="flex gap-2">
                  <Input value={data.chNumber} onChange={(e) => setData({ ...data, chNumber: e.target.value })} placeholder="e.g. 12345678" />
                  <Button variant="outline" onClick={lookupCompany}>Look up</Button>
                </div>
              </div>
              {data.companyName && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <div className="font-semibold">{data.companyName}</div>
                  <div className="text-muted-foreground">{data.address}</div>
                  <Badge variant="secondary" className="mt-2">SIC 47.91 (E-commerce retail)</Badge>
                </div>
              )}
              <div className="space-y-2">
                <Label>Are you authorised to set up a pension scheme?</Label>
                <RadioGroup value={data.authorised} onValueChange={(v) => setData({ ...data, authorised: v })}>
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="auth-yes" /><Label htmlFor="auth-yes">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="auth-no" /><Label htmlFor="auth-no">No</Label></div>
                </RadioGroup>
                {data.authorised === "no" && (
                  <p className="text-xs text-amber-600">You'll need authorisation from a director or company secretary.</p>
                )}
              </div>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>How does your pension scheme work?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={data.pensionType} onValueChange={(v) => setData({ ...data, pensionType: v })} className="grid gap-3">
                {[
                  { v: "workplace", t: "Workplace pension (auto-enrolment)", d: "Required for employees earning £10k+" },
                  { v: "groupsipp", t: "Group SIPP", d: "More control, suitable for higher earners" },
                  { v: "exec", t: "Executive pension", d: "For directors and key staff only" },
                ].map((o) => (
                  <Label key={o.v} className="border rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value={o.v} />
                    <div>
                      <div className="font-semibold text-sm">{o.t}</div>
                      <div className="text-xs text-muted-foreground">{o.d}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              <div className="space-y-2">
                <Label>Staging / start date</Label>
                <Input type="date" value={data.stagingDate} onChange={(e) => setData({ ...data, stagingDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Employee min (%)</Label>
                  <Input type="number" min={3} value={data.employeePct} onChange={(e) => setData({ ...data, employeePct: +e.target.value })} />
                </div>
                <div>
                  <Label>Employer min (%)</Label>
                  <Input type="number" min={3} value={data.employerPct} onChange={(e) => setData({ ...data, employerPct: +e.target.value })} />
                </div>
              </div>
              <div className="rounded-md bg-muted/40 p-3 text-xs">
                On a £30,000 salary, employee pays £{Math.round(30000 * data.employeePct / 100 / 12)}/mo, employer adds £{Math.round(30000 * data.employerPct / 100 / 12)}/mo.
              </div>
              <div className="flex items-center justify-between">
                <Label>Offer enhanced employer matching?</Label>
                <Switch checked={data.matching} onCheckedChange={(v) => setData({ ...data, matching: v })} />
              </div>
              {data.matching && (
                <div className="rounded-md border p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    Match <Input className="w-20" type="number" value={data.matchPct} onChange={(e) => setData({ ...data, matchPct: +e.target.value })} />% up to
                    <Input className="w-20" type="number" value={data.matchCap} onChange={(e) => setData({ ...data, matchCap: +e.target.value })} />% of salary
                  </div>
                  <p className="text-xs text-muted-foreground">If employee contributes {data.matchCap}%, employer adds {Math.round(data.matchCap * data.matchPct / 100)}%.</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Salary sacrifice</Label>
                <Switch checked={data.salarySacrifice} onCheckedChange={(v) => setData({ ...data, salarySacrifice: v })} />
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader><CardTitle>Add your employees</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="csv">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="csv">CSV upload</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="hr">HR integration</TabsTrigger>
                </TabsList>
                <TabsContent value="csv" className="space-y-3 pt-3">
                  <Button variant="outline" size="sm">Download CSV template</Button>
                  <Input type="file" accept=".csv" onChange={() => { setData({ ...data, csvEmployees: 47 }); toast.success("47 employees found · 0 errors"); }} />
                  {data.csvEmployees > 0 && <div className="text-sm">{data.csvEmployees} employees ready to enrol.</div>}
                </TabsContent>
                <TabsContent value="manual" className="space-y-2 pt-3">
                  <Input placeholder="Full name" /><Input placeholder="Email" /><Input placeholder="Salary" type="number" />
                  <Button onClick={() => setData({ ...data, manualEmployees: data.manualEmployees + 1 })}>Add employee ({data.manualEmployees})</Button>
                </TabsContent>
                <TabsContent value="hr" className="pt-3 text-sm text-muted-foreground space-y-2">
                  {["BambooHR", "Workday", "Breathe HR"].map((p) => (
                    <div key={p} className="flex items-center justify-between border rounded-md p-3">
                      <span>{p}</span><Badge variant="secondary">Coming soon</Badge>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader><CardTitle>Review your scheme settings</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Company</span><div className="font-semibold">{data.companyName || "—"}</div></div>
                <div><span className="text-muted-foreground">Scheme type</span><div className="font-semibold capitalize">{data.pensionType}</div></div>
                <div><span className="text-muted-foreground">Start date</span><div className="font-semibold">{data.stagingDate || "—"}</div></div>
                <div><span className="text-muted-foreground">Employees</span><div className="font-semibold">{total}</div></div>
                <div><span className="text-muted-foreground">Contribution</span><div className="font-semibold">EE {data.employeePct}% / ER {data.employerPct}%</div></div>
                <div><span className="text-muted-foreground">Matching</span><div className="font-semibold">{data.matching ? `${data.matchPct}% up to ${data.matchCap}%` : "None"}</div></div>
              </div>
              <div className="rounded-md bg-primary/10 p-3">
                <Calculator className="inline h-4 w-4 mr-1 text-primary" />
                Estimated monthly employer cost: <strong>£{monthlyEmployerCost.toLocaleString()}</strong>
              </div>
            </CardContent>
          </>
        )}

        {step === 4 && (
          <CardContent className="py-10 text-center space-y-4">
            <PartyPopper className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Your pension scheme is ready!</h2>
            <p className="text-sm text-muted-foreground">Scheme ID: AIR-{Date.now().toString().slice(-6)} · {total} employees enrolled</p>
            <div className="grid sm:grid-cols-3 gap-3 pt-4 text-left">
              <Card className="p-3"><CardTitle className="text-sm">Submit first contributions</CardTitle></Card>
              <Card className="p-3"><CardTitle className="text-sm">Invite employees</CardTitle></Card>
              <Card className="p-3"><CardTitle className="text-sm">View compliance dashboard</CardTitle></Card>
            </div>
          </CardContent>
        )}

        {step < 4 && (
          <CardContent className="flex justify-between pt-0">
            <Button variant="outline" onClick={back} disabled={step === 0}>Back</Button>
            {step === 3 ? (
              <Button onClick={finish}><CheckCircle2 className="h-4 w-4 mr-1" /> Confirm & launch</Button>
            ) : (
              <Button onClick={next}>Continue</Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
