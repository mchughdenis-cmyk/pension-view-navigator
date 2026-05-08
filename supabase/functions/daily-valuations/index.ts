// Daily valuations job — snapshots all client accounts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const today = new Date().toISOString().slice(0, 10)
  const { data: accounts } = await supabase.from('client_accounts').select('id, client_id, cash_balance').eq('status', 'active')
  const { data: investments } = await supabase.from('investments').select('account_id, current_value')

  const invMap = new Map<string, number>()
  for (const inv of investments || []) {
    const k = inv.account_id as string
    invMap.set(k, (invMap.get(k) || 0) + Number(inv.current_value || 0))
  }

  const rows = (accounts || []).map((a: any) => ({
    client_id: a.client_id,
    account_id: a.id,
    valuation_date: today,
    cash_balance: a.cash_balance,
    investments_value: invMap.get(a.id) || 0,
    total_value: Number(a.cash_balance || 0) + (invMap.get(a.id) || 0),
    source: 'cron',
  }))

  if (rows.length) await supabase.from('valuations').insert(rows)
  await supabase.from('activity_log').insert({
    entity_type: 'system', action: 'cron', description: `Daily valuations: ${rows.length} accounts snapshotted`, performed_by: 'System'
  })

  return new Response(JSON.stringify({ count: rows.length, date: today }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
