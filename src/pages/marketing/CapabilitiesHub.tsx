import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { capabilities, MATURITY_LABEL, MATURITY_DESCRIPTION, type Maturity } from "@/data/capabilities";

export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  const variant = maturity === "live" ? "default" : maturity === "partial" ? "secondary" : "outline";
  return <Badge variant={variant} title={MATURITY_DESCRIPTION[maturity]}>{MATURITY_LABEL[maturity]}</Badge>;
}

export default function CapabilitiesHub() {
  const counts = capabilities.reduce(
    (acc, c) => ({ ...acc, [c.maturity]: (acc[c.maturity] ?? 0) + 1 }),
    {} as Record<Maturity, number>,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <header className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Capability showcase
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          What a full pension administration system has to do — and where we stand
        </h1>
        <p className="text-muted-foreground">
          Sixteen administration domains, from member onboarding to CASS reconciliation, the fee run
          and the controls that sit around them. Each page sets out the workflow, the rules it has to
          satisfy, the screens that deliver it and what is still on the roadmap. Nothing is dressed up:
          partial means partial.
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{counts.live ?? 0}</strong> live</span>
          <span><strong className="text-foreground">{counts.partial ?? 0}</strong> partial</span>
          <span><strong className="text-foreground">{counts.roadmap ?? 0}</strong> roadmap</span>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((c) => (
          <Card key={c.slug} className="flex flex-col">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-snug">{c.title}</CardTitle>
                <MaturityBadge maturity={c.maturity} />
              </div>
              <p className="text-sm text-muted-foreground">{c.positioning}</p>
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
              <ul className="text-sm text-muted-foreground space-y-1">
                {c.rules.slice(0, 3).map((r) => (
                  <li key={r} className="flex gap-2"><span className="text-primary">·</span><span>{r}</span></li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/capabilities/${c.slug}`}>
                  See how it works <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Want to see it running?</h2>
            <p className="text-sm text-muted-foreground">
              Live screens sit behind sign-in. Ask us for demo credentials, or take the guided tour first.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/tour">Guided tour</Link></Button>
            <Button asChild><Link to="/site/contact">Request a demo</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
