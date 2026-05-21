import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/nav/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/contexts/FirmContext";
import { toast } from "sonner";
import { Upload, Save, Trash2, Palette, Globe, Image as ImageIcon, RefreshCw, Check } from "lucide-react";

type FormState = {
  logo_url: string;
  primary_color: string;
  accent_color: string;
  custom_domain: string;
};

const DEFAULTS: FormState = {
  logo_url: "",
  primary_color: "#3B82F6",
  accent_color: "#E0E7FF",
  custom_domain: "",
};

export default function WhiteLabelBranding() {
  const { firms, firmId, firm, setFirmId, branding, refreshBranding } = useFirm();
  const [editFirmId, setEditFirmId] = useState<string | null>(firmId);
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditFirmId(firmId); }, [firmId]);

  // load the branding row for the firm being edited (independent of active firm)
  useEffect(() => {
    if (!editFirmId) return;
    (async () => {
      const { data } = await supabase
        .from("firm_branding")
        .select("logo_url, primary_color, accent_color, custom_domain")
        .eq("firm_id", editFirmId).maybeSingle();
      setForm({
        logo_url: data?.logo_url ?? "",
        primary_color: data?.primary_color ?? DEFAULTS.primary_color,
        accent_color: data?.accent_color ?? DEFAULTS.accent_color,
        custom_domain: data?.custom_domain ?? "",
      });
    })();
  }, [editFirmId]);

  const upload = async (file: File) => {
    if (!editFirmId) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2 MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${editFirmId}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("firm-branding").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("firm-branding").getPublicUrl(path);
      setForm(f => ({ ...f, logo_url: data.publicUrl }));
      toast.success("Logo uploaded — remember to save");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editFirmId) return;
    setBusy(true);
    try {
      // upsert by firm_id
      const { data: existing } = await supabase
        .from("firm_branding").select("id").eq("firm_id", editFirmId).maybeSingle();
      const payload = {
        firm_id: editFirmId,
        logo_url: form.logo_url || null,
        primary_color: form.primary_color || null,
        accent_color: form.accent_color || null,
        custom_domain: form.custom_domain || null,
      };
      const { error } = existing
        ? await supabase.from("firm_branding").update(payload).eq("id", existing.id)
        : await supabase.from("firm_branding").insert(payload);
      if (error) throw error;
      toast.success("Branding saved");
      if (editFirmId === firmId) await refreshBranding();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!editFirmId) return;
    if (!confirm("Reset this firm's white-label branding to defaults?")) return;
    setBusy(true);
    await supabase.from("firm_branding").delete().eq("firm_id", editFirmId);
    setForm(DEFAULTS);
    if (editFirmId === firmId) await refreshBranding();
    toast.success("Branding cleared");
    setBusy(false);
  };

  const preview = (
    <div
      className="rounded-lg border p-5 space-y-3"
      style={{
        background: `linear-gradient(135deg, ${form.primary_color}15, ${form.accent_color}30)`,
        borderColor: form.primary_color,
      }}
    >
      <div className="flex items-center gap-3">
        {form.logo_url ? (
          <img src={form.logo_url} alt="Firm logo" className="h-10 w-10 object-contain rounded" />
        ) : (
          <div className="h-10 w-10 rounded grid place-items-center" style={{ background: form.primary_color, color: "#fff" }}>
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
        <div>
          <div className="font-semibold" style={{ color: form.primary_color }}>
            {firms.find(f => f.id === editFirmId)?.name ?? "Firm"}
          </div>
          <div className="text-xs text-muted-foreground">Pension Navigator · powered by Airgead</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded text-xs font-medium text-white" style={{ background: form.primary_color }}>
          Primary action
        </button>
        <button className="px-3 py-1.5 rounded text-xs font-medium border" style={{ background: form.accent_color, borderColor: form.primary_color, color: form.primary_color }}>
          Accent action
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader
        title="White-label branding"
        description="Multi-tenant branding — each adviser firm can apply its own logo, colours and custom domain. Changes apply across every screen for that firm."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Select firm to brand</span>
            {firm?.id === editFirmId && <Badge variant="outline" className="gap-1"><Check className="h-3 w-3" />Currently active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select value={editFirmId ?? undefined} onValueChange={setEditFirmId}>
            <SelectTrigger><SelectValue placeholder="Choose a firm" /></SelectTrigger>
            <SelectContent>
              {firms.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name} {f.fca_ref ? `· FRN ${f.fca_ref}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {editFirmId && editFirmId !== firmId && (
            <Button variant="outline" size="sm" onClick={() => setFirmId(editFirmId)} className="gap-1">
              <RefreshCw className="h-3 w-3" /> Activate this firm in the header switcher
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" />Logo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                <img src={form.logo_url} alt="logo" className="h-14 w-14 object-contain rounded border" />
              ) : (
                <div className="h-14 w-14 rounded border grid place-items-center text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>
              )}
              <div className="flex-1 space-y-1">
                <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden
                  onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
                <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()} className="gap-2">
                  <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload logo"}
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG, SVG or WebP — max 2 MB. Square or wide layouts work best.</p>
              </div>
            </div>
            <div>
              <Label>Or paste a logo URL</Label>
              <Input value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" />Brand colours</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ColorField label="Primary" value={form.primary_color} onChange={v => setForm(f => ({ ...f, primary_color: v }))} />
            <ColorField label="Accent" value={form.accent_color} onChange={v => setForm(f => ({ ...f, accent_color: v }))} />
            <p className="text-xs text-muted-foreground">Primary drives buttons, links and active nav. Accent drives hover and secondary surfaces.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Custom domain</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={form.custom_domain} onChange={e => setForm(f => ({ ...f, custom_domain: e.target.value }))}
            placeholder="portal.sterlingwealth.co.uk" />
          <p className="text-xs text-muted-foreground">
            Point an A record at <span className="font-mono">185.158.133.1</span> and a TXT record <span className="font-mono">_lovable</span> to the verification value provided in Project &rarr; Domains. The platform will serve the firm&apos;s branded portal on this domain.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Live preview</CardTitle></CardHeader>
        <CardContent>{preview}</CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy || !editFirmId} className="gap-2">
          <Save className="h-4 w-4" /> Save branding
        </Button>
        <Button variant="outline" onClick={reset} disabled={busy || !editFirmId} className="gap-2">
          <Trash2 className="h-4 w-4" /> Reset to defaults
        </Button>
        {branding && editFirmId === firmId && (
          <span className="text-xs text-muted-foreground self-center">
            Active branding applied across the platform for {firm?.name}.
          </span>
        )}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-9 w-12 rounded border cursor-pointer bg-transparent" />
        <Input value={value} onChange={e => onChange(e.target.value)} className="font-mono uppercase" />
      </div>
    </div>
  );
}
