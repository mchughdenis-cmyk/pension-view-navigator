import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Scheme { id: string; name: string; scheme_type: string; pstr: string | null; psr_number: string | null; status: string; established_date: string | null; }

export default function SchemeRegister() {
  const [rows, setRows] = useState<Scheme[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", scheme_type: "SIPP", pstr: "", psr_number: "", established_date: "" });

  const load = async () => {
    const { data } = await supabase.from("schemes").select("*").order("name");
    setRows((data as Scheme[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return toast.error("Scheme name required");
    const { error } = await supabase.from("schemes").insert({ ...form, established_date: form.established_date || null, pstr: form.pstr || null, psr_number: form.psr_number || null });
    if (error) return toast.error(error.message);
    toast.success("Scheme added"); setOpen(false); setForm({ name: "", scheme_type: "SIPP", pstr: "", psr_number: "", established_date: "" }); load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Scheme register</h1>
          <p className="text-sm text-muted-foreground mt-1">Master register of pension schemes with PSTR/PSR numbers, benefit basis and status.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New scheme</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New scheme</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Scheme name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Type</Label>
                <Select value={form.scheme_type} onValueChange={v => setForm({ ...form, scheme_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIPP">SIPP</SelectItem>
                    <SelectItem value="SSAS">SSAS</SelectItem>
                    <SelectItem value="Occupational DC">Occupational DC</SelectItem>
                    <SelectItem value="Occupational DB">Occupational DB</SelectItem>
                    <SelectItem value="Master Trust">Master Trust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>PSTR</Label><Input value={form.pstr} onChange={e => setForm({ ...form, pstr: e.target.value })} placeholder="e.g. 00123456RH" /></div>
                <div><Label>PSR number</Label><Input value={form.psr_number} onChange={e => setForm({ ...form, psr_number: e.target.value })} /></div>
              </div>
              <div><Label>Established date</Label><Input type="date" value={form.established_date} onChange={e => setForm({ ...form, established_date: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader><CardTitle>Schemes ({rows.length})</CardTitle><CardDescription>Foundational entity — everything at book-of-business level attaches to a scheme.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>PSTR</TableHead><TableHead>PSR</TableHead><TableHead>Established</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="outline">{r.scheme_type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.pstr || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.psr_number || "—"}</TableCell>
                  <TableCell>{r.established_date || "—"}</TableCell>
                  <TableCell><Badge className={r.status === "active" ? "bg-emerald-100 text-emerald-700" : ""}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No schemes yet — add your first.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
