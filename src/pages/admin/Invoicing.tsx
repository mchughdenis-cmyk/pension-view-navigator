import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Receipt, Plus } from "lucide-react";
import { toast } from "sonner";

interface Invoice { id: string; invoice_number: string; issue_date: string; due_date: string | null; subtotal: number; vat: number; total: number; status: string; exported_to: string | null; paid_date: string | null; }
const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

export default function Invoicing() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", subtotal: "" });

  const load = async () => {
    const { data } = await supabase.from("invoices").select("*").order("issue_date", { ascending: false });
    setRows((data as Invoice[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const sub = Number(form.subtotal);
    if (!sub || !form.description.trim()) return toast.error("Description and amount required");
    const vat = Math.round(sub * 0.2 * 100) / 100;
    const total = sub + vat;
    const invNum = `INV-${Date.now().toString().slice(-6)}`;
    const due = new Date(); due.setDate(due.getDate() + 30);
    const { data: inv, error } = await supabase.from("invoices").insert({
      invoice_number: invNum, subtotal: sub, vat, total, due_date: due.toISOString().slice(0, 10), status: "draft",
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("invoice_lines").insert({ invoice_id: inv!.id, description: form.description, quantity: 1, unit_amount: sub, vat_rate: 20, line_total: sub });
    toast.success(`Invoice ${invNum} created`); setOpen(false); setForm({ description: "", subtotal: "" }); load();
  };

  const markSent = async (id: string) => {
    await supabase.from("invoices").update({ status: "sent" }).eq("id", id); toast.success("Invoice marked as sent"); load();
  };
  const markPaid = async (id: string) => {
    await supabase.from("invoices").update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) }).eq("id", id); toast.success("Invoice marked as paid"); load();
  };

  const outstanding = rows.filter(r => r.status !== "paid").reduce((s, r) => s + Number(r.total), 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Receipt className="w-6 h-6 text-primary" /> Invoicing</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate scheme/adviser invoices from fee schedules. Xero and Sage export ready.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New invoice</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Line description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Q1 SIPP administration fee" /></div>
              <div><Label>Net amount (£)</Label><Input type="number" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">VAT auto-added at 20%. Due date: 30 days from today.</p>
            </div>
            <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total invoices</CardDescription><CardTitle className="text-2xl">{rows.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Outstanding</CardDescription><CardTitle className="text-2xl text-amber-700">{gbp(outstanding)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Paid (all time)</CardDescription><CardTitle className="text-2xl text-emerald-700">{gbp(rows.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.total), 0))}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoices ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Issued</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Net</TableHead><TableHead className="text-right">VAT</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.invoice_number}</TableCell>
                  <TableCell>{r.issue_date}</TableCell>
                  <TableCell>{r.due_date || "—"}</TableCell>
                  <TableCell className="text-right">{gbp(Number(r.subtotal))}</TableCell>
                  <TableCell className="text-right">{gbp(Number(r.vat))}</TableCell>
                  <TableCell className="text-right font-medium">{gbp(Number(r.total))}</TableCell>
                  <TableCell><Badge className={r.status === "paid" ? "bg-emerald-100 text-emerald-700" : r.status === "sent" ? "bg-blue-100 text-blue-700" : ""}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {r.status === "draft" && <Button size="sm" variant="outline" onClick={() => markSent(r.id)}>Mark sent</Button>}
                    {r.status === "sent" && <Button size="sm" variant="outline" onClick={() => markPaid(r.id)}>Mark paid</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No invoices yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
