import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Breach { id: string; identified_date: string; category: string; description: string; materiality: string; reportable_to_tpr: boolean; reported_date: string | null; status: string; }
const tone: Record<string, string> = { material: "bg-rose-100 text-rose-700", not_material: "bg-slate-100 text-slate-700", under_review: "bg-amber-100 text-amber-700" };

export default function BreachRegister() {
  const [rows, setRows] = useState<Breach[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "contributions", description: "", cause: "", effect: "", reaction: "", materiality: "under_review", reportable_to_tpr: false });

  const load = async () => {
    const { data } = await supabase.from("tpr_breaches").select("*").order("identified_date", { ascending: false });
    setRows((data as Breach[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.description.trim()) return toast.error("Description required");
    const { error } = await supabase.from("tpr_breaches").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Breach logged"); setOpen(false);
    setForm({ category: "contributions", description: "", cause: "", effect: "", reaction: "", materiality: "under_review", reportable_to_tpr: false });
    load();
  };

  const material = rows.filter(r => r.materiality === "material").length;
  const reportable = rows.filter(r => r.reportable_to_tpr && !r.reported_date).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-primary" /> Breach register (s.70)</h1>
          <p className="text-sm text-muted-foreground mt-1">Pensions Regulator breach log with cause / effect / reaction and materiality decision. Reportable breaches must be filed with TPR without delay.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Log breach</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Log a breach</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contributions">Late contributions</SelectItem>
                    <SelectItem value="data">Data / records</SelectItem>
                    <SelectItem value="scam">Scam / pension liberation</SelectItem>
                    <SelectItem value="internal_controls">Internal controls</SelectItem>
                    <SelectItem value="conflicts">Conflicts of interest</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cause</Label><Input value={form.cause} onChange={e => setForm({ ...form, cause: e.target.value })} /></div>
                <div><Label>Effect</Label><Input value={form.effect} onChange={e => setForm({ ...form, effect: e.target.value })} /></div>
              </div>
              <div><Label>Reaction</Label><Input value={form.reaction} onChange={e => setForm({ ...form, reaction: e.target.value })} /></div>
              <div><Label>Materiality</Label>
                <Select value={form.materiality} onValueChange={v => setForm({ ...form, materiality: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_review">Under review</SelectItem>
                    <SelectItem value="not_material">Not material</SelectItem>
                    <SelectItem value="material">Material — reportable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between"><Label>Reportable to TPR</Label><Switch checked={form.reportable_to_tpr} onCheckedChange={v => setForm({ ...form, reportable_to_tpr: v })} /></div>
            </div>
            <DialogFooter><Button onClick={create}>Log breach</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total on register</CardDescription><CardTitle className="text-2xl">{rows.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Material</CardDescription><CardTitle className="text-2xl text-rose-700">{material}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Reportable — not yet filed</CardDescription><CardTitle className="text-2xl text-amber-700">{reportable}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Register</CardTitle><CardDescription>Ordered by most recently identified.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Identified</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Materiality</TableHead><TableHead>Reportable</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.identified_date}</TableCell>
                  <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate">{r.description}</TableCell>
                  <TableCell><Badge className={tone[r.materiality] || ""}>{r.materiality}</Badge></TableCell>
                  <TableCell>{r.reportable_to_tpr ? (r.reported_date ? <Badge className="bg-emerald-100 text-emerald-700">Filed {r.reported_date}</Badge> : <Badge className="bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>) : "—"}</TableCell>
                  <TableCell><Badge>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No breaches on register.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
