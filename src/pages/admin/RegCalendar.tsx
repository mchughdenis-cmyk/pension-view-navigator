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
import { Plus, CalendarClock, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { downloadCSV } from "@/lib/adminExportUtils";

type Item = {
  id: string;
  regulator: string;
  return_name: string;
  period_start: string | null;
  period_end: string | null;
  due_date: string;
  submitted_date: string | null;
  status: string;
  reference: string | null;
  notes: string | null;
};

const REGULATORS = ["TPR", "HMRC", "FCA", "ICO", "Other"];
const STATUSES = ["due", "in_progress", "submitted", "late", "waived"];
const today = () => new Date().toISOString().slice(0, 10);

export default function RegCalendar() {
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [regFilter, setRegFilter] = useState("all");
  const empty = {
    regulator: "TPR",
    return_name: "",
    period_end: "",
    due_date: today(),
    reference: "",
    notes: "",
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reg_reporting_calendar")
      .select("*")
      .order("due_date", { ascending: true });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    // Auto-flag late items
    const now = today();
    (data ?? []).forEach(async (r: Item) => {
      if (r.status === "due" && r.due_date < now) {
        await supabase.from("reg_reporting_calendar").update({ status: "late" }).eq("id", r.id);
      }
    });
    setRows((data ?? []) as Item[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter(r => regFilter === "all" || r.regulator === regFilter), [rows, regFilter]);

  const stats = useMemo(() => {
    const now = today();
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    const in30s = in30.toISOString().slice(0, 10);
    return {
      overdue: rows.filter(r => (r.status === "late") || (r.status === "due" && r.due_date < now)).length,
      dueSoon: rows.filter(r => (r.status === "due" || r.status === "in_progress") && r.due_date >= now && r.due_date <= in30s).length,
      submitted: rows.filter(r => r.status === "submitted").length,
      inProgress: rows.filter(r => r.status === "in_progress").length,
    };
  }, [rows]);

  const create = async () => {
    const { error } = await supabase.from("reg_reporting_calendar").insert({
      regulator: form.regulator,
      return_name: form.return_name,
      period_end: form.period_end || null,
      due_date: form.due_date,
      reference: form.reference || null,
      notes: form.notes || null,
      status: "due",
    });
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Return added" });
    setOpen(false); setForm(empty); load();
  };

  const setStatus = async (id: string, s: string) => {
    const payload: Record<string, unknown> = { status: s };
    if (s === "submitted") payload.submitted_date = today();
    const { error } = await supabase.from("reg_reporting_calendar").update(payload).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    load();
  };

  const exportCsv = () => {
    downloadCSV("reg-calendar",
      ["Regulator", "Return", "Period end", "Due date", "Submitted", "Status", "Reference"],
      filtered.map(r => [r.regulator, r.return_name, r.period_end ?? "", r.due_date, r.submitted_date ?? "", r.status, r.reference ?? ""]));
  };

  const statusColour = (s: string) => s === "late" ? "destructive" : s === "submitted" ? "default" : s === "in_progress" ? "secondary" : "outline";

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarClock className="h-6 w-6" /> Regulatory reporting calendar</h1>
          <p className="text-sm text-muted-foreground">Track TPR, HMRC, FCA and ICO returns with due dates and submission status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><FileSpreadsheet className="h-4 w-4 mr-2" />Export CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add return</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New regulatory return</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>Regulator</Label>
                  <Select value={form.regulator} onValueChange={v => setForm({ ...form, regulator: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{REGULATORS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Return name</Label><Input value={form.return_name} onChange={e => setForm({ ...form, return_name: e.target.value })} placeholder="Scheme return / RMAR / AFT..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Period end</Label><Input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} /></div>
                  <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
                </div>
                <div><Label>Reference</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
                <Button onClick={create} disabled={!form.return_name}>Add return</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Overdue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.overdue}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Due within 30 days</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.dueSoon}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">In progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.inProgress}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Submitted</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.submitted}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex-1"><CardTitle>Returns</CardTitle></div>
          <Select value={regFilter} onValueChange={setRegFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regulators</SelectItem>
              {REGULATORS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regulator</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Period end</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline">{r.regulator}</Badge></TableCell>
                    <TableCell className="font-medium">{r.return_name}</TableCell>
                    <TableCell>{r.period_end || "—"}</TableCell>
                    <TableCell>{r.due_date}</TableCell>
                    <TableCell>{r.submitted_date || "—"}</TableCell>
                    <TableCell><Badge variant={statusColour(r.status) as "default" | "secondary" | "destructive" | "outline"}>{r.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Select value={r.status} onValueChange={v => setStatus(r.id, v)}>
                        <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No returns match.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
