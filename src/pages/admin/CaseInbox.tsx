import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox } from "lucide-react";

interface Case { id: string; case_type: string | null; status: string | null; priority: string | null; assigned_to: string | null; sla_due_at: string | null; created_at: string; subject?: string | null; }
const priorityTone: Record<string, string> = { high: "bg-rose-100 text-rose-700", medium: "bg-amber-100 text-amber-700", low: "bg-slate-100 text-slate-700" };

export default function CaseInbox() {
  const [rows, setRows] = useState<Case[]>([]);
  const [tab, setTab] = useState("open");

  useEffect(() => {
    supabase.from("ops_cases").select("*").order("created_at", { ascending: false }).limit(300)
      .then(({ data }) => setRows((data as Case[]) || []));
  }, []);

  const filtered = useMemo(() => rows.filter(r => {
    if (tab === "open") return (r.status || "open") !== "closed";
    if (tab === "breach") return r.sla_due_at && new Date(r.sla_due_at) < new Date() && (r.status || "open") !== "closed";
    if (tab === "closed") return r.status === "closed";
    return true;
  }), [rows, tab]);

  const grouped = useMemo(() => {
    const g: Record<string, number> = {};
    filtered.forEach(r => { g[r.case_type || "other"] = (g[r.case_type || "other"] || 0) + 1; });
    return Object.entries(g).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Inbox className="w-6 h-6 text-primary" /> Case inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">Unified queue of every work item across payroll, transfers, drawdown, complaints and KYC — one SLA clock per case.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Open cases</CardDescription><CardTitle className="text-2xl">{rows.filter(r => (r.status || "open") !== "closed").length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>SLA breached</CardDescription><CardTitle className="text-2xl text-rose-700">{rows.filter(r => r.sla_due_at && new Date(r.sla_due_at) < new Date() && (r.status || "open") !== "closed").length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Closed (all time)</CardDescription><CardTitle className="text-2xl">{rows.filter(r => r.status === "closed").length}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>By type</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {grouped.map(([k, n]) => <Badge key={k} variant="outline">{k}: {n}</Badge>)}
          {grouped.length === 0 && <span className="text-sm text-muted-foreground">No cases in this bucket.</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cases</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="breach">SLA breached</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Opened</TableHead><TableHead>Type</TableHead><TableHead>Subject</TableHead><TableHead>Assigned</TableHead><TableHead>Priority</TableHead><TableHead>SLA due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.created_at).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell><Badge variant="outline">{r.case_type || "—"}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{r.subject || "—"}</TableCell>
                      <TableCell>{r.assigned_to || "—"}</TableCell>
                      <TableCell>{r.priority && <Badge className={priorityTone[r.priority] || ""}>{r.priority}</Badge>}</TableCell>
                      <TableCell>{r.sla_due_at ? new Date(r.sla_due_at).toLocaleDateString("en-GB") : "—"}</TableCell>
                      <TableCell><Badge>{r.status || "open"}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No cases in this bucket.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
