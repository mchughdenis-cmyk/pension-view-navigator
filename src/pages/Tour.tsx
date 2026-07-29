import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, Sparkles, TrendingUp, Workflow, FileText, Activity, ScrollText,
  ChevronLeft, ChevronRight, Lock, ArrowRight, Compass, PoundSterling, PiggyBank,
  Send, User, Bot, AlertTriangle, CheckCircle2, Clock, Shield, Download,
} from "lucide-react";

/**
 * Public, read-only product tour. Each step renders a static mock preview of
 * the corresponding screen so prospective users can see the platform without
 * any live data or operational access.
 */

// ---------- Static mock screens ----------

const MockDashboard = () => (
  <div className="p-4 space-y-3 bg-background">
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Pot value", value: "£412,580", icon: PoundSterling, tone: "text-primary" },
        { label: "Annual allowance", value: "£42,300 left", icon: PiggyBank, tone: "text-emerald-500" },
        { label: "Projected at 67", value: "£1.18m", icon: TrendingUp, tone: "text-blue-500" },
      ].map((k) => (
        <div key={k.label} className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</span>
            <k.icon className={`h-3.5 w-3.5 ${k.tone}`} />
          </div>
          <div className="text-lg font-bold">{k.value}</div>
        </div>
      ))}
    </div>
    <div className="rounded-lg border bg-card p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">Pot trajectory</div>
        <Badge variant="outline" className="text-[10px]">On track</Badge>
      </div>
      <svg viewBox="0 0 300 80" className="w-full h-20">
        <path d="M0,70 Q60,55 120,40 T240,18 L300,8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"/>
        <path d="M0,70 Q60,55 120,40 T240,18 L300,8 L300,80 L0,80 Z" fill="hsl(var(--primary))" opacity="0.15"/>
      </svg>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground mb-2">Allowance usage</div>
        <Progress value={62} className="h-2 mb-1" />
        <div className="text-[10px] text-muted-foreground">£37,200 of £60,000</div>
      </div>
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground mb-2">Health score</div>
        <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-emerald-500">82</span><span className="text-xs text-muted-foreground">/100</span></div>
      </div>
    </div>
  </div>
);

const MockAssistant = () => (
  <div className="flex flex-col bg-background h-full">
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="flex gap-2"><User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="bg-muted rounded-lg p-2.5 text-sm max-w-[80%]">Can I take £40k tax-free this year without triggering MPAA?</div>
      </div>
      <div className="flex gap-2"><Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-sm max-w-[85%]">
          Yes — you can take up to £104,375 as PCLS from your £417,500 pot (25% rule) tax-free without triggering MPAA. Taking £40k as PCLS leaves £64,375 of tax-free cash. You'd still have full £60k annual allowance.
          <div className="mt-2 flex gap-1"><Badge variant="outline" className="text-[10px]">PCLS rules</Badge><Badge variant="outline" className="text-[10px]">2026/27 tax year</Badge></div>
        </div>
      </div>
      <div className="flex gap-2"><User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="bg-muted rounded-lg p-2.5 text-sm max-w-[80%]">What's my IHT exposure post-2027?</div>
      </div>
    </div>
    <div className="border-t p-3 flex gap-2">
      <div className="flex-1 h-9 rounded-md border bg-muted/40 px-3 text-xs flex items-center text-muted-foreground">Ask Navigator anything…</div>
      <Button size="sm" variant="default"><Send className="h-3.5 w-3.5" /></Button>
    </div>
  </div>
);

const MockProjection = () => (
  <div className="p-4 space-y-3 bg-background">
    <div className="flex justify-between items-center">
      <div className="text-sm font-medium">Monte Carlo — 10,000 scenarios</div>
      <Badge variant="secondary" className="text-[10px]">P10 / P50 / P90</Badge>
    </div>
    <div className="rounded-lg border bg-card p-3">
      <svg viewBox="0 0 320 140" className="w-full h-32">
        <path d="M0,120 Q80,100 160,70 T320,20 L320,5 Q240,15 160,40 T0,90 Z" fill="hsl(var(--primary))" opacity="0.12"/>
        <path d="M0,110 Q80,90 160,60 T320,15" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.4"/>
        <path d="M0,100 Q80,75 160,45 T320,10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"/>
        <path d="M0,90 Q80,65 160,30 T320,5" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.4"/>
        <line x1="0" y1="135" x2="320" y2="135" stroke="hsl(var(--border))" />
        {["2026","2035","2045","2055"].map((y,i)=>(<text key={y} x={i*100+5} y="148" fontSize="8" fill="hsl(var(--muted-foreground))">{y}</text>))}
      </svg>
    </div>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="rounded border p-2"><div className="text-muted-foreground text-[10px]">P10 (poor)</div><div className="font-bold">£680k</div></div>
      <div className="rounded border p-2 border-primary"><div className="text-muted-foreground text-[10px]">P50 (median)</div><div className="font-bold">£1.18m</div></div>
      <div className="rounded border p-2"><div className="text-muted-foreground text-[10px]">P90 (strong)</div><div className="font-bold">£2.05m</div></div>
    </div>
  </div>
);

const MockDrawdown = () => (
  <div className="p-4 space-y-3 bg-background">
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground mb-2">Withdrawal plan</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><div className="text-[10px] text-muted-foreground">PCLS (25%)</div><div className="font-bold">£103,150</div></div>
        <div><div className="text-[10px] text-muted-foreground">Flexi-access</div><div className="font-bold">£28,000/yr</div></div>
        <div><div className="text-[10px] text-muted-foreground">Tax band</div><div className="font-bold">Basic rate</div></div>
        <div><div className="text-[10px] text-muted-foreground">MPAA triggered</div><div className="font-bold text-amber-500">Yes</div></div>
      </div>
    </div>
    <div className="rounded-lg border bg-amber-500/10 border-amber-500/30 p-3 flex gap-2 items-start">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="text-xs"><div className="font-medium">IHT impact (post-Apr 2027)</div><div className="text-muted-foreground mt-0.5">Residual pension £309k now in estate. Est. IHT £123k.</div></div>
    </div>
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs font-medium mb-2">Sustainability — 30yr horizon</div>
      <Progress value={87} className="h-2" /><div className="text-[10px] text-muted-foreground mt-1">87% success probability</div>
    </div>
  </div>
);

const MockPassport = () => (
  <div className="p-4 bg-background">
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex justify-between items-start border-b pb-3">
        <div><div className="text-xs text-muted-foreground">Pension Passport</div><div className="font-bold">Sarah Williams</div><div className="text-[10px] text-muted-foreground">DOB 12/03/1972 · NI QQ123456C</div></div>
        <Badge variant="outline" className="text-[10px]">v3.2</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {[["Pot value","£412,580"],["Wrapper","SIPP"],["PCLS taken","£0"],["MPAA","Not triggered"],["LSA remaining","£268,275"],["LSDBA remaining","£1,073,100"]].map(([k,v])=>(<div key={k}><div className="text-muted-foreground text-[10px]">{k}</div><div className="font-medium">{v}</div></div>))}
      </div>
      <div className="border-t pt-3"><div className="text-[10px] text-muted-foreground mb-1">Expression of wish</div><div className="text-xs">100% to John Williams (spouse) · Updated 14/02/2025</div></div>
      <div className="flex gap-2 pt-2"><Button size="sm" variant="outline" className="text-xs"><Download className="h-3 w-3 mr-1" /> PDF</Button><Button size="sm" variant="outline" className="text-xs"><Download className="h-3 w-3 mr-1" /> Word</Button></div>
    </div>
  </div>
);

const MockCockpit = () => (
  <div className="p-4 space-y-3 bg-background">
    <div className="grid grid-cols-4 gap-2 text-xs">
      {[["Open",47,"text-primary"],["At risk",6,"text-amber-500"],["Breached",2,"text-destructive"],["Closed today",23,"text-emerald-500"]].map(([l,v,t])=>(<div key={l as string} className="rounded border bg-card p-2"><div className="text-[10px] text-muted-foreground">{l}</div><div className={`text-lg font-bold ${t}`}>{v}</div></div>))}
    </div>
    <div className="rounded-lg border bg-card">
      <div className="px-3 py-2 border-b text-xs font-medium">SLA exceptions</div>
      <div className="divide-y">
        {[
          {ref:"TR-2841", type:"Origo transfer", sla:"4h", state:"Breached", tone:"text-destructive", icon:AlertTriangle},
          {ref:"TR-2839", type:"Equisoft in-specie", sla:"1d", state:"At risk", tone:"text-amber-500", icon:Clock},
          {ref:"CR-1102", type:"CASS recon", sla:"OK", state:"On track", tone:"text-emerald-500", icon:CheckCircle2},
        ].map(r=>(<div key={r.ref} className="px-3 py-2 flex items-center justify-between text-xs">
          <div><div className="font-medium">{r.ref}</div><div className="text-[10px] text-muted-foreground">{r.type}</div></div>
          <div className={`flex items-center gap-1 ${r.tone}`}><r.icon className="h-3 w-3" />{r.state}</div>
        </div>))}
      </div>
    </div>
  </div>
);

const MockHMRC = () => (
  <div className="p-4 space-y-3 bg-background">
    <div className="rounded-lg border bg-card p-3">
      <div className="flex justify-between items-center mb-2"><div className="text-sm font-medium">Event reporting</div><Badge variant="outline" className="text-[10px]">2026/27</Badge></div>
      <div className="space-y-2 text-xs">
        {[["BCE 1 – Drawdown designation","£103,150","Submitted"],["BCE 5A – Age 75 test","Pending","Scheduled"],["RTI / FPS submission","£28,000","Submitted"]].map(([t,a,s])=>(
          <div key={t} className="flex justify-between items-center py-1.5 border-b last:border-0">
            <div><div className="font-medium">{t}</div><div className="text-[10px] text-muted-foreground">{a}</div></div>
            <Badge variant={s==="Submitted"?"default":"secondary"} className="text-[10px]">{s}</Badge>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs font-medium mb-2 flex items-center gap-1"><Shield className="h-3 w-3" /> LSA / LSDBA tracking</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><div className="text-[10px] text-muted-foreground">LSA used</div><Progress value={28} className="h-1.5 my-1" /><div>£75,000 of £268,275</div></div>
        <div><div className="text-[10px] text-muted-foreground">LSDBA used</div><Progress value={0} className="h-1.5 my-1" /><div>£0 of £1,073,100</div></div>
      </div>
    </div>
  </div>
);

const STEPS = [
  { icon: LayoutDashboard, title: "Client dashboard", body: "A single holistic view of pot value, allowances, contributions and projections — the day-one home for every client.", tag: "Client", Mock: MockDashboard },
  { icon: Sparkles, title: "Ask Navigator (AI)", body: "Conversational AI grounded in the client's own data and UK 2026/27 tax rules. Answers questions, drafts illustrations and surfaces risk.", tag: "AI", Mock: MockAssistant },
  { icon: TrendingUp, title: "Monte Carlo projection", body: "10,000-scenario stochastic modelling with a cone-of-outcomes fan chart — including post-2027 IHT-on-pensions impact.", tag: "Modelling", Mock: MockProjection },
  { icon: Workflow, title: "Drawdown planner", body: "PCLS, UFPLS, flexi-access and drip-feed drawdown — with live tax, MPAA and IHT impact previews.", tag: "Drawdown", Mock: MockDrawdown },
  { icon: FileText, title: "Pension passport", body: "A single-page summary used for transfers, KYC and beneficiary nominations — exportable as branded PDF/Word.", tag: "Document", Mock: MockPassport },
  { icon: Activity, title: "Operations cockpit", body: "SLA tracker, exceptions, bulk operations, Origo / Equisoft transfers and CASS-aware reconciliation for the back office.", tag: "Operations", Mock: MockCockpit },
  { icon: ScrollText, title: "HMRC & compliance", body: "Event reporting, LSA / LSDBA tracking, RTI / PAYE submissions and an immutable audit trail across every action.", tag: "Compliance", Mock: MockHMRC },
];

export default function Tour() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const Icon = step.icon;
  const Mock = step.Mock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/site" className="flex items-center gap-2 font-semibold">
            <Compass className="h-5 w-5 text-primary" />
            <span>Pension Navigator — Guided tour</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              <Lock className="h-3 w-3 mr-1" /> Preview only
            </Badge>
            <Button asChild size="sm">
              <Link to="/auth">Register <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1} of {STEPS.length}</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
            Preview the platform. <span className="text-primary">No account required.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Read-only walkthrough with static demo data. Register to access live functionality.
          </p>
        </div>

        <Card className="overflow-hidden shadow-xl shadow-primary/5">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="mb-2 text-[10px]">{step.tag}</Badge>
                <CardTitle className="text-2xl">{step.title}</CardTitle>
                <p className="text-muted-foreground mt-2 text-sm">{step.body}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-muted/30 p-4 md:p-6 border-b border-border">
              <div className="mx-auto max-w-2xl rounded-xl border border-border bg-background shadow-lg overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/50">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-3 text-[10px] text-muted-foreground">pension-navigator.airgead.co.uk{step.title === "Client dashboard" ? "/dashboard" : ""}</div>
                </div>
                <div className="min-h-[360px]"><Mock /></div>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-3">Static demo — not connected to live data.</p>
            </div>
            <div className="flex items-center justify-between p-4">
              <Button variant="outline" size="sm" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex gap-1.5">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>
              {i < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setI(i + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Register to continue <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid md:grid-cols-3 gap-3">
          {STEPS.map((s, idx) => {
            const SI = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => setI(idx)}
                className={`text-left p-3 rounded-lg border transition-all hover:border-primary/50 ${idx === i ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <SI className="h-4 w-4 text-primary mb-2" />
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.body}</div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
