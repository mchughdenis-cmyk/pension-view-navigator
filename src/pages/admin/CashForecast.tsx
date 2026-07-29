import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Wallet, FileSpreadsheet } from "lucide-react";
import { downloadCSV } from "@/lib/adminExportUtils";

type Entry = {
  id: string;
  forecast_date: string;
  direction: "inflow" | "outflow";
  category: string;
  amount: number;
  currency: string;
  reference: string | null;
  confidence: string;
  notes: string | null;
};

const CATEGORIES = [
  "Employer contributions", "Member contributions", "Transfer in", "RAS reclaim",
  "Investment sale", "Other inflow",
  "Pension payments", "PCLS lump sum", "Transfer out", "Adviser fees",
  "Investment purchase", "Bank charges", "Other outflow",
];

const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

export default function CashForecast() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number>(250000);
  const empty = {
    forecast_date: today(),
    direction: "inflow" as "inflow" | "outflow",
    category: "Employer contributions",
    amount: "",
    reference: "",
    confidence: "expected",
    notes: "",
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cash_forecast_entries")
      .select("*")
      .gte("forecast_date", today())
      .lte("forecast_date", addDays(today(), 14))
      .order("forecast_date", { ascending: true });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data ?? []) as Entry[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const buckets = useMemo(() => {
    const days = Array.from({ length: 5 }, (_, i) => addDays(today(), i + 1));
    let running = openingBalance;
    return days.map((d) => {
      const inflow = rows.filter(r => r.forecast_date === d && r.direction === "inflow").reduce((s, r) => s + Number(r.amount), 0);
      const outflow = rows.filter(r => r.forecast_date === d && r.direction === "outflow").reduce((s, r) => s + Number(r.amount), 0);
      const net = inflow - outflow;
      running += net;
      return { date: d, inflow, outflow, net, closing: running };
    });
  }, [rows, openingBalance]);

  const create = async () => {
    const payload = {
      forecast_date: form.forecast_date,
      direction: form.direction,
      category: form.category,
      amount: Number(form.amount),
      reference: form.reference || null,
      confidence: form.confidence,
      notes: form.notes || null,
    };
    const { error } = await supabase.from("cash_forecast_entries").insert(payload);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Forecast entry added" });
    setOpen(false); setForm(empty); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("cash_forecast_entries").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    load();
  };

  const exportCsv = () => {
    downloadCSV("cash-forecast",
      ["Date", "Direction", "Category", "Amount", "Reference", "Confidence"],
      rows.map(r => [r.forecast_date, r.direction, r.category, Number(r.amount).toFixed(2), r.reference ?? "", r.confidence]));
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6" /> Cash forecast (T+1 to T+5)</h1>
          <p className="text-sm text-muted-foreground">Projected inflows, outflows and closing cash across the coming week.</p>
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <Label className="text-xs">Opening balance</Label>
            <Input type="number" value={openingBalance} onChange={e => setOpeningBalance(Number(e.target.value) || 0)} className="w-40" />
          </div>
          <Button variant="outline" onClick={exportCsv}><FileSpreadsheet className="h-4 w-4 mr-2" />Export CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add entry</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New forecast entry</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={form.forecast_date} onChange={e => setForm({ ...form, forecast_date: e.target.value })} /></div>
                  <div>
                    <Label>Direction</Label>
                    <Select value={form.direction} onValueChange={v => setForm({ ...form, direction: v as "inflow" | "outflow" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inflow">Inflow</SelectItem>
                        <SelectItem value="outflow">Outflow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount (£)</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                  <div>
                    <Label>Confidence</Label>
                    <Select value={form.confidence} onValueChange={v => setForm({ ...form, confidence: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="expected">Expected</SelectItem>
                        <SelectItem value="tentative">Tentative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Reference</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
                <Button onClick={create} disabled={!form.amount}>Add entry</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {buckets.map(b => (
          <Card key={b.date}>
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">{new Date(b.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xs text-green-600">+ {fmt(b.inflow)}</div>
              <div className="text-xs text-red-600">− {fmt(b.outflow)}</div>
              <div className={`text-lg font-bold tabular-nums ${b.closing < 0 ? "text-red-600" : ""}`}>{fmt(b.closing)}</div>
              <div className="text-[10px] text-muted-foreground uppercase">closing</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Forecast entries (next 14 days)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.forecast_date}</TableCell>
                    <TableCell>
                      <Badge variant={r.direction === "inflow" ? "default" : "secondary"}>{r.direction}</Badge>
                    </TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reference || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{r.confidence}</Badge></TableCell>
                    <TableCell className={`text-right tabular-nums ${r.direction === "inflow" ? "text-green-600" : "text-red-600"}`}>
                      {r.direction === "inflow" ? "+" : "−"} {fmt(Number(r.amount))}
                    </TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Remove</Button></TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No forecast entries.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
