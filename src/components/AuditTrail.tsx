import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ShieldCheck, ArrowDownToLine, FileSignature, Search, Download, ChevronDown,
  CheckCircle2, XCircle, AlertTriangle, Clock, User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

interface AuditRow {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  description: string;
  performed_by: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

const KYC_ENTITIES = new Set(["kyc_case", "kyc_document", "kyc_check"]);
const CASH_ENTITIES = new Set(["bank_connection", "payment_initiation", "dd_mandate"]);

const ENTITY_META: Record<string, { label: string; icon: any; tone: string }> = {
  kyc_case:           { label: "KYC case",         icon: ShieldCheck,  tone: "text-blue-600" },
  kyc_document:       { label: "KYC document",     icon: ShieldCheck,  tone: "text-blue-600" },
  kyc_check:          { label: "KYC check",        icon: ShieldCheck,  tone: "text-blue-600" },
  bank_connection:    { label: "Bank connection",  icon: ArrowDownToLine, tone: "text-emerald-600" },
  payment_initiation: { label: "PISP payment",     icon: ArrowDownToLine, tone: "text-emerald-600" },
  dd_mandate:         { label: "Direct Debit",     icon: FileSignature, tone: "text-amber-600" },
};

const ACTION_TONE: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  consent_granted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  payment_settled: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  mandate_signed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  payment_failed: "bg-destructive/15 text-destructive",
  consent_revoked: "bg-destructive/15 text-destructive",
  consent_expired: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  review_required: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  created: "bg-muted text-muted-foreground",
  payment_initiated: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

function ActionIcon({ action }: { action: string }) {
  if (["approved","verified","consent_granted","payment_settled","mandate_signed"].includes(action))
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (["rejected","payment_failed","consent_revoked"].includes(action))
    return <XCircle className="w-4 h-4 text-destructive" />;
  if (["review_required","consent_expired"].includes(action))
    return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
}

function csvCell(v: any) {
  if (v == null) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AuditTrail() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [scope, setScope] = useState<"all" | "kyc" | "cash">("all");
  const [actor, setActor] = useState<string>("all");
  const [action, setAction] = useState<string>("all");
  const [days, setDays] = useState<string>("30");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = days === "all" ? null : new Date(Date.now() - parseInt(days) * 86400000).toISOString();
    let query = supabase
      .from("activity_log")
      .select("*")
      .in("entity_type", [...KYC_ENTITIES, ...CASH_ENTITIES])
      .order("created_at", { ascending: false })
      .limit(500);
    if (since) query = query.gte("created_at", since);
    const { data } = await query;
    setRows((data as AuditRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("audit-stream")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [days]);

  const filtered = useMemo(() => rows.filter(r => {
    if (scope === "kyc"  && !KYC_ENTITIES.has(r.entity_type))  return false;
    if (scope === "cash" && !CASH_ENTITIES.has(r.entity_type)) return false;
    if (actor !== "all" && r.performed_by !== actor) return false;
    if (action !== "all" && r.action !== action) return false;
    if (q) {
      const hay = `${r.description} ${r.entity_type} ${r.action} ${r.performed_by}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [rows, scope, actor, action, q]);

  const actors = useMemo(() => Array.from(new Set(rows.map(r => r.performed_by))).sort(), [rows]);
  const actions = useMemo(() => Array.from(new Set(rows.map(r => r.action))).sort(), [rows]);

  const summary = {
    total: filtered.length,
    kyc: filtered.filter(r => KYC_ENTITIES.has(r.entity_type)).length,
    cash: filtered.filter(r => CASH_ENTITIES.has(r.entity_type)).length,
    actors: new Set(filtered.map(r => r.performed_by)).size,
  };

  const exportCsv = () => {
    if (!filtered.length) { toast.error("Nothing to export"); return; }
    const headers = ["Timestamp", "Entity type", "Entity ID", "Action", "Description", "Performed by", "Old values", "New values"];
    const lines = [
      headers.join(","),
      ...filtered.map(r => [
        new Date(r.created_at).toISOString(),
        r.entity_type, r.entity_id ?? "",
        r.action, r.description, r.performed_by,
        r.old_values, r.new_values,
      ].map(csvCell).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} entries`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit trail"
        description="Immutable, tamper-evident log of every KYC decision and cash onboarding event — who, what and when. Updates and deletes are blocked at the database."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Events shown" value={summary.total} />
        <StatTile label="KYC events"   value={summary.kyc} />
        <StatTile label="Cash events"  value={summary.cash} />
        <StatTile label="Distinct actors" value={summary.actors} />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Tabs value={scope} onValueChange={v => setScope(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
              <TabsTrigger value="kyc"><ShieldCheck className="w-4 h-4 mr-2" />KYC</TabsTrigger>
              <TabsTrigger value="cash"><ArrowDownToLine className="w-4 h-4 mr-2" />Cash onboarding</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search description, action, actor…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Select value={actor} onValueChange={setActor}>
              <SelectTrigger><SelectValue placeholder="Actor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actors</SelectItem>
                {actors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period:</span>
              {[
                { v: "1",   l: "24h" },
                { v: "7",   l: "7d" },
                { v: "30",  l: "30d" },
                { v: "90",  l: "90d" },
                { v: "all", l: "All" },
              ].map(o => (
                <Button key={o.v} size="sm" variant={days === o.v ? "default" : "outline"} onClick={() => setDays(o.v)}>{o.l}</Button>
              ))}
            </div>
            <Button onClick={exportCsv} disabled={!filtered.length}>
              <Download className="w-4 h-4 mr-2" />Export CSV ({filtered.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {loading && <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>}
        {!loading && !filtered.length && (
          <Card><CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
            No audit entries match these filters. Run a KYC check or link a bank in cash onboarding to generate events.
          </CardContent></Card>
        )}
        {filtered.map(r => <AuditRowCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="pt-6">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </CardContent></Card>
  );
}

function AuditRowCard({ r }: { r: AuditRow }) {
  const meta = ENTITY_META[r.entity_type] ?? { label: r.entity_type, icon: Clock, tone: "text-muted-foreground" };
  const Icon = meta.icon;
  const hasDiff = (r.old_values && Object.keys(r.old_values).length) || (r.new_values && Object.keys(r.new_values).length);

  return (
    <Collapsible className="border rounded-lg">
      <div className="flex items-start gap-3 p-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.tone}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ActionIcon action={r.action} />
            <span className="font-medium text-sm">{r.description}</span>
            <Badge className={`text-[10px] ${ACTION_TONE[r.action] ?? "bg-muted text-muted-foreground"}`}>{r.action}</Badge>
            <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
            <UserIcon className="w-3 h-3" />
            <span>{r.performed_by}</span>
            <span>·</span>
            <span>{new Date(r.created_at).toLocaleString()}</span>
            {r.entity_id && <><span>·</span><span className="font-mono text-[10px]">{r.entity_id.slice(0, 8)}</span></>}
          </div>
        </div>
        {hasDiff ? (
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="ghost"><ChevronDown className="w-4 h-4" /></Button>
          </CollapsibleTrigger>
        ) : null}
      </div>
      {hasDiff ? (
        <CollapsibleContent>
          <div className="border-t bg-muted/30 p-3 grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Before</div>
              <pre className="text-xs whitespace-pre-wrap bg-background border rounded p-2 max-h-48 overflow-auto">
{r.old_values ? JSON.stringify(r.old_values, null, 2) : "—"}
              </pre>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">After</div>
              <pre className="text-xs whitespace-pre-wrap bg-background border rounded p-2 max-h-48 overflow-auto">
{r.new_values ? JSON.stringify(r.new_values, null, 2) : "—"}
              </pre>
            </div>
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
}
