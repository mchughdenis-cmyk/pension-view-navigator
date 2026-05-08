import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";
import { AsyncState, useAsync } from "@/components/ui/async-state";

export default function ReportingSuite() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Reporting suite"
        description="Annual tax packs and HMRC / FCA regulatory return generators."
      />
      <Tabs defaultValue="taxpack">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="taxpack">Annual Tax Pack</TabsTrigger>
          <TabsTrigger value="hmrc">HMRC returns</TabsTrigger>
          <TabsTrigger value="fca">FCA returns</TabsTrigger>
          <TabsTrigger value="cgt">CGT 30-day</TabsTrigger>
        </TabsList>
        <TabsContent value="taxpack"><AnnualTaxPack /></TabsContent>
        <TabsContent value="hmrc"><HMRCReturns /></TabsContent>
        <TabsContent value="fca"><FCAReturns /></TabsContent>
        <TabsContent value="cgt"><CGT30Day /></TabsContent>
      </Tabs>
    </div>
  );
}

function AnnualTaxPack() {
  const [clients, setClients] = useState<any[]>([]); const [clientId, setClientId] = useState<string>("");
  const [taxYear, setTaxYear] = useState("2024/25"); const [generating, setGenerating] = useState(false);

  useEffect(() => { supabase.from("clients").select("id, first_name, last_name").order("last_name").then(({ data }) => { setClients(data ?? []); if (data?.[0]) setClientId(data[0].id); }); }, []);

  const generate = async () => {
    if (!clientId) return;
    setGenerating(true);
    const client = clients.find((c) => c.id === clientId);
    const [contrib, cgt, fees] = await Promise.all([
      supabase.from("contributions").select("*").eq("client_id", clientId).eq("tax_year", taxYear),
      supabase.from("cgt_disposals").select("*").eq("client_id", clientId).eq("tax_year", taxYear),
      supabase.from("fee_charges").select("*").eq("client_id", clientId),
    ]);
    const totalContrib = (contrib.data ?? []).reduce((s, r) => s + Number(r.gross_amount || 0), 0);
    const totalRelief = (contrib.data ?? []).reduce((s, r) => s + Number(r.tax_relief || 0), 0);
    const totalGain = (cgt.data ?? []).reduce((s, r) => s + Number(r.gain_loss || 0), 0);
    const totalFees = (fees.data ?? []).reduce((s, r) => s + Number(r.total || 0), 0);

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`Annual Tax Pack ${taxYear}`)] }),
          new Paragraph({ children: [new TextRun(`Client: ${client.first_name} ${client.last_name}`)] }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Pension contributions")] }),
          new Paragraph(`Total gross contributions: £${totalContrib.toLocaleString()}`),
          new Paragraph(`Tax relief claimed at source: £${totalRelief.toLocaleString()}`),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Capital Gains")] }),
          new Paragraph(`Net gain/(loss): £${totalGain.toLocaleString()} (annual exempt amount: £3,000)`),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fees & charges")] }),
          new Paragraph(`Total fees: £${totalFees.toLocaleString()}`),
          new Paragraph({ children: [new TextRun({ text: "Pension Navigator by Airgead — generated " + new Date().toLocaleDateString("en-GB"), italics: true })] }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `tax-pack-${client.last_name}-${taxYear.replace("/", "-")}.docx`);
    await supabase.from("activity_log").insert({
      action: "report_generated", entity_type: "client", entity_id: clientId,
      description: `Annual Tax Pack ${taxYear} for ${client.first_name} ${client.last_name}`,
      new_values: { report: "annual_tax_pack", tax_year: taxYear, totals: { contributions: totalContrib, relief: totalRelief, gain: totalGain, fees: totalFees } },
    } as any);
    setGenerating(false); toast.success("Tax pack generated");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Annual tax pack</CardTitle><CardDescription>Per-client PDF/Word: contributions, growth, withdrawals, CGT, fees.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-3 items-end">
        <div><Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Tax year</Label>
          <Select value={taxYear} onValueChange={setTaxYear}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["2024/25", "2023/24", "2022/23"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={generate} disabled={generating}><Download className="h-4 w-4 mr-2" />{generating ? "Generating…" : "Generate .docx"}</Button>
      </CardContent>
    </Card>
  );
}

function HMRCReturns() {
  const returns = [
    { name: "Pension Scheme Return (PSR)", freq: "Annual", due: "31 Jan", status: "draft" },
    { name: "Event Report", freq: "Annual", due: "31 Jan", status: "ready" },
    { name: "Accounting for Tax (AFT)", freq: "Quarterly", due: "45 days post-quarter", status: "submitted" },
    { name: "ISA Annual Return", freq: "Annual", due: "5 June", status: "draft" },
    { name: "RTI / FPS", freq: "Per-payment", due: "On or before payment", status: "automated" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>HMRC returns</CardTitle><CardDescription>Draft and submission tracking.</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Return</TableHead><TableHead>Frequency</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{returns.map((r) => (
            <TableRow key={r.name}><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.freq}</TableCell><TableCell>{r.due}</TableCell>
              <TableCell><Badge variant={r.status === "submitted" ? "default" : r.status === "ready" ? "secondary" : "outline"}>{r.status}</Badge></TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => toast.success(`${r.name} draft generated`)}>Generate draft</Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FCAReturns() {
  const returns = [
    { name: "RMAR (Retail Mediation)", freq: "6-monthly", code: "RMA-A through K" },
    { name: "CMAR (Client Money & Assets)", freq: "Monthly", code: "CMAR" },
    { name: "RegData submission", freq: "Per requirement", code: "Various" },
    { name: "Consumer Duty Board Report", freq: "Annual", code: "Internal" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>FCA / RegData returns</CardTitle><CardDescription>Preview and export drafts.</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Return</TableHead><TableHead>Frequency</TableHead><TableHead>Code</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{returns.map((r) => (
            <TableRow key={r.name}><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.freq}</TableCell><TableCell className="font-mono text-xs">{r.code}</TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => toast.success(`${r.name} draft built`)}>Build draft</Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CGT30Day() {
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await supabase.from("cgt_disposals").select("*").order("disposal_date", { ascending: false }).limit(20);
    if (error) throw error;
    return data ?? [];
  }, []);
  const disposals = data ?? [];

  return (
    <Card>
      <CardHeader><CardTitle>CGT 30-day reporter</CardTitle><CardDescription>In-year disposals requiring 60-day reporting (UK property) or annual self-assessment.</CardDescription></CardHeader>
      <CardContent>
        <AsyncState
          loading={loading} error={error} onRetry={reload} isEmpty={disposals.length === 0}
          loadingLabel="Loading disposals…"
          emptyTitle="No disposals in window"
          emptyDescription="Capital disposals will appear here once recorded."
        >
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Symbol</TableHead><TableHead>Proceeds</TableHead><TableHead>Cost</TableHead><TableHead>Gain/Loss</TableHead><TableHead>Rule</TableHead></TableRow></TableHeader>
            <TableBody>{disposals.map((d: any) => (
              <TableRow key={d.id}><TableCell>{d.disposal_date}</TableCell><TableCell className="font-mono">{d.symbol}</TableCell>
                <TableCell>£{Number(d.proceeds).toLocaleString()}</TableCell><TableCell>£{Number(d.cost_basis).toLocaleString()}</TableCell>
                <TableCell className={Number(d.gain_loss) >= 0 ? "text-green-600" : "text-destructive"}>£{Number(d.gain_loss || 0).toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline">{d.matching_rule}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </AsyncState>
      </CardContent>
    </Card>
  );
}
