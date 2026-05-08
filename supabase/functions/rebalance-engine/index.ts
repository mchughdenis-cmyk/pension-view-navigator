// Rebalance engine — calculates drift vs model target and generates buy/sell trades
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const { account_id, dry_run = true } = await req.json()
    if (!account_id) return new Response(JSON.stringify({ error: 'account_id required' }), { status: 400, headers: corsHeaders })

    // Find model assignment
    const { data: assignment } = await supabase
      .from('model_assignments')
      .select('*, model_portfolios(*, model_holdings(*))')
      .eq('account_id', account_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!assignment) return new Response(JSON.stringify({ error: 'No active model assignment' }), { status: 404, headers: corsHeaders })

    const { data: account } = await supabase.from('client_accounts').select('*').eq('id', account_id).single()
    const { data: holdings } = await supabase.from('investments').select('*').eq('account_id', account_id)

    const totalValue = Number(account.total_value || 0)
    const targets = assignment.model_portfolios.model_holdings as any[]

    const drift: any[] = []
    const trades: any[] = []
    let totalBuy = 0, totalSell = 0

    for (const t of targets) {
      const targetValue = totalValue * (Number(t.target_pct) / 100)
      const current = (holdings || []).find((h: any) => h.fund_name === t.fund_name || h.isin === t.isin)
      const currentValue = current ? Number(current.current_value || 0) : (t.symbol === 'CASH' ? Number(account.cash_balance || 0) : 0)
      const driftPct = totalValue > 0 ? ((currentValue - targetValue) / totalValue) * 100 : 0
      const delta = targetValue - currentValue

      drift.push({ symbol: t.symbol, fund: t.fund_name, target_pct: t.target_pct, current_value: currentValue, target_value: targetValue, drift_pct: +driftPct.toFixed(2), delta: +delta.toFixed(2) })

      if (Math.abs(driftPct) >= Number(assignment.model_portfolios.drift_tolerance_pct || 5) && t.symbol !== 'CASH') {
        const side = delta > 0 ? 'buy' : 'sell'
        const value = Math.abs(delta)
        trades.push({ symbol: t.symbol, fund: t.fund_name, side, value: +value.toFixed(2) })
        if (side === 'buy') totalBuy += value
        else totalSell += value
      }
    }

    const { data: run } = await supabase.from('rebalance_runs').insert({
      model_id: assignment.model_id,
      account_id,
      client_id: account.client_id,
      triggered_by: dry_run ? 'manual_dry_run' : 'manual_executed',
      drift_summary: drift,
      trades_generated: trades,
      total_buy_value: totalBuy,
      total_sell_value: totalSell,
      status: dry_run ? 'pending' : 'approved',
    }).select().single()

    if (!dry_run && trades.length) {
      // Create trade orders
      for (const tr of trades) {
        await supabase.from('trade_orders').insert({
          client_id: account.client_id,
          account_id,
          instrument: tr.fund,
          side: tr.side,
          quantity: 0,
          price: 0,
          value: tr.value,
          status: 'pending',
          client_name: 'Rebalance',
        })
      }
    }

    await supabase.from('activity_log').insert({
      entity_type: 'rebalance', entity_id: run?.id, action: 'rebalance',
      description: `Rebalance ${dry_run ? 'analysed' : 'executed'} for account ${account.account_number || account_id.slice(0, 8)}: ${trades.length} trades, £${totalBuy.toFixed(0)} buy / £${totalSell.toFixed(0)} sell`,
      performed_by: 'System',
    })

    return new Response(JSON.stringify({ run_id: run?.id, drift, trades, total_buy: totalBuy, total_sell: totalSell, dry_run }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
