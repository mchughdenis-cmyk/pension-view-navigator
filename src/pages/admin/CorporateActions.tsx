import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, CalendarDays } from "lucide-react";

type CA = {
  id: string;
  event_type: string;
  security_name: string;
  isin: string | null;
  sedol: string | null;
  announcement_date: string | null;
  ex_date: string | null;
  record_date: string | null;
  payment_date: string | null;
  ratio: string | null;
  cash_rate: number | null;
  currency: string | null;
  status: string;
  mandatory: boolean;
  notes: string | null;
};

const EVENT_TYPES = [
  "cash_dividend", "scrip_dividend", "stock_split", "reverse_split",
  "rights_issue", "bonus_issue", "tender_offer", "merger", "spinoff",
  "name_change", "delisting",
];
const STATUSES = ["announced", "election_open", "election_closed", "processed", "cancelled"];

export default function CorporateActions() {
  const [rows, setRows] = useState<CA[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState(false);
  const empty = {
    event_type: "cash_dividend",
    security_name: "",
    isin: "",
    sedol: "",
    announcement_date: new Date().toISOString().slice(0, 10),
    ex_date: "",
    record_date: "",
    payment_date: "",
    ratio: "",
    cash_rate: "",
    status: "announced",
    mandatory: true,
    notes: "",
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("corporate_actions")
      .select("*")
      .order("ex_date", { ascending: true, nullsFirst: false })
      .limit(500);
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data as CA[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    rows.filter(r =>
      (status === "all" || r.status === status) &&
      (type === "all" || r.event_type === type),
    ), [rows, status, type]);

  const upcoming = rows.filter(r => r.ex_date && r.ex_date >= new Date().toISOString().slice(0, 10)).length;
  const elections = rows.filter(r => r.status === "election_open").length;
  const dueToday = rows.filter(r => r.payment_date === new Date().toISOString().slice(0, 10)).length;

  const create = async () => {
    const payload = {
      ...form,
      cash_rate: form.cash_rate ? Number(form.cash_rate) : null,
      ex_date: form.ex_date || null,
      record_date: form.record_date || null,
      payment_date: form.payment_date || null,
    };
    const { error } = await supabase.from("corporate_actions").insert(payload);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Corporate action added" });
    setOpen(false); setForm(empty); load();
  };

  const setRowStatus = async (id: string, s: string) => {
    const { error } = await supabase.from("corporate_actions").update({ status: s }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="h-6 w-6" /> Corporate actions calendar</h1>
          <p className="text-sm text-muted-foreground">Dividends, splits, rights and tenders across the book — with election tracking.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add event</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New corporate action</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Event type</Label>
                  <Select value={form.event_type} onValueChange={v => setForm({ ...form, event_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Security name</Label>
                <Input value={form.security_name} onChange={e => setForm({ ...form, security_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ISIN</Label><Input value={form.isin} onChange={e => setForm({ ...form, isin: e.target.value })} /></div>
                <div><Label>SEDOL</Label><Input value={form.sedol} onChange={e => setForm({ ...form, sedol: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ex date</Label><Input type="date" value={form.ex_date} onChange={e => setForm({ ...form, ex_date: e.target.value })} /></div>
                <div><Label>Record date</Label><Input type="date" value={form.record_date} onChange={e => setForm({ ...form, record_date: e.target.value })} /></div>
                <div><Label>Payment date</Label><Input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} /></div>
                <div><Label>Announcement</Label><Input type="date" value={form.announcement_date} onChange={e => setForm({ ...form, announcement_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ratio (e.g. 1:5)</Label><Input value={form.ratio} onChange={e => setForm({ ...form, ratio: e.target.value })} /></div>
                <div><Label>Cash rate (£/share)</Label><Input type="number" step="0.0001" value={form.cash_rate} onChange={e => setForm({ ...form, cash_rate: e.target.value })} /></div>
              </div>
              <Button onClick={create} disabled={!form.security_name}>Add corporate action</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Upcoming ex-dates</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{upcoming}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Elections open</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{elections}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Paying today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{dueToday}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total events</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <CardTitle>Events</CardTitle>
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Security</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Ex date</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Pay date</TableHead>
                  <TableHead className="text-right">Rate / Ratio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.security_name}</div>
                      <div className="text-xs text-muted-foreground">{r.isin || r.sedol}</div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {r.event_type.replace(/_/g, " ")}
                      {!r.mandatory && <Badge variant="outline" className="ml-2">voluntary</Badge>}
                    </TableCell>
                    <TableCell>{r.ex_date || "—"}</TableCell>
                    <TableCell>{r.record_date || "—"}</TableCell>
                    <TableCell>{r.payment_date || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.cash_rate ? `£${Number(r.cash_rate).toFixed(4)}` : r.ratio || "—"}
                    </TableCell>
                    <TableCell><Badge>{r.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Select value={r.status} onValueChange={v => setRowStatus(r.id, v)}>
                        <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No corporate actions match the filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
