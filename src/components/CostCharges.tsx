import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/nav/PageHeader";
import { formatGBP } from "@/lib/pensionCalculations";
import { Percent, FileBarChart } from "lucide-react";

// MiFID II / COBS 6.1ZA cost & charges disclosure
export default function CostCharges() {
  const [portfolio, setPortfolio] = useState(250000);
  const [years, setYears] = useState(10);
  const [grossReturn, setGrossReturn] = useState(5);

  const platformFee = 0.30;   // %
  const advisoryFee = 0.75;   // %
  const fundOCF = 0.45;       // %
  const txCosts = 0.08;       // %

  const total = platformFee + advisoryFee + fundOCF + txCosts;

  const projection = useMemo(() => {
    const rows: { year: number; gross: number; charges: number; net: number }[] = [];
    let bal = portfolio;
    let cumCharges = 0;
    const netRate = (grossReturn - total) / 100;
    const grossRate = grossReturn / 100;
    let grossBal = portfolio;
    for (let y = 1; y <= years; y++) {
      grossBal = grossBal * (1 + grossRate);
      const yearCharges = bal * (total / 100);
      cumCharges += yearCharges;
      bal = bal * (1 + netRate);
      rows.push({ year: y, gross: grossBal, charges: cumCharges, net: bal });
    }
    return rows;
  }, [portfolio, years, grossReturn, total]);

  const final = projection[projection.length - 1];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Cost & charges disclosure"
        description="MiFID II / COBS 6.1ZA aggregated cost disclosure — ex-ante illustration showing the cumulative effect of charges on returns."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Percent className="h-4 w-4" /> Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Portfolio value</Label><Input type="number" value={portfolio} onChange={(e) => setPortfolio(Number(e.target.value))} /></div>
            <div><Label>Investment horizon (years)</Label><Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} /></div>
            <div><Label>Assumed gross return % p.a.</Label><Input type="number" step="0.1" value={grossReturn} onChange={(e) => setGrossReturn(Number(e.target.value))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aggregated charges (per annum)</CardTitle>
            <CardDescription>One-off and ongoing costs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Component</TableHead><TableHead className="text-right">% p.a.</TableHead><TableHead className="text-right">Year 1 £</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Platform / custody</TableCell><TableCell className="text-right">{platformFee.toFixed(2)}%</TableCell><TableCell className="text-right">{formatGBP(portfolio * platformFee / 100)}</TableCell></TableRow>
                <TableRow><TableCell>Adviser ongoing</TableCell><TableCell className="text-right">{advisoryFee.toFixed(2)}%</TableCell><TableCell className="text-right">{formatGBP(portfolio * advisoryFee / 100)}</TableCell></TableRow>
                <TableRow><TableCell>Fund OCF</TableCell><TableCell className="text-right">{fundOCF.toFixed(2)}%</TableCell><TableCell className="text-right">{formatGBP(portfolio * fundOCF / 100)}</TableCell></TableRow>
                <TableRow><TableCell>Transaction costs</TableCell><TableCell className="text-right">{txCosts.toFixed(2)}%</TableCell><TableCell className="text-right">{formatGBP(portfolio * txCosts / 100)}</TableCell></TableRow>
                <TableRow className="font-semibold"><TableCell>Total</TableCell><TableCell className="text-right">{total.toFixed(2)}%</TableCell><TableCell className="text-right">{formatGBP(portfolio * total / 100)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileBarChart className="h-4 w-4" /> Cumulative effect over {years} years</CardTitle>
          <CardDescription>Reduction in yield = {total.toFixed(2)}% p.a.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Value before charges</TableHead>
                <TableHead className="text-right">Cumulative charges</TableHead>
                <TableHead className="text-right">Value after charges</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projection.filter((r) => r.year === 1 || r.year === 5 || r.year === years || r.year % 5 === 0).map((r) => (
                <TableRow key={r.year}>
                  <TableCell>{r.year}</TableCell>
                  <TableCell className="text-right">{formatGBP(r.gross)}</TableCell>
                  <TableCell className="text-right text-destructive">−{formatGBP(r.charges)}</TableCell>
                  <TableCell className="text-right font-medium">{formatGBP(r.net)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {final && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="border rounded-lg p-3"><div className="text-muted-foreground text-xs">Gross at year {years}</div><div className="text-lg font-semibold">{formatGBP(final.gross)}</div></div>
              <div className="border rounded-lg p-3"><div className="text-muted-foreground text-xs">Total charges paid</div><div className="text-lg font-semibold text-destructive">{formatGBP(final.charges)}</div></div>
              <div className="border rounded-lg p-3 bg-muted/30"><div className="text-muted-foreground text-xs">Net to you</div><div className="text-lg font-bold">{formatGBP(final.net)}</div></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
