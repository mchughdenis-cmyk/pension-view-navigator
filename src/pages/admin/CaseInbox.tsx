import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Inbox, Save, Star, Trash2 } from "lucide-react";
import { useSavedViews } from "@/hooks/useSavedViews";

interface Case { id: string; case_type: string | null; status: string | null; priority: string | null; assigned_to: string | null; sla_due_at: string | null; created_at: string; subject?: string | null; }
type Filters = { tab: string; q: string; priority: string; type: string };
const priorityTone: Record<string, string> = { high: "bg-rose-100 text-rose-700", medium: "bg-amber-100 text-amber-700", low: "bg-slate-100 text-slate-700" };

export default function CaseInbox() {
  const [rows, setRows] = useState<Case[]>([]);
  const [filters, setFilters] = useState<Filters>({ tab: "open", q: "", priority: "all", type: "all" });
  const { views, save, remove } = useSavedViews<Filters>("cases");

  useEffect(() => {
    supabase.from("ops_cases").select("*").order("created_at", { ascending: false }).limit(300)
      .then(({ data }) => setRows((data as Case[]) || []));
  }, []);

  const types = useMemo(() => Array.from(new Set(rows.map(r => r.case_type || "other"))).sort(), [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    if (filters.tab === "open" && (r.status || "open") === "closed") return false;
    if (filters.tab === "breach" && !(r.sla_due_at && new Date(r.sla_due_at) < new Date() && (r.status || "open") !== "closed")) return false;
    if (filters.tab === "closed" && r.status !== "closed") return false;
    if (filters.priority !== "all" && r.priority !== filters.priority) return false;
    if (filters.type !== "all" && (r.case_type || "other") !== filters.type) return false;
    if (filters.q && !`${r.subject || ""} ${r.assigned_to || ""} ${r.case_type || ""}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  }), [rows, filters]);

  const grouped = useMemo(() => {
    const g: Record<string, number> = {};
    filtered.forEach(r => { g[r.case_type || "other"] = (g[r.case_type || "other"] || 0) + 1; });
    return Object.entries(g).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const onSaveView = () => {
    const name = window.prompt("Name this view (e.g. 'My open transfers')");
    if (name) save(name.trim(), filters);
  };

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

      {views.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Saved views</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {views.map(v => (
              <div key={v.id} className="inline-flex items-center gap-1 rounded-full border bg-muted/40 pl-2 pr-1 py-0.5 text-xs">
                <button className="hover:underline" onClick={() => setFilters(v.filters)}>{v.name}</button>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => remove(v.id)} title="Delete view">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Cases</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Input placeholder="Search subject / assignee / type" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} className="max-w-xs h-8" />
            <Select value={filters.priority} onValueChange={v => setFilters(f => ({ ...f, priority: v }))}>
              <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v }))}>
              <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={onSaveView} className="h-8 gap-1"><Save className="h-3.5 w-3.5" /> Save view</Button>
          </div>
          <Tabs value={filters.tab} onValueChange={v => setFilters(f => ({ ...f, tab: v }))}>
            <TabsList>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="breach">SLA breached</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={filters.tab} className="mt-4">
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
                  {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No cases match these filters.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
