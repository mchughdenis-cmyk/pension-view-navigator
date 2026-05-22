// MP.4 — Cross-portal notification routing rules engine
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Play } from "lucide-react";
import { toast } from "sonner";

type Role = "consumer" | "adviser" | "employer" | "admin";
interface Rule { id: string; trigger: string; recipients: Role[]; active: boolean; }

const DEFAULTS: Rule[] = [
  { id: "1", trigger: "contribution_missed", recipients: ["consumer", "employer"], active: true },
  { id: "2", trigger: "annual_allowance_warning", recipients: ["consumer", "adviser"], active: true },
  { id: "3", trigger: "annual_allowance_critical", recipients: ["consumer", "adviser", "admin"], active: true },
  { id: "4", trigger: "transfer_complete", recipients: ["consumer", "adviser"], active: true },
  { id: "5", trigger: "kyc_failed", recipients: ["consumer", "admin"], active: true },
  { id: "6", trigger: "health_score_drop", recipients: ["consumer", "adviser"], active: true },
  { id: "7", trigger: "document_expiry_30days", recipients: ["consumer", "adviser", "admin"], active: true },
  { id: "8", trigger: "drawdown_depletion_warning", recipients: ["consumer", "adviser"], active: true },
  { id: "9", trigger: "employer_match_unclaimed", recipients: ["consumer", "employer"], active: true },
];

const ALL_ROLES: Role[] = ["consumer", "adviser", "employer", "admin"];
const LS = "airgead.notif.routing.rules";

export default function NotificationRoutingRules() {
  const [rules, setRules] = useState<Rule[]>(DEFAULTS);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(LS);
    if (raw) try { setRules(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem(LS, JSON.stringify(rules)); }, [rules]);

  const toggleRecipient = (id: string, r: Role) => {
    setRules((rs) => rs.map((x) => x.id === id ? {
      ...x,
      recipients: x.recipients.includes(r) ? x.recipients.filter((y) => y !== r) : [...x.recipients, r],
    } : x));
  };

  const test = (rule: Rule) => {
    const ts = new Date().toLocaleTimeString("en-GB");
    const lines = rule.recipients.map((r) => `[${ts}] ${rule.trigger} → routed to ${r}`);
    setLog((l) => [...lines, ...l].slice(0, 30));
    toast.success(`Simulated routing to ${rule.recipients.length} recipient(s)`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Network className="h-7 w-7 text-primary" /> Notification routing
        </h1>
        <p className="text-sm text-muted-foreground">Decide which portals receive each alert type. Changes apply immediately.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Routing rules</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trigger</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-20">Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.trigger}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ALL_ROLES.map((role) => (
                        <Badge
                          key={role}
                          variant={r.recipients.includes(role) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => toggleRecipient(r.id, role)}
                        >{role}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={r.active} onCheckedChange={(v) => setRules((rs) => rs.map((x) => x.id === r.id ? { ...x, active: v } : x))} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => test(r)}><Play className="h-3 w-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {log.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Routing log</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-64 overflow-auto">{log.join("\n")}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
