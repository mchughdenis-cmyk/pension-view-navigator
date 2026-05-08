import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClients } from "@/hooks/useClientData";
import { supabase } from "@/integrations/supabase/client";
import { formatGBP } from "@/lib/pensionCalculations";
import { ArrowDownToLine, ArrowUpFromLine, Download, Search } from "lucide-react";

type Direction = "all" | "in" | "out";

const MONEY_IN = ["contribution", "transfer_in", "interest", "dividend"];
const MONEY_OUT = ["pcls", "ufpls_taxable", "drawdown", "tax_withheld", "bank_transfer", "fee", "transfer_out"];

const TAX_YEARS = ["all", "2024/25", "2023/24", "2022/23"];

export default function TransactionHistory() {
  const { clients } = useClients();
  const [clientId, setClientId] = useState<string | undefined>();
  useEffect(() => { if (!clientId && clients.length) setClientId(clients[0].id); }, [clients, clientId]);

  const [rows, setRows] = useState<any[]>([]);
  const [contribs, setContribs] = useState<any[]>([]);
  const [taxYear, setTaxYear] = useState("2024/25");
  const [direction, setDirection] = useState<Direction>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const ukYearRange = (year: string) => {
    if (year === "all") return null;
    const [a] = year.split("/");
    const start = `${a}-04-06`;
    const end = `${Number(a) + 1}-04-05`;
    return { start, end };
  };

  const load = async () => {
    if (!clientId) return;
    setLoading(true);
    let q = supabase.from("transactions").select("*").eq("client_id", clientId).order("effective_date", { ascending: false });
    const range = ukYearRange(taxYear);
    if (range) q = q.gte("effective_date", range.start).lte("effective_date", range.end);
    const { data: tx } = await q.limit(500);

    let cq = supabase.from("contributions").select("*").eq("client_id", clientId).order("effective_date", { ascending: false });
    if (taxYear !== "all") cq = cq.eq("tax_year", taxYear);
    const { data: con } = await cq.limit(500);

    setRows(tx || []);
    setContribs(con || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [clientId, taxYear]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const isIn = MONEY_IN.includes(r.transaction_type) || Number(r.amount) > 0;
      const isOut = MONEY_OUT.includes(r.transaction_type) || Number(r.amount) < 0;
      if (direction === "in" && !isIn) return false;
      if (direction === "out" && !isOut) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!String(r.description || "").toLowerCase().includes(s) && !String(r.reference || "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rows, direction, search]);

  const totals = useMemo(() => {
    const moneyIn = filtered.filter(r => MONEY_IN.includes(r.transaction_type) || Number(r.amount) > 0).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const moneyOut = filtered.filter(r => Number(r.amount) < 0 && r.transaction_type !== "tax_withheld").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const taxRelief = contribs.reduce((s, r) => s + Number(r.tax_relief || 0), 0);
    const paye = filtered.filter(r => r.transaction_type === "tax_withheld").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    return { moneyIn, moneyOut, taxRelief, paye };
  }, [filtered, contribs]);

  const exportCSV = () => {
    const header = ["Date", "Type", "Direction", "Description", "Reference", "Amount (£)", "Tax relief / PAYE (£)", "Tax year", "Status"].join(",");
    const lines = filtered.map(r => {
      const dir = MONEY_IN.includes(r.transaction_type) || Number(r.amount) > 0 ? "IN" : "OUT";
      return [
        r.effective_date, r.transaction_type, dir,
        `"${(r.description || "").replace(/"/g, "'")}"`,
        r.reference || "", Number(r.amount).toFixed(2),
        Number(r.tax_relief_amount || 0).toFixed(2),
        r.tax_year || taxYear, r.status,
      ].join(",");
    });
    const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `transactions-${taxYear.replace("/", "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const dirBadge = (r: any) => {
    const isIn = MONEY_IN.includes(r.transaction_type) || Number(r.amount) > 0;
    return isIn
      ? <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/20"><ArrowDownToLine className="w-3 h-3 mr-1" />IN</Badge>
      : <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20"><ArrowUpFromLine className="w-3 h-3 mr-1" />OUT</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">Money in & money out, with tax relief and PAYE charges.</p>
          </div>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>

        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {clients.length > 1 && (
              <div>
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>UK tax year</Label>
              <Select value={taxYear} onValueChange={setTaxYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TAX_YEARS.map(y => <SelectItem key={y} value={y}>{y === "all" ? "All years" : y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Direction</Label>
              <Select value={direction} onValueChange={(v: Direction) => setDirection(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in">Money in</SelectItem>
                  <SelectItem value="out">Money out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="description or reference" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Money in</p><p className="text-2xl font-bold text-green-600">{formatGBP(totals.moneyIn)}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Money out</p><p className="text-2xl font-bold text-destructive">{formatGBP(totals.moneyOut)}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Tax relief received</p><p className="text-2xl font-bold text-green-600">+{formatGBP(totals.taxRelief)}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">PAYE withheld</p><p className="text-2xl font-bold text-amber-600">−{formatGBP(totals.paye)}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All transactions</TabsTrigger>
            <TabsTrigger value="contributions">Contributions & relief</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader><CardTitle>{filtered.length} transactions {taxYear !== "all" && `· ${taxYear}`}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Tax relief / PAYE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>}
                    {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No transactions in this period.</TableCell></TableRow>}
                    {filtered.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.effective_date}</TableCell>
                        <TableCell>{dirBadge(r)}</TableCell>
                        <TableCell className="capitalize text-sm">{String(r.transaction_type).replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-sm">{r.description}</TableCell>
                        <TableCell className="font-mono text-xs">{r.reference}</TableCell>
                        <TableCell className={`text-right font-semibold ${Number(r.amount) >= 0 ? "text-green-600" : "text-destructive"}`}>{Number(r.amount) >= 0 ? "+" : "−"}{formatGBP(Math.abs(Number(r.amount)))}</TableCell>
                        <TableCell className="text-right text-sm">{Number(r.tax_relief_amount) ? formatGBP(Number(r.tax_relief_amount)) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions">
            <Card>
              <CardHeader><CardTitle>Contributions & tax relief {taxYear !== "all" && `· ${taxYear}`}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Net paid</TableHead>
                      <TableHead className="text-right">Tax relief</TableHead>
                      <TableHead className="text-right">Gross to pot</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contribs.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No contributions in this period.</TableCell></TableRow>}
                    {contribs.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.effective_date}</TableCell>
                        <TableCell className="capitalize text-sm">{c.contribution_type}</TableCell>
                        <TableCell className="text-sm uppercase">{c.relief_method}</TableCell>
                        <TableCell className="text-right">{formatGBP(Number(c.net_amount))}</TableCell>
                        <TableCell className="text-right text-green-600">+{formatGBP(Number(c.tax_relief))}</TableCell>
                        <TableCell className="text-right font-semibold">{formatGBP(Number(c.gross_amount))}</TableCell>
                        <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
