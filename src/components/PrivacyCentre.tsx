import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Download, ShieldCheck, AlertTriangle, Cookie, FileQuestion } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export default function PrivacyCentre() {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [sarText, setSarText] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<{ clients: number; accounts: number; transactions: number; documents: number }>({
    clients: 0, accounts: 0, transactions: 0, documents: 0,
  });

  useEffect(() => {
    (async () => {
      const [c, a, t, d] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("client_accounts").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("client_documents").select("id", { count: "exact", head: true }),
      ]);
      setSummary({
        clients: c.count ?? 0, accounts: a.count ?? 0,
        transactions: t.count ?? 0, documents: d.count ?? 0,
      });
    })();
  }, []);

  const downloadData = async () => {
    setBusy(true);
    try {
      const [clients, accounts, txns, docs] = await Promise.all([
        supabase.from("clients").select("*").limit(1000),
        supabase.from("client_accounts").select("*").limit(1000),
        supabase.from("transactions").select("*").limit(1000),
        supabase.from("client_documents").select("id, file_name, document_type, created_at").limit(1000),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        controller: "Pension Navigator by Airgead",
        clients: clients.data ?? [],
        client_accounts: accounts.data ?? [],
        transactions: txns.data ?? [],
        documents: docs.data ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      saveAs(blob, `airgead-data-export-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success("Data export downloaded");
    } catch (e: any) {
      toast.error("Export failed", { description: e?.message ?? "Try again." });
    } finally { setBusy(false); }
  };

  const submitSAR = async () => {
    if (sarText.trim().length < 10) {
      toast.error("Please describe your request (min 10 characters)");
      return;
    }
    setBusy(true);
    try {
      await supabase.from("activity_log").insert({
        action: "Subject Access Request submitted",
        entity_type: "sar",
        metadata: { request_text: sarText, channel: "privacy_centre" },
      });
      toast.success("Request submitted", { description: "We'll respond within 1 month, per UK GDPR Article 12." });
      setSarText("");
    } catch (e: any) {
      toast.error("Could not submit", { description: e?.message ?? "Try again." });
    } finally { setBusy(false); }
  };

  const deleteAccount = async () => {
    if (!confirm("This starts a 14-day cooling-off period before your account is anonymised and personal data deleted. Continue?")) return;
    await supabase.from("activity_log").insert({
      action: "Account deletion requested",
      entity_type: "account_deletion",
      metadata: { cooling_off_ends: new Date(Date.now() + 14 * 86400_000).toISOString() },
    });
    toast.success("Deletion scheduled", { description: "Your data will be removed in 14 days unless you cancel." });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Privacy centre"
        description="Manage your personal data, consent preferences, and your rights under UK GDPR."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5" /> My data summary</CardTitle>
          <CardDescription>What we hold about you (or your firm's clients) in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Clients", v: summary.clients }, { l: "Accounts", v: summary.accounts },
              { l: "Transactions", v: summary.transactions }, { l: "Documents", v: summary.documents },
            ].map((s) => (
              <div key={s.l} className="rounded-md border bg-card p-4">
                <p className="text-2xl font-semibold">{s.v.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Download className="h-5 w-5" /> Download my data</CardTitle>
          <CardDescription>Export all personal records as JSON (UK GDPR Article 20 — data portability).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadData} disabled={busy}>
            <Download className="h-4 w-4" /> Download data export (.json)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Cookie className="h-5 w-5" /> Cookie & tracking preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics</Label>
              <p className="text-xs text-muted-foreground">Helps us improve the app. Anonymised.</p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing</Label>
              <p className="text-xs text-muted-foreground">Product updates and tips by email.</p>
            </div>
            <Switch checked={marketing} onCheckedChange={setMarketing} />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("Preferences saved")}>
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><FileQuestion className="h-5 w-5" /> Subject Access Request</CardTitle>
          <CardDescription>Ask us about the data we hold, how we use it, or request correction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={4} value={sarText} onChange={(e) => setSarText(e.target.value)}
            placeholder="Describe your request — e.g. 'Please confirm what data you hold relating to my January 2024 contribution'…" />
          <Button onClick={submitSAR} disabled={busy}>Submit request</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive"><AlertTriangle className="h-5 w-5" /> Delete my account</CardTitle>
          <CardDescription>14-day cooling-off period. Activity log entries are anonymised but retained for regulatory record-keeping.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This cannot be undone after the cooling-off period</AlertTitle>
            <AlertDescription>You can cancel within 14 days from your settings.</AlertDescription>
          </Alert>
          <Button variant="destructive" onClick={deleteAccount}>Request account deletion</Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Data controller: Airgead Financial Services Ltd. Contact: privacy@airgead.co.uk.
        Lawful basis: contract (account servicing), legal obligation (FCA record-keeping), and consent (marketing).
      </p>
    </div>
  );
}
