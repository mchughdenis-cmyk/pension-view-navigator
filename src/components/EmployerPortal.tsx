import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, AlertCircle, Mail } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  salary: number;
  contributionPct: number;
  employerMatchPct: number;
  claimedMatch: boolean;
}

const SEED: Employee[] = [
  { id: "1", name: "Aisha Patel", salary: 48000, contributionPct: 5, employerMatchPct: 5, claimedMatch: true },
  { id: "2", name: "Ben Carter", salary: 62000, contributionPct: 3, employerMatchPct: 5, claimedMatch: false },
  { id: "3", name: "Chloe Dunn", salary: 55000, contributionPct: 8, employerMatchPct: 5, claimedMatch: true },
  { id: "4", name: "Daniel Ellis", salary: 41000, contributionPct: 2, employerMatchPct: 5, claimedMatch: false },
  { id: "5", name: "Emma Field", salary: 73000, contributionPct: 6, employerMatchPct: 5, claimedMatch: true },
  { id: "6", name: "Farid Ghani", salary: 38000, contributionPct: 0, employerMatchPct: 5, claimedMatch: false },
  { id: "7", name: "Grace Hill", salary: 89000, contributionPct: 10, employerMatchPct: 5, claimedMatch: true },
  { id: "8", name: "Hari Iyer", salary: 52000, contributionPct: 4, employerMatchPct: 5, claimedMatch: false },
];

export default function EmployerPortal() {
  const [employees] = useState<Employee[]>(SEED);

  const stats = useMemo(() => {
    const total = employees.length;
    const claimed = employees.filter((e) => e.claimedMatch).length;
    const totalUnclaimed = employees
      .filter((e) => !e.claimedMatch)
      .reduce((s, e) => s + e.salary * (e.employerMatchPct / 100), 0);
    const totalMatch = employees.reduce((s, e) => s + e.salary * (e.employerMatchPct / 100), 0);
    return { total, claimed, totalUnclaimed, totalMatch, participationPct: (claimed / total) * 100 };
  }, [employees]);

  const underContributors = employees.filter((e) => e.contributionPct < e.employerMatchPct);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Employer Portal</h1>
          <p className="text-sm text-muted-foreground">Workforce pension oversight for HR & finance teams.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Workforce</div>
            <div className="text-3xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" /> Participation</div>
            <div className="text-3xl font-bold mt-1">{stats.participationPct.toFixed(0)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">Annual match budget</div>
            <div className="text-3xl font-bold mt-1">£{(stats.totalMatch / 1000).toFixed(1)}k</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-amber-500"><AlertCircle className="h-4 w-4" /> Unclaimed</div>
            <div className="text-3xl font-bold mt-1 text-amber-500">£{(stats.totalUnclaimed / 1000).toFixed(1)}k</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workforce — match status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr><th className="py-2">Employee</th><th>Salary</th><th>Contribution</th><th>Max match</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {employees.map((e) => {
                  const annualMatch = e.salary * (e.employerMatchPct / 100);
                  const fullyMatched = e.contributionPct >= e.employerMatchPct;
                  return (
                    <tr key={e.id} className="border-b">
                      <td className="py-3">{e.name}</td>
                      <td>£{e.salary.toLocaleString()}</td>
                      <td>{e.contributionPct}%</td>
                      <td>£{annualMatch.toLocaleString()}</td>
                      <td>
                        {!e.claimedMatch ? (
                          <Badge variant="destructive">Not enrolled</Badge>
                        ) : fullyMatched ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Maximised</Badge>
                        ) : (
                          <Badge variant="secondary">Under-contributing</Badge>
                        )}
                      </td>
                      <td>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Mail className="h-3 w-3" /> Nudge
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {underContributors.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recommended campaign</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {underContributors.length} employees are leaving employer match on the table. A targeted nudge campaign typically lifts contributions by 1.8% within 60 days.
            </p>
            <Button>Launch nudge campaign</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
