import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Status = "Partial" | "Missing" | "Stub" | "Not connected" | "Unverified" | "Not done";
type Priority = "Priority 1" | "Other known gap";

type RoadmapRow = {
  area: string;
  status: Status;
  note: string;
  priority: Priority;
};

const rows: RoadmapRow[] = [
  { priority: "Priority 1", area: "Live Origo Options connection", status: "Not connected", note: "The transfer state machine and message formats are demonstrable; live network exchange and exception handling are not connected." },
  { priority: "Priority 1", area: "Pensions Dashboards Programme (PDP)", status: "Not connected", note: "Add live find and view data exchange, matching and downstream exception handling; the current integration surface is demonstrational." },
  { priority: "Priority 1", area: "Live custodian and platform feeds", status: "Not connected", note: "Scheduled position and transaction feeds are needed to replace uploaded or manually recorded reconciliation inputs." },
  { priority: "Priority 1", area: "Live bank connectivity for statements and payments", status: "Not connected", note: "Bank statements and approved payment files are generated or uploaded in the system today; transmission and retrieval remain manual." },
  { priority: "Priority 1", area: "Payment return-file ingestion", status: "Missing", note: "Automate pain.002, ARUDD and AWACS processing, reconciliation and payment re-issue." },
  { priority: "Priority 1", area: "Direct HMRC gateway submissions", status: "Not connected", note: "Managing Pension Schemes, RTI and relief-at-source returns are staged in the system; gateway transmission, acknowledgements and retries are not automated." },
  { priority: "Priority 1", area: "Automated scheme registration filing", status: "Partial", note: "Scheme references are recorded and submission data can be prepared; electronic filing and HMRC acknowledgement capture are still outstanding." },
  { priority: "Other known gap", area: "Unit tests for src/lib/", status: "Missing", note: "Only 4 Playwright E2E specs today." },
  { priority: "Other known gap", area: "Four-eyes queue", status: "Partial", note: "Present in Payroll only; not cross-module." },
  { priority: "Other known gap", area: "Corporate actions processor", status: "Stub", note: "Edge function exists, no UI workflow." },
  { priority: "Other known gap", area: "RAS monthly reclaim submission", status: "Partial", note: "Calculation yes, HMRC submission stub; detailed gateway connectivity is tracked under Priority 1." },
  { priority: "Other known gap", area: "Death benefits end-to-end", status: "Partial", note: "Claims page exists; payout workflow light." },
  { priority: "Other known gap", area: "Accessibility (WCAG 2.2 AA) audit", status: "Not done", note: "No formal audit recorded." },
  { priority: "Other known gap", area: "SSO / SCIM for enterprise tenants", status: "Missing", note: "Backend auth only." },
  { priority: "Other known gap", area: "Full audit export (immutable, signed)", status: "Partial", note: "Audit trail present, no signed export." },
  { priority: "Other known gap", area: "Performance at 100k+ members", status: "Unverified", note: "No load testing." },
  { priority: "Other known gap", area: "DR / RPO/RTO documentation", status: "Missing", note: "Not published." },
  { priority: "Other known gap", area: "Print & postal fulfilment", status: "Not connected", note: "Documents generated and stored; despatch handled outside." },
  { priority: "Other known gap", area: "Correspondence template version control", status: "Partial", note: "No compliance approval workflow on templates." },
  { priority: "Other known gap", area: "Configurable workflow designer", status: "Missing", note: "Case types and steps are code-defined." },
  { priority: "Other known gap", area: "Penetration test / control attestation", status: "Not done", note: "No independent assurance recorded." },
];

const tone: Record<Status, string> = {
  "Partial": "border-warning/40 bg-warning/10 text-warning-foreground",
  "Missing": "border-destructive/40 bg-destructive/10 text-destructive",
  "Stub": "border-warning/40 bg-warning/10 text-warning-foreground",
  "Not connected": "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Unverified": "border-muted-foreground/30 bg-muted text-muted-foreground",
  "Not done": "border-destructive/40 bg-destructive/10 text-destructive",
};

const priorities: Priority[] = ["Priority 1", "Other known gap"];

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
            Priority 1 focuses on production connectivity needed to move the demonstrable capability set towards live operation. Straight-through dealing is intentionally excluded from this priority view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {priorities.map((priority) => (
              <section key={priority} aria-labelledby={priority.replaceAll(" ", "-").toLowerCase()}>
                <h2 id={priority.replaceAll(" ", "-").toLowerCase()} className="mb-2 text-sm font-semibold text-foreground">{priority}</h2>
                <div className="divide-y">
                  {rows.filter((row) => row.priority === priority).map((r) => (
                    <div key={r.area} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_2fr] items-start gap-3 py-3">
                      <div className="text-sm font-medium">{r.area}</div>
                      <div>
                        <Badge variant="outline" className={tone[r.status]}>{r.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{r.note}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
