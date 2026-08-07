import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { capabilities, getCapability, getCapabilityDemo, MATURITY_DESCRIPTION } from "@/data/capabilities";
import DemoJourneyPanel from "@/components/marketing/DemoJourneyPanel";
import { MaturityBadge } from "./CapabilitiesHub";

export default function CapabilityDetail() {
  const { slug } = useParams();
  const cap = getCapability(slug);
  if (!cap) return <Navigate to="/capabilities" replace />;

  const idx = capabilities.findIndex((c) => c.slug === cap.slug);
  const next = capabilities[(idx + 1) % capabilities.length];
  const demo = getCapabilityDemo(cap.slug);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
          <Link to="/capabilities"><ArrowLeft className="mr-1 h-4 w-4" /> All capabilities</Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{cap.title}</h1>
          <MaturityBadge maturity={cap.maturity} />
        </div>
        <p className="text-muted-foreground mt-3 max-w-3xl">{cap.positioning}</p>
        <p className="text-sm text-muted-foreground mt-1">{MATURITY_DESCRIPTION[cap.maturity]}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>How the workflow runs</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {cap.what.map((w, i) => (
              <li key={w} className="flex gap-3 text-sm">
                <span className="h-6 w-6 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{w}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <DemoJourneyPanel slug={cap.slug} demo={demo} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Rules and limits applied</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {cap.rules.map((r) => (
                <li key={r} className="flex gap-2"><span className="text-primary">·</span><span>{r}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Production connections still to come</CardTitle></CardHeader>
          <CardContent>
            {cap.roadmap.length ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {cap.roadmap.map((r) => (
                  <li key={r} className="flex gap-2"><span className="text-muted-foreground">·</span><span>{r}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing outstanding in this area.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Live screens <Lock className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These open the working product. You will be asked to sign in first.
          </p>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {cap.screens.map((s) => (
            <Link
              key={s.to + s.label}
              to={s.to}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent/60 transition-colors"
            >
              <span>{s.label}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border pt-6">
        <Button asChild variant="outline"><Link to="/site/contact">Request a demo</Link></Button>
        <Button asChild variant="ghost">
          <Link to={`/capabilities/${next.slug}`}>Next: {next.title} <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
