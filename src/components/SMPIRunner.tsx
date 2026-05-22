import { useMemo, useState } from "react";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FUND_UNIVERSE } from "@/data/fundUniverse";
import { runSmpi, SMPI_INFLATION, SMPI_REGULAR_REVIEW, type SmpiResult } from "@/lib/smpi";
import { formatGBP } from "@/lib/pensionCalculations";
import { toast } from "sonner";
import { FileText, Play, Calculator, ShieldCheck } from "lucide-react";

const SAMPLE_MEMBERS = [
  { ref: "M-1001", name: "Alex Carter", age: 42, retAge: 67, pot: 84000, contrib: 6000, fund: "GB00B3ZHN960" },
  { ref: "M-1002", name: "Priya Shah", age: 55, retAge: 65, pot: 248000, contrib: 12000, fund: "GB00B4PQW151" },
  { ref: "M-1003", name: "Daniel O'Connor", age: 31, retAge: 68, pot: 22000, contrib: 4200, fund: "IE00B4L5Y983" },
  { ref: "M-1004", name: "Yuki Tanaka", age: 49, retAge: 65, pot: 165000, contrib: 9000, fund: "GB00B41XG308" },
];

export default function SMPIRunner() {
  const [member, setMember] = useState(SAMPLE_MEMBERS[0]);
  const [results, setResults] = useState<SmpiResult[]>([]);
  const [running, setRunning] = useState(false);

  const single = useMemo(() => runSmpi({
    memberRef: member.ref, memberName: member.name, age: member.age,
    retirementAge: member.retAge, potValue: member.pot,
    annualContribution: member.contrib, fundIsin: member.fund,
  }), [member]);

  function runBatch() {
    setRunning(true);
    const batch = SAMPLE_MEMBERS.map((m) => runSmpi({
      memberRef: m.ref, memberName: m.name, age: m.age, retirementAge: m.retAge,
      potValue: m.pot, annualContribution: m.contrib, fundIsin: m.fund,
    }));
    setResults(batch);
    setRunning(false);
    toast.success(`Generated ${batch.length} SMPIs under ${SMPI_REGULAR_REVIEW}`);
  }

  function exportCsv() {
    const rows = [
      ["Member", "Name", "Age", "Retirement age", "Pot", "Annual contrib", "Fund", "Growth rate", "Nominal at ret.", "Real at ret.", "Real annual income"],
      ...results.map((r) => [
        r.input.memberRef, r.input.memberName, r.input.age, r.input.retirementAge,
        r.input.potValue, r.input.annualContribution, r.fundName,
        (r.growthRate * 100).toFixed(2) + "%", r.nominalFundAtRetirement,
        r.realFundAtRetirement, r.realAnnualIncome,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `smpi-batch-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="SMPI runner"
        description="Statutory Money Purchase Illustrations — issued annually under FRC AS TM1 v5.0"
        actions={
          <>
            <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> {SMPI_REGULAR_REVIEW}</Badge>
            <Button size="sm" onClick={runBatch} disabled={running}>
              <Play className="h-4 w-4 mr-2" /> {running ? "Running…" : "Run batch (sample members)"}
            </Button>
          </>
        }
      />

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single member</TabsTrigger>
          <TabsTrigger value="batch">Batch results</TabsTrigger>
          <TabsTrigger value="funds">Fund growth rates</TabsTrigger>
          <TabsTrigger value="rules">TM1 v5.0 rules</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Member ref</Label><Input value={member.ref} onChange={(e) => setMember({ ...member, ref: e.target.value })} /></div>
                  <div><Label>Name</Label><Input value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} /></div>
                  <div><Label>Current age</Label><Input type="number" value={member.age} onChange={(e) => setMember({ ...member, age: Number(e.target.value) })} /></div>
                  <div><Label>Retirement age</Label><Input type="number" value={member.retAge} onChange={(e) => setMember({ ...member, retAge: Number(e.target.value) })} /></div>
                  <div><Label>Pot value (£)</Label><Input type="number" value={member.pot} onChange={(e) => setMember({ ...member, pot: Number(e.target.value) })} /></div>
                  <div><Label>Annual contribution (£)</Label><Input type="number" value={member.contrib} onChange={(e) => setMember({ ...member, contrib: Number(e.target.value) })} /></div>
                </div>
                <div>
                  <Label>Fund</Label>
                  <Select value={member.fund} onValueChange={(v) => setMember({ ...member, fund: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {FUND_UNIVERSE.map((f) => (
                        <SelectItem key={f.isin} value={f.isin}>
                          {f.name} — {(f.standardGrowthRate * 100).toFixed(1)}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Illustration</CardTitle>
                <CardDescription>{single.fundName} · growth {(single.growthRate * 100).toFixed(2)}% · inflation {(SMPI_INFLATION * 100).toFixed(1)}%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row label="Years to retirement" value={`${single.yearsToRetirement}`} />
                <Row label="Projected fund (nominal)" value={formatGBP(single.nominalFundAtRetirement)} />
                <Row label="Projected fund (today's money)" value={formatGBP(single.realFundAtRetirement)} emphasised />
                <Row label="Indicative annual income (today's money)" value={formatGBP(single.realAnnualIncome)} emphasised />
                <p className="text-xs text-muted-foreground pt-2">
                  Annuity basis: single life, level, no guarantee. Figures are statutory illustrations only and not a guarantee of benefits.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Batch run output</CardTitle>
                <CardDescription>Last run: {results.length} members</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportCsv} disabled={!results.length}>
                <FileText className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {!results.length ? (
                <p className="text-sm text-muted-foreground">Run the batch to generate SMPIs for sample members.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Member", "Name", "Age → Ret.", "Fund", "Growth", "Real fund @ ret.", "Real income p.a."].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.input.memberRef} className="border-t">
                          <td className="px-3 py-2 font-mono">{r.input.memberRef}</td>
                          <td className="px-3 py-2">{r.input.memberName}</td>
                          <td className="px-3 py-2">{r.input.age} → {r.input.retirementAge}</td>
                          <td className="px-3 py-2">{r.fundName}</td>
                          <td className="px-3 py-2">{(r.growthRate * 100).toFixed(2)}%</td>
                          <td className="px-3 py-2">{formatGBP(r.realFundAtRetirement)}</td>
                          <td className="px-3 py-2">{formatGBP(r.realAnnualIncome)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funds">
          <Card>
            <CardHeader>
              <CardTitle>Standard growth rates by fund</CardTitle>
              <CardDescription>TM1 v5.0 banded nominal accumulation rate per fund — used as the default for projections and SMPIs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>{["ISIN", "Fund", "Asset class", "Risk", "OCF", "Standard growth"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {FUND_UNIVERSE.map((f) => (
                      <tr key={f.isin} className="border-t">
                        <td className="px-3 py-2 font-mono">{f.isin}</td>
                        <td className="px-3 py-2">{f.name}</td>
                        <td className="px-3 py-2">{f.assetClass}</td>
                        <td className="px-3 py-2">{f.risk}</td>
                        <td className="px-3 py-2">{f.ocf.toFixed(2)}%</td>
                        <td className="px-3 py-2 font-medium">{(f.standardGrowthRate * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>FRC AS TM1 v5.0 — applied assumptions</CardTitle>
              <CardDescription>Mandatory for SMPIs issued on or after 1 October 2023.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Single accumulation rate per fund, banded by 5-year volatility of the underlying asset class.</li>
                <li>Inflation assumption: 2.5% per annum (figures shown in today's money).</li>
                <li>Annuitised on a single-life, level, no-guarantee basis at the member's selected retirement age.</li>
                <li>Default state pension age used where the member has not specified a retirement age.</li>
                <li>All figures are statutory illustrations and do not constitute a guarantee of benefits.</li>
                <li>SMPIs must be issued to every active money purchase member at least annually.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value, emphasised }: { label: string; value: string; emphasised?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasised ? "text-lg font-semibold" : "text-sm font-medium"}>{value}</span>
    </div>
  );
}
