import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Webhook, Send, RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown,
  Building2, Zap, Repeat, Sparkles, Trash2,
} from "lucide-react";

type Outcome = "success" | "failure" | "pending";
type Provider = "aisp" | "pisp" | "gocardless";

interface EventDef { id: string; label: string; outcome: Outcome; }

const EVENTS: Record<Provider, { name: string; icon: any; events: EventDef[] }> = {
  aisp: {
    name: "TrueLayer Open Banking (AISP)",
    icon: Building2,
    events: [
      { id: "connection.created",   label: "connection.created (consent granted)",      outcome: "success" },
      { id: "connection.refreshed", label: "connection.refreshed (token refreshed)",    outcome: "success" },
      { id: "consent.expired",      label: "consent.expired (90-day SCA expiry)",       outcome: "pending" },
      { id: "connection.revoked",   label: "connection.revoked (user withdrew consent)", outcome: "failure" },
    ],
  },
  pisp: {
    name: "TrueLayer Pay (PISP)",
    icon: Zap,
    events: [
      { id: "payment_authorization.required", label: "payment.authorization_required (awaiting SCA)", outcome: "pending" },
      { id: "payment_executed",     label: "payment.executed (settled at ASPSP)",       outcome: "success" },
      { id: "payment_failed",       label: "payment.failed (insufficient funds / rejected)", outcome: "failure" },
      { id: "payment_settled",      label: "payment.settled (Faster Payments confirmed)", outcome: "success" },
    ],
  },
  gocardless: {
    name: "GoCardless (Bacs Direct Debit)",
    icon: Repeat,
    events: [
      { id: "mandates.submitted",  label: "mandates.submitted (sent to bank)",          outcome: "pending" },
      { id: "mandates.active",     label: "mandates.active (mandate live)",             outcome: "success" },
      { id: "mandates.failed",     label: "mandates.failed (bank rejected)",            outcome: "failure" },
      { id: "mandates.cancelled",  label: "mandates.cancelled (customer cancelled)",    outcome: "failure" },
      { id: "payments.confirmed",  label: "payments.confirmed (collection successful)", outcome: "success" },
      { id: "payments.failed",     label: "payments.failed (Bacs reason code 1/2/3)",   outcome: "failure" },
    ],
  },
};

const STATUS_STYLE: Record<Outcome, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  failure: "bg-destructive/15 text-destructive",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const STORAGE_KEY = "webhook_sandbox_log_v1";

interface LoggedEvent {
  id: string;
  ts: string;
  provider: Provider;
  event: string;
  outcome: Outcome;
  target_id: string;
  target_label: string;
  payload: any;
}

const fakeSig = () => "v1=" + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join("");

export default function WebhookSandbox() {
  const [provider, setProvider] = useState<Provider>("aisp");
  const [aispRecords, setAispRecords] = useState<any[]>([]);
  const [pispRecords, setPispRecords] = useState<any[]>([]);
  const [ddRecords, setDdRecords] = useState<any[]>([]);
  const [targetId, setTargetId] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<LoggedEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });

  const persistLog = (next: LoggedEvent[]) => {
    setLog(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)));
  };

  const loadRecords = async () => {
    const [{ data: bc }, { data: pi }, { data: dd }] = await Promise.all([
      supabase.from("bank_connections").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_initiations").select("*").order("initiated_at", { ascending: false }),
      supabase.from("dd_mandates").select("*").order("created_at", { ascending: false }),
    ]);
    setAispRecords(bc || []); setPispRecords(pi || []); setDdRecords(dd || []);
  };
  useEffect(() => { loadRecords(); }, []);

  // Reset target when provider changes
  useEffect(() => {
    setTargetId("");
    setEventId("");
  }, [provider]);

  const targets = provider === "aisp" ? aispRecords.map(r => ({ id: r.id, label: `${r.bank_name} · ${r.status}` }))
                : provider === "pisp" ? pispRecords.map(r => ({ id: r.id, label: `£${Number(r.amount).toLocaleString()} · ${r.reference} · ${r.status}` }))
                : ddRecords.map(r => ({ id: r.id, label: `${r.reference || r.id.slice(0,8)} · £${Number(r.amount).toLocaleString()} ${r.frequency} · ${r.status}` }));

  const event = EVENTS[provider].events.find(e => e.id === eventId);

  const buildPayload = (target: any, ev: EventDef) => {
    const id = `evt_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const ts = new Date().toISOString();
    if (provider === "aisp" || provider === "pisp") {
      return {
        type: ev.id, id, created_at: ts,
        connection_id: provider === "aisp" ? target.id : undefined,
        payment_id: provider === "pisp" ? target.id : undefined,
        provider: "TrueLayer (mock)",
        result: ev.outcome,
        signature: fakeSig(),
        idempotency_key: crypto.randomUUID(),
        data: target,
      };
    }
    return {
      events: [{
        id, created_at: ts, action: ev.id.split(".")[1], resource_type: ev.id.split(".")[0],
        links: { mandate: target.id }, details: { origin: "bank", cause: ev.id, scheme: target.scheme || "bacs" },
      }],
      provider: "GoCardless (mock)", signature: fakeSig(), webhook_id: `wh_${crypto.randomUUID().slice(0, 8)}`,
    };
  };

  const applyEffect = async (target: any, ev: EventDef) => {
    if (provider === "aisp") {
      const next = ev.id === "connection.revoked" ? "revoked"
                 : ev.id === "consent.expired"    ? "expired"
                 : "active";
      await supabase.from("bank_connections").update({ status: next, last_synced_at: new Date().toISOString() }).eq("id", target.id);
    } else if (provider === "pisp") {
      const next = ev.id === "payment_failed" ? "failed"
                 : ev.id === "payment_authorization.required" ? "awaiting_sca"
                 : "settled";
      const settled = next === "settled" ? new Date().toISOString() : null;
      await supabase.from("payment_initiations").update({ status: next, settled_at: settled }).eq("id", target.id);
    } else {
      const map: Record<string, string> = {
        "mandates.submitted": "submitted",
        "mandates.active": "active",
        "mandates.failed": "failed",
        "mandates.cancelled": "cancelled",
        "payments.confirmed": "active",
        "payments.failed": "active",
      };
      const next = map[ev.id] || target.status;
      const update: any = { status: next };
      if (ev.id === "mandates.active") update.signed_at = new Date().toISOString();
      await supabase.from("dd_mandates").update(update).eq("id", target.id);
    }
  };

  const send = async (replayOf?: LoggedEvent) => {
    const ev = replayOf
      ? EVENTS[replayOf.provider].events.find(e => e.id === replayOf.event)!
      : event;
    const tId = replayOf ? replayOf.target_id : targetId;
    const prov = replayOf ? replayOf.provider : provider;
    if (!ev || !tId) { toast.error("Pick a target and an event"); return; }

    const records = prov === "aisp" ? aispRecords : prov === "pisp" ? pispRecords : ddRecords;
    const target = records.find((r: any) => r.id === tId);
    if (!target) { toast.error("Target not found — refresh"); return; }

    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    const payload = buildPayload(target, ev);
    await applyEffect(target, ev);

    const label = prov === "aisp" ? `${target.bank_name}`
                : prov === "pisp" ? `${target.reference}`
                : `${target.reference || target.id.slice(0,8)}`;

    const entry: LoggedEvent = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      provider: prov, event: ev.id, outcome: ev.outcome,
      target_id: tId, target_label: label, payload,
    };
    persistLog([entry, ...log]);
    toast.success(`Webhook ${ev.id} delivered`);
    setSending(false);
    loadRecords();
  };

  const clearLog = () => { persistLog([]); toast.info("Log cleared"); };

  const ProvIcon = EVENTS[provider].icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhook sandbox"
        description="Replay mock provider callbacks for AISP, PISP and GoCardless. Updates the underlying records as a real webhook would."
      />

      <Tabs value={provider} onValueChange={v => setProvider(v as Provider)}>
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="aisp"><Building2 className="w-4 h-4 mr-2" />AISP</TabsTrigger>
          <TabsTrigger value="pisp"><Zap className="w-4 h-4 mr-2" />PISP</TabsTrigger>
          <TabsTrigger value="gocardless"><Repeat className="w-4 h-4 mr-2" />GoCardless</TabsTrigger>
        </TabsList>

        {(["aisp","pisp","gocardless"] as Provider[]).map(p => (
          <TabsContent key={p} value={p}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ProvIcon className="w-5 h-5" /> {EVENTS[p].name}
                  <Badge variant="outline" className="gap-1 ml-2"><Sparkles className="w-3 h-3" />Mock</Badge>
                </CardTitle>
                <CardDescription>
                  Trigger a callback exactly as the provider would post to your webhook endpoint. The matching record is updated and the payload is logged below.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Target record</Label>
                  <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger><SelectValue placeholder="Pick a record…" /></SelectTrigger>
                    <SelectContent>
                      {targets.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                      {!targets.length && <div className="px-2 py-1.5 text-sm text-muted-foreground">No records — create one in Cash onboarding first</div>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Event</Label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger><SelectValue placeholder="Pick an event…" /></SelectTrigger>
                    <SelectContent>
                      {EVENTS[p].events.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          <span className="inline-flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${e.outcome === "success" ? "bg-emerald-500" : e.outcome === "failure" ? "bg-destructive" : "bg-amber-500"}`} />
                            {e.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={loadRecords}><RefreshCw className="w-4 h-4 mr-2" />Refresh records</Button>
                  <Button onClick={() => send()} disabled={sending || !targetId || !eventId}>
                    {sending ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Delivering…</> : <><Send className="w-4 h-4 mr-2" />Send webhook</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5" />Event log</CardTitle>
            <CardDescription>Latest 50 deliveries · stored locally for replay.</CardDescription>
          </div>
          {log.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearLog}><Trash2 className="w-4 h-4 mr-2" />Clear</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {!log.length && <div className="text-sm text-muted-foreground py-8 text-center">No webhooks delivered yet. Pick a record and event above and hit <strong>Send webhook</strong>.</div>}
          {log.map(e => {
            const Icon = e.outcome === "success" ? CheckCircle2 : e.outcome === "failure" ? XCircle : Clock;
            return (
              <Collapsible key={e.id} className="border rounded-lg">
                <div className="flex items-center justify-between p-3">
                  <CollapsibleTrigger className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${e.outcome === "success" ? "text-emerald-600" : e.outcome === "failure" ? "text-destructive" : "text-amber-600"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs">{e.event}</span>
                        <Badge variant="outline" className="text-xs">{e.provider.toUpperCase()}</Badge>
                        <Badge className={`text-xs ${STATUS_STYLE[e.outcome]}`}>{e.outcome}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {e.target_label} · {new Date(e.ts).toLocaleString()}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <Button size="sm" variant="ghost" className="ml-2" onClick={() => send(e)}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Replay
                  </Button>
                </div>
                <CollapsibleContent>
                  <pre className="text-xs bg-muted/40 border-t p-3 overflow-x-auto">{JSON.stringify(e.payload, null, 2)}</pre>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
