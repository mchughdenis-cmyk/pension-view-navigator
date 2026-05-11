// CASS 7 daily client-money reconciliation engine.
// Reads ledger / bank / custody snapshots for the given firm + date and writes
// a cass_reconciliations row plus any cass_breaches discovered.
//
// Public function (verify_jwt=false to match the project's demo posture).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const Body = z.object({
  firm_id: z.string().uuid().nullable().optional(),
  recon_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const BREACH_THRESHOLD = 1; // £1 break => recordable for prototype

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { firm_id = null } = parsed.data;
    const recon_date = parsed.data.recon_date ?? new Date().toISOString().slice(0, 10);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Ledger balance — sum of transactions running_balance latest per account
    const { data: txns } = await sb
      .from("transactions")
      .select("amount, account_id, effective_date")
      .lte("effective_date", recon_date);

    const ledgerBalance = (txns ?? []).reduce((s, t: any) => s + Number(t.amount ?? 0), 0);

    // 2) Bank balance — most recent bank_files entries up to recon_date
    const { data: bankRows } = await sb
      .from("bank_file_entries")
      .select("amount, value_date")
      .lte("value_date", recon_date);
    const bankBalance = (bankRows ?? []).reduce((s, r: any) => s + Number(r.amount ?? 0), 0);

    // 3) Custody balance — from valuations latest per holding up to recon_date
    const { data: vals } = await sb
      .from("valuations")
      .select("market_value, valuation_date")
      .lte("valuation_date", recon_date)
      .order("valuation_date", { ascending: false })
      .limit(500);
    const custodyBalance = (vals ?? []).reduce((s, v: any) => s + Number(v.market_value ?? 0), 0);

    const variance = Math.round((bankBalance - ledgerBalance) * 100) / 100;
    const status = Math.abs(variance) < BREACH_THRESHOLD ? "reconciled" : "break";

    const { data: recon, error: reErr } = await sb
      .from("cass_reconciliations")
      .insert({
        recon_date,
        recon_type: "daily_client_money",
        firm_id,
        internal_balance: ledgerBalance,
        external_balance: bankBalance,
        ledger_balance: ledgerBalance,
        bank_balance: bankBalance,
        custody_balance: custodyBalance,
        variance,
        unmatched_count: status === "break" ? 1 : 0,
        status,
        performed_by: "cass-recon-engine",
      })
      .select()
      .single();

    if (reErr) throw reErr;

    if (status === "break") {
      await sb.from("cass_breaches").insert({
        recon_id: recon.id,
        breach_date: recon_date,
        breach_type: "shortfall",
        severity: Math.abs(variance) > 1000 ? "high" : "medium",
        amount: variance,
        description: `Ledger £${ledgerBalance.toFixed(2)} vs bank £${bankBalance.toFixed(2)} — variance £${variance.toFixed(2)}`,
        status: "open",
      });
    }

    return new Response(JSON.stringify({ ok: true, recon }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cass-recon-run error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
