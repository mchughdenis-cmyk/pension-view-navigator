import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard } from "@/components/ui/page-primitives";
import { formatGBP } from "@/lib/pensionCalculations";
import { Building2, Users, Banknote, AlertTriangle, ArrowRight } from "lucide-react";

interface Scheme { id: string; scheme_ref: string; scheme_name: string; sponsoring_employer: string; registration_date: string; professional_trustee: string; status: string; total_assets: number; notes: string; }
interface Member { id: string; scheme_id: string; client_id: string; is_trustee: boolean; share_pct: number; joined_date: string; }
interface Loan { id: string; scheme_id: string; borrower_employer: string; principal: number; interest_rate: number; charge_secured: string; start_date: string; term_months: number; outstanding_balance: number; fifty_pct_test_pass: boolean; status: string; notes: string; }
interface Client { id: string; first_name: string; last_name: string; }

export default function SSASModule() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loanbacks, setLoanbacks] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeScheme, setActiveScheme] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("ssas_schemes").select("*").order("scheme_ref"),
      supabase.from("ssas_loanbacks").select("*").order("start_date", { ascending: false }),
      supabase.from("ssas_members").select("*"),
      supabase.from("clients").select("id, first_name, last_name"),
    ]).then(([s, l, m, c]) => {
      setSchemes((s.data as Scheme[]) || []);
      setLoanbacks((l.data as Loan[]) || []);
      setMembers((m.data as Member[]) || []);
      setClients((c.data as Client[]) || []);
    });
  }, []);

  const clientName = (id: string) => {
    const c = clients.find(x => x.id === id);
    return c ? `${c.first_name} ${c.last_name}` : id.slice(0, 8);
  };
  const schemeRef = (id: string) => schemes.find(s => s.id === id)?.scheme_ref || id.slice(0, 8);

  const totalAssets = useMemo(() => schemes.reduce((s, x) => s + Number(x.total_assets || 0), 0), [schemes]);
  const totalOutstanding = useMemo(() => loanbacks.filter(l => l.status !== "repaid").reduce((s, x) => s + Number(x.outstanding_balance || 0), 0), [loanbacks]);
  const totalPrincipal = useMemo(() => loanbacks.reduce((s, x) => s + Number(x.principal || 0), 0), [loanbacks]);
  const breaches = loanbacks.filter(l => !l.fifty_pct_test_pass).length;

  const visible = activeScheme ? { schemes: schemes.filter(s => s.id === activeScheme), members: members.filter(m => m.scheme_id === activeScheme), loanbacks: loanbacks.filter(l => l.scheme_id === activeScheme) } : { schemes, members, loanbacks };

  const schemeBreakdown = (s: Scheme) => {
    const m = members.filter(x => x.scheme_id === s.id);
    const ls = loanbacks.filter(x => x.scheme_id === s.id);
    const out = ls.filter(l => l.status !== "repaid").reduce((a, l) => a + Number(l.outstanding_balance), 0);
    const pct = Number(s.total_assets) > 0 ? (out / Number(s.total_assets)) * 100 : 0;
    return { memberCount: m.length, outstanding: out, loanPct: pct, breach: ls.some(l => !l.fifty_pct_test_pass) };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="SSAS Administration" description="Small Self-Administered Schemes — member-trustees, loanbacks, and the 50% test." />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Schemes" value={schemes.length} />
        <StatCard label="Total assets under admin" value={formatGBP(totalAssets)} />
        <StatCard label="Loanbacks outstanding" value={formatGBP(totalOutstanding)} />
        <StatCard label="Members" value={members.length} />
      </div>

      {breaches > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">50% test breach detected</p>
              <p className="text-sm text-muted-foreground">{breaches} loanback{breaches > 1 ? "s" : ""} require remediation. Review the Loanbacks tab.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeScheme && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => setActiveScheme(null)}>← All schemes</Button>
          <span className="text-muted-foreground">Filtered to {schemeRef(activeScheme)}</span>
        </div>
      )}

      <Tabs defaultValue="schemes">
        <TabsList>
          <TabsTrigger value="schemes">Schemes ({visible.schemes.length})</TabsTrigger>
          <TabsTrigger value="loanbacks">Loanbacks ({visible.loanbacks.length})</TabsTrigger>
          <TabsTrigger value="members">Members ({visible.members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schemes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visible.schemes.map(s => {
              const b = schemeBreakdown(s);
              return (
                <Card key={s.id} className="cursor-pointer hover:border-primary transition" onClick={() => setActiveScheme(s.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{s.scheme_name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{s.scheme_ref} · Registered {s.registration_date}</p>
                      </div>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-muted-foreground text-xs">Sponsoring employer</p><p className="font-medium">{s.sponsoring_employer}</p></div>
                      <div><p className="text-muted-foreground text-xs">Professional trustee</p><p className="font-medium">{s.professional_trustee}</p></div>
                      <div><p className="text-muted-foreground text-xs">Total assets</p><p className="font-semibold">{formatGBP(Number(s.total_assets))}</p></div>
                      <div><p className="text-muted-foreground text-xs">Members</p><p className="font-semibold">{b.memberCount}</p></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Loanback exposure (50% test)</span>
                        <span className={b.loanPct > 50 ? "text-destructive font-semibold" : "text-muted-foreground"}>{b.loanPct.toFixed(1)}% / 50%</span>
                      </div>
                      <Progress value={Math.min(100, (b.loanPct / 50) * 100)} className={b.loanPct > 50 ? "[&>div]:bg-destructive" : ""} />
                      <p className="text-xs text-muted-foreground mt-1">{formatGBP(b.outstanding)} outstanding to employer</p>
                    </div>
                    {b.breach && <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Test breach</Badge>}
                    {s.notes && <p className="text-xs text-muted-foreground italic">{s.notes}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="loanbacks">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Scheme</TableHead><TableHead>Borrower</TableHead>
                <TableHead className="text-right">Principal</TableHead><TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Repaid</TableHead><TableHead>Rate</TableHead>
                <TableHead>Term</TableHead><TableHead>Charge</TableHead>
                <TableHead>50% test</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {visible.loanbacks.map(l => {
                  const repaid = Number(l.principal) - Number(l.outstanding_balance);
                  const pct = Number(l.principal) ? (repaid / Number(l.principal)) * 100 : 0;
                  return (
                    <TableRow key={l.id} className="cursor-pointer" onClick={() => setActiveScheme(l.scheme_id)}>
                      <TableCell className="font-mono text-xs">{schemeRef(l.scheme_id)}</TableCell>
                      <TableCell className="text-sm">{l.borrower_employer}</TableCell>
                      <TableCell className="text-right">{formatGBP(Number(l.principal))}</TableCell>
                      <TableCell className="text-right font-semibold">{formatGBP(Number(l.outstanding_balance))}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs">{formatGBP(repaid)}</span>
                          <Progress value={pct} className="w-16 h-1" />
                        </div>
                      </TableCell>
                      <TableCell>{(Number(l.interest_rate) * 100).toFixed(2)}%</TableCell>
                      <TableCell className="text-xs">{l.term_months}m from {l.start_date}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={l.charge_secured}>{l.charge_secured}</TableCell>
                      <TableCell><Badge variant={l.fifty_pct_test_pass ? "default" : "destructive"}>{l.fifty_pct_test_pass ? "PASS" : "FAIL"}</Badge></TableCell>
                      <TableCell><Badge variant={l.status === "active" ? "secondary" : l.status === "breach" ? "destructive" : "outline"}>{l.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {visible.loanbacks.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-6">No loanbacks for this scheme.</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="mt-4 text-xs text-muted-foreground">
              Total principal advanced: <strong>{formatGBP(totalPrincipal)}</strong> · Outstanding: <strong>{formatGBP(totalOutstanding)}</strong> · Repaid to date: <strong>{formatGBP(totalPrincipal - totalOutstanding)}</strong>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="members">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Scheme</TableHead><TableHead>Member</TableHead>
                <TableHead>Role</TableHead><TableHead className="text-right">Share %</TableHead>
                <TableHead className="text-right">Member fund</TableHead><TableHead>Joined</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {visible.members.map(m => {
                  const scheme = schemes.find(s => s.id === m.scheme_id);
                  const fund = scheme ? Number(scheme.total_assets) * (Number(m.share_pct) / 100) : 0;
                  return (
                    <TableRow key={m.id} className="cursor-pointer" onClick={() => setActiveScheme(m.scheme_id)}>
                      <TableCell className="font-mono text-xs">{schemeRef(m.scheme_id)}</TableCell>
                      <TableCell className="font-medium">{clientName(m.client_id)}</TableCell>
                      <TableCell>{m.is_trustee ? <Badge>Member-trustee</Badge> : <Badge variant="secondary">Member</Badge>}</TableCell>
                      <TableCell className="text-right">{Number(m.share_pct).toFixed(0)}%</TableCell>
                      <TableCell className="text-right font-semibold">{formatGBP(fund)}</TableCell>
                      <TableCell className="text-sm">{m.joined_date}</TableCell>
                    </TableRow>
                  );
                })}
                {visible.members.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No members.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
