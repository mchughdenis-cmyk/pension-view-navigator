import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FieldType = "text" | "number" | "date" | "select" | "checkbox" | "textarea";

export interface StandardField {
  key: string;
  label: string;
  step: 1 | 2 | 3;
  /** Locked — required for product set-up; cannot be hidden or made optional */
  mandatory: boolean;
  reason?: string;
}

export interface StandardFieldSetting { visible: boolean; required: boolean; label?: string }

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  step: 1 | 2 | 3;
  required: boolean;
  options?: string[];
  helpText?: string;
}

export interface OnboardingConfig {
  standard: Record<string, StandardFieldSetting>;
  custom: CustomField[];
}

export const STEP_NAMES: Record<number, string> = { 1: "Personal information", 2: "Financial details", 3: "Goals & objectives" };

export const STANDARD_FIELDS: StandardField[] = [
  { key: "title", label: "Title", step: 1, mandatory: false },
  { key: "firstName", label: "First name", step: 1, mandatory: true, reason: "Legal name for account registration & HMRC" },
  { key: "lastName", label: "Last name", step: 1, mandatory: true, reason: "Legal name for account registration & HMRC" },
  { key: "dateOfBirth", label: "Date of birth", step: 1, mandatory: true, reason: "Age checks, NMPA, HMRC relief at source" },
  { key: "email", label: "Email address", step: 1, mandatory: true, reason: "Account login & regulatory communications" },
  { key: "phone", label: "Phone number", step: 1, mandatory: false },
  { key: "address", label: "Full address", step: 1, mandatory: true, reason: "UK residency for tax relief & AML" },
  { key: "annualIncome", label: "Annual income", step: 2, mandatory: false },
  { key: "employmentStatus", label: "Employment status", step: 2, mandatory: false },
  { key: "existingPensions", label: "Existing pensions", step: 2, mandatory: false },
  { key: "retirementAge", label: "Target retirement age", step: 3, mandatory: true, reason: "Selected retirement age drives lifestyling & SMPI" },
  { key: "monthlyContribution", label: "Monthly contribution", step: 3, mandatory: true, reason: "Contribution set-up & relief at source" },
];

export const defaultConfig = (): OnboardingConfig => ({
  standard: Object.fromEntries(STANDARD_FIELDS.map(f => [f.key, { visible: true, required: true }])),
  custom: [],
});

/** Enforce locked mandatory fields regardless of stored config */
export function normalise(cfg: Partial<OnboardingConfig> | null | undefined): OnboardingConfig {
  const base = defaultConfig();
  const standard = { ...base.standard, ...(cfg?.standard ?? {}) };
  for (const f of STANDARD_FIELDS) {
    if (f.mandatory) standard[f.key] = { ...standard[f.key], visible: true, required: true };
    else if (!standard[f.key].visible) standard[f.key] = { ...standard[f.key], required: false };
  }
  return { standard, custom: Array.isArray(cfg?.custom) ? cfg!.custom : [] };
}

export const configKey = (firmId: string | null) => `onboarding_config:${firmId ?? "default"}`;

export async function loadOnboardingConfig(firmId: string | null): Promise<OnboardingConfig> {
  const keys = [configKey(firmId), configKey(null)];
  const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);
  const firm = data?.find(d => d.key === keys[0]);
  const def = data?.find(d => d.key === keys[1]);
  return normalise(((firm ?? def)?.value ?? null) as any);
}

export async function saveOnboardingConfig(firmId: string | null, cfg: OnboardingConfig, userId?: string) {
  const { error } = await supabase.from("site_settings").upsert({
    key: configKey(firmId), value: normalise(cfg) as any,
    updated_at: new Date().toISOString(), updated_by: userId ?? null,
  });
  if (error) throw error;
}

export function useOnboardingConfig(firmId: string | null) {
  const [config, setConfig] = useState<OnboardingConfig>(defaultConfig());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    loadOnboardingConfig(firmId).then(c => { if (live) { setConfig(c); setLoading(false); } });
    return () => { live = false; };
  }, [firmId]);
  return { config, loading };
}
