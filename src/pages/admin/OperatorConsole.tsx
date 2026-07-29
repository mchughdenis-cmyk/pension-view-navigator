import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavBadges } from "@/hooks/useNavBadges";
import {
  AlertTriangle, ClipboardList, ShieldCheck, Timer, Wallet,
  MessageSquare, HandCoins, ArrowRight, Upload, Receipt, PoundSterling,
} from "lucide-react";

interface Tile {
  key: string;
  title: string;
  count: number;
  url: string;
  icon: any;
  tone: "danger" | "warn" | "info" | "ok";
  hint: string;
}

const toneCls: Record<Tile["tone"], string> = {
  danger: "border-destructive/40 bg-destructive/5",
  warn: "border-warning/40 bg-warning/5",
  info: "border-primary/30 bg-primary/5",
  ok: "border-emerald-500/30 bg-emerald-500/5",
};

const quickActions = [
  { title: "Upload bank file", url: "/bank-upload", icon: Upload },
  { title: "Run payroll", url: "/payroll-processing", icon: Receipt },
  { title: "New case", url: "/cases", icon: ClipboardList },
  { title: "Process drawdown", url: "/drawdown", icon: PoundSterling },
  { title: "Chase contribution", url: "/contribution-chaser", icon: HandCoins },
];

export default function OperatorConsole() {
  const b = useNavBadges(30_000);

  const tiles: Tile[] = [
    { key: "approvals", title: "Awaiting my approval", count: b.approvals, url: "/admin?tab=approvals", icon: ShieldCheck, tone: "warn", hint: "Four-eyes queue" },
    { key: "sla", title: "SLA breaching today", count: b.slaBreaching, url: "/sla-tracker", icon: Timer, tone: "danger", hint: "Cases against deadline" },
    { key: "cases", title: "Open cases", count: b.cases, url: "/cases", icon: ClipboardList, tone: "info", hint: "All work in progress" },
    { key: "breaks", title: "Cash breaks (CASS)", count: b.cashBreaks, url: "/cass-engine", icon: AlertTriangle, tone: "danger", hint: "Unresolved CASS 7/8 breaks" },
    { key: "unalloc", title: "Unallocated cash", count: b.unallocated, url: "/unallocated-cash", icon: Wallet, tone: "warn", hint: "Suspense to allocate" },
    { key: "overdue", title: "Overdue contributions", count: b.contribOverdue, url: "/contribution-chaser", icon: HandCoins, tone: "warn", hint: "TPR chase list" },
    { key: "queries", title: "Open member queries", count: b.memberQueries, url: "/member-queries", icon: MessageSquare, tone: "info", hint: "Complaints & questions" },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Operator console</h1>
          <p className="text-sm text-muted-foreground">Everything that needs a human today, in one view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button key={a.url} asChild variant="outline" size="sm">
              <Link to={a.url}><a.icon className="h-3.5 w-3.5 mr-1.5" />{a.title}</Link>
            </Button>
          ))}
        </div>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Work queue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((t) => (
            <Link to={t.url} key={t.key} className="group">
              <Card className={`transition hover:shadow-md ${toneCls[t.tone]}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <t.icon className="h-4 w-4 text-muted-foreground" />
                    {t.count > 0 && <Badge variant="secondary">{t.count}</Badge>}
                  </div>
                  <CardTitle className="text-sm font-medium mt-2">{t.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold tabular-nums">{t.count}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.hint}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* SLA heatmap */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SLA heatmap — next 5 days</h2>
          <span className="text-xs text-muted-foreground">Red = breach, amber = &lt; 24h, green = healthy</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(() => {
            // Simulated load derived from live badge counts across a 5-day window
            const total = b.slaBreaching + b.cases;
            const breachToday = b.slaBreaching;
            const days = [
              { label: "Today", load: breachToday, tone: breachToday > 0 ? "danger" : "ok" as const },
              { label: "T+1", load: Math.max(0, Math.round(total * 0.22) - breachToday), tone: "warn" as const },
              { label: "T+2", load: Math.round(total * 0.18), tone: "info" as const },
              { label: "T+3", load: Math.round(total * 0.14), tone: "info" as const },
              { label: "T+4", load: Math.round(total * 0.10), tone: "ok" as const },
            ];
            const cls = (tone: string, load: number) => {
              if (tone === "danger" && load > 0) return "bg-destructive/20 border-destructive/50 text-destructive-foreground";
              if (tone === "warn" && load > 0) return "bg-amber-500/15 border-amber-500/40";
              if (load === 0) return "bg-emerald-500/10 border-emerald-500/30";
              return "bg-primary/5 border-primary/20";
            };
            return days.map(d => (
              <Link key={d.label} to="/sla-tracker" className={`rounded border p-3 transition hover:shadow-sm ${cls(d.tone, d.load)}`}>
                <div className="text-xs uppercase text-muted-foreground">{d.label}</div>
                <div className="text-2xl font-bold tabular-nums">{d.load}</div>
                <div className="text-[10px] text-muted-foreground mt-1">cases due</div>
              </Link>
            ));
          })()}
        </div>
      </section>


      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Book-of-business jumps</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["/bank-upload", "Bank upload"],
              ["/cass", "CASS 7/8"],
              ["/payroll-processing", "Payroll"],
              ["/contributions", "Contributions"],
              ["/dealing", "Dealing desk"],
              ["/direct-debit-collections", "Direct debits"],
              ["/paye", "RAS / RTI"],
              ["/hmrc", "HMRC events"],
            ].map(([url, label]) => (
              <Link key={url} to={url} className="rounded border px-3 py-2 hover:bg-muted transition">{label}</Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Client-level jumps</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["/onboarding", "Onboarding"],
              ["/kyc-review", "KYC review"],
              ["/transfer", "Transfer in"],
              ["/drawdown", "Drawdown"],
              ["/instant-withdrawal", "UFPLS"],
              ["/death-claims", "Death claims"],
              ["/pension-sharing", "Pension sharing"],
              ["/benefit-statements", "Statements"],
            ].map(([url, label]) => (
              <Link key={url} to={url} className="rounded border px-3 py-2 hover:bg-muted transition">{label}</Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground">
        Tip: press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">⌘K</kbd> to jump anywhere,
        or <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">?</kbd> for shortcuts.
      </p>
    </div>
  );
}
