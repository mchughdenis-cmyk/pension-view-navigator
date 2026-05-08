// Corporate actions processor — applies dividends/scrip/etc. to all holders
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const { corporate_action_id } = await req.json()
    const { data: ca } = await supabase.from('corporate_actions').select('*').eq('id', corporate_action_id).single()
    if (!ca) return new Response(JSON.stringify({ error: 'Action not found' }), { status: 404, headers: corsHeaders })

    const { data: holders } = await supabase
      .from('investments')
      .select('id, client_id, account_id, units, fund_name, isin')
      .or(`isin.eq.${ca.isin || 'none'},fund_name.ilike.%${ca.symbol}%`)

    let processed = 0
    for (const h of holders || []) {
      const units = Number(h.units || 0)
      if (units <= 0) continue

      if (ca.action_type === 'dividend') {
        const cash = +(units * Number(ca.rate || 0)).toFixed(2)
        await supabase.from('corporate_action_elections').insert({
          corporate_action_id,
          client_id: h.client_id,
          account_id: h.account_id,
          election: 'cash',
          units_held: units,
          cash_amount: cash,
          status: 'settled',
          settled_at: new Date().toISOString(),
        })
        // credit cash to account
        await supabase.from('transactions').insert({
          client_id: h.client_id,
          account_id: h.account_id,
          transaction_type: 'dividend',
          amount: cash,
          status: 'completed',
          description: `Dividend ${ca.symbol} @ £${ca.rate}/unit`,
          reference: `DIV-${ca.id.slice(0, 8)}`,
        })
        processed++
      }
    }

    await supabase.from('corporate_actions').update({ status: 'settled' }).eq('id', corporate_action_id)
    await supabase.from('activity_log').insert({
      entity_type: 'corporate_action', entity_id: corporate_action_id, action: 'process',
      description: `Corporate action ${ca.action_type} on ${ca.symbol} processed: ${processed} holders`, performed_by: 'System',
    })

    return new Response(JSON.stringify({ processed, action: ca.action_type, symbol: ca.symbol }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
