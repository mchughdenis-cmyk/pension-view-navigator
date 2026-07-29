import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type Flag = { id: string; flag_key: string; enabled: boolean };
const DEFAULT_FLAGS = [
  "payments_hub", "general_ledger", "case_workbench", "expected_receipts",
  "secure_messaging", "public_api", "monte_carlo", "corporate_actions",
  "consolidated_tax_certificate", "psig_scam_workflow",
];

export default function FeatureFlags() {
  const [rows, setRows] = useState<Flag[]>([]);
  const [newKey, setNewKey] = useState("");

  const load = async () => {
    const { data } = await supabase.from("feature_flags").select("*").order("flag_key");
    setRows((data as Flag[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (f: Flag) => {
    await supabase.from("feature_flags").update({ enabled: !f.enabled }).eq("id", f.id);
    load();
  };

  const seed = async () => {
    for (const k of DEFAULT_FLAGS) {
      await supabase.from("feature_flags").upsert({ flag_key: k, enabled: true }, { onConflict: "tenant_id,flag_key" });
    }
    toast({ title: "Default flags seeded" });
    load();
  };

  const add = async () => {
    if (!newKey) return;
    await supabase.from("feature_flags").insert({ flag_key: newKey, enabled: true });
    setNewKey("");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-sm text-muted-foreground">Toggle modules per tenant — supports white-label deployments as a copyable product.</p>
        </div>
        <Button variant="outline" onClick={seed}>Seed defaults</Button>
      </header>
      <div className="flex gap-2">
        <Input placeholder="new_flag_key" value={newKey} onChange={e => setNewKey(e.target.value)} className="max-w-xs" />
        <Button onClick={add}>Add flag</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map(f => (
          <Card key={f.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <div className="font-mono text-sm">{f.flag_key}</div>
                <div className="text-xs text-muted-foreground">{f.enabled ? "Enabled" : "Disabled"}</div>
              </div>
              <Switch checked={f.enabled} onCheckedChange={() => toggle(f)} />
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No flags yet — click "Seed defaults".</p>}
      </div>
    </div>
  );
}
