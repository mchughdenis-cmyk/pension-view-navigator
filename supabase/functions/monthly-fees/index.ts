// Monthly fees job — accrues platform fee on every active account (0.30% annual / 12 = 0.025% monthly)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLATFORM_FEE_ANNUAL_PCT = 0.30
const MONTHLY_RATE = PLATFORM_FEE_ANNUAL_PCT / 12

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: accounts } = await supabase.from('client_accounts').select('id, client_id, total_value').eq('status', 'active')
  const today = new Date()
  const periodEnd = today.toISOString().slice(0, 10)
  const periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10)

  let count = 0
  for (const a of accounts || []) {
    const aum = Number(a.total_value || 0)
    if (aum <= 0) continue
    const amount = +(aum * (MONTHLY_RATE / 100)).toFixed(2)
    await supabase.from('fee_charges').insert({
      client_id: a.client_id,
      account_id: a.id,
      fee_type: 'platform',
      description: 'Monthly platform fee (auto)',
      basis: 'percent',
      rate: MONTHLY_RATE,
      amount,
      vat: 0,
      total: amount,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'accrued',
      reference: `FEE-AUTO-${Date.now()}-${a.id.slice(0, 6)}`,
    })
    count++
  }

  await supabase.from('activity_log').insert({
    entity_type: 'system', action: 'cron', description: `Monthly fees accrued for ${count} accounts`, performed_by: 'System'
  })

  return new Response(JSON.stringify({ count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
