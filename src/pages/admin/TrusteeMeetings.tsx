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
import { Users, Plus, CalendarClock } from "lucide-react";
import { toast } from "sonner";

interface Meeting { id: string; meeting_date: string; meeting_type: string; chair: string | null; status: string; }
interface Action { id: string; description: string; owner: string | null; due_date: string | null; status: string; }

export default function TrusteeMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meeting_date: "", meeting_type: "quarterly", chair: "" });

  const load = async () => {
    const [m, a] = await Promise.all([
      supabase.from("trustee_meetings").select("*").order("meeting_date", { ascending: false }),
      supabase.from("trustee_actions").select("*").eq("status", "open").order("due_date"),
    ]);
    setMeetings((m.data as Meeting[]) || []);
    setActions((a.data as Action[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.meeting_date) return toast.error("Meeting date required");
    const { error } = await supabase.from("trustee_meetings").insert({
      ...form, chair: form.chair || null,
      agenda: [{ item: "Minutes of previous meeting" }, { item: "Investment update" }, { item: "Administration report" }, { item: "Risk & compliance" }, { item: "AOB" }],
    });
    if (error) return toast.error(error.message);
    toast.success("Meeting scheduled with standard agenda"); setOpen(false);
    setForm({ meeting_date: "", meeting_type: "quarterly", chair: "" }); load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Trustee meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Meeting packs with standard agenda, attendees and action tracker.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Schedule meeting</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule trustee meeting</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Date</Label><Input type="date" value={form.meeting_date} onChange={e => setForm({ ...form, meeting_date: e.target.value })} /></div>
              <div><Label>Type</Label>
                <Select value={form.meeting_type} onValueChange={v => setForm({ ...form, meeting_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                    <SelectItem value="sub_committee">Sub-committee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Chair</Label><Input value={form.chair} onChange={e => setForm({ ...form, chair: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={create}>Create pack</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Meetings ({meetings.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Chair</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {meetings.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.meeting_date}</TableCell>
                  <TableCell><Badge variant="outline">{m.meeting_type}</Badge></TableCell>
                  <TableCell>{m.chair || "—"}</TableCell>
                  <TableCell><Badge>{m.status}</Badge></TableCell>
                </TableRow>
              ))}
              {meetings.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No meetings scheduled.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Open actions ({actions.length})</CardTitle><CardDescription>Follow-ups from prior meetings.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Owner</TableHead><TableHead>Due</TableHead></TableRow></TableHeader>
            <TableBody>
              {actions.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.description}</TableCell>
                  <TableCell>{a.owner || "—"}</TableCell>
                  <TableCell>{a.due_date || "—"}</TableCell>
                </TableRow>
              ))}
              {actions.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No open actions.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
