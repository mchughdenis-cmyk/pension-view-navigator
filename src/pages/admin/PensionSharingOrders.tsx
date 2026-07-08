import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowRightLeft, Plus, Scale, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; first_name: string; last_name: string; }
interface PSO {
  id: string;
  member_client_id: string;
  ex_partner_name: string;
  ex_partner_dob: string | null;
  court_order_date: string;
  percentage: number;
  transfer_value: number;
  status: string;
  implementation_date: string | null;
  notes: string | null;
  created_at: string;
}

const statusTone: Record<string, string> = {
  received: "bg-amber-100 text-amber-700",
  valuing: "bg-blue-100 text-blue-700",
  implementing: "bg-indigo-100 text-indigo-700",
  implemented: "bg-emerald-100 text-emerald-700",
  discharged: "bg-slate-100 text-slate-700",
};

const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n || 0);

// 4-month statutory implementation period from receipt of order
const deadlineFrom = (dateStr: string) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 4);
  return d.toISOString().slice(0, 10);
};

const daysBetween = (a: string, b: string) => Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

export default function PensionSharingOrders() {
  const [clients, setClients] = useState<Client[]>([]);
  const [rows, setRows] = useState<PSO[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    member_client_id: "",
    ex_partner_name: "",
    ex_partner_dob: "",
    court_order_date: new Date().toISOString().slice(0, 10),
    percentage: 50,
    transfer_value: 0,
    notes: "",
  });

  const load = async () => {
    const { data } = await supabase.from("pension_sharing_orders").select("*").order("court_order_date", { ascending: false });
    setRows((data as PSO[]) || []);
  };
  useEffect(() => {
    supabase.from("clients").select("id, first_name, last_name").order("last_name").then(({ data }) => setClients((data as Client[]) || []));
    load();
  }, []);

  const clientName = (id: string) => {
    const c = clients.find(x => x.id === id);
    return c ? `${c.first_name} ${c.last_name}` : "—";
  };

  const create = async () => {
    if (!form.member_client_id || !form.ex_partner_name) return toast.error("Member and ex-partner required");
    const { error } = await supabase.from("pension_sharing_orders").insert({
      member_client_id: form.member_client_id,
      ex_partner_name: form.ex_partner_name,
      ex_partner_dob: form.ex_partner_dob || null,
      court_order_date: form.court_order_date,
      percentage: form.percentage,
      transfer_value: form.transfer_value,
      status: "received",
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Pension sharing order recorded");
    setOpen(false);
    setForm({ member_client_id: "", ex_partner_name: "", ex_partner_dob: "", court_order_date: new Date().toISOString().slice(0, 10), percentage: 50, transfer_value: 0, notes: "" });
    load();
  };

  const advance = async (r: PSO, next: string) => {
    const patch: Partial<PSO> = { status: next };
    if (next === "implemented") patch.implementation_date = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("pension_sharing_orders").update(patch).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`Order → ${next}`);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const overdue = rows.filter(r => r.status !== "implemented" && r.status !== "discharged" && daysBetween(today, deadlineFrom(r.court_order_date)) > 0).length;
  const inFlight = rows.filter(r => r.status !== "implemented" && r.status !== "discharged").length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Scale className="w-6 h-6 text-primary" /> Pension sharing orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Court-ordered PSOs under WRPA 1999 s.28. Statutory implementation period is 4 months from receipt of the order and matrimonial documents.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New order</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record pension sharing order</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Member (transferor)</Label>
                <Select value={form.member_client_id} onValueChange={v => setForm({ ...form, member_client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ex-partner (transferee)</Label><Input value={form.ex_partner_name} onChange={e => setForm({ ...form, ex_partner_name: e.target.value })} /></div>
                <div><Label>Ex-partner DOB</Label><Input type="date" value={form.ex_partner_dob} onChange={e => setForm({ ...form, ex_partner_dob: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Order date</Label><Input type="date" value={form.court_order_date} onChange={e => setForm({ ...form, court_order_date: e.target.value })} /></div>
                <div><Label>Percentage %</Label><Input type="number" value={form.percentage} onChange={e => setForm({ ...form, percentage: Number(e.target.value) })} /></div>
                <div><Label>Cash equivalent (£)</Label><Input type="number" value={form.transfer_value} onChange={e => setForm({ ...form, transfer_value: Number(e.target.value) })} /></div>
              </div>
              <div className="text-xs text-muted-foreground rounded border p-2 bg-muted/40">
                Statutory deadline: <b>{deadlineFrom(form.court_order_date)}</b>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={create}>Record order</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>In flight</CardDescription><CardTitle className="text-2xl">{inFlight}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Past 4-month deadline</CardDescription><CardTitle className="text-2xl text-rose-700">{overdue}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total value ordered</CardDescription><CardTitle className="text-2xl">{fmt(rows.reduce((s, r) => s + Number(r.transfer_value), 0))}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order register</CardTitle><CardDescription>Progress each order through valuation and implementation.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Ordered</TableHead><TableHead>Member</TableHead><TableHead>Ex-partner</TableHead><TableHead>%</TableHead><TableHead>Value</TableHead><TableHead>Deadline</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(r => {
                const dl = deadlineFrom(r.court_order_date);
                const late = r.status !== "implemented" && r.status !== "discharged" && daysBetween(today, dl) > 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.court_order_date}</TableCell>
                    <TableCell>{clientName(r.member_client_id)}</TableCell>
                    <TableCell>{r.ex_partner_name}</TableCell>
                    <TableCell>{r.percentage}%</TableCell>
                    <TableCell>{fmt(r.transfer_value)}</TableCell>
                    <TableCell className={late ? "text-rose-700 font-medium" : ""}>{late && <AlertTriangle className="w-3 h-3 inline mr-1" />}{dl}</TableCell>
                    <TableCell><Badge className={statusTone[r.status] || ""}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {r.status === "received" && <Button size="sm" variant="outline" onClick={() => advance(r, "valuing")}>Value</Button>}
                      {r.status === "valuing" && <Button size="sm" variant="outline" onClick={() => advance(r, "implementing")}>Implement</Button>}
                      {r.status === "implementing" && <Button size="sm" variant="outline" onClick={() => advance(r, "implemented")}>Mark done</Button>}
                      {r.status === "implemented" && <Button size="sm" variant="outline" onClick={() => advance(r, "discharged")}>Discharge</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No pension sharing orders on register.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
