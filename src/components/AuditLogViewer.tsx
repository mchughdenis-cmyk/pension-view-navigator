import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AsyncState } from "@/components/ui/async-state";
import { RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";

interface LogRow {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  description: string;
  performed_by: string | null;
  new_values: any;
  old_values: any;
  created_at: string;
}

export default function AuditLogViewer() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState<string>("all");
  const [action, setAction] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    else setRows((data ?? []) as LogRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("audit-log-stream")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => setRows((prev) => [payload.new as LogRow, ...prev].slice(0, 500)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const entityTypes = Array.from(new Set(rows.map(r => r.entity_type))).sort();
  const actions = Array.from(new Set(rows.map(r => r.action))).sort();

  const filtered = rows.filter(r => {
    if (entityType !== "all" && r.entity_type !== entityType) return false;
    if (action !== "all" && r.action !== action) return false;
    if (search && !`${r.description} ${r.action} ${r.entity_type} ${r.performed_by ?? ""}`
      .toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Audit log"
        description="Immutable record of system and user actions across the platform."
        actions={<Button onClick={load} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search description, action, user…"
              value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger><SelectValue placeholder="Entity type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entity types</SelectItem>
              {entityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Entries</CardTitle>
          <span className="text-xs text-muted-foreground">{filtered.length} of {rows.length}</span>
        </CardHeader>
        <CardContent>
          <AsyncState
            loading={loading}
            error={error}
            empty={!loading && !error && filtered.length === 0}
            onRetry={load}
            emptyTitle="No matching audit entries"
            emptyDescription="Try clearing filters or trigger an action elsewhere in the app."
          >
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[140px]">By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(r.created_at), "dd MMM yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{r.action}</Badge></TableCell>
                      <TableCell className="text-xs">{r.entity_type}</TableCell>
                      <TableCell className="text-sm">{r.description}</TableCell>
                      <TableCell className="text-xs">{r.performed_by ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AsyncState>
        </CardContent>
      </Card>
    </div>
  );
}
