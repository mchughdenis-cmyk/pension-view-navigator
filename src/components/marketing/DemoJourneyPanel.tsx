import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Play, PlugZap, Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DemoJourney } from "@/data/capabilities";
import { demoOutputs, downloadDemoOutput } from "@/lib/demoOutputs";

function ConnectorCard({ name, protocol, messages }: DemoJourney["connectors"][number]) {
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);

  const run = () => {
    if (running) return;
    setRunning(true);
    setShown(0);
    messages.forEach((_, i) => {
      window.setTimeout(() => {
        setShown(i + 1);
        if (i === messages.length - 1) setRunning(false);
      }, 420 * (i + 1));
    });
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 font-medium text-sm">
            <PlugZap className="h-4 w-4 text-primary" /> {name}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{protocol}</p>
        </div>
        <Button size="sm" variant="outline" onClick={run} disabled={running}>
          <Play className="mr-1 h-3.5 w-3.5" /> {running ? "Running…" : "Run exchange"}
        </Button>
      </div>
      <div className="mt-3 rounded-md bg-muted/50 p-3 font-mono text-xs space-y-1 min-h-[5.5rem]">
        {shown === 0 ? (
          <p className="text-muted-foreground">Press run to replay the message exchange.</p>
        ) : (
          messages.slice(0, shown).map((m) => (
            <p key={m} className="flex gap-2 text-muted-foreground">
              <Check className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
              <span>{m}</span>
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default function DemoJourneyPanel({ slug, demo }: { slug: string; demo?: DemoJourney }) {
  const outputs = demoOutputs[slug] ?? [];
  if (!demo && !outputs.length) return null;

  return (
    <div className="space-y-6">
      {demo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>Demo journey</CardTitle>
              <Badge variant="secondary">Runnable today</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{demo.headline}</p>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {demo.steps.map((s, i) => {
              const inner = (
                <>
                  <span className="h-6 w-6 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">{s.detail}</span>
                  </span>
                  {s.to && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground ml-auto self-center" />}
                </>
              );
              return s.to ? (
                <Link
                  key={s.label}
                  to={s.to}
                  className="flex gap-3 rounded-md border border-border px-3 py-2 hover:bg-accent/60 transition-colors"
                >
                  {inner}
                </Link>
              ) : (
                <div key={s.label} className="flex gap-3 rounded-md border border-border px-3 py-2">
                  {inner}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {outputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample outputs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Real files produced by this area. Download them now — no sign-in needed.
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {outputs.map((o) => (
              <button
                key={o.filename}
                type="button"
                onClick={() => downloadDemoOutput(o)}
                className="flex items-start gap-3 rounded-md border border-border px-3 py-2 text-left hover:bg-accent/60 transition-colors"
              >
                <Download className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="block text-xs text-muted-foreground">{o.description}</span>
                  <span className="block text-xs text-muted-foreground/70 font-mono mt-1">{o.filename}</span>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {demo && demo.connectors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>Simulated connectivity</CardTitle>
              <Badge variant="outline">Mocked for demo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Message formats and sequencing match the real interfaces. In a demo these run against a
              simulator; in production the same handlers point at the live endpoint.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {demo.connectors.map((c) => (
              <ConnectorCard key={c.name} {...c} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
