import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Timer } from "lucide-react";

type Case = {
  id: string; case_ref: string; case_type: string; title: string;
  status: string; priority: string; sla_due_at: string | null; created_at: string;
};

const CASE_TYPES = ["transfer_in","transfer_out","drawdown","ufpls","pcls","death_claim","pension_sharing","complaint","kyc_review","contribution_query","fee_query","other"];

export default function CaseWorkbench() {
  const [rows, setRows] = useState<Case[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ case_type: "transfer_in", title: "", description: "", priority: "normal", sla_days: 5 });

  const load = async () => {
    const { data } = await supabase.from("cases").select("*").order("created_at", { ascending: false }).limit(300);
    setRows((data as Case[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const ref = `C-${Date.now().toString(36).toUpperCase()}`;
    const sla = new Date(); sla.setDate(sla.getDate() + Number(form.sla_days || 5));
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("cases").insert({
      case_ref: ref, case_type: form.case_type, title: form.title, description: form.description,
      priority: form.priority, sla_due_at: sla.toISOString(),
      opened_by: u.user?.id ?? null,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Case opened", description: ref });
    setOpen(false);
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("cases").update({ status, ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}) }).eq("id", id);
    load();
  };

  const filtered = rows.filter(r => !q || r.case_ref.toLowerCase().includes(q.toLowerCase()) || r.title.toLowerCase().includes(q.toLowerCase()));
  const openCount = rows.filter(r => !["closed","cancelled"].includes(r.status)).length;
  const breaching = rows.filter(r => r.sla_due_at && new Date(r.sla_due_at) < new Date() && !["closed","cancelled"].includes(r.status)).length;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Case Workbench</h1>
          <p className="text-sm text-muted-foreground">Every admin workflow — transfers, drawdown, death claims, complaints — as a tracked case with SLA and audit trail.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Open case</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Open new case</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.case_type} onValueChange={v => setForm({ ...form, case_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CASE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["low","normal","high","urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>SLA (days)</Label><Input type="number" value={form.sla_days} onChange={e => setForm({ ...form, sla_days: Number(e.target.value) })} /></div>
              </div>
              <Button onClick={create} disabled={!form.title}>Open case</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Open cases</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{openCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">SLA breaching</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{breaching}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total this view</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><Input placeholder="Search reference or title…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" /></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Ref</TableHead><TableHead>Type</TableHead><TableHead>Title</TableHead>
              <TableHead>Priority</TableHead><TableHead>SLA</TableHead><TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(c => {
                const breach = c.sla_due_at && new Date(c.sla_due_at) < new Date() && !["closed","cancelled"].includes(c.status);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.case_ref}</TableCell>
                    <TableCell className="capitalize text-xs">{c.case_type.replace(/_/g," ")}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell><Badge variant={c.priority === "urgent" ? "destructive" : "secondary"}>{c.priority}</Badge></TableCell>
                    <TableCell className={breach ? "text-destructive" : ""}>
                      {breach && <Timer className="h-3.5 w-3.5 inline mr-1" />}
                      {c.sla_due_at ? new Date(c.sla_due_at).toLocaleDateString("en-GB") : "—"}
                    </TableCell>
                    <TableCell><Badge variant="outline">{c.status.replace(/_/g," ")}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      {c.status !== "in_progress" && c.status !== "closed" && (
                        <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "in_progress")}>Start</Button>
                      )}
                      {c.status !== "closed" && (
                        <Button size="sm" onClick={() => setStatus(c.id, "closed")}>Close</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No cases.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
