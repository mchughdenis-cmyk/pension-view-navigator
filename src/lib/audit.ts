import { supabase } from "@/integrations/supabase/client";

export type AuditEntity =
  | "kyc_case" | "kyc_document" | "kyc_check"
  | "bank_connection" | "payment_initiation" | "dd_mandate"
  | "notification";

export type AuditAction =
  | "created" | "updated" | "submitted" | "approved" | "rejected"
  | "verified" | "review_required" | "consent_granted" | "consent_revoked"
  | "consent_expired" | "payment_initiated" | "payment_settled"
  | "payment_failed" | "mandate_signed" | "mandate_cancelled"
  | "document_uploaded" | "check_run";

export interface AuditEvent {
  entity_type: AuditEntity;
  entity_id?: string | null;
  action: AuditAction;
  description: string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  /** Defaults to the active demo actor (role + display name). */
  performed_by?: string;
}

/** Resolve a friendly actor label from the role context kept in localStorage. */
function currentActor(): string {
  try {
    const role = localStorage.getItem("active_role") || "system";
    const name = localStorage.getItem("active_user_name") || "Demo user";
    return `${name} (${role})`;
  } catch {
    return "System";
  }
}

export async function logAudit(ev: AuditEvent) {
  const { error } = await supabase.from("activity_log").insert({
    entity_type: ev.entity_type,
    entity_id: ev.entity_id ?? null,
    action: ev.action,
    description: ev.description,
    old_values: ev.old_values ?? null,
    new_values: ev.new_values ?? null,
    performed_by: ev.performed_by ?? currentActor(),
  });
  if (error) console.warn("logAudit failed", error);
}

/** Compute a shallow diff so old/new only carry changed keys. */
export function diff<T extends Record<string, any>>(before: T, after: T) {
  const o: Record<string, any> = {};
  const n: Record<string, any> = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  keys.forEach(k => {
    if (JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k])) {
      o[k] = before?.[k] ?? null;
      n[k] = after?.[k] ?? null;
    }
  });
  return { old_values: o, new_values: n };
}
