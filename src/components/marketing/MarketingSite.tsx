import { ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShieldCheck, Sparkles, Layers, TrendingUp, Workflow, Building2, Users, Globe,
  ArrowRight, CheckCircle2, ScrollText, BarChart3, Cpu, Lock, Award, BookOpen,
  Mail, Phone, MapPin, Compass, PiggyBank, Briefcase, Calendar, Quote, Scale,
  GraduationCap, Gauge, Map, Target, ChevronDown, LayoutDashboard,
} from "lucide-react";
import { ContactForm } from "./ContactForm";

/* --------------------------- Pension Navigator menu ------------------------ */

const navigatorGroups: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: "Core",
    items: [
      { to: "/dashboard", label: "Dashboard (home)" },
      { to: "/client-services", label: "Client services hub" },
      { to: "/portfolio", label: "Portfolio overview" },
      { to: "/m", label: "Mobile client app" },
    ],
  },
  {
    label: "Client journeys",
    items: [
      { to: "/onboarding", label: "Client onboarding" },
      { to: "/welcome-pack", label: "Digital welcome pack" },
      { to: "/kyc", label: "KYC / AML" },
      { to: "/illustration", label: "Pension illustration" },
      { to: "/transfer", label: "Pension transfer in" },
      { to: "/transfer-out", label: "Transfer out" },
      { to: "/drawdown", label: "Drawdown journey" },
      { to: "/drip-feed", label: "Drip-feed drawdown" },
      { to: "/instant-withdrawal", label: "Instant withdrawal" },
      { to: "/instant-deposit", label: "Instant deposit" },
      { to: "/instrument-transfer", label: "Instrument transfer" },
      { to: "/annual-summary", label: "Annual summary" },
      { to: "/learning", label: "Learning centre" },
    ],
  },
  {
    label: "Wrappers",
    items: [
      { to: "/isa", label: "Stocks & Shares ISA" },
      { to: "/gia", label: "GIA" },
      { to: "/ssas", label: "SSAS module" },
      { to: "/property", label: "Commercial property" },
      { to: "/iht", label: "IHT overview" },
    ],
  },
  {
    label: "Adviser & operations",
    items: [
      { to: "/workbench", label: "Adviser workbench" },
      { to: "/operations", label: "Pension operations" },
      { to: "/cockpit", label: "Operations cockpit" },
      { to: "/dealing", label: "Dealing desk" },
      { to: "/models", label: "Model portfolios" },
      { to: "/projection", label: "Monte Carlo projection" },
      { to: "/suitability", label: "Suitability assessment" },
      { to: "/sla-tracker", label: "SLA tracker" },
      { to: "/cash-warnings", label: "Cash warnings" },
      { to: "/comms", label: "Communications hub" },
    ],
  },
  {
    label: "Admin & compliance",
    items: [
      { to: "/admin", label: "Admin portal" },
      { to: "/firms", label: "Firm hierarchy" },
      { to: "/enterprise", label: "Enterprise suite" },
      { to: "/mi", label: "MI dashboard" },
      { to: "/reporting", label: "Reporting suite" },
      { to: "/hmrc", label: "HMRC reporting" },
      { to: "/lsa", label: "LSA / LSDBA" },
      { to: "/paye", label: "PAYE dashboard" },
      { to: "/cass", label: "CASS reconciliation" },
      { to: "/cass-engine", label: "CASS recon engine" },
      { to: "/origo", label: "Origo messages" },
      { to: "/origo-transfers", label: "Origo transfers" },
      { to: "/audit-log", label: "Audit log" },
      { to: "/documents", label: "Document vault" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/system-overview", label: "System overview" },
      { to: "/overview", label: "Showcase" },
      { to: "/api-directory", label: "API directory" },
      { to: "/documentation", label: "Documentation" },
      { to: "/demo", label: "Interactive demo" },
      { to: "/advanced", label: "Market leader hub" },
      { to: "/settings", label: "Settings" },
    ],
  },
];

function NavigatorDropdown({ size = "sm" }: { size?: "sm" | "default" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="gap-1">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Pension Navigator</span>
          <span className="sm:hidden">App</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(92vw,640px)] max-h-[75vh] overflow-y-auto bg-popover z-50"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Pension Navigator</span>
          <Link to="/dashboard" className="text-xs text-primary hover:underline">
            Open home →
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid sm:grid-cols-2 gap-x-2">
          {navigatorGroups.map((g) => (
            <div key={g.label} className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </div>
              {g.items.map((it) => (
                <DropdownMenuItem key={it.to} asChild>
                  <Link to={it.to} className="text-sm">{it.label}</Link>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------------------------- Layout --------------------------------- */

const navLinks = [
  { to: "/site", label: "Home", end: true },
  { to: "/site/about", label: "About" },
  { to: "/site/platform", label: "Platform" },
  { to: "/site/expertise", label: "Expertise" },
  { to: "/site/market", label: "Market position" },
  { to: "/site/contact", label: "Contact" },
];

export function MarketingLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/site" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center text-primary-foreground">
              <Compass className="h-4 w-4" />
            </span>
            <span>Pension Navigator <span className="text-muted-foreground font-normal">by Airgead</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NavigatorDropdown />
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => {
                const url = `${window.location.origin}/home`;
                navigator.clipboard?.writeText(url);
                import("sonner").then(({ toast }) =>
                  toast.success("Direct link copied", { description: url })
                );
              }}
              title="Copy a direct link straight to the app home"
            >
              Copy share link
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/home">Launch app <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {navLinks.map((l) => {
              const active = l.end ? pathname === l.to : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold mb-3">
              <span className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center text-primary-foreground">
                <Compass className="h-3.5 w-3.5" />
              </span>
              Pension Navigator
            </div>
            <p className="text-sm text-muted-foreground">
              Modern pensions infrastructure built by veteran SIPP, SSAS and platform specialists.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/site/platform" className="hover:text-foreground">Platform</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Client portal</Link></li>
              <li><Link to="/m" className="hover:text-foreground">Mobile app</Link></li>
              <li><Link to="/overview" className="hover:text-foreground">System overview</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/site/about" className="hover:text-foreground">About Airgead</Link></li>
              <li><Link to="/site/expertise" className="hover:text-foreground">Pensions expertise</Link></li>
              <li><Link to="/site/market" className="hover:text-foreground">Market position</Link></li>
              <li><Link to="/site/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Compliance</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>FCA-aligned operating model</li>
              <li>HMRC reporting & RTI</li>
              <li>CASS-aware reconciliation</li>
              <li>UK 2024/25 tax rules</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} Airgead Pensions Ltd. All rights reserved.</span>
            <span>For institutional and adviser use. Capital at risk.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------- Helpers -------------------------------- */

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{children}</div>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* ----------------------------------- Home ---------------------------------- */

export function MarketingHome() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-4"><Sparkles className="h-3 w-3 mr-1" /> Next-generation pensions infrastructure</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Pensions, modernised.
              <span className="block text-primary mt-2">Engineered by experts.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Pension Navigator is Airgead's end-to-end platform for SIPP, SSAS, ISA and GIA
              administration — uniting deep pensions expertise with a modern, real-time,
              compliance-first technology stack.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">Launch the app <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/site/platform">Explore the platform</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-secondary" /> FCA-aligned</span>
              <span className="flex items-center gap-1"><Lock className="h-4 w-4 text-secondary" /> CASS-aware</span>
              <span className="flex items-center gap-1"><Award className="h-4 w-4 text-secondary" /> HMRC ready</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/40 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground">navigator.airgead.app</span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
                <Stat value="£487k" label="Total wealth" />
                <Stat value="+8.4%" label="YTD growth" />
                <Stat value="3" label="Wrappers" />
                <Stat value="A+" label="Compliance" />
                <div className="col-span-2 rounded-lg border border-border p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Live drawdown</div>
                  <div className="h-20 flex items-end gap-1">
                    {[40, 55, 48, 62, 70, 65, 78, 84, 80, 92, 88, 96].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-secondary" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <Section className="!py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat value="30+ yrs" label="Combined pensions expertise" />
          <Stat value="100%" label="HMRC RTI / Origo coverage" />
          <Stat value="Real-time" label="CASS-aware reconciliation" />
          <Stat value="2027-ready" label="IHT-on-pensions modelling" />
        </div>
      </Section>

      {/* Why */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow><Sparkles className="h-3 w-3" /> Why Pension Navigator</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built by pension specialists. Engineered for the next decade.</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Most pensions platforms were designed in the 2000s and patched ever since. We rebuilt
            from first principles around modern wrappers, real-time data, and the regulatory
            reality of post-2027 IHT, MPAA, LSA / LSDBA and SDR.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Compliance-first", desc: "HMRC RTI, PAYE, LSA / LSDBA, CASS reconciliation and a full audit trail are built-in — not bolted-on." },
            { icon: Cpu, title: "Modern architecture", desc: "Event-driven, API-native, real-time valuations, role-based portals and embedded AI assistance." },
            { icon: Users, title: "Adviser & client first", desc: "Distinct workspaces for clients, advisers and administrators — including a mobile-native client app." },
          ].map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="!py-16">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10 md:p-14 grid md:grid-cols-[1fr_auto] items-center gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">See the live platform.</h3>
            <p className="mt-2 text-primary-foreground/80 max-w-xl">
              Walk through the full administrator, adviser and client experience — including IHT
              modelling, drawdown, KYC, cash onboarding and the mobile client app.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/dashboard">Launch app</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/site/contact">Book a demo</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ---------------------------------- About ---------------------------------- */

export function MarketingAbout() {
  return (
    <>
      <Section>
        <Eyebrow><Building2 className="h-3 w-3" /> About Airgead</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          A pensions business — with a software company inside it.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
          Airgead was founded by pension administrators, advisers and technologists who spent
          decades inside the UK's largest SIPP, SSAS and platform providers. We built Pension
          Navigator because we knew what good looked like — and what the industry was missing.
        </p>
      </Section>

      <Section className="!pt-0">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Our heritage", body: "Operational leadership across HMRC reporting, scheme administration, drawdown, transfers, dealing and reconciliation — built into the product, not learnt on the job." },
            { title: "Our philosophy", body: "Great pensions software is invisible. Clients see clarity. Advisers see leverage. Administrators see control. Auditors see evidence." },
            { title: "Our discipline", body: "Every feature passes a three-way test: regulatory accuracy, operational efficiency, and a member experience advisers can stand behind." },
          ].map((c) => (
            <Card key={c.title}>
              <CardHeader><CardTitle>{c.title}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{c.body}</p></CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="rounded-xl border border-border bg-card p-8 md:p-12">
          <Eyebrow><Award className="h-3 w-3" /> What sets us apart</Eyebrow>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Decades of pensions know-how, condensed into software.</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Direct experience administering SIPP, SSAS, ISA, GIA and bespoke schemes",
              "Hands-on delivery of HMRC RTI, Origo Options and APSS reporting",
              "Built CASS reconciliation processes inside FCA-regulated operators",
              "Designed adviser propositions for top-100 UK IFA networks",
              "Operated dealing desks executing across SIPP and platform wrappers",
              "Authored response frameworks for MPAA, LSA / LSDBA and post-2027 IHT",
            ].map((t) => (
              <div key={t} className="flex gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

/* --------------------------------- Platform -------------------------------- */

export function MarketingPlatform() {
  const modules = [
    { icon: Workflow, title: "Onboarding & KYC", desc: "Digital welcome packs, identity checks, cash onboarding and a bulk bank reconciliation workflow." },
    { icon: PiggyBank, title: "Multi-wrapper engine", desc: "SIPP, SSAS, ISA (allowance tracking), GIA (CGT tracking) and bespoke schemes in a single ledger." },
    { icon: TrendingUp, title: "Drawdown & UFPLS", desc: "Flexible drawdown, drip-feed, annuities, PCLS, UFPLS — with PAYE, RTI and tax-code automation." },
    { icon: ScrollText, title: "IHT & estate planning", desc: "Post-2027 IHT modelling on pensions and other assets, including spousal exemption logic." },
    { icon: BarChart3, title: "Dealing & portfolios", desc: "Model portfolios, rebalancing, dealing desk, Monte Carlo projections and corporate actions." },
    { icon: ShieldCheck, title: "Compliance suite", desc: "HMRC reporting, LSA / LSDBA, CASS reconciliation, audit trail and KYC review queue." },
    { icon: Users, title: "Role-based portals", desc: "Distinct experiences for clients, advisers and administrators — plus a mobile client app." },
    { icon: Sparkles, title: "AI-assisted service", desc: "An embedded AI assistant — Ask Navigator — trained for UK pensions queries and contextual help." },
    { icon: Globe, title: "Open integration", desc: "API-native: Origo Options, payments, identity, market data, custodians and bank files." },
  ];
  return (
    <>
      <Section>
        <Eyebrow><Layers className="h-3 w-3" /> Platform</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">One platform. Every wrapper. Every workflow.</h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
          Pension Navigator is a unified administration, advice-support and client-experience
          platform. Modular by design, regulatory by default, and ready for the post-2027 pensions
          landscape.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link to="/dashboard">Open the live platform <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button asChild variant="outline"><Link to="/overview">System overview deck</Link></Button>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => (
            <Card key={m.title} className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{m.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Eyebrow><Cpu className="h-3 w-3" /> Architecture</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight">Real-time, event-driven, API-native.</h2>
            <p className="mt-4 text-muted-foreground">
              A modern cloud architecture with role-based access, full audit logging, real-time
              valuations, and a network-only PWA layer that prevents stale caching for advisers
              working across devices.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "TypeScript and React 18 frontend",
                "Postgres + Row Level Security backend",
                "Edge functions for AI, projections and reconciliation",
                "Comprehensive audit trail with CSV export",
                "Mobile-first client portal with action-sheet UX",
              ].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-6 font-mono text-xs leading-relaxed text-muted-foreground">
            <pre>{`┌────────────────────────────────────────────┐
│  Client portal · Adviser · Admin · Mobile  │
└────────────────────────────────────────────┘
                    │
            ┌───────┴────────┐
            │  API gateway   │
            └───────┬────────┘
   ┌────────────┬──┴──┬──────────────┐
Wrapper     Drawdown  Dealing      IHT
engine      & PAYE    desk         engine
   │            │       │            │
   └────────────┴───┬───┴────────────┘
                   │
        ┌──────────┴──────────┐
        │  Audit · Reporting  │
        │  HMRC · Origo · CASS│
        └─────────────────────┘`}</pre>
          </div>
        </div>
      </Section>

      {/* Persona experiences */}
      <Section className="!pt-0">
        <Eyebrow><Users className="h-3 w-3" /> Three roles, one platform</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          Purpose-built workspaces for clients, advisers and administrators.
        </h2>
        <p className="mt-4 text-muted-foreground max-w-3xl">
          Pension Navigator presents the right surface to the right user. No more advisers wading
          through admin screens, or members confronted with regulatory jargon.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Users, title: "Client portal",
              tagline: "Clarity, control, confidence.",
              points: [
                "Total wealth and YTD growth at a glance",
                "Self-serve contributions and drawdown adjustments",
                "Mobile-native app with bottom-tab navigation",
                "Embedded AI assistant for plain-English answers",
              ],
              cta: { to: "/dashboard", label: "Open client view" },
            },
            {
              icon: Briefcase, title: "Adviser workbench",
              tagline: "Leverage across every household.",
              points: [
                "Cross-client illustrations and Monte Carlo projections",
                "IHT planning across pensions, ISAs, GIAs and property",
                "Drawdown sustainability and tax-efficient sequencing",
                "One-click reporting suite with Airgead branding",
              ],
              cta: { to: "/workbench", label: "Open adviser workbench" },
            },
            {
              icon: ShieldCheck, title: "Administrator console",
              tagline: "Operational control, end-to-end.",
              points: [
                "Operations cockpit with real-time SLA monitoring",
                "Bulk bank operations: match → allocate → apply",
                "HMRC RTI, PAYE, LSA / LSDBA and Origo Options",
                "Full audit trail with who-when-what and CSV export",
              ],
              cta: { to: "/cockpit", label: "Open ops cockpit" },
            },
          ].map((p) => (
            <Card key={p.title} className="flex flex-col">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {p.points.map((t) => (
                    <li key={t} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />{t}</li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Button asChild variant="outline" size="sm"><Link to={p.cta.to}>{p.cta.label} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Integrations */}
      <Section className="!pt-0">
        <div className="rounded-xl border border-border bg-card p-8 md:p-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-10 items-start">
            <div>
              <Eyebrow><Globe className="h-3 w-3" /> Integrations</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight">Open by design.</h2>
              <p className="mt-4 text-muted-foreground">
                Every external touchpoint is API-first. We treat integrations as products, not
                projects — so connecting custodians, banks, identity providers or market data feeds
                is a config exercise, not a six-month build.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline"><Link to="/api-directory">Browse API directory <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "HMRC RTI / APSS", "Origo Options", "Bank file (BACS / CHAPS)",
                "Identity & KYC providers", "Market data feeds", "Custodian APIs",
                "Payment providers", "Document signing", "Email / SMS gateways",
              ].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section className="!pt-0">
        <Eyebrow><Lock className="h-3 w-3" /> Security & resilience</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          Built to a financial-services security bar.
        </h2>
        <div className="mt-10 grid md:grid-cols-4 gap-5">
          {[
            { icon: Lock, title: "Data protection", body: "Encryption in transit and at rest, row-level security and fine-grained role-based access controls." },
            { icon: ScrollText, title: "Audit & evidence", body: "Every KYC decision, cash event and admin change is captured with actor, timestamp and diff — exportable to CSV." },
            { icon: ShieldCheck, title: "Operational resilience", body: "Multi-region deployment options, point-in-time recovery and CASS-aligned reconciliation routines." },
            { icon: Award, title: "Regulatory alignment", body: "Designed against FCA SYSC, CASS, SDR and Consumer Duty expectations from day one." },
          ].map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-secondary/15 grid place-items-center mb-3">
                  <s.icon className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{s.body}</p></CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Implementation timeline */}
      <Section className="!pt-0">
        <Eyebrow><Workflow className="h-3 w-3" /> Implementation</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          From kick-off to go-live in weeks, not years.
        </h2>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Discover", body: "Operating-model review, data audit and integration map. Output: a phased delivery plan." },
            { step: "02", title: "Configure", body: "Wrappers, fee schedules, permissions, model portfolios and reporting templates set up to your firm." },
            { step: "03", title: "Migrate", body: "Bulk data load, balancing reconciliation, parallel running and a regulator-grade migration evidence pack." },
            { step: "04", title: "Operate", body: "Go-live with named support, SLA monitoring and a continuous-improvement roadmap." },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-border bg-card p-6">
              <div className="text-xs font-mono text-primary mb-2">{s.step}</div>
              <div className="font-semibold mb-1">{s.title}</div>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="!pt-0">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-10 md:p-14 text-center">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to see it work on your data?</h3>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            We'll run a tailored walkthrough using a sanitised slice of your scheme data so the
            value is concrete on day one.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg"><Link to="/site/contact">Book a demo</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/dashboard">Launch the live app</Link></Button>
          </div>
        </div>
      </Section>
    </>
  );
}

export function MarketingExpertise() {
  const areas = [
    { title: "SIPP & SSAS administration", points: ["Full scheme lifecycle", "Connected-party SSAS loans", "Commercial property in pension"] },
    { title: "Drawdown & retirement income", points: ["Flexi-access drawdown", "Drip-feed drawdown", "Annuity comparisons", "UFPLS & PCLS"] },
    { title: "Tax & allowances", points: ["MPAA tracking", "LSA / LSDBA monitoring", "Annual & tapered allowance", "Carry-forward"] },
    { title: "IHT & estate planning", points: ["Post-2027 IHT on pensions", "Spousal exemption modelling", "Cross-asset estate view"] },
    { title: "Wrappers & investment", points: ["ISA allowance tracking", "GIA & CGT tracking", "Model portfolios & rebalancing"] },
    { title: "Operations & compliance", points: ["HMRC RTI, PAYE, APSS", "Origo Options transfers", "CASS reconciliation", "FCA-aligned audit trail"] },
  ];
  return (
    <>
      <Section>
        <Eyebrow><BookOpen className="h-3 w-3" /> Pensions expertise</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Vast pensions knowledge, encoded in software.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
          Airgead's team has spent careers inside SIPP operators, platforms and IFA networks. That
          institutional memory shapes every workflow, every tax calculation and every piece of
          adviser-facing UX in Pension Navigator.
        </p>
      </Section>

      <Section className="!pt-0">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((a) => (
            <Card key={a.title}>
              <CardHeader>
                <CardTitle className="text-lg">{a.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {a.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="rounded-xl border border-border bg-gradient-to-br from-secondary/10 via-card to-primary/10 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Eyebrow><Sparkles className="h-3 w-3" /> Knowledge in action</Eyebrow>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Ask Navigator — your AI pensions co-pilot.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Embedded inside the client and adviser portals, Ask Navigator answers UK pension
                queries grounded in 2024/25 tax rules and the user's own portfolio context.
              </p>
              <div className="mt-6">
                <Button asChild><Link to="/assistant">Try Ask Navigator</Link></Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-3">
              <div className="rounded-md bg-muted px-3 py-2"><strong>You:</strong> If I crystallise £40k from my SIPP this year, what's the LSA impact?</div>
              <div className="rounded-md bg-primary/10 px-3 py-2"><strong>Navigator:</strong> 25% (£10k) is tax-free PCLS and reduces your LSA by £10k. Remaining LSA: £258,275. Want me to model the income tax on the £30k crystallised pot?</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Regulatory timeline */}
      <Section className="!pt-0">
        <Eyebrow><Calendar className="h-3 w-3" /> Regulatory horizon</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          We track every change so your operation doesn't have to.
        </h2>
        <p className="mt-4 text-muted-foreground max-w-3xl">
          UK pensions regulation moves constantly. Pension Navigator's roadmap is anchored to a
          live regulatory tracker maintained by our pensions team — so the platform is ready for
          the rule change before it lands.
        </p>
        <div className="mt-10 relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" aria-hidden />
          <div className="space-y-8">
            {[
              { date: "April 2024", title: "LTA abolished, LSA / LSDBA introduced", body: "Replaced lifetime allowance with the Lump Sum Allowance and Lump Sum Death Benefit Allowance. Navigator tracks both per member, per crystallisation event." },
              { date: "April 2025", title: "Annual allowance £60,000 + tapering", body: "Carry-forward, tapered allowance and MPAA tracked across SIPP and SSAS contributions in real time." },
              { date: "April 2026", title: "Origo Options enhanced reporting", body: "Expanded transfer messaging and SLA reporting baked into our Origo integration." },
              { date: "April 2027", title: "Pensions enter the IHT estate", body: "Our IHT engine models the post-2027 regime today, including spousal exemption, residence nil-rate band tapering and cross-asset estate composition." },
              { date: "Ongoing", title: "Consumer Duty & SDR", body: "Outcome monitoring, fair-value assessments and sustainability disclosures captured in the audit trail and reporting suite." },
            ].map((e, i) => (
              <div key={e.title} className={`relative md:grid md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className={`pl-12 md:pl-0 ${i % 2 ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">{e.date}</div>
                  <div className="font-semibold mt-1">{e.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{e.body}</p>
                </div>
                <div className="hidden md:block" />
                <span className="absolute left-4 md:left-1/2 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background md:-translate-x-1/2" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Team / heritage */}
      <Section className="!pt-0">
        <Eyebrow><GraduationCap className="h-3 w-3" /> Our pensions team</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          Practitioners, not just product managers.
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { role: "Pensions operations leadership", body: "Former Heads of SIPP and Heads of Operations from leading UK SIPP operators and platform providers — with hands-on responsibility for HMRC, Origo and CASS." },
            { role: "Adviser-side specialists", body: "Ex-paraplanners, technical advisers and proposition leads who have run cashflow planning, drawdown reviews and IHT cases at scale." },
            { role: "Engineering & data", body: "A senior engineering team with deep financial-services experience — building the modern, API-native, real-time stack underneath." },
          ].map((t) => (
            <Card key={t.role}>
              <CardHeader><CardTitle className="text-lg">{t.role}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{t.body}</p></CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Knowledge base / FAQ */}
      <Section className="!pt-0">
        <Eyebrow><BookOpen className="h-3 w-3" /> Pensions FAQ</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Plain-English answers to the questions we hear most.</h2>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {[
            { q: "How is the LSA different from the old LTA?", a: "The Lump Sum Allowance caps the total tax-free cash a member can take across their lifetime at £268,275. Unlike the LTA, it doesn't tax growth — only crystallised lump sums." },
            { q: "What does the 2027 IHT change actually do?", a: "From April 2027, most unused pension funds will fall inside the deceased's estate for IHT purposes. Our IHT engine models pre- and post-2027 outcomes side-by-side, including spousal exemption logic." },
            { q: "How does drip-feed drawdown help clients?", a: "It crystallises only what's needed each period, releasing 25% PCLS gradually rather than in one event. This preserves uncrystallised growth and can manage tax-band exposure year-on-year." },
            { q: "Do you support SSAS connected-party loans?", a: "Yes — full SSAS administration including loan-back to sponsoring employers, commercial property purchase and member-directed investment." },
            { q: "How is MPAA tracked?", a: "Once a member triggers MPAA via flexible drawdown or UFPLS, Navigator automatically caps DC contributions at £10,000 across all wrappers and flags any breaches in real time." },
            { q: "Can advisers white-label the client experience?", a: "Yes. Branding, communication templates and the document pack are all configurable per firm — the underlying admin and compliance engine remains shared." },
          ].map((f) => (
            <div key={f.q} className="rounded-lg border border-border bg-card p-5">
              <div className="font-semibold flex gap-2"><Quote className="h-4 w-4 text-primary mt-1 shrink-0" />{f.q}</div>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="!pt-0">
        <div className="rounded-2xl border border-border bg-card p-10 md:p-14 grid md:grid-cols-[2fr_1fr] gap-6 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Talk to a pensions specialist.</h3>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Whether you're scoping a platform replacement, reviewing your IHT proposition or
              modernising adviser tooling, our team will give you a straight answer.
            </p>
          </div>
          <div className="flex md:justify-end gap-3">
            <Button asChild size="lg"><Link to="/site/contact">Get in touch</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/site/platform">Explore platform</Link></Button>
          </div>
        </div>
      </Section>
    </>
  );
}

export function MarketingMarket() {
  const competitors = [
    { name: "Legacy SIPP operators", strength: "Scale", gap: "Outdated UX, slow change cycles, weak adviser tooling" },
    { name: "Platforms (Wraps)", strength: "Distribution", gap: "Generic admin, limited SSAS, no IHT-on-pensions modelling" },
    { name: "Spreadsheet + back-office", strength: "Flexibility", gap: "No real-time data, manual reconciliation, no audit trail" },
    { name: "Pension Navigator", strength: "Modern + expert", gap: "Built end-to-end for the post-2027 landscape" },
  ];
  return (
    <>
      <Section>
        <Eyebrow><Globe className="h-3 w-3" /> Market position</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          The modern alternative to legacy pensions infrastructure.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
          The UK pensions market sits between three forces: tightening regulation, member demand
          for digital experiences, and operators trapped on legacy stacks. Pension Navigator was
          built for this moment.
        </p>
      </Section>

      <Section className="!pt-0">
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            { value: "£3 trillion+", label: "UK pension assets" },
            { value: "April 2027", label: "Pensions enter the IHT estate" },
            { value: "70%+", label: "Operators on legacy systems" },
          ].map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-4 font-semibold">Provider type</th>
                <th className="p-4 font-semibold">Strength</th>
                <th className="p-4 font-semibold">Gap we close</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr key={c.name} className={`border-t border-border ${c.name === "Pension Navigator" ? "bg-primary/5" : ""}`}>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-muted-foreground">{c.strength}</td>
                  <td className="p-4 text-muted-foreground">{c.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Who we serve", body: "SIPP & SSAS operators, advised platforms, IFA networks and discretionary managers seeking a modern back- and front-office." },
            { icon: TrendingUp, title: "Why now", body: "The 2027 IHT change, LSA / LSDBA reform and SDR are forcing operators to upgrade — and the UI bar set by consumer apps keeps rising." },
            { icon: Sparkles, title: "Why us", body: "Few teams combine real pensions operating experience with shippable, modern engineering. We do — and the platform shows it." },
          ].map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-secondary/15 grid place-items-center mb-3">
                  <p.icon className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Positioning quadrant */}
      <Section className="!pt-0">
        <Eyebrow><Target className="h-3 w-3" /> Positioning</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          Where Pension Navigator sits in the market.
        </h2>
        <p className="mt-4 text-muted-foreground max-w-3xl">
          Most providers trade off pensions depth against modern technology. We don't accept the
          trade-off.
        </p>
        <div className="mt-10 rounded-xl border border-border bg-card p-6 md:p-10">
          <div className="relative aspect-[16/10] w-full">
            {/* Axes */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-border" />
              <div className="border-b border-border" />
              <div className="border-r border-border" />
              <div />
            </div>
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs uppercase tracking-wider text-muted-foreground">Modern technology →</div>
            <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 text-xs uppercase tracking-wider text-muted-foreground">Pensions depth →</div>
            {/* Markers */}
            {[
              { left: "12%", top: "70%", label: "Spreadsheet + back-office", muted: true },
              { left: "38%", top: "55%", label: "Generic platforms", muted: true },
              { left: "65%", top: "62%", label: "Legacy SIPP operators", muted: true },
              { left: "78%", top: "18%", label: "Pension Navigator", muted: false },
            ].map((m) => (
              <div key={m.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: m.left, top: m.top }}>
                <div className={`h-3 w-3 rounded-full mx-auto ${m.muted ? "bg-muted-foreground/60" : "bg-primary ring-4 ring-primary/20"}`} />
                <div className={`mt-2 text-xs whitespace-nowrap ${m.muted ? "text-muted-foreground" : "font-semibold text-primary"}`}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Segments served */}
      <Section className="!pt-0">
        <Eyebrow><Map className="h-3 w-3" /> Segments served</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          One platform, four go-to-market motions.
        </h2>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {[
            { icon: Building2, title: "SIPP & SSAS operators", body: "Modernise core admin without ripping out custodian or banking relationships. Phased migration with full parallel running." },
            { icon: Users, title: "IFA networks & advised platforms", body: "Adviser-grade workbench, IHT planning and reporting suite — branded for the network, white-labelled where required." },
            { icon: TrendingUp, title: "Discretionary fund managers", body: "Model portfolios, dealing desk and corporate-actions handling integrated with member-level reporting and PAYE." },
            { icon: Scale, title: "Workplace & SSAS schemes", body: "Sponsor-employer schemes with member-directed investment, PAYE-on-pension and trustee reporting." },
          ].map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{s.body}</p></CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Outcomes */}
      <Section className="!pt-0">
        <Eyebrow><Gauge className="h-3 w-3" /> Outcomes our clients target</Eyebrow>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl">
          Measurable change, not just better screens.
        </h2>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { value: "−60%", label: "Manual admin effort", body: "Bulk operations and STP onboarding remove repetitive ops work." },
            { value: "<24h", label: "Cash onboarding SLA", body: "Match → allocate → apply on bank files, with full reconciliation evidence." },
            { value: "100%", label: "Audit coverage", body: "Every KYC decision and admin change captured and exportable." },
            { value: "10×", label: "Faster client reviews", body: "IHT, drawdown and projection tooling collapse review prep time." },
          ].map((o) => (
            <div key={o.label} className="rounded-xl border border-border bg-card p-6">
              <div className="text-3xl font-bold tracking-tight text-primary">{o.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{o.label}</div>
              <p className="text-sm text-muted-foreground mt-3">{o.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Voices */}
      <Section className="!pt-0">
        <Eyebrow><Quote className="h-3 w-3" /> What the market is telling us</Eyebrow>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { quote: "We've been waiting for a SIPP platform that takes the 2027 IHT change seriously. The modelling alone changes the adviser conversation.", who: "Head of Pensions, advised platform" },
            { quote: "The audit trail and CASS-aware reconciliation are exactly what our compliance team kept asking legacy vendors for — and never got.", who: "COO, SIPP operator" },
            { quote: "Our paraplanners cut review prep by more than half. The cross-asset IHT view is the bit clients actually understand.", who: "Director, IFA network" },
          ].map((t, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Quote className="h-5 w-5 text-primary mb-3" />
                <p className="text-sm">{t.quote}</p>
                <div className="text-xs text-muted-foreground mt-4">— {t.who}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Representative voices from prospect conversations. Named references available on request.</p>
      </Section>

      {/* CTA */}
      <Section className="!pt-0">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10 md:p-14 grid md:grid-cols-[1fr_auto] items-center gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Stake your position before 2027.</h3>
            <p className="mt-2 text-primary-foreground/80 max-w-xl">
              Operators who modernise now will own the post-reform conversation. Let's plan your
              path.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/site/contact">Book a strategy call</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Link to="/dashboard">Launch app</Link></Button>
          </div>
        </div>
      </Section>
    </>
  );
}

export function MarketingContact() {
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Eyebrow><Mail className="h-3 w-3" /> Talk to us</Eyebrow>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Book a walkthrough of Pension Navigator.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We work with SIPP operators, advised platforms, IFA networks and discretionary
            managers. Tell us a little about your operation and we'll arrange a tailored demo.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex gap-3"><Mail className="h-5 w-5 text-primary" /> hello@airgead.co.uk</div>
            <div className="flex gap-3"><Phone className="h-5 w-5 text-primary" /> +44 (0)20 0000 0000</div>
            <div className="flex gap-3"><MapPin className="h-5 w-5 text-primary" /> London, United Kingdom</div>
          </div>
          <div className="mt-10">
            <Button asChild size="lg"><Link to="/dashboard">Or launch the live demo <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
