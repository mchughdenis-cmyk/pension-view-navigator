import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Sparkles, TrendingUp, Workflow, FileText, Activity, ScrollText,
  ChevronLeft, ChevronRight, Lock, ArrowRight, Compass,
} from "lucide-react";

/**
 * Public, read-only product tour. No app data is loaded and no app routes are
 * navigated to — purely a guided walkthrough of what Pension Navigator delivers.
 * Designed so prospective users can preview the platform without being able to
 * copy or operate it.
 */
const STEPS = [
  { icon: LayoutDashboard, title: "Client dashboard", body: "A single holistic view of pot value, allowances, contributions and projections — the day-one home for every client.", tag: "Client" },
  { icon: Sparkles, title: "Ask Navigator (AI)", body: "Conversational AI grounded in the client's own data and UK 2024/25 tax rules. Answers questions, drafts illustrations and surfaces risk.", tag: "AI" },
  { icon: TrendingUp, title: "Monte Carlo projection", body: "10,000-scenario stochastic modelling with a cone-of-outcomes fan chart — including post-2027 IHT-on-pensions impact.", tag: "Modelling" },
  { icon: Workflow, title: "Drawdown planner", body: "PCLS, UFPLS, flexi-access and drip-feed drawdown — with live tax, MPAA and IHT impact previews.", tag: "Drawdown" },
  { icon: FileText, title: "Pension passport", body: "A single-page summary used for transfers, KYC and beneficiary nominations — exportable as branded PDF/Word.", tag: "Document" },
  { icon: Activity, title: "Operations cockpit", body: "SLA tracker, exceptions, bulk operations, Origo / Equisoft transfers and CASS-aware reconciliation for the back office.", tag: "Operations" },
  { icon: ScrollText, title: "HMRC & compliance", body: "Event reporting, LSA / LSDBA tracking, RTI / PAYE submissions and an immutable audit trail across every action.", tag: "Compliance" },
];

export default function Tour() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const Icon = step.icon;

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1} of {STEPS.length}</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-2">
            Preview the platform. <span className="text-primary">No account required.</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            This is a read-only walkthrough. Live data, mutations and operational actions are
            disabled — register an account to request full access.
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
                <p className="text-muted-foreground mt-2">{step.body}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[16/9] bg-muted/40 grid place-items-center border-b border-border">
              <div className="text-center text-muted-foreground p-8">
                <Icon className="h-16 w-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Interactive screen preview disabled in tour mode.</p>
                <p className="text-xs mt-1 opacity-70">Register an account to use {step.title.toLowerCase()} with live data.</p>
              </div>
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

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {STEPS.map((s, idx) => {
            const SI = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => setI(idx)}
                className={`text-left p-4 rounded-lg border transition-all hover:border-primary/50 ${idx === i ? "border-primary bg-primary/5" : "border-border bg-card"}`}
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
