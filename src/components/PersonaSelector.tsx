import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { Sparkles, ArrowRight } from "lucide-react";

interface Persona {
  id: string;
  name: string;
  age: number;
  role: "client" | "adviser" | "admin";
  occupation: string;
  hook: string;
  pot: string;
  story: string;
  initials: string;
  accent: string;
}

const PERSONAS: Persona[] = [
  {
    id: "sarah", name: "Sarah Chen", age: 34, role: "client",
    occupation: "Marketing Director · £85k",
    hook: "Leaving £400/month of employer match unclaimed",
    pot: "£89,400 (SIPP + ISA)",
    story: "Recently married. 2 old workplace pensions to consolidate. Beneficiary not updated.",
    initials: "SC", accent: "from-teal-500 to-cyan-500",
  },
  {
    id: "james", name: "James Okafor", age: 52, role: "client",
    occupation: "Self-employed · £120k",
    hook: "Approaching retirement — drawdown vs annuity",
    pot: "£324,000 (SIPP + GIA)",
    story: "6 years from retirement target. Annual Allowance £42.8k of £60k used. Considering carry-forward.",
    initials: "JO", accent: "from-indigo-500 to-violet-500",
  },
  {
    id: "emma", name: "Emma Walsh", age: 26, role: "client",
    occupation: "Graduate Engineer · £38k",
    hook: "Just starting out — readiness score 41",
    pot: "£4,200 (SIPP)",
    story: "5% contribution, 3% employer. 39 years to retirement — every increase compounds massively.",
    initials: "EW", accent: "from-rose-500 to-orange-500",
  },
  {
    id: "robert", name: "Robert Price", age: 61, role: "client",
    occupation: "Semi-retired",
    hook: "£520k pot · 2 years from retirement",
    pot: "£600,000 (SIPP + ISA)",
    story: "Drawdown planning, PCLS strategy, IHT-efficient transfer to family. IFA linked.",
    initials: "RP", accent: "from-amber-500 to-yellow-500",
  },
  {
    id: "adviser", name: "Adviser view", age: 0, role: "adviser",
    occupation: "Independent Financial Adviser",
    hook: "47 clients · £18.4m AUM",
    pot: "Adviser workbench",
    story: "Suitability reports, annual review packs, dealing desk, model portfolios.",
    initials: "IFA", accent: "from-slate-600 to-slate-800",
  },
  {
    id: "admin", name: "Admin / Operations", age: 0, role: "admin",
    occupation: "Platform operator",
    hook: "HMRC reporting, CASS, audit, white-label",
    pot: "Full admin console",
    story: "End-to-end platform operations: compliance, integrations, branding, firm hierarchy.",
    initials: "OPS", accent: "from-emerald-600 to-teal-700",
  },
];

export default function PersonaSelector() {
  const nav = useNavigate();
  const { setRole } = useRole();

  const launch = (p: Persona) => {
    setRole(p.role);
    sessionStorage.setItem("airgead-demo-persona", p.id);
    nav(p.role === "client" ? "/client-services" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5">
            <Sparkles className="h-3 w-3 mr-1" /> Live demo · no sign-up required
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Experience Pension Navigator
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Step into a real-world workspace. Pick a persona to see the platform from their point of view —
            data, decisions and journeys included.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERSONAS.map((p) => (
            <Card
              key={p.id}
              className="bg-slate-900/60 border-slate-800 text-white hover:border-primary/60 transition-all cursor-pointer group"
              onClick={() => launch(p)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${p.accent} grid place-items-center font-semibold shrink-0`}>
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-lg leading-tight">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.occupation}{p.age ? ` · ${p.age}` : ""}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">{p.hook}</p>
                  <p className="text-xs text-slate-400">{p.pot}</p>
                </div>
                <p className="text-sm text-slate-300 leading-snug">{p.story}</p>
                <Button variant="outline" className="w-full mt-2 bg-transparent border-slate-700 hover:bg-slate-800 group-hover:border-primary">
                  Enter as {p.name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-slate-400">
            Or <button onClick={() => nav("/auth")} className="text-primary underline-offset-4 hover:underline">create your own account →</button>
          </p>
          <p className="text-xs text-slate-500">
            FCA Regulated · 256-bit Encrypted · UK GDPR compliant
          </p>
        </div>
      </div>
    </div>
  );
}
