import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import { ShieldAlert, HeartHandshake } from "lucide-react";

type Client = { id: string; first_name: string; last_name: string };

const DRIVERS = [
  { key: "health", label: "Health (physical, mental, cognitive)" },
  { key: "life_event", label: "Life event (bereavement, divorce, redundancy)" },
  { key: "resilience", label: "Resilience (low savings, debt, low income)" },
  { key: "capability", label: "Capability (financial / digital literacy)" },
];

const ADJUSTMENTS = [
  "Larger font / plain English documents",
  "Trusted contact authorised",
  "Allow extra time / cooling-off",
  "Phone over digital where possible",
  "Annual welfare check call",
  "Joint meetings with family member",
  "Cognitive assessment requested",
];

export default function VulnerableClientRegister() {
  const { firmId } = useFirm();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [drivers, setDrivers] = useState<string[]>([]);
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const [trustedContact, setTrustedContact] = useState("");
  const [reviewDate, setReviewDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      let q = supabase.from("clients").select("id, first_name, last_name").eq("status", "active").order("last_name");
      if (firmId) q = q.eq("firm_id", firmId);
      const { data } = await q;
      setClients((data as Client[]) ?? []);
    })();
  }, [firmId]);

  const toggle = (list: string[], setList: (v: string[]) => void, key: string) =>
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  const riskBadge = useMemo(() => ({
    low: "secondary",
    medium: "default",
    high: "destructive",
  } as const)[risk], [risk]);

  const save = async () => {
    if (!clientId) { toast.error("Select a client"); return; }
    if (drivers.length === 0) { toast.error("Select at least one driver of vulnerability"); return; }
    setBusy(true);
    try {
      await supabase.from("activity_log").insert({
        action: "vulnerable_client_flagged",
        description: `Vulnerable client review (${risk} risk, ${drivers.length} drivers)`,
        entity_type: "vulnerability_record",
        entity_id: clientId,
        new_values: { drivers, adjustments, trusted_contact: trustedContact, review_date: reviewDate, notes, risk } as any,
      });
      toast.success("Vulnerability record saved", { description: "Logged under Consumer Duty obligations." });
    } catch (e: any) {
      toast.error("Could not save", { description: e?.message ?? "Try again." });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Vulnerable client register"
        description="FCA Consumer Duty (PRIN 12) requires firms to identify and respond to characteristics of vulnerability. Record drivers, adjustments, and review dates."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartHandshake className="h-4 w-4" /> Client & assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Choose a client…" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Overall risk level</Label>
              <Select value={risk} onValueChange={(v: any) => setRisk(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — monitor</SelectItem>
                  <SelectItem value="medium">Medium — adjustments in place</SelectItem>
                  <SelectItem value="high">High — enhanced support required</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={riskBadge} className="mt-2">{risk.toUpperCase()}</Badge>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Drivers of vulnerability</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {DRIVERS.map((d) => (
                <label key={d.key} className="flex items-center gap-2 text-sm border rounded-lg p-2 cursor-pointer hover:bg-muted/30">
                  <input type="checkbox" checked={drivers.includes(d.key)} onChange={() => toggle(drivers, setDrivers, d.key)} />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Reasonable adjustments</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {ADJUSTMENTS.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm border rounded-lg p-2 cursor-pointer hover:bg-muted/30">
                  <input type="checkbox" checked={adjustments.includes(a)} onChange={() => toggle(adjustments, setAdjustments, a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Trusted contact (optional)</Label>
              <Input value={trustedContact} onChange={(e) => setTrustedContact(e.target.value)} placeholder="Name & relationship" />
            </div>
            <div>
              <Label>Next review date</Label>
              <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Notes (private — adviser file)</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Background, key contacts, sensitivities…" />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>Handled with extra confidentiality. Review at least every 12 months or after any material change. Aligns with FG21/1 and Consumer Duty good outcomes monitoring.</p>
          </div>

          <Button onClick={save} disabled={busy}>Save vulnerability record</Button>
        </CardContent>
      </Card>
    </div>
  );
}
