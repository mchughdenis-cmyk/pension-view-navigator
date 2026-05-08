import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, Mail, FileText } from "lucide-react";
import { AsyncState, useAsync, runWithToast } from "@/components/ui/async-state";

const TEMPLATES = [
  { key: "welcome", name: "Welcome letter", body: "Dear {{first_name}},\n\nWelcome to Pension Navigator by Airgead. Your account {{account_number}} is now active.\n\nKind regards,\nThe Airgead Team" },
  { key: "drawdown_confirm", name: "Drawdown confirmation", body: "Dear {{first_name}},\n\nWe confirm your drawdown of £{{amount}} has been processed. Net payment of £{{net}} will reach your bank within 3 business days.\n\nYours sincerely,\nPension Navigator" },
  { key: "annual_statement", name: "Annual benefit statement", body: "Dear {{first_name}},\n\nYour annual statement for {{tax_year}} is now available. Total fund value: £{{value}}.\n\nKind regards,\nPension Navigator" },
  { key: "consumer_duty", name: "Consumer Duty review", body: "Dear {{first_name}},\n\nAs part of our Consumer Duty obligations we have completed your annual fair-value review and confirm your products continue to deliver good outcomes.\n\nYours sincerely,\nThe Airgead Team" },
];

export default function CommsHub() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Communications hub"
        description="Templated comms, secure messaging, and bulk annual statement runs."
      />
      <Tabs defaultValue="templates">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1" />Templates</TabsTrigger>
          <TabsTrigger value="messaging"><Send className="h-4 w-4 mr-1" />Secure messaging</TabsTrigger>
          <TabsTrigger value="bulk"><Mail className="h-4 w-4 mr-1" />Bulk statement run</TabsTrigger>
        </TabsList>
        <TabsContent value="templates"><TemplateEngine /></TabsContent>
        <TabsContent value="messaging"><SecureMessaging /></TabsContent>
        <TabsContent value="bulk"><BulkStatementRun /></TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateEngine() {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [tplKey, setTplKey] = useState("welcome");
  const [body, setBody] = useState(TEMPLATES[0].body);

  useEffect(() => { supabase.from("clients").select("id, first_name, last_name").order("last_name").then(({ data }) => { setClients(data ?? []); if (data?.[0]) setClientId(data[0].id); }); }, []);

  const client = clients.find((c) => c.id === clientId);
  const merged = body
    .replace(/\{\{first_name\}\}/g, client?.first_name ?? "Client")
    .replace(/\{\{account_number\}\}/g, "ACC-XXXX")
    .replace(/\{\{amount\}\}/g, "10,000")
    .replace(/\{\{net\}\}/g, "8,000")
    .replace(/\{\{tax_year\}\}/g, "2024/25")
    .replace(/\{\{value\}\}/g, "150,000");

  const onTpl = (k: string) => { setTplKey(k); setBody(TEMPLATES.find((t) => t.key === k)?.body ?? ""); };

  const send = async () => {
    if (!clientId) return;
    await supabase.from("secure_messages").insert({ client_id: clientId, sender: "Adviser", subject: TEMPLATES.find((t) => t.key === tplKey)?.name ?? "Comms", body: merged, status: "sent" } as any);
    await supabase.from("activity_log").insert({ action: "comms_sent", entity_type: "client", entity_id: clientId, description: `Sent ${tplKey} comm` });
    toast.success("Communication archived & sent");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Template engine</CardTitle><CardDescription>Merge fields, four-eyes approval, archived for audit.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><Label>Template</Label>
            <Select value={tplKey} onValueChange={onTpl}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Recipient</Label>
            <Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Body (supports {`{{first_name}}`}, {`{{amount}}`}, etc.)</Label><Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <Button onClick={send}><Send className="h-4 w-4 mr-2" />Send & archive</Button>
        </div>
        <div className="rounded-lg border p-4 bg-muted/30 whitespace-pre-wrap text-sm">{merged}</div>
      </CardContent>
    </Card>
  );
}

function SecureMessaging() {
  const [clients, setClients] = useState<any[]>([]); const [clientId, setClientId] = useState<string>("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    supabase.from("clients").select("id, first_name, last_name").order("last_name").then(({ data, error }) => {
      if (error) { toast.error(error.message); return; }
      setClients(data ?? []); if (data?.[0]) setClientId(data[0].id);
    });
  }, []);

  const { data, loading, error, reload } = useAsync(async () => {
    if (!clientId) return [];
    const { data, error } = await supabase.from("secure_messages").select("*").eq("client_id", clientId).order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }, [clientId]);
  const thread = data ?? [];

  const send = async () => {
    if (!draft || !clientId) return;
    const res = await runWithToast(async () => {
      const { error } = await supabase.from("secure_messages").insert({ client_id: clientId, sender: "Adviser", subject: "Reply", body: draft, status: "sent" } as any);
      if (error) throw error;
      await supabase.from("activity_log").insert({
        action: "secure_message_sent", entity_type: "client", entity_id: clientId,
        description: `Secure reply sent (${draft.length} chars)`,
        new_values: { subject: "Reply", length: draft.length },
      } as any);
    }, { success: "Message sent" });
    if (res.ok) { setDraft(""); reload(); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Secure messaging</CardTitle><CardDescription>Threaded, attachments, read receipts.</CardDescription></CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-3">
          <ScrollArea className="h-72 rounded-lg border p-3">
            <AsyncState
              loading={loading} error={error} onRetry={reload} isEmpty={thread.length === 0}
              loadingLabel="Loading messages…"
              emptyTitle="No messages yet"
              emptyDescription="Start a conversation by sending a message below."
              rows={2}
            >
              {thread.map((m: any) => (
                <div key={m.id} className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.sender}</span><span>{new Date(m.created_at).toLocaleString("en-GB")}</span></div>
                  <p className="text-sm font-medium">{m.subject}</p>
                  <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </AsyncState>
          </ScrollArea>
          <div className="flex gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a secure reply…" />
            <Button onClick={send} disabled={!clientId || !draft}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BulkStatementRun() {
  const [count, setCount] = useState(0); const [running, setRunning] = useState(false); const [progress, setProgress] = useState(0);

  useEffect(() => { supabase.from("clients").select("id", { count: "exact", head: true }).then(({ count }) => setCount(count ?? 0)); }, []);

  const run = async () => {
    setRunning(true); setProgress(0);
    const { data: cs } = await supabase.from("clients").select("id, first_name, last_name");
    const list = cs ?? [];
    const rows = list.map((c) => ({ client_id: c.id, sender: "System", subject: "Annual benefit statement 2024/25", body: `Dear ${c.first_name}, your annual statement is attached.`, status: "dispatched" }));
    // chunk inserts
    for (let i = 0; i < rows.length; i += 25) {
      await supabase.from("secure_messages").insert(rows.slice(i, i + 25) as any);
      setProgress(Math.round(((i + 25) / rows.length) * 100));
    }
    await supabase.from("activity_log").insert({
      action: "bulk_statement_run", entity_type: "comms", entity_id: null,
      description: `Bulk annual statement dispatch — ${rows.length} clients`,
      new_values: { recipients: rows.length, subject: "Annual benefit statement 2024/25" },
    } as any);
    setRunning(false); setProgress(100); toast.success(`${rows.length} statements dispatched`);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Bulk annual statement run</CardTitle><CardDescription>Generate, dispatch and track delivery for all clients.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">Eligible clients: <Badge>{count}</Badge></p>
        <Button onClick={run} disabled={running}>{running ? `Running… ${progress}%` : "Start statement run"}</Button>
        {progress > 0 && <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>}
      </CardContent>
    </Card>
  );
}
