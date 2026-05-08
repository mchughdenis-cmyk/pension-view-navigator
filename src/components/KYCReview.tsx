import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, FileText, AlertTriangle, CheckCircle2, XCircle, Eye, Search } from "lucide-react";
import { toast } from "sonner";

interface KycCase { id: string; client_id: string; provider: string; provider_ref: string|null; status: string; risk_level: string; risk_score: number; reviewer: string|null; started_at: string|null; completed_at: string|null; }
interface KycCheck { id: string; case_id: string; check_type: string; provider: string; decision: string; score: number|null; details: any; ran_at: string; }
interface KycDoc { id: string; case_id: string; doc_type: string; file_name: string; status: string; extracted: any; uploaded_at: string; }

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  rejected: "bg-destructive/15 text-destructive",
  not_started: "bg-muted text-muted-foreground",
};

export default function KYCReview() {
  const [cases, setCases] = useState<KycCase[]>([]);
  const [docs, setDocs] = useState<Record<string, KycDoc[]>>({});
  const [checks, setChecks] = useState<Record<string, KycCheck[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    const { data: cs } = await supabase.from("kyc_cases").select("*").order("started_at", { ascending: false });
    const { data: dd } = await supabase.from("kyc_documents").select("*");
    const { data: ck } = await supabase.from("kyc_checks").select("*");
    setCases((cs as KycCase[]) || []);
    const docsBy: Record<string, KycDoc[]> = {}; (dd as KycDoc[] || []).forEach(d => { (docsBy[d.case_id] ??= []).push(d); }); setDocs(docsBy);
    const checksBy: Record<string, KycCheck[]> = {}; (ck as KycCheck[] || []).forEach(c => { (checksBy[c.case_id] ??= []).push(c); }); setChecks(checksBy);
    if (cs && cs.length && !selected) setSelected(cs[0].id);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, status: "verified" | "rejected") => {
    await supabase.from("kyc_cases").update({
      status, decision_reason: reason || null, reviewer: "Demo Reviewer", completed_at: new Date().toISOString(),
    }).eq("id", id);
    toast.success(`Case ${status}`);
    setReason("");
    load();
  };

  const summary = {
    total: cases.length,
    review: cases.filter(c => c.status === "review").length,
    verified: cases.filter(c => c.status === "verified").length,
    inprog: cases.filter(c => c.status === "in_progress").length,
  };

  const sel = cases.find(c => c.id === selected);
  const selChecks = sel ? checks[sel.id] || [] : [];
  const selDocs = sel ? docs[sel.id] || [] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC review queue"
        description="Adviser & compliance review of identity verification cases. Mock providers: Onfido, ComplyAdvantage, GBG."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { k: "Total cases", v: summary.total, c: "text-foreground" },
          { k: "Awaiting review", v: summary.review, c: "text-amber-600" },
          { k: "Verified", v: summary.verified, c: "text-emerald-600" },
          { k: "In progress", v: summary.inprog, c: "text-blue-600" },
        ].map(t => (
          <Card key={t.k}><CardContent className="pt-6"><div className="text-sm text-muted-foreground">{t.k}</div><div className={`text-3xl font-bold ${t.c}`}>{t.v}</div></CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[380px,1fr] gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Cases</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {cases.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition ${selected === c.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-mono text-xs text-muted-foreground">{c.provider_ref}</div>
                  <Badge className={STATUS_STYLES[c.status] || ""}>{c.status}</Badge>
                </div>
                <div className="text-sm font-medium">Client {c.client_id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <span>Risk {c.risk_score}</span>·<span className="capitalize">{c.risk_level}</span>·<span>{c.provider}</span>
                </div>
              </button>
            ))}
            {!cases.length && <div className="text-sm text-muted-foreground p-4 text-center">No cases</div>}
          </CardContent>
        </Card>

        {sel && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Case {sel.provider_ref}</CardTitle>
                  <CardDescription>{sel.provider} · started {sel.started_at ? new Date(sel.started_at).toLocaleString() : "—"}</CardDescription>
                </div>
                <Badge className={STATUS_STYLES[sel.status]}>{sel.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="checks">
                <TabsList>
                  <TabsTrigger value="checks">Checks ({selChecks.length})</TabsTrigger>
                  <TabsTrigger value="docs">Documents ({selDocs.length})</TabsTrigger>
                  <TabsTrigger value="action">Decision</TabsTrigger>
                </TabsList>

                <TabsContent value="checks" className="space-y-2 mt-4">
                  {selChecks.map(c => (
                    <div key={c.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium capitalize">{c.check_type.replace("_", " ")}</span>
                          <span className="text-xs text-muted-foreground">· {c.provider}</span>
                        </div>
                        <Badge className={c.decision === "pass" || c.decision === "clear" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : c.decision === "review" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-destructive/15 text-destructive"}>
                          {c.decision} {c.score != null && `(${c.score})`}
                        </Badge>
                      </div>
                      {c.details && (
                        <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto mt-2">{JSON.stringify(c.details, null, 2)}</pre>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="docs" className="space-y-2 mt-4">
                  {selDocs.map(d => (
                    <div key={d.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium capitalize">{d.doc_type.replace("_", " ")}</div>
                            <div className="text-xs text-muted-foreground">{d.file_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={d.status === "accepted" ? "default" : "secondary"}>{d.status}</Badge>
                          <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      {d.extracted && <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto mt-2">{JSON.stringify(d.extracted, null, 2)}</pre>}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="action" className="space-y-3 mt-4">
                  {sel.status === "review" && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="text-sm">PEP near-match flagged by ComplyAdvantage. Review match details and confirm.</div>
                    </div>
                  )}
                  <Textarea placeholder="Decision reason / reviewer notes…" value={reason} onChange={e => setReason(e.target.value)} rows={4} />
                  <div className="flex gap-2">
                    <Button onClick={() => decide(sel.id, "verified")} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />Approve
                    </Button>
                    <Button onClick={() => decide(sel.id, "rejected")} variant="destructive">
                      <XCircle className="w-4 h-4 mr-2" />Reject
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
