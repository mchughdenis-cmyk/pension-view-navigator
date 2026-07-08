import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowRightLeft, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CETV { id: string; request_date: string; quote_date: string | null; guarantee_end_date: string | null; transfer_value: number | null; safeguarded_benefits: boolean; advice_required: boolean; status: string; requested_by: string | null; }
const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

export default function CETVQuotes() {
  const [rows, setRows] = useState<CETV[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ transfer_value: "", requested_by: "", safeguarded_benefits: false });

  const load = async () => {
    const { data } = await supabase.from("cetv_quotes").select("*").order("request_date", { ascending: false });
    setRows((data as CETV[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const tv = Number(form.transfer_value);
    if (!tv) return toast.error("Transfer value required");
    const guarantee = new Date(); guarantee.setMonth(guarantee.getMonth() + 3);
    const adviceReq = tv > 30000 && form.safeguarded_benefits;
    const { error } = await supabase.from("cetv_quotes").insert({
      transfer_value: tv, requested_by: form.requested_by || null,
      safeguarded_benefits: form.safeguarded_benefits, advice_required: adviceReq,
      quote_date: new Date().toISOString().slice(0, 10),
      guarantee_end_date: guarantee.toISOString().slice(0, 10),
      status: "quoted",
    });
    if (error) return toast.error(error.message);
    toast.success("CETV quoted — 3-month guarantee applied");
    setOpen(false); setForm({ transfer_value: "", requested_by: "", safeguarded_benefits: false }); load();
  };

  const expiringSoon = rows.filter(r => r.guarantee_end_date && daysUntil(r.guarantee_end_date) <= 14 && daysUntil(r.guarantee_end_date) >= 0).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ArrowRightLeft className="w-6 h-6 text-primary" /> CETV quotations</h1>
          <p className="text-sm text-muted-foreground mt-1">Cash Equivalent Transfer Values — 3-month statutory guarantee. Safeguarded benefits &gt; £30k trigger advice requirement.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New CETV</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New CETV quote</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Requested by (member)</Label><Input value={form.requested_by} onChange={e => setForm({ ...form, requested_by: e.target.value })} /></div>
              <div><Label>Transfer value (£)</Label><Input type="number" value={form.transfer_value} onChange={e => setForm({ ...form, transfer_value: e.target.value })} /></div>
              <div className="flex items-center justify-between"><Label>Safeguarded benefits (DB / GAR)</Label><Switch checked={form.safeguarded_benefits} onCheckedChange={v => setForm({ ...form, safeguarded_benefits: v })} /></div>
              {form.safeguarded_benefits && Number(form.transfer_value) > 30000 && (
                <Alert variant="destructive"><AlertTriangle className="w-4 h-4" /><AlertTitle>Advice required</AlertTitle><AlertDescription>Transfer &gt; £30k with safeguarded benefits — regulated advice must be evidenced before payment.</AlertDescription></Alert>
              )}
            </div>
            <DialogFooter><Button onClick={create}>Quote CETV</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {expiringSoon > 0 && (
        <Alert><AlertTriangle className="w-4 h-4" /><AlertTitle>{expiringSoon} guarantee(s) expiring within 14 days</AlertTitle><AlertDescription>Re-quote or complete the transfer before the guarantee lapses.</AlertDescription></Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Quotes ({rows.length})</CardTitle><CardDescription>Guarantee period runs 3 months from quote date.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Requested</TableHead><TableHead>Member</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Guarantee ends</TableHead><TableHead>Safeguarded</TableHead><TableHead>Advice</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => {
                const d = r.guarantee_end_date ? daysUntil(r.guarantee_end_date) : null;
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.request_date}</TableCell>
                    <TableCell>{r.requested_by || "—"}</TableCell>
                    <TableCell className="text-right">{r.transfer_value ? gbp(r.transfer_value) : "—"}</TableCell>
                    <TableCell>{r.guarantee_end_date || "—"} {d !== null && d >= 0 && d <= 14 && <Badge className="ml-2 bg-amber-100 text-amber-700">{d}d</Badge>}{d !== null && d < 0 && <Badge className="ml-2 bg-rose-100 text-rose-700">expired</Badge>}</TableCell>
                    <TableCell>{r.safeguarded_benefits ? "Yes" : "No"}</TableCell>
                    <TableCell>{r.advice_required ? <Badge className="bg-rose-100 text-rose-700">Required</Badge> : "—"}</TableCell>
                    <TableCell><Badge>{r.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No CETV quotes yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
