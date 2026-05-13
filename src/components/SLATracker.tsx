import { Fragment, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Clock, AlertTriangle, CheckCircle2, Timer, Info, ExternalLink, Search, ChevronDown, ChevronRight, ShieldAlert, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { evaluateAccountWarnings, SEVERITY_BADGE, fmtGBP, type Warning, type AccountLike } from "@/lib/cashWarnings";

type Status = "open" | "in_progress" | "completed" | "breached";
type Priority = "high" | "medium" | "low";

interface SLACase {
  id: string;
  firm_id: string | null;
  client_id: string | null;
  account_id: string | null;
  case_type: string;
  reference: string | null;
  description: string | null;
  priority: Priority;
  status: Status;
  owner: string | null;
  sla_hours: number;
  opened_at: string;
  due_at: string;
  completed_at: string | null;
  notes: string | null;
}

interface AccountRow extends AccountLike {
  account_number: string | null;
  status: string | null;
}

const STATUS_BADGE: Record<Status, "destructive" | "default" | "secondary" | "outline"> = {
  breached: "destructive",
  in_progress: "default",
  open: "secondary",
  completed: "outline",
};

const PRIORITY_BADGE: Record<Priority, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

function timeRemaining(due: string, completed: string | null) {
  if (completed) return "Completed";
  const ms = new Date(due).getTime() - Date.now();
  const hrs = ms / (1000 * 60 * 60);
  if (hrs < 0) return `${Math.abs(Math.round(hrs))}h overdue`;
  if (hrs < 24) return `${Math.round(hrs)}h left`;
  return `${Math.round(hrs / 24)}d left`;
}

function progressPct(opened: string, due: string) {
  const total = new Date(due).getTime() - new Date(opened).getTime();
  const used = Date.now() - new Date(opened).getTime();
  return Math.min(100, Math.max(0, (used / total) * 100));
}

export default function SLATracker() {
  const { firmId, firm } = useFirm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<SLACase[]>([]);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState<Record<string, AccountRow>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("sla_cases").select("*").order("due_at", { ascending: true });
    if (firmId) q = q.eq("firm_id", firmId);
    const { data } = await q;
    const list = (data ?? []) as SLACase[];

    list.forEach((c) => {
      if (c.status !== "completed" && new Date(c.due_at).getTime() < Date.now()) {
        c.status = "breached";
      }
    });
    setCases(list);

    const clientIds = Array.from(new Set(list.map((c) => c.client_id).filter(Boolean))) as string[];
    if (clientIds.length) {
      const { data: cs } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .in("id", clientIds);
      const map: Record<string, string> = {};
      (cs ?? []).forEach((c: any) => {
        map[c.id] = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
      });
      setClientNames(map);
    }

    const acctIds = Array.from(new Set(list.map((c) => c.account_id).filter(Boolean))) as string[];
    if (acctIds.length) {
      const { data: acs } = await supabase
        .from("client_accounts")
        .select("id, account_type, account_number, cash_balance, total_value, status")
        .in("id", acctIds);
      const am: Record<string, AccountRow> = {};
      (acs ?? []).forEach((a: any) => { am[a.id] = a as AccountRow; });
      setAccounts(am);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [firmId]);

  const counts = useMemo(() => {
    const c = { all: cases.length, open: 0, in_progress: 0, completed: 0, breached: 0 };
    cases.forEach((x) => (c[x.status] += 1));
    return c;
  }, [cases]);

  const types = useMemo(() => Array.from(new Set(cases.map((c) => c.case_type))).sort(), [cases]);

  const filtered = cases.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (typeFilter !== "all" && c.case_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = clientNames[c.client_id ?? ""] ?? "";
      if (
        !c.case_type.toLowerCase().includes(q) &&
        !(c.reference ?? "").toLowerCase().includes(q) &&
        !name.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const markCompleted = async (id: string) => {
    const { error } = await supabase
      .from("sla_cases")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Case marked completed");
      load();
    }
  };

  const breachRate =
    counts.all > 0 ? ((counts.breached / counts.all) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="SLA Tracker"
        subtitle={firm ? `${firm.name} — operational service-level monitoring` : "Operational service-level monitoring"}
        badge={
          <Badge variant="outline" className="gap-1">
            <Timer className="w-3 h-3" /> Live SLA clock
          </Badge>
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2"><CardDescription>Open</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{counts.open}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>In progress</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{counts.in_progress}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Breached</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{counts.breached}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Completed</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{counts.completed}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Breach rate</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{breachRate}%</div></CardContent>
          </Card>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How SLAs are tracked</AlertTitle>
          <AlertDescription className="text-sm">
            Each case records an opened time and an SLA due time based on the case-type
            target (e.g. UFPLS payments 48h, Origo transfers in 15 days, complaints 8 weeks per <b>DISP 1.6</b>,
            pension sharing orders 4 months per <b>WRPA 1999</b>). Cases past their due date and not yet
            completed are flagged as <b>Breached</b>.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Cases
            </CardTitle>
            <CardDescription>Filter by status, type or search by client / reference.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by client, reference or type"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="All case types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All case types</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="breached">Breached ({counts.breached})</TabsTrigger>
                <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
                <TabsTrigger value="in_progress">In progress ({counts.in_progress})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
              </TabsList>

              <TabsContent value={tab} className="space-y-3">
                {loading && <p className="text-sm text-muted-foreground">Loading SLA cases…</p>}
                {!loading && filtered.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No cases match your filter.
                  </div>
                )}

                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Type / Ref</TableHead>
                        <TableHead>Client / Account</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead className="w-[180px]">Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => {
                        const pct = progressPct(c.opened_at, c.due_at);
                        const breached = c.status === "breached";
                        const acct = c.account_id ? accounts[c.account_id] : undefined;
                        const warns = acct ? evaluateAccountWarnings(acct) : [];
                        const isOpen = !!expanded[c.id];
                        return (
                          <Fragment key={c.id}>
                            <TableRow>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7"
                                  onClick={() => setExpanded((s) => ({ ...s, [c.id]: !s[c.id] }))}>
                                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{c.case_type}</div>
                                <div className="text-xs text-muted-foreground">{c.reference}</div>
                              </TableCell>
                              <TableCell>
                                <div>{clientNames[c.client_id ?? ""] ?? "—"}</div>
                                {acct ? (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Wallet className="w-3 h-3" />
                                    {acct.account_type}{acct.account_number ? ` · ${acct.account_number}` : ""}
                                    {warns.length > 0 && (
                                      <Badge variant="destructive" className="ml-1 text-[9px] px-1.5 py-0 gap-0.5">
                                        <ShieldAlert className="w-2.5 h-2.5" /> {warns.length}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">No account linked</div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">{c.owner ?? "—"}</TableCell>
                              <TableCell>
                                <Badge variant={PRIORITY_BADGE[c.priority]} className="uppercase text-[10px]">
                                  {c.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={STATUS_BADGE[c.status]} className="capitalize">
                                  {c.status.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div>{timeRemaining(c.due_at, c.completed_at)}</div>
                                <div className="text-xs text-muted-foreground">
                                  Due {new Date(c.due_at).toLocaleDateString("en-GB")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="h-2 w-full rounded bg-muted overflow-hidden">
                                  <div
                                    className={`h-full ${breached ? "bg-destructive" : pct > 75 ? "bg-warning" : "bg-primary"}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">SLA {c.sla_hours}h</div>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                {c.status !== "completed" && (
                                  <Button size="sm" variant="outline" onClick={() => markCompleted(c.id)}>
                                    Complete
                                  </Button>
                                )}
                                {c.client_id && (
                                  <Button size="sm" variant="ghost"
                                    onClick={() => navigate(`/client-admin/${c.client_id}`)}>
                                    Open <ExternalLink className="w-3 h-3 ml-1" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                            {isOpen && (
                              <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableCell></TableCell>
                                <TableCell colSpan={8} className="py-4">
                                  <CaseDetails acct={acct} warns={warns} description={c.description} notes={c.notes} />
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filtered.map((c) => {
                    const pct = progressPct(c.opened_at, c.due_at);
                    const breached = c.status === "breached";
                    const acct = c.account_id ? accounts[c.account_id] : undefined;
                    const warns = acct ? evaluateAccountWarnings(acct) : [];
                    const isOpen = !!expanded[c.id];
                    return (
                      <div key={c.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">{c.case_type}</div>
                          <Badge variant={STATUS_BADGE[c.status]} className="capitalize text-[10px]">
                            {c.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{c.reference}</div>
                        <div className="text-sm mt-1">{clientNames[c.client_id ?? ""] ?? "—"}</div>
                        {acct && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Wallet className="w-3 h-3" />
                            {acct.account_type}{acct.account_number ? ` · ${acct.account_number}` : ""}
                            {warns.length > 0 && (
                              <Badge variant="destructive" className="ml-1 text-[9px] px-1.5 py-0 gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" /> {warns.length}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={PRIORITY_BADGE[c.priority]} className="uppercase text-[10px]">
                            {c.priority}
                          </Badge>
                          <span className="text-xs">{timeRemaining(c.due_at, c.completed_at)}</span>
                        </div>
                        <div className="h-2 w-full rounded bg-muted overflow-hidden mt-2">
                          <div
                            className={`h-full ${breached ? "bg-destructive" : pct > 75 ? "bg-warning" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between gap-2 mt-2">
                          <Button size="sm" variant="ghost"
                            onClick={() => setExpanded((s) => ({ ...s, [c.id]: !s[c.id] }))}>
                            {isOpen ? "Hide details" : "Details"}
                          </Button>
                          <div className="flex gap-2">
                            {c.status !== "completed" && (
                              <Button size="sm" variant="outline" onClick={() => markCompleted(c.id)}>
                                Complete
                              </Button>
                            )}
                            {c.client_id && (
                              <Button size="sm" variant="ghost"
                                onClick={() => navigate(`/client-admin/${c.client_id}`)}>
                                Open <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {isOpen && (
                          <div className="mt-3 border-t pt-3">
                            <CaseDetails acct={acct} warns={warns} description={c.description} notes={c.notes} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {counts.breached > 0 && (
              <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{counts.breached} case(s) past SLA</AlertTitle>
                <AlertDescription>
                  Breached cases require immediate triage and a Consumer Duty (PRIN 12) impact assessment if a client has been disadvantaged.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
