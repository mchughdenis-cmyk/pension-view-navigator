import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/nav/PageHeader";
import { formatGBP } from "@/lib/pensionCalculations";
import { Plus, Trash2, Download, Info, Scale, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  ProbateHolding,
  valuePortfolio,
  downloadProbateValuation,
  exportProbateCSV,
} from "@/lib/probateValuation";

const TYPE_LABEL: Record<ProbateHolding["type"], string> = {
  "quoted-share": "Quoted share / investment trust",
  "dual-priced-fund": "Dual-priced unit trust",
  "single-priced-fund": "Single-priced OEIC",
  "gilt-bond": "Gilt / listed bond",
};

const seed: ProbateHolding[] = [
  { id: "1", name: "BP plc", sedol: "0798059", type: "quoted-share", ownership: "estate", units: 4200, low: 4.12, high: 4.36, exDividend: true, dividendPerUnit: 0.068 },
  { id: "2", name: "Scottish Mortgage Inv Trust", sedol: "BLDYK61", type: "quoted-share", ownership: "estate", units: 1800, low: 9.24, high: 9.52 },
  { id: "3", name: "Treasury 4.25% 2032", type: "gilt-bond", ownership: "estate", units: 25000, low: 0.9712, high: 0.9806, accruedIncome: 318.4 },
  { id: "4", name: "Invesco Income (dual-priced)", type: "dual-priced-fund", ownership: "estate", units: 9500, bid: 2.184, offer: 2.301 },
  { id: "5", name: "Vanguard LifeStrategy 60% Acc", type: "single-priced-fund", ownership: "estate", units: 6400, nav: 2.9147, accruedIncome: 412.5 },
  { id: "6", name: "Family Discretionary Trust — Fidelity Global", type: "single-priced-fund", ownership: "trust", units: 12000, nav: 3.4021 },
  { id: "7", name: "Family Discretionary Trust — M&G Recovery", type: "dual-priced-fund", ownership: "trust", units: 8000, bid: 1.7422, offer: 1.8355 },
];

export default function ProbateValuation() {
  const [deceasedName, setDeceasedName] = useState("Mr John A Sample");
  const [dateOfDeath, setDateOfDeath] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("PV-2026-0184");
  const [holdings, setHoldings] = useState<ProbateHolding[]>(seed);

  const summary = useMemo(() => valuePortfolio(holdings), [holdings]);

  const add = () =>
    setHoldings((h) => [
      ...h,
      { id: crypto.randomUUID(), name: "New holding", type: "quoted-share", ownership: "estate", units: 0, low: 0, high: 0 },
    ]);
  const update = (id: string, patch: Partial<ProbateHolding>) =>
    setHoldings((h) => h.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) => setHoldings((h) => h.filter((x) => x.id !== id));

  const downloadCSV = () => {
    const blob = new Blob([exportProbateCSV(summary)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `probate-valuation-${dateOfDeath}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Schedule exported as CSV");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Probate valuation calculator"
        description="Date-of-death valuations on the IHT400 / IHT411 / IHT412 basis — quarter-up and mid-market compared, with the lower applied."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCSV}><FileSpreadsheet className="h-4 w-4 mr-2" />CSV schedule</Button>
            <Button onClick={() => { downloadProbateValuation({ deceasedName, dateOfDeath, reference, summary }); toast.success("Probate valuation PDF generated"); }}>
              <Download className="h-4 w-4 mr-2" />Valuation report
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Valuation details</CardTitle>
          <CardDescription>Prices must be taken as at the date of death (or the nearest trading day, applied consistently).</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div><Label>Deceased</Label><Input value={deceasedName} onChange={(e) => setDeceasedName(e.target.value)} /></div>
          <div><Label>Date of death</Label><Input type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} /></div>
          <div><Label>Case reference</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Estate holdings", value: summary.estateCapital, note: "Quarter-up / mid-market basis" },
          { label: "Trust holdings", value: summary.trustCapital, note: "Bid price · NAV basis" },
          { label: "Dividends & accrued income", value: summary.income, note: "xd entitlements added" },
          { label: "Total probate value", value: summary.grandTotal, note: "Reported on IHT400" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
              <p className="text-2xl font-semibold mt-1">{formatGBP(k.value)}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Scale className="h-4 w-4" />
        <AlertTitle>Lower-of-two basis applied</AlertTitle>
        <AlertDescription className="text-sm">
          Whole portfolio on quarter-up: <strong>{formatGBP(summary.quarterUpTotal)}</strong> · on mid-market:{" "}
          <strong>{formatGBP(summary.midMarketTotal)}</strong> · reduction from applying the lower figure per line:{" "}
          <strong>{formatGBP(summary.savingVsMid)}</strong>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="holdings">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="schedule">Valuation schedule</TabsTrigger>
          <TabsTrigger value="method">Methodology</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-3">
          {holdings.map((h) => (
            <Card key={h.id}>
              <CardContent className="pt-5 space-y-3">
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="md:col-span-2"><Label>Holding</Label><Input value={h.name} onChange={(e) => update(h.id, { name: e.target.value })} /></div>
                  <div><Label>SEDOL / ISIN</Label><Input value={h.sedol ?? ""} onChange={(e) => update(h.id, { sedol: e.target.value })} /></div>
                  <div><Label>Units / shares</Label><Input type="number" value={h.units} onChange={(e) => update(h.id, { units: Number(e.target.value) })} /></div>
                  <div>
                    <Label>Instrument type</Label>
                    <Select value={h.type} onValueChange={(v) => update(h.id, { type: v as ProbateHolding["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ownership</Label>
                    <Select value={h.ownership} onValueChange={(v) => update(h.id, { ownership: v as ProbateHolding["ownership"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="estate">Estate (personal)</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(h.type === "quoted-share" || h.type === "gilt-bond") && h.ownership === "estate" ? (
                    <>
                      <div><Label>Lowest quotation (£)</Label><Input type="number" step="0.0001" value={h.low ?? 0} onChange={(e) => update(h.id, { low: Number(e.target.value) })} /></div>
                      <div><Label>Highest quotation (£)</Label><Input type="number" step="0.0001" value={h.high ?? 0} onChange={(e) => update(h.id, { high: Number(e.target.value) })} /></div>
                    </>
                  ) : (
                    <>
                      <div><Label>Bid price (£)</Label><Input type="number" step="0.0001" value={h.bid ?? 0} onChange={(e) => update(h.id, { bid: Number(e.target.value) })} /></div>
                      <div><Label>{h.type === "single-priced-fund" ? "NAV price (£)" : "Offer price (£)"}</Label>
                        <Input type="number" step="0.0001"
                          value={(h.type === "single-priced-fund" ? h.nav : h.offer) ?? 0}
                          onChange={(e) => update(h.id, h.type === "single-priced-fund" ? { nav: Number(e.target.value) } : { offer: Number(e.target.value) })} />
                      </div>
                    </>
                  )}

                  <div><Label>Accrued income (£)</Label><Input type="number" step="0.01" value={h.accruedIncome ?? 0} onChange={(e) => update(h.id, { accruedIncome: Number(e.target.value) })} /></div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={!!h.exDividend} onCheckedChange={(v) => update(h.id, { exDividend: v })} />
                    <Label className="text-xs">Marked ex-dividend</Label>
                  </div>
                  {h.exDividend && (
                    <div><Label>Net dividend per unit (£)</Label><Input type="number" step="0.0001" value={h.dividendPerUnit ?? 0} onChange={(e) => update(h.id, { dividendPerUnit: Number(e.target.value) })} /></div>
                  )}
                </div>
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary">{summary.rows.find((r) => r.holding.id === h.id)?.basis}</Badge>
                    <span className="text-muted-foreground">{summary.rows.find((r) => r.holding.id === h.id)?.basisReason}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatGBP(summary.rows.find((r) => r.holding.id === h.id)?.total ?? 0)}</span>
                    <Button variant="ghost" size="icon" onClick={() => remove(h.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={add}><Plus className="h-4 w-4 mr-2" />Add holding</Button>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader><CardTitle className="text-base">Valuation schedule (IHT411 / IHT412 format)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Holding</th><th>Ownership</th>
                    <th className="text-right">Units</th>
                    <th className="text-right">Quarter-up</th>
                    <th className="text-right">Mid-market</th>
                    <th className="text-right">Applied</th>
                    <th>Basis</th>
                    <th className="text-right">Capital</th>
                    <th className="text-right">Income</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map((r) => (
                    <tr key={r.holding.id} className="border-b last:border-0">
                      <td className="py-2">{r.holding.name}</td>
                      <td className="capitalize">{r.holding.ownership}</td>
                      <td className="text-right">{r.holding.units.toLocaleString()}</td>
                      <td className="text-right">{r.quarterUp != null ? r.quarterUp.toFixed(4) : "—"}</td>
                      <td className="text-right">{r.midMarket != null ? r.midMarket.toFixed(4) : "—"}</td>
                      <td className="text-right font-medium">{r.appliedPrice.toFixed(4)}</td>
                      <td className="text-xs">{r.basis}</td>
                      <td className="text-right">{formatGBP(r.capital)}</td>
                      <td className="text-right">{formatGBP(r.dividendDue + r.accrued)}</td>
                      <td className="text-right font-semibold">{formatGBP(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2" colSpan={9}>Total probate value</td>
                    <td className="text-right">{formatGBP(summary.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="method">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4" />How each line is valued</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Quarter-up:</strong> lowest quotation plus one quarter of the difference between the lowest and highest quotations on the date of death.</p>
              <p>• <strong>Mid-market:</strong> the simple average of the two closing quotations.</p>
              <p>• Both are calculated for every quoted holding and the <strong>lower of the two</strong> is applied, consistent with HMRC form IHT411.</p>
              <p>• <strong>Trust holdings</strong> are valued on the <strong>bid</strong> (realisation) basis; where the fund is single-priced, the published <strong>NAV</strong> is used.</p>
              <p>• Dual-priced unit trusts use the bid price; single-priced OEICs use the NAV (IHT412).</p>
              <p>• Holdings marked <strong>ex-dividend</strong> at the date of death have the net dividend due but unpaid added as a separate estate asset; accumulation units include accrued income.</p>
              <p>• Where markets were closed on the date of death, the closing prices of the last trading day before or the first after may be used, applied consistently across the portfolio.</p>
              <p className="pt-2 text-xs">Guide only — not financial, tax or legal advice. Confirm figures with the registrar, fund manager or a probate specialist before submitting IHT400.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
