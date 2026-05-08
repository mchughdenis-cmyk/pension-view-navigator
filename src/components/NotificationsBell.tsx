import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/contexts/RoleContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  client_id: string;
  title: string;
  body: string;
  category: string | null;
  read_at: string | null;
  sent_at: string;
  source: "push" | "message";
}

export function NotificationsBell() {
  const { role } = useRole();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [{ data: pushes }, { data: msgs }] = await Promise.all([
      supabase.from("push_notifications")
        .select("id, client_id, title, body, category, read_at, sent_at")
        .order("sent_at", { ascending: false }).limit(20),
      supabase.from("secure_messages")
        .select("id, client_id, subject, body, read_at, created_at")
        .order("created_at", { ascending: false }).limit(20),
    ]);
    const merged: Notification[] = [
      ...((pushes ?? []) as any[]).map((p): Notification => ({ ...p, source: "push" })),
      ...((msgs ?? []) as any[]).map((m): Notification => ({
        id: m.id, client_id: m.client_id, title: m.subject || "New message",
        body: m.body, category: "message", read_at: m.read_at, sent_at: m.created_at,
        source: "message",
      })),
    ].sort((a, b) => +new Date(b.sent_at) - +new Date(a.sent_at)).slice(0, 30);
    setItems(merged);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("notifications-stream")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "push_notifications" },
        (p) => {
          const n = p.new as any;
          setItems((prev) => [{ ...n, source: "push" }, ...prev].slice(0, 30));
          toast({ title: n.title, description: n.body });
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "secure_messages" },
        (p) => {
          const m = p.new as any;
          setItems((prev) => [{
            id: m.id, client_id: m.client_id, title: m.subject || "New message",
            body: m.body, category: "message", read_at: m.read_at, sent_at: m.created_at,
            source: "message",
          }, ...prev].slice(0, 30));
          toast({ title: "New message", description: m.subject || m.body.slice(0, 60) });
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [role]);

  const unread = items.filter(i => !i.read_at).length;

  const markAllRead = async () => {
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from("push_notifications").update({ read_at: now }).is("read_at", null),
      supabase.from("secure_messages").update({ read_at: now }).is("read_at", null),
    ]);
    setItems(prev => prev.map(i => ({ ...i, read_at: i.read_at ?? now })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-medium">Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={`${n.source}-${n.id}`} className={`p-3 ${!n.read_at ? "bg-muted/40" : ""}`}>
                  <div className="flex items-start gap-2">
                    {n.source === "message" ? (
                      <MessageSquare className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    ) : (
                      <Bell className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {!n.read_at && <Badge variant="default" className="h-4 text-[10px]">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.sent_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
