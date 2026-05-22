import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import { Heart, Plus, Trash2, ShieldAlert } from "lucide-react";

type Client = { id: string; first_name: string; last_name: string };
type Nominee = { id: string; name: string; relationship: string; share: number; dob?: string; address?: string };

const RELATIONSHIPS = ["Spouse", "Civil partner", "Child", "Grandchild", "Parent", "Sibling", "Charity", "Trust", "Other"];

export default function BeneficiaryNominations() {
  const { firmId } = useFirm();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      let q = supabase.from("clients").select("id, first_name, last_name").eq("status", "active").order("last_name");
      if (firmId) q = q.eq("firm_id", firmId);
      const { data } = await q;
      setClients((data as Client[]) ?? []);
    })();
  }, [firmId]);

  const addNominee = () => {
    setNominees((prev) => [...prev, { id: crypto.randomUUID(), name: "", relationship: "Spouse", share: 0 }]);
  };
  const removeNominee = (id: string) => setNominees((prev) => prev.filter((n) => n.id !== id));
  const update = (id: string, patch: Partial<Nominee>) =>
    setNominees((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const totalShare = nominees.reduce((s, n) => s + (Number(n.share) || 0), 0);
  const balanced = totalShare === 100;

  const save = async () => {
    if (!clientId) { toast.error("Select a client"); return; }
    if (!balanced) { toast.error("Shares must total 100%"); return; }
    if (nominees.some((n) => !n.name.trim())) { toast.error("All nominees need a name"); return; }
    setBusy(true);
    try {
      await supabase.from("activity_log").insert({
        action: "expression_of_wish_updated",
        description: `Expression of Wish updated (${nominees.length} nominees)`,
        entity_type: "beneficiary_nomination",
        entity_id: clientId,
        new_values: { nominees, total_share: totalShare } as any,
      });
      toast.success("Expression of Wish recorded", { description: "Nominations saved to the client file." });
    } catch (e: any) {
      toast.error("Could not save", { description: e?.message ?? "Try again." });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Beneficiary nominations"
        description="Expression of Wish for SIPP death benefits. Non-binding but guides the scheme administrator's discretion — keeps benefits outside the estate for IHT."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-4 w-4" /> Client</CardTitle>
          <CardDescription>Select a client to view or update their nominations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Choose a client…" /></SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {clientId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nominees</CardTitle>
                <CardDescription>Total share must equal 100%.</CardDescription>
              </div>
              <Badge variant={balanced ? "default" : "destructive"}>{totalShare}% allocated</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {nominees.length === 0 && (
              <p className="text-sm text-muted-foreground">No nominees yet. Add one to begin.</p>
            )}
            {nominees.map((n) => (
              <div key={n.id} className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,auto] items-end border rounded-lg p-3">
                <div>
                  <Label className="text-xs">Full name</Label>
                  <Input value={n.name} onChange={(e) => update(n.id, { name: e.target.value })} placeholder="e.g. Jane Smith" />
                </div>
                <div>
                  <Label className="text-xs">Relationship</Label>
                  <Select value={n.relationship} onValueChange={(v) => update(n.id, { relationship: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Share %</Label>
                  <Input type="number" min={0} max={100} value={n.share}
                    onChange={(e) => update(n.id, { share: Number(e.target.value) })} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeNominee(n.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={addNominee}><Plus className="h-4 w-4 mr-2" /> Add nominee</Button>
              <Button onClick={save} disabled={busy || !balanced || nominees.length === 0}>Save Expression of Wish</Button>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs flex gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p>An Expression of Wish is not binding on the scheme administrator but is heavily relied upon. Review after any major life event (marriage, divorce, birth, bereavement) and at least every 2 years.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
