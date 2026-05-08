import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Bell, Mail, MessageSquare, CheckCircle2, AlertTriangle, XCircle, Info,
  ChevronDown, CheckCheck, Trash2, Sparkles,
} from "lucide-react";

type Channel = "inapp" | "email" | "sms";

interface Notification {
  id: string;
  channel: Channel;
  event_type: string;
  title: string;
  body: string;
  severity: "info" | "success" | "warning" | "error";
  recipient: string | null;
  status: string;
  metadata: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

const SEV: Record<Notification["severity"], { icon: any; tone: string; chip: string }> = {
  success: { icon: CheckCircle2,   tone: "text-emerald-600", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  warning: { icon: AlertTriangle,  tone: "text-amber-600",   chip: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  error:   { icon: XCircle,        tone: "text-destructive", chip: "bg-destructive/15 text-destructive" },
  info:    { icon: Info,           tone: "text-blue-600",    chip: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
};

export default function NotificationsCenter() {
  const [items, setItems] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"all" | Channel>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setItems((data as Notification[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("notifications-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(
    () => tab === "all" ? items : items.filter(n => n.channel === tab),
    [items, tab],
  );
  const unread = items.filter(n => n.channel === "inapp" && !n.read_at).length;

  const markAllRead = async () => {
    const ids = items.filter(n => n.channel === "inapp" && !n.read_at).map(n => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString(), status: "read" }).in("id", ids);
    toast.success(`Marked ${ids.length} notification${ids.length === 1 ? "" : "s"} as read`);
    load();
  };

  const clearAll = async () => {
    if (!items.length) return;
    if (!confirm("Clear all notifications? This cannot be undone.")) return;
    await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    toast.info("Notifications cleared");
    load();
  };

  const counts = {
    all: items.length,
    inapp: items.filter(n => n.channel === "inapp").length,
    email: items.filter(n => n.channel === "email").length,
    sms: items.filter(n => n.channel === "sms").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Every consent, mandate and KYC decision triggers an in-app alert plus a mocked email and SMS preview."
      />

      <Card>
        <CardContent className="pt-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{unread} unread in-app · {items.length} total</div>
              <div className="text-xs text-muted-foreground">Live updates via realtime · email & SMS are mocked previews</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={markAllRead} disabled={unread === 0}>
              <CheckCheck className="w-4 h-4 mr-2" />Mark all read
            </Button>
            <Button size="sm" variant="ghost" onClick={clearAll} disabled={!items.length}>
              <Trash2 className="w-4 h-4 mr-2" />Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all"><Bell className="w-4 h-4 mr-2" />All ({counts.all})</TabsTrigger>
          <TabsTrigger value="inapp"><Bell className="w-4 h-4 mr-2" />In-app ({counts.inapp})</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email ({counts.email})</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-2" />SMS ({counts.sms})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-2 mt-4">
          {loading && <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>}
          {!loading && !filtered.length && (
            <Card><CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
              Nothing to show yet. Trigger an action — link a bank, sign a Direct Debit, or run KYC — and notifications will appear here in real time.
            </CardContent></Card>
          )}
          {filtered.map(n => <NotificationRow key={n.id} n={n} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationRow({ n }: { n: Notification }) {
  const sev = SEV[n.severity];
  const Icon = sev.icon;
  const isMock = n.channel !== "inapp";

  return (
    <Collapsible className={`border rounded-lg ${n.channel === "inapp" && !n.read_at ? "bg-primary/[0.03] border-primary/30" : ""}`}>
      <div className="flex items-start gap-3 p-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${sev.tone}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{n.title}</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              {n.channel === "inapp" ? "In-app" : n.channel === "email" ? "Email" : "SMS"}
            </Badge>
            <Badge className={`text-[10px] ${sev.chip}`}>{n.severity}</Badge>
            {isMock && <Badge variant="outline" className="text-[10px] gap-1"><Sparkles className="w-2.5 h-2.5" />Mock</Badge>}
            {n.channel === "inapp" && !n.read_at && <Badge className="text-[10px] bg-primary text-primary-foreground">New</Badge>}
          </div>
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.body}</div>
          <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
            <span>{new Date(n.created_at).toLocaleString()}</span>
            {n.recipient && <><span>·</span><span className="font-mono">{n.recipient}</span></>}
            <span>·</span><span>{n.event_type}</span>
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="ghost"><ChevronDown className="w-4 h-4" /></Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="border-t bg-muted/30 p-3">
          {n.channel === "email" && <EmailPreview n={n} />}
          {n.channel === "sms"   && <SmsPreview n={n} />}
          {n.channel === "inapp" && (
            <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{n.body}</pre>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function EmailPreview({ n }: { n: Notification }) {
  return (
    <div className="bg-background border rounded-md max-w-2xl mx-auto overflow-hidden">
      <div className="border-b px-4 py-2 text-xs text-muted-foreground space-y-0.5 bg-muted/50">
        <div><span className="font-medium text-foreground">From:</span> Pension Navigator &lt;notify@airgead.example&gt;</div>
        <div><span className="font-medium text-foreground">To:</span> {n.recipient}</div>
        <div><span className="font-medium text-foreground">Subject:</span> {n.title}</div>
      </div>
      <div className="p-6 space-y-4">
        <div className="text-xs text-muted-foreground">PENSION NAVIGATOR BY AIRGEAD</div>
        <h2 className="text-xl font-semibold">{n.title}</h2>
        <p className="text-sm leading-relaxed">{n.body}</p>
        <div className="pt-2">
          <Button size="sm">Open dashboard</Button>
        </div>
        <div className="text-xs text-muted-foreground pt-4 border-t">
          You're receiving this because you have a Pension Navigator account. This is a mocked email preview — no email was actually sent.
        </div>
      </div>
    </div>
  );
}

function SmsPreview({ n }: { n: Notification }) {
  return (
    <div className="max-w-xs mx-auto">
      <div className="text-xs text-muted-foreground text-center mb-2">{n.recipient}</div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
        <div className="text-xs text-muted-foreground mb-0.5">Airgead</div>
        {n.body}
      </div>
      <div className="text-[10px] text-muted-foreground text-center mt-1">{new Date(n.created_at).toLocaleTimeString()}</div>
    </div>
  );
}
