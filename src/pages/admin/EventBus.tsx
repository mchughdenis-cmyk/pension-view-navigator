import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Evt = { id: string; event_name: string; aggregate_type: string | null; published: boolean; payload: any; created_at: string };

export default function EventBus() {
  const [rows, setRows] = useState<Evt[]>([]);
  const [name, setName] = useState("payroll.completed");
  const [json, setJson] = useState('{"run_id":"demo"}');

  const load = async () => {
    const { data } = await supabase.from("domain_events").select("*").order("created_at", { ascending: false }).limit(200);
    setRows((data as Evt[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const emit = async () => {
    let payload: any = {};
    try { payload = JSON.parse(json); } catch { return toast({ title: "Invalid JSON", variant: "destructive" }); }
    await supabase.from("domain_events").insert({ event_name: name, payload, aggregate_type: name.split(".")[0] });
    toast({ title: "Event emitted" });
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Domain Event Bus</h1>
        <p className="text-sm text-muted-foreground">Central event log for chaining processes: payroll → contribution → dealing → statements.</p>
      </header>
      <Card>
        <CardHeader className="text-sm font-medium">Emit test event</CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="event.name" />
          <Input value={json} onChange={e => setJson(e.target.value)} placeholder='{"key":"value"}' />
          <Button onClick={emit}>Emit</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow>
              <TableHead>When</TableHead><TableHead>Event</TableHead><TableHead>Aggregate</TableHead>
              <TableHead>Payload</TableHead><TableHead>Published</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs">{new Date(e.created_at).toLocaleString("en-GB")}</TableCell>
                  <TableCell className="font-mono text-xs">{e.event_name}</TableCell>
                  <TableCell className="text-xs">{e.aggregate_type}</TableCell>
                  <TableCell className="font-mono text-xs max-w-md truncate">{JSON.stringify(e.payload)}</TableCell>
                  <TableCell><Badge variant={e.published ? "default" : "secondary"}>{e.published ? "yes" : "no"}</Badge></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No events yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
