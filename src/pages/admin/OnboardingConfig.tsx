import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Plus, Save, Trash2, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useFirm } from "@/contexts/FirmContext";
import { useRole } from "@/contexts/RoleContext";
import {
  STANDARD_FIELDS, STEP_NAMES, CustomField, FieldType, OnboardingConfig,
  JOURNEY_STEPS, defaultConfig, loadOnboardingConfig, saveOnboardingConfig, normalise,
} from "@/lib/onboardingConfig";

const DEFAULT = "__default__";

export default function OnboardingConfigPage() {
  const { firms, firmId: activeFirm } = useFirm();
  const { user } = useRole();
  const [target, setTarget] = useState<string>(activeFirm ?? DEFAULT);
  const [cfg, setCfg] = useState<OnboardingConfig>(defaultConfig());
  const [saving, setSaving] = useState(false);
  const firmId = target === DEFAULT ? null : target;

  useEffect(() => { loadOnboardingConfig(firmId).then(setCfg); }, [firmId]);

  const setStd = (key: string, patch: Partial<{ visible: boolean; required: boolean; label: string }>) =>
    setCfg(c => normalise({ ...c, standard: { ...c.standard, [key]: { ...c.standard[key], ...patch } } }));

  const setCustom = (id: string, patch: Partial<CustomField>) =>
    setCfg(c => ({ ...c, custom: c.custom.map(f => f.id === id ? { ...f, ...patch } : f) }));

  const addCustom = () => setCfg(c => ({
    ...c, custom: [...c.custom, { id: crypto.randomUUID(), label: "New question", type: "text", step: 1, required: false }],
  }));

  const moveStep = (i: number, d: -1 | 1) => setCfg(c => {
    const o = [...c.stepOrder]; const j = i + d;
    if (j < 0 || j >= o.length - 1) return c;
    [o[i], o[j]] = [o[j], o[i]]; return { ...c, stepOrder: o };
  });
  const moveCustom = (id: string, d: -1 | 1) => setCfg(c => {
    const a = [...c.custom]; const i = a.findIndex(f => f.id === id); const j = i + d;
    if (j < 0 || j >= a.length) return c;
    [a[i], a[j]] = [a[j], a[i]]; return { ...c, custom: a };
  });

  const save = async () => {
    const bad = cfg.custom.find(f => !f.label.trim() || (f.type === "select" && !(f.options?.length)));
    if (bad) return toast.error("Each custom field needs a label, and dropdowns need at least one option");
    setSaving(true);
    try {
      await saveOnboardingConfig(firmId, cfg, user?.id);
      toast.success("Onboarding journey saved", { description: firmId ? "Applies to this firm's new clients" : "Default for firms without their own set-up" });
    } catch (e: any) {
      toast.error(e.message ?? "Save failed — admin role required");
    } finally { setSaving(false); }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Onboarding journey configuration</h1>
          <p className="text-sm text-muted-foreground">Tailor the data collected when onboarding clients for each firm. Fields needed for product set-up are locked.</p>
        </div>
        <div className="flex gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Applies to</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT}>Platform default</SelectItem>
                {firms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => setCfg(defaultConfig())}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
          <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journey order</CardTitle>
          <CardDescription>Reorder the steps to match the firm's operating model. The contribution and submission step always comes last.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {cfg.stepOrder.map((id, i) => {
            const locked = id === 7;
            return (
              <div key={id} className="flex items-center gap-3 p-2 border rounded-md">
                <Badge variant="outline" className="w-8 justify-center">{i + 1}</Badge>
                <span className="flex-1 text-sm">{JOURNEY_STEPS[id]}</span>
                {locked ? (
                  <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Always last</Badge>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => moveStep(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label="Move down" disabled={i >= cfg.stepOrder.length - 2} onClick={() => moveStep(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standard fields</CardTitle>
          <CardDescription>Locked fields are required to open the product, verify identity and claim tax relief.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {STANDARD_FIELDS.map(f => {
            const s = cfg.standard[f.key];
            return (
              <div key={f.key} className="grid grid-cols-12 gap-3 items-center p-2 border rounded-md">
                <div className="col-span-12 md:col-span-4">
                  <Input value={s.label ?? f.label} onChange={e => setStd(f.key, { label: e.target.value })} />
                </div>
                <div className="col-span-6 md:col-span-2 text-xs text-muted-foreground">{STEP_NAMES[f.step]}</div>
                {f.mandatory ? (
                  <div className="col-span-6 md:col-span-6 flex items-center gap-2 text-xs">
                    <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Mandatory</Badge>
                    <span className="text-muted-foreground">{f.reason}</span>
                  </div>
                ) : (
                  <>
                    <label className="col-span-3 md:col-span-3 flex items-center gap-2 text-sm">
                      <Switch checked={s.visible} onCheckedChange={v => setStd(f.key, { visible: v })} />Show
                    </label>
                    <label className="col-span-3 md:col-span-3 flex items-center gap-2 text-sm">
                      <Switch checked={s.required} disabled={!s.visible} onCheckedChange={v => setStd(f.key, { required: v })} />Required
                    </label>
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">Firm-specific questions</CardTitle>
            <CardDescription>Add extra questions to any of the first three steps. Use the arrows to set the order they appear in.</CardDescription>
          </div>
          <Button size="sm" onClick={addCustom}><Plus className="h-4 w-4 mr-1" />Add question</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {cfg.custom.length === 0 && <p className="text-sm text-muted-foreground">No extra questions yet.</p>}
          {cfg.custom.map(f => (
            <div key={f.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-md">
              <div className="col-span-12 md:col-span-4 space-y-1"><Label className="text-xs">Question</Label>
                <Input value={f.label} onChange={e => setCustom(f.id, { label: e.target.value })} /></div>
              <div className="col-span-6 md:col-span-2 space-y-1"><Label className="text-xs">Type</Label>
                <Select value={f.type} onValueChange={v => setCustom(f.id, { type: v as FieldType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["text", "textarea", "number", "date", "select", "checkbox"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select></div>
              <div className="col-span-6 md:col-span-3 space-y-1"><Label className="text-xs">Step</Label>
                <Select value={String(f.step)} onValueChange={v => setCustom(f.id, { step: Number(v) as 1 | 2 | 3 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3].map(s => <SelectItem key={s} value={String(s)}>{STEP_NAMES[s]}</SelectItem>)}</SelectContent>
                </Select></div>
              <label className="col-span-6 md:col-span-1 flex items-center gap-2 text-sm pb-2">
                <Switch checked={f.required} onCheckedChange={v => setCustom(f.id, { required: v })} />Required
              </label>
              <div className="col-span-6 md:col-span-2 flex justify-end">
                <Button variant="ghost" size="icon" aria-label="Move up" onClick={() => moveCustom(f.id, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Move down" onClick={() => moveCustom(f.id, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setCfg(c => ({ ...c, custom: c.custom.filter(x => x.id !== f.id) }))}><Trash2 className="h-4 w-4" /></Button>
              </div>
              {f.type === "select" && (
                <div className="col-span-12 space-y-1"><Label className="text-xs">Options (comma-separated)</Label>
                  <Input value={(f.options ?? []).join(", ")} onChange={e => setCustom(f.id, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></div>
              )}
              <div className="col-span-12 space-y-1"><Label className="text-xs">Help text (optional)</Label>
                <Input value={f.helpText ?? ""} onChange={e => setCustom(f.id, { helpText: e.target.value })} /></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
