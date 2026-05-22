import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { Download, FileText, MapPin } from "lucide-react";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { createAirgeadDocxHeader, createAirgeadDocxFooter } from "@/lib/documentUtils";
import { formatGBP } from "@/lib/pensionCalculations";
import { toast } from "sonner";

type Client = { id: string; first_name: string; last_name: string; date_of_birth: string | null; firm_id: string | null };
type Account = { account_type: string; total_value: number | null };

export default function PensionPassport() {
  const { firmId, firm } = useFirm();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      let q = supabase.from("clients").select("id, first_name, last_name, date_of_birth, firm_id").eq("status", "active").order("last_name");
      if (firmId) q = q.eq("firm_id", firmId);
      const { data } = await q;
      setClients((data as Client[]) ?? []);
    })();
  }, [firmId]);

  useEffect(() => {
    (async () => {
      if (!clientId) { setClient(null); setAccounts([]); return; }
      const [c, a] = await Promise.all([
        supabase.from("clients").select("id, first_name, last_name, date_of_birth, firm_id").eq("id", clientId).maybeSingle(),
        supabase.from("client_accounts").select("account_type, total_value").eq("client_id", clientId),
      ]);
      setClient((c.data as Client) ?? null);
      setAccounts((a.data as Account[]) ?? []);
    })();
  }, [clientId]);

  const totals = useMemo(() => {
    const sum = (t: string) => accounts.filter((a) => a.account_type?.toLowerCase() === t).reduce((s, a) => s + Number(a.total_value || 0), 0);
    const total = accounts.reduce((s, a) => s + Number(a.total_value || 0), 0);
    return { sipp: sum("sipp"), isa: sum("isa"), gia: sum("gia"), total };
  }, [accounts]);

  const age = useMemo(() => {
    if (!client?.date_of_birth) return null;
    const dob = new Date(client.date_of_birth);
    const ms = Date.now() - dob.getTime();
    return Math.floor(ms / (365.25 * 86400_000));
  }, [client]);

  const projectedIncome = totals.total * 0.04; // 4% sustainable withdrawal
  const targetIncome = 31300; // PLSA moderate

  const generate = async () => {
    if (!client) { toast.error("Select a client"); return; }
    setBusy(true);
    try {
      const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
      const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

      const row = (l: string, v: string) => new TableRow({
        children: [
          new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [new Paragraph({ children: [new TextRun({ text: l, bold: true })] })] }),
          new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [new Paragraph({ children: [new TextRun(v)] })] }),
        ],
      });

      const headerParas = await createAirgeadDocxHeader();
      const footerParas = createAirgeadDocxFooter();

      const doc = new Document({
        styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
        sections: [{
          properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
          children: [
            ...headerParas,
            new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Pension Passport", bold: true, size: 36 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
              children: [new TextRun({ text: `${client.first_name} ${client.last_name}  ·  Issued ${new Date().toLocaleDateString("en-GB")} · ${firm?.name ?? "Pension Navigator by Airgead"}`, color: "555555" })] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "1. My pensions", bold: true })] }),
            new Table({
              width: { size: 9000, type: WidthType.DXA }, columnWidths: [4500, 4500],
              rows: [
                row("SIPP value", formatGBP(totals.sipp)),
                row("ISA value", formatGBP(totals.isa)),
                row("GIA value", formatGBP(totals.gia)),
                row("Total wealth", formatGBP(totals.total)),
              ],
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text: "2. State Pension", bold: true })] }),
            new Table({
              width: { size: 9000, type: WidthType.DXA }, columnWidths: [4500, 4500],
              rows: [
                row("Full State Pension (2024/25)", "£221.20/week (£11,502/year)"),
                row("NI qualifying years needed", "35"),
                row("State Pension age", age && age >= 50 ? "67" : "68 (subject to review)"),
              ],
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text: "3. Retirement income outlook", bold: true })] }),
            new Table({
              width: { size: 9000, type: WidthType.DXA }, columnWidths: [4500, 4500],
              rows: [
                row("Projected pot at retirement", formatGBP(totals.total * 1.4)),
                row("Sustainable income (4% rule)", `${formatGBP(projectedIncome)}/year`),
                row("With full State Pension", `${formatGBP(projectedIncome + 11502)}/year`),
                row("vs PLSA moderate target", projectedIncome + 11502 >= targetIncome ? `On track (+${formatGBP(projectedIncome + 11502 - targetIncome)})` : `Gap of ${formatGBP(targetIncome - projectedIncome - 11502)}`),
              ],
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text: "4. Top 3 actions", bold: true })] }),
            ...["Claim your full employer match — typically worth £200–£500/month in 'free money'.",
                "Use unused Annual Allowance via carry-forward (up to 3 prior tax years).",
                "Update your nomination of beneficiary if circumstances have changed."]
              .map((t, i) => new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${t}` })], spacing: { after: 80 } })),

            new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text: "5. Key dates", bold: true })] }),
            new Table({
              width: { size: 9000, type: WidthType.DXA }, columnWidths: [4500, 4500],
              rows: [
                row("Tax year ends", "5 April"),
                row("ISA allowance resets", "6 April — £20,000"),
                row("Annual Allowance resets", "6 April — £60,000"),
                row("NMPA rises to 57", "6 April 2028"),
              ],
            }),

            new Paragraph({ spacing: { before: 400 }, children: [new TextRun({
              text: "This Pension Passport is illustrative guidance only and does not constitute regulated financial advice. Projections use assumed growth; actual returns will vary. Tax treatment depends on individual circumstances and may change.",
              italics: true, color: "777777", size: 18,
            })] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Pension-Passport-${client.last_name}-${new Date().toISOString().slice(0, 10)}.docx`);

      await supabase.from("activity_log").insert({
        action: "passport_generated",
        description: "Pension Passport generated",
        entity_type: "passport", entity_id: client.id,
        new_values: { client_name: `${client.first_name} ${client.last_name}`, total_wealth: totals.total } as any,
      });
      toast.success("Passport generated", { description: "Downloaded as .docx" });
    } catch (e: any) {
      toast.error("Generation failed", { description: e?.message ?? "Try again." });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Pension Passport"
        description="One-page portable summary of a client's pension position — total wealth, projected income, top actions and key dates. Branded Airgead/firm output."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-5 w-5" /> Generate passport</CardTitle>
          <CardDescription>Select a client and download a branded .docx passport in one click.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Choose a client…" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {client && (
            <div className="rounded-md border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{client.first_name} {client.last_name}</p>
                {age && <Badge variant="secondary">Age {age}</Badge>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">SIPP</p><p className="font-medium">{formatGBP(totals.sipp)}</p></div>
                <div><p className="text-xs text-muted-foreground">ISA</p><p className="font-medium">{formatGBP(totals.isa)}</p></div>
                <div><p className="text-xs text-muted-foreground">GIA</p><p className="font-medium">{formatGBP(totals.gia)}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium text-primary">{formatGBP(totals.total)}</p></div>
              </div>
            </div>
          )}

          <Button onClick={generate} disabled={!client || busy} className="w-full">
            <Download className="h-4 w-4" /> {busy ? "Generating…" : "Generate Pension Passport (.docx)"}
          </Button>
          <p className="text-xs text-muted-foreground">
            <FileText className="h-3 w-3 inline mr-1" />
            Cached in your activity log. Tracking values can be refreshed at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
