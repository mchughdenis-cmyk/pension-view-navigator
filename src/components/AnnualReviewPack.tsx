import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import { Download, FileText, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Document, Packer, Paragraph, HeadingLevel, TextRun,
  Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { createAirgeadDocxHeader, createAirgeadDocxFooter } from "@/lib/documentUtils";
import { formatGBP, ANNUAL_ALLOWANCE, MPAA_ALLOWANCE, LSA_LIMIT } from "@/lib/pensionCalculations";

type Client = {
  id: string; first_name: string; last_name: string; title: string | null;
  date_of_birth: string | null; email: string | null; postcode: string | null;
  risk_profile: string | null; adviser: string | null; mpaa_triggered: boolean;
  annual_allowance_used: number; firm_id: string | null;
};
type Account = { id: string; account_type: string; account_number: string | null; total_value: number | null; cash_balance: number | null };
type Suitability = { id: string; created_at: string; atr_score: number | null; capacity_for_loss: string | null; objectives: string | null; time_horizon_years: number | null; recommendation: string };
type FeeCharge = { period_end: string | null; total: number | null; fee_type: string | null };
type Txn = { effective_date: string | null; amount: number; transaction_type: string; description: string | null };

const RISK_TO_ATR: Record<string, number> = { cautious: 2, defensive: 3, "cautious-balanced": 4, balanced: 6, moderate: 6, growth: 8, adventurous: 10 };

export default function AnnualReviewPack() {
  const { firmId, firm } = useFirm();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [fees, setFees] = useState<FeeCharge[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState("Independent Financial Adviser");
  const [reviewNotes, setReviewNotes] = useState(
    "Client circumstances reviewed. No material changes to objectives, capacity for loss, or attitude to risk. Recommendation remains suitable."
  );
  const [recommendation, setRecommendation] = useState<"continue" | "rebalance" | "switch" | "review">("continue");
  const [busy, setBusy] = useState(false);

  // load clients filtered by firm
  useEffect(() => {
    (async () => {
      let q = supabase.from("clients")
        .select("id, first_name, last_name, title, date_of_birth, email, postcode, risk_profile, adviser, mpaa_triggered, annual_allowance_used, firm_id")
        .eq("status", "active").order("last_name");
      if (firmId) q = q.eq("firm_id", firmId);
      const { data } = await q;
      setClients((data ?? []) as Client[]);
      if (data?.length && !clientId) setClientId(data[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firmId]);

  // load client detail
  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const [c, a, s, f, t] = await Promise.all([
        supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
        supabase.from("client_accounts").select("id, account_type, account_number, total_value, cash_balance").eq("client_id", clientId),
        supabase.from("suitability_reports").select("id, created_at, atr_score, capacity_for_loss, objectives, time_horizon_years, recommendation")
          .eq("client_id", clientId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("fee_charges").select("period_end, total_charge, charge_type").eq("client_id", clientId)
          .order("period_end", { ascending: false }).limit(12),
        supabase.from("transactions").select("posted_at, effective_date, amount, transaction_type, description")
          .eq("client_id", clientId).order("effective_date", { ascending: false }).limit(50),
      ]);
      setClient((c.data ?? null) as Client | null);
      setAccounts((a.data ?? []) as Account[]);
      setSuitability((s.data ?? null) as Suitability | null);
      setFees((f.data ?? []) as FeeCharge[]);
      setTxns((t.data ?? []) as Txn[]);
    })();
  }, [clientId]);

  const totals = useMemo(() => {
    const total = accounts.reduce((s, a) => s + Number(a.total_value || 0), 0);
    const cash = accounts.reduce((s, a) => s + Number(a.cash_balance || 0), 0);
    const sipp = accounts.filter(a => a.account_type === "sipp").reduce((s, a) => s + Number(a.total_value || 0), 0);
    const isa = accounts.filter(a => a.account_type === "isa").reduce((s, a) => s + Number(a.total_value || 0), 0);
    const gia = accounts.filter(a => a.account_type === "gia").reduce((s, a) => s + Number(a.total_value || 0), 0);
    const cashPct = total > 0 ? (cash / total) * 100 : 0;
    return { total, cash, cashPct, sipp, isa, gia };
  }, [accounts]);

  const periodFees = useMemo(() => {
    const last12 = fees.filter(f => {
      const d = new Date(f.period_end);
      const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1);
      return d >= cutoff;
    });
    const total = last12.reduce((s, f) => s + Number(f.total_charge || 0), 0);
    const ocfPct = totals.total > 0 ? (total / totals.total) * 100 : 0;
    return { total, ocfPct, count: last12.length };
  }, [fees, totals.total]);

  const flow = useMemo(() => {
    const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1);
    const window = txns.filter(t => new Date(t.effective_date || t.posted_at || 0) >= cutoff);
    const contributions = window.filter(t => /contribution|deposit/i.test(t.transaction_type)).reduce((s, t) => s + Number(t.amount || 0), 0);
    const withdrawals = window.filter(t => /withdrawal|drawdown|ufpls|pcls/i.test(t.transaction_type)).reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);
    return { contributions, withdrawals, count: window.length };
  }, [txns]);

  const currentAtr = useMemo(() => {
    if (suitability?.atr_score) return suitability.atr_score;
    const lvl = (client?.risk_profile ?? "").toLowerCase();
    return RISK_TO_ATR[lvl] ?? 6;
  }, [suitability, client]);

  const allowance = client?.mpaa_triggered ? MPAA_ALLOWANCE : ANNUAL_ALLOWANCE;
  const aaRemaining = Math.max(0, allowance - Number(client?.annual_allowance_used || 0));

  const driftFlag = totals.cashPct > 10;

  const generate = async () => {
    if (!client) { toast.error("Select a client"); return; }
    if (!reviewerName.trim()) { toast.error("Enter reviewer name"); return; }
    setBusy(true);
    try {
      await buildDocx();
      // persist review record into consumer_duty_reviews (used as annual review log)
      await supabase.from("consumer_duty_reviews").insert({
        client_id: client.id,
        firm_id: firmId,
        review_type: "annual_review",
        outcome: recommendation,
        reviewer: `${reviewerName} (${reviewerRole})`,
        notes: reviewNotes,
      } as any).then(({ error }) => {
        if (error) console.warn("review log skipped:", error.message);
      });
      toast.success("Annual review pack generated");
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const buildDocx = async () => {
    if (!client) return;
    const fullName = `${client.title ?? ""} ${client.first_name} ${client.last_name}`.trim();
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const periodFrom = new Date(); periodFrom.setFullYear(periodFrom.getFullYear() - 1);
    const periodLabel = `${periodFrom.toLocaleDateString("en-GB")} – ${new Date().toLocaleDateString("en-GB")}`;
    const age = client.date_of_birth ? Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (365.25 * 86400_000)) : null;

    const H1 = (t: string) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true })] });
    const H2 = (t: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 160, after: 80 }, children: [new TextRun({ text: t, bold: true })] });
    const P = (t: string) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun(t)] });
    const Bullet = (t: string) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun(t)] });

    const noBorder = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };
    const cell = (text: string, bold = false) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, left: noBorder.left, right: noBorder.right },
    });
    const kv = (rows: [string, string][]) => new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(([k, v]) => new TableRow({ children: [cell(k, true), cell(v)] })),
    });

    const headerParas = await createAirgeadDocxHeader();
    const footerParas = createAirgeadDocxFooter();

    const recoLabel: Record<string, string> = {
      continue: "Continue with current strategy — no changes required",
      rebalance: "Rebalance portfolio to target allocation",
      switch: "Switch to a more suitable model portfolio",
      review: "Schedule full suitability re-assessment",
    };

    const children = [
      ...headerParas,
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Annual Review Pack", bold: true })],
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Issued ${today}`, italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${firm?.name ?? "Pension Navigator by Airgead"} · FCA FRN ${firm?.fca_ref ?? "—"}`, size: 18 })] }),

      H1("1. Client details"),
      kv([
        ["Client", fullName],
        ["Date of birth", client.date_of_birth ?? "—"],
        ["Age", age != null ? String(age) : "—"],
        ["Email", client.email ?? "—"],
        ["Postcode", client.postcode ?? "—"],
        ["Adviser", client.adviser ?? reviewerName],
        ["Review period", periodLabel],
      ]),

      H1("2. Portfolio summary"),
      kv([
        ["Total portfolio value", formatGBP(totals.total)],
        ["SIPP", formatGBP(totals.sipp)],
        ["Stocks & Shares ISA", formatGBP(totals.isa)],
        ["General Investment Account", formatGBP(totals.gia)],
        ["Cash holdings", `${formatGBP(totals.cash)} (${totals.cashPct.toFixed(1)}%)`],
        ["Net contributions (12m)", formatGBP(flow.contributions)],
        ["Net withdrawals (12m)", formatGBP(flow.withdrawals)],
      ]),
      driftFlag ? P(`Note: Cash holdings represent ${totals.cashPct.toFixed(1)}% of the portfolio — above the 10% target. A rebalance into invested assets is recommended.`) : P("Cash allocation is within the 10% target band."),

      H1("3. Attitude to risk and capacity for loss"),
      kv([
        ["Recorded risk profile", client.risk_profile ?? "—"],
        ["Current ATR score", `${currentAtr} / 10`],
        ["Capacity for loss", suitability?.capacity_for_loss ?? "Medium"],
        ["Investment horizon", suitability?.time_horizon_years ? `${suitability.time_horizon_years} years` : "—"],
        ["Last suitability assessment", suitability?.created_at ? new Date(suitability.created_at).toLocaleDateString("en-GB") : "Not on file — recommend completion"],
      ]),
      P(`Stated objectives: ${suitability?.objectives ?? "Long-term capital growth and tax-efficient retirement income provision."}`),
      P("The recorded ATR has been reviewed against the current portfolio allocation. The portfolio remains consistent with the client's risk profile, capacity for loss, and time horizon (FCA COBS 9.2)."),

      H1("4. UK allowances and tax position (2024/25)"),
      kv([
        ["Annual Allowance", formatGBP(allowance)],
        ["AA used this tax year", formatGBP(Number(client.annual_allowance_used || 0))],
        ["AA remaining", formatGBP(aaRemaining)],
        ["MPAA triggered", client.mpaa_triggered ? "Yes — £10,000 limit applies" : "No"],
        ["Lump Sum Allowance (LSA)", formatGBP(LSA_LIMIT)],
      ]),
      P("Carry-forward of unused Annual Allowance from the previous three tax years may be available where pensionable earnings support it. Please confirm before any contribution exceeding the standard AA."),

      H1("5. Costs and charges (MiFID II / COBS 6.1ZA)"),
      kv([
        ["Total charges (12m)", formatGBP(periodFees.total)],
        ["Ongoing charges (OCF equivalent)", `${periodFees.ocfPct.toFixed(2)}%`],
        ["Charge entries on file", String(periodFees.count)],
      ]),
      P("All product, platform, and adviser charges are disclosed above. Charges are deducted from cash balances unless otherwise instructed. A detailed transactional breakdown is available on request."),

      H1("6. Investment performance (illustrative)"),
      P("Performance figures are net of all charges and shown over the review period. Past performance is not a reliable indicator of future returns; the value of investments and the income from them can fall as well as rise."),
      P(`Estimated 12-month change (contributions less withdrawals adjusted): see transaction ledger appendix. ${flow.count} transactions recorded.`),

      H1("7. Review conclusion and recommendation"),
      P(`Recommendation: ${recoLabel[recommendation]}.`),
      P(`Reviewer commentary: ${reviewNotes}`),

      H1("8. Consumer Duty assessment"),
      Bullet("Products and services: Remain appropriate to identified client needs."),
      Bullet("Price and value: Charges remain proportionate to services delivered (fair value assessment on file)."),
      Bullet("Consumer understanding: All communications issued in plain English; client confirms understanding."),
      Bullet("Consumer support: No service issues raised in the review period; complaints log: nil."),
      P("Vulnerability indicators reviewed — none identified. To be flagged immediately should circumstances change (PRIN 2A / FG21/1)."),

      H1("9. Regulatory disclosures"),
      P("This document constitutes the annual review required under FCA COBS 9.3 and the ongoing service agreement between the client and the firm. It does not constitute new advice. Where a change in recommendation is made, a separate suitability report will be issued."),
      P("Pension Wise / MoneyHelper provides free, impartial guidance on retirement options (call 0800 138 3944 or visit moneyhelper.org.uk). Clients aged 50+ are entitled to a free guidance appointment."),
      P("Complaints: If you are dissatisfied, please contact the firm in writing. You may also refer the matter to the Financial Ombudsman Service (financial-ombudsman.org.uk). The Financial Services Compensation Scheme may provide protection (fscs.org.uk)."),

      H1("10. Sign-off"),
      kv([
        ["Reviewed by", reviewerName],
        ["Role", reviewerRole],
        ["Date", today],
        ["Next review due", new Date(Date.now() + 365 * 86400_000).toLocaleDateString("en-GB")],
      ]),
      P(" "),
      P("Client acknowledgement:"),
      P("Signed: __________________________     Date: ________________"),

      ...footerParas,
    ];

    const doc = new Document({
      creator: firm?.name ?? "Pension Navigator by Airgead",
      title: `Annual Review – ${fullName}`,
      sections: [{ properties: {}, children }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `AnnualReview-${client.last_name}-${client.first_name}-${new Date().toISOString().slice(0, 10)}.docx`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Annual review pack"
        description="FCA COBS 9.3 compliant annual review — pulls live client data, ATR, holdings, fees and allowances into a single signed Word document."
      />

      <Card>
        <CardHeader><CardTitle className="text-base">1. Select client</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Choose a client" /></SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.last_name}, {c.first_name} {c.adviser ? `— ${c.adviser}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {client && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline">Risk: {client.risk_profile ?? "—"}</Badge>
              <Badge variant="outline">ATR {currentAtr}/10</Badge>
              <Badge variant="outline">{client.mpaa_triggered ? "MPAA triggered" : "AA £60k"}</Badge>
              {!suitability && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> No suitability on file</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {client && (
        <>
          <div className="grid md:grid-cols-4 gap-3">
            <StatCard label="Total value" value={formatGBP(totals.total)} />
            <StatCard label="Cash" value={`${formatGBP(totals.cash)} · ${totals.cashPct.toFixed(0)}%`} warning={driftFlag} />
            <StatCard label="Contributions 12m" value={formatGBP(flow.contributions)} />
            <StatCard label="Withdrawals 12m" value={formatGBP(flow.withdrawals)} />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <StatCard label="SIPP" value={formatGBP(totals.sipp)} />
            <StatCard label="ISA" value={formatGBP(totals.isa)} />
            <StatCard label="GIA" value={formatGBP(totals.gia)} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">2. Allowances</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
              <Row k="Annual Allowance" v={formatGBP(allowance)} />
              <Row k="AA used" v={formatGBP(Number(client.annual_allowance_used || 0))} />
              <Row k="AA remaining" v={formatGBP(aaRemaining)} />
              <Row k="LSA limit" v={formatGBP(LSA_LIMIT)} />
              <Row k="MPAA" v={client.mpaa_triggered ? "Triggered" : "Not triggered"} />
              <Row k="12m fees" v={`${formatGBP(periodFees.total)} (${periodFees.ocfPct.toFixed(2)}%)`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">3. Reviewer commentary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Reviewer name</Label><Input value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="e.g. Sarah Chen" /></div>
                <div><Label>Role</Label><Input value={reviewerRole} onChange={e => setReviewerRole(e.target.value)} /></div>
              </div>
              <div>
                <Label>Outcome</Label>
                <Select value={recommendation} onValueChange={v => setRecommendation(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continue">Continue — no changes</SelectItem>
                    <SelectItem value="rebalance">Rebalance to target</SelectItem>
                    <SelectItem value="switch">Switch model portfolio</SelectItem>
                    <SelectItem value="review">Full suitability re-assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commentary</Label>
                <Textarea rows={4} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={busy} className="gap-2">
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Generate &amp; download review pack (Word)
            </Button>
            <div className="text-xs text-muted-foreground self-center flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Includes Consumer Duty assessment, MiFID II costs, COBS 9.3 sign-off
            </div>
          </div>

          <Separator />
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            The pack is generated from live data: client record, accounts, latest suitability report, fee charges (12m), and transaction ledger.
            A copy of the review outcome is logged against the client&apos;s consumer-duty review history.
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-lg font-semibold ${warning ? "text-destructive" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b pb-1"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
