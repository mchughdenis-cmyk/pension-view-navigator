import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Status = "Partial" | "Missing" | "Stub" | "Not connected" | "Unverified" | "Not done";

const rows: { area: string; status: Status; note: string }[] = [
  { area: "Unit tests for src/lib/", status: "Missing", note: "Only 4 Playwright E2E specs today." },
  { area: "Four-eyes queue", status: "Partial", note: "Present in Payroll only; not cross-module." },
  { area: "Corporate actions processor", status: "Stub", note: "Edge function exists, no UI workflow." },
  { area: "RAS monthly reclaim submission", status: "Partial", note: "Calculation yes, HMRC submission stub." },
  { area: "Death benefits end-to-end", status: "Partial", note: "Claims page exists; payout workflow light." },
  { area: "Origo transfer state machine", status: "Partial", note: "Happy path only; exception handling thin." },
  { area: "Pensions Dashboards Programme (PDP)", status: "Not connected", note: "Integration surface only." },
  { area: "Accessibility (WCAG 2.2 AA) audit", status: "Not done", note: "No formal audit recorded." },
  { area: "SSO / SCIM for enterprise tenants", status: "Missing", note: "Backend auth only." },
  { area: "Full audit export (immutable, signed)", status: "Partial", note: "Audit trail present, no signed export." },
  { area: "Performance at 100k+ members", status: "Unverified", note: "No load testing." },
  { area: "DR / RPO/RTO documentation", status: "Missing", note: "Not published." },
];

const tone: Record<Status, string> = {
  "Partial": "border-warning/40 bg-warning/10 text-warning-foreground",
  "Missing": "border-destructive/40 bg-destructive/10 text-destructive",
  "Stub": "border-warning/40 bg-warning/10 text-warning-foreground",
  "Not connected": "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Unverified": "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Not done": "border-destructive/40 bg-destructive/10 text-destructive",
};

export default function Roadmap() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Roadmap & known gaps"
        description="Transparent list of what's partial, missing or not yet connected — published alongside the strengths."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current status</CardTitle>
          <CardDescription>
            This page is the source of truth for the marketing site's transparency section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.area} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_2fr] items-start gap-3 py-3">
                <div className="text-sm font-medium">{r.area}</div>
                <div>
                  <Badge variant="outline" className={tone[r.status]}>{r.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{r.note}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
