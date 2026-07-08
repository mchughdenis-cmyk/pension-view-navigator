import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Briefcase, Plus } from "lucide-react";
import { toast } from "sonner";

interface Employer { id: string; name: string; paye_reference: string | null; staging_date: string | null; employee_contribution_pct: number | null; employer_contribution_pct: number | null; salary_sacrifice: boolean; status: string; }

export default function EmployerRegister() {
  const [rows, setRows] = useState<Employer[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", paye_reference: "", staging_date: "", employee_contribution_pct: "5", employer_contribution_pct: "3", salary_sacrifice: false });

  const load = async () => {
    const { data } = await supabase.from("employers").select("*").order("name");
    setRows((data as Employer[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return toast.error("Employer name required");
    const { error } = await supabase.from("employers").insert({
      name: form.name,
      paye_reference: form.paye_reference || null,
      staging_date: form.staging_date || null,
      employee_contribution_pct: Number(form.employee_contribution_pct) || 0,
      employer_contribution_pct: Number(form.employer_contribution_pct) || 0,
      salary_sacrifice: form.salary_sacrifice,
    });
    if (error) return toast.error(error.message);
    toast.success("Employer added"); setOpen(false);
    setForm({ name: "", paye_reference: "", staging_date: "", employee_contribution_pct: "5", employer_contribution_pct: "3", salary_sacrifice: false });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary" /> Employer register</h1>
          <p className="text-sm text-muted-foreground mt-1">Participating employers with PAYE references, staging dates and contribution rates. Feeds payroll processing.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New employer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New employer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Employer name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>PAYE reference</Label><Input value={form.paye_reference} onChange={e => setForm({ ...form, paye_reference: e.target.value })} placeholder="123/AB456" /></div>
                <div><Label>Staging date</Label><Input type="date" value={form.staging_date} onChange={e => setForm({ ...form, staging_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Employee %</Label><Input type="number" step="0.1" value={form.employee_contribution_pct} onChange={e => setForm({ ...form, employee_contribution_pct: e.target.value })} /></div>
                <div><Label>Employer %</Label><Input type="number" step="0.1" value={form.employer_contribution_pct} onChange={e => setForm({ ...form, employer_contribution_pct: e.target.value })} /></div>
              </div>
              <div className="flex items-center justify-between"><Label>Salary sacrifice</Label><Switch checked={form.salary_sacrifice} onCheckedChange={v => setForm({ ...form, salary_sacrifice: v })} /></div>
            </div>
            <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader><CardTitle>Employers ({rows.length})</CardTitle><CardDescription>Book-of-business employer master data.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>PAYE ref</TableHead><TableHead>Staging</TableHead><TableHead className="text-right">EE %</TableHead><TableHead className="text-right">ER %</TableHead><TableHead>Sal-sac</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.paye_reference || "—"}</TableCell>
                  <TableCell>{r.staging_date || "—"}</TableCell>
                  <TableCell className="text-right">{r.employee_contribution_pct ?? "—"}</TableCell>
                  <TableCell className="text-right">{r.employer_contribution_pct ?? "—"}</TableCell>
                  <TableCell>{r.salary_sacrifice ? <Badge className="bg-violet-100 text-violet-700">Yes</Badge> : "—"}</TableCell>
                  <TableCell><Badge className={r.status === "active" ? "bg-emerald-100 text-emerald-700" : ""}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No employers yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
