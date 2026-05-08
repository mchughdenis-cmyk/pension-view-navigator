// Daily interest accrual on cash balances of active accounts.
// Posts an interest_accruals row per account with simple-daily compounding.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Bank of England base rate proxy — kept simple for demo.
const ANNUAL_RATE_PCT = 4.25

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const today = new Date().toISOString().slice(0, 10)
  const dailyRate = ANNUAL_RATE_PCT / 100 / 365

  const { data: accounts, error: aErr } = await supabase
    .from('client_accounts')
    .select('id, client_id, cash_balance')
    .eq('status', 'active')

  if (aErr) {
    return new Response(JSON.stringify({ ok: false, error: aErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Skip accounts that already have an accrual today (idempotent).
  const { data: existing } = await supabase
    .from('interest_accruals')
    .select('account_id')
    .eq('accrual_date', today)
  const seen = new Set((existing ?? []).map((r: any) => r.account_id))

  const rows = (accounts ?? [])
    .filter((a: any) => !seen.has(a.id) && Number(a.cash_balance) > 0)
    .map((a: any) => ({
      account_id: a.id,
      client_id: a.client_id,
      accrual_date: today,
      daily_balance: Number(a.cash_balance),
      rate_pct: ANNUAL_RATE_PCT,
      interest: Number((Number(a.cash_balance) * dailyRate).toFixed(4)),
      status: 'accrued',
    }))

  let inserted = 0
  if (rows.length) {
    const { error: iErr } = await supabase.from('interest_accruals').insert(rows)
    if (iErr) {
      return new Response(JSON.stringify({ ok: false, error: iErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    inserted = rows.length
  }

  await supabase.from('activity_log').insert({
    action: 'interest_accrual_run',
    entity_type: 'interest_accruals',
    description: `Daily interest accrual: ${inserted} accounts at ${ANNUAL_RATE_PCT}% pa`,
    performed_by: 'Scheduler',
    new_values: { date: today, accounts: inserted, annual_rate_pct: ANNUAL_RATE_PCT },
  })

  return new Response(JSON.stringify({ ok: true, date: today, accounts: inserted }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
