// Origo Options state machine — simulates the ceding-scheme side of a UK pension transfer.
// POST { transfer_id, action } — advances state, writes paired origo_messages entries.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// State graph: action -> { next_state, progress, msg_out?, msg_in_after? }
const FLOW: Record<string, Record<string, any>> = {
  initiated: {
    send_discovery: {
      next: "discovery_sent", progress: 15,
      out: { type: "discovery_request", payload: { intent: "transfer" } },
      simulated_ack: { type: "discovery_ack", payload: { plan_found: true } },
      then_state: "discovery_acked", then_progress: 25,
    },
  },
  discovery_acked: {
    request_quote: {
      next: "quote_pending", progress: 35,
      out: { type: "quote_request" },
      simulated_ack: { type: "quote_response", payload: { cetv_quoted: true, guarantee_days: 90 } },
      then_state: "quote_received", then_progress: 50,
    },
  },
  quote_received: {
    send_option: {
      next: "option_sent", progress: 60,
      out: { type: "option_to_proceed", payload: { client_consented: true } },
      simulated_ack: { type: "ceding_confirmation", payload: { settlement_eta_days: 10 } },
      then_state: "ceding_confirmed", then_progress: 75,
    },
  },
  ceding_confirmed: {
    request_settlement: {
      next: "settlement_pending", progress: 85,
      out: { type: "settlement_instruction" },
      simulated_ack: { type: "settlement_confirmation", payload: { settled: true } },
      then_state: "settled", then_progress: 100,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    // Staff-only — clients must not be able to cancel/reject transfers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: { user } } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
    const list = (roles ?? []).map((r: any) => r.role as string);
    if (!list.includes("admin") && !list.includes("adviser")) {
      return new Response(JSON.stringify({ error: "Forbidden: staff only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { transfer_id, action, reject_reason } = await req.json();
    if (!transfer_id || !action) throw new Error("transfer_id and action required");

    const { data: t, error: tErr } = await sb.from("origo_transfers").select("*").eq("id", transfer_id).single();
    if (tErr || !t) throw new Error("transfer not found");

    // Cancel / reject branches
    if (action === "cancel") {
      await sb.from("origo_transfers").update({
        current_state: "cancelled", progress_pct: 0, last_event_at: new Date().toISOString(),
        rejection_reason: reject_reason || "Cancelled by adviser",
      }).eq("id", transfer_id);
      return ok({ state: "cancelled" });
    }
    if (action === "reject") {
      await sb.from("origo_transfers").update({
        current_state: "rejected", progress_pct: 0, last_event_at: new Date().toISOString(),
        rejection_reason: reject_reason || "Rejected by ceding scheme",
      }).eq("id", transfer_id);
      await sb.from("origo_messages").insert({
        transfer_id, direction: "inbound", message_type: "rejection",
        status: "acked", payload: { reason: reject_reason || "Discharge requirements not met" },
        sent_at: new Date().toISOString(), acked_at: new Date().toISOString(),
        ack_ref: `RJ-${Date.now()}`,
      });
      return ok({ state: "rejected" });
    }

    const step = FLOW[t.current_state]?.[action];
    if (!step) throw new Error(`Action '${action}' not valid from state '${t.current_state}'`);

    const now = new Date().toISOString();

    // 1) Write outbound message
    await sb.from("origo_messages").insert({
      transfer_id, direction: "outbound", message_type: step.out.type,
      status: "sent", payload: step.out.payload ?? {}, sent_at: now,
      ack_ref: `OUT-${Date.now()}`,
    });

    // 2) Move to intermediate state
    await sb.from("origo_transfers").update({
      current_state: step.next, progress_pct: step.progress, last_event_at: now,
    }).eq("id", transfer_id);

    // 3) Simulate ceding-scheme ack (small async delay would be ideal — for demo we apply immediately)
    if (step.simulated_ack) {
      const ackRef = `ACK-${Date.now()}`;
      await sb.from("origo_messages").insert({
        transfer_id, direction: "inbound", message_type: step.simulated_ack.type,
        status: "acked", payload: step.simulated_ack.payload ?? {},
        sent_at: now, acked_at: now, ack_ref: ackRef,
      });

      const update: any = {
        current_state: step.then_state, progress_pct: step.then_progress, last_event_at: now,
      };
      if (step.then_state === "settled") {
        update.actual_settlement_date = now.slice(0, 10);
      }
      await sb.from("origo_transfers").update(update).eq("id", transfer_id);
    }

    // Audit
    await sb.from("activity_log").insert({
      entity_type: "origo_transfer", entity_id: transfer_id, action,
      description: `Origo: ${t.current_state} → ${step.then_state ?? step.next} (${step.out.type})`,
      performed_by: "Origo state machine",
    }).then(() => {}, () => {}); // ignore if activity_log shape differs

    return ok({ state: step.then_state ?? step.next, progress: step.then_progress ?? step.progress });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function ok(body: any) {
  return new Response(JSON.stringify({ ok: true, ...body }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
