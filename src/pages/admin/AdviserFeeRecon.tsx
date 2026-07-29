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
import { Plus, Receipt, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { downloadCSV } from "@/lib/adminExportUtils";

type Fee = {
  id: string;
  fee_type: string;
  basis: string;
  rate_or_amount: number;
  frequency: string | null;
  next_due_date: string | null;
  last_paid_date: string | null;
  status: string;
  notes: string | null;
  adviser_id: string | null;
  client_id: string | null;
};

const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const today = () => new Date().toISOString().slice(0, 10);

export default function AdviserFeeRecon() {
  const [rows, setRows] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const empty = {
    fee_type: "ongoing",
    basis: "percentage",
    rate_or_amount: "",
    frequency: "monthly",
    next_due_date: today(),
    notes: "",
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("adviser_fee_schedules")
      .select("*")
      .order("next_due_date", { ascending: true, nullsFirst: false });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data ?? []) as Fee[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const active = rows.filter(r => r.status === "active");
    const overdue = active.filter(r => r.next_due_date && r.next_due_date < today());
    const dueThisWeek = active.filter(r => {
      if (!r.next_due_date) return false;
      const diff = (new Date(r.next_due_date).getTime() - new Date(today()).getTime()) / (86400000);
      return diff >= 0 && diff <= 7;
    });
    const monthlyRun = active
      .filter(r => r.basis === "fixed" && r.frequency === "monthly")
      .reduce((s, r) => s + Number(r.rate_or_amount), 0);
    return { active: active.length, overdue: overdue.length, dueThisWeek: dueThisWeek.length, monthlyRun };
  }, [rows]);

  const create = async () => {
    const payload = {
      fee_type: form.fee_type,
      basis: form.basis,
      rate_or_amount: Number(form.rate_or_amount),
      frequency: form.frequency,
      next_due_date: form.next_due_date || null,
      notes: form.notes || null,
      status: "active",
    };
    const { error } = await supabase.from("adviser_fee_schedules").insert(payload);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Fee schedule added" });
    setOpen(false); setForm(empty); load();
  };

  const markPaid = async (id: string, next_due_date: string | null, frequency: string | null) => {
    let newDue: string | null = null;
    if (next_due_date && frequency) {
      const d = new Date(next_due_date);
      if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
      else if (frequency === "quarterly") d.setMonth(d.getMonth() + 3);
      else if (frequency === "annual") d.setFullYear(d.getFullYear() + 1);
      newDue = d.toISOString().slice(0, 10);
    }
    const { error } = await supabase.from("adviser_fee_schedules")
      .update({ last_paid_date: today(), next_due_date: newDue, status: frequency === "one_off" ? "ended" : "active" })
      .eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Marked as paid" });
    load();
  };

  const exportCsv = () => {
    downloadCSV("adviser-fees",
      ["Type", "Basis", "Rate/Amount", "Frequency", "Next due", "Last paid", "Status"],
      rows.map(r => [r.fee_type, r.basis, Number(r.rate_or_amount).toFixed(4), r.frequency ?? "", r.next_due_date ?? "", r.last_paid_date ?? "", r.status]));
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6" /> Adviser fee reconciliation</h1>
          <p className="text-sm text-muted-foreground">Track initial, ongoing and ad-hoc adviser fee schedules and mark them paid when settled.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><FileSpreadsheet className="h-4 w-4 mr-2" />Export CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add fee</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New fee schedule</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Fee type</Label>
                    <Select value={form.fee_type} onValueChange={v => setForm({ ...form, fee_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">Initial</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Basis</Label>
                    <Select value={form.basis} onValueChange={v => setForm({ ...form, basis: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{form.basis === "percentage" ? "Rate (%)" : "Amount (£)"}</Label><Input type="number" step="0.0001" value={form.rate_or_amount} onChange={e => setForm({ ...form, rate_or_amount: e.target.value })} /></div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="one_off">One-off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Next due date</Label><Input type="date" value={form.next_due_date} onChange={e => setForm({ ...form, next_due_date: e.target.value })} /></div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button onClick={create} disabled={!form.rate_or_amount}>Add schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Active schedules</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Overdue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.overdue}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Due within 7 days</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.dueThisWeek}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Monthly run rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold tabular-nums">{fmt(stats.monthlyRun)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Fee schedules</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Basis</TableHead>
                  <TableHead className="text-right">Rate/Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next due</TableHead>
                  <TableHead>Last paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => {
                  const overdue = r.next_due_date && r.next_due_date < today() && r.status === "active";
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="capitalize">{r.fee_type.replace("_", " ")}</TableCell>
                      <TableCell className="capitalize">{r.basis}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.basis === "percentage" ? `${Number(r.rate_or_amount).toFixed(2)}%` : fmt(Number(r.rate_or_amount))}
                      </TableCell>
                      <TableCell className="capitalize">{r.frequency?.replace("_", " ") || "—"}</TableCell>
                      <TableCell>
                        {r.next_due_date || "—"}
                        {overdue && <Badge variant="destructive" className="ml-2">overdue</Badge>}
                      </TableCell>
                      <TableCell>{r.last_paid_date || "—"}</TableCell>
                      <TableCell><Badge variant={r.status === "active" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        {r.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => markPaid(r.id, r.next_due_date, r.frequency)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />Mark paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No fee schedules yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
