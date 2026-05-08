// Annual statements job — generates a statement for each client for the prior tax year
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

  const today = new Date()
  // UK tax year runs 6 Apr → 5 Apr. Run after 5 April.
  const isAfterApril6 = today.getMonth() > 3 || (today.getMonth() === 3 && today.getDate() >= 6)
  const taxYearStart = isAfterApril6 ? today.getFullYear() - 1 : today.getFullYear() - 2
  const periodStart = `${taxYearStart}-04-06`
  const periodEnd = `${taxYearStart + 1}-04-05`

  const { data: clients } = await supabase.from('clients').select('id').eq('status', 'active')

  let count = 0
  for (const c of clients || []) {
    const [accountsRes, txnsRes, contribsRes, feesRes] = await Promise.all([
      supabase.from('client_accounts').select('total_value').eq('client_id', c.id),
      supabase.from('transactions').select('transaction_type, amount').eq('client_id', c.id).gte('effective_date', periodStart).lte('effective_date', periodEnd),
      supabase.from('contributions').select('gross_amount').eq('client_id', c.id).gte('effective_date', periodStart).lte('effective_date', periodEnd),
      supabase.from('fee_charges').select('total').eq('client_id', c.id).eq('status', 'charged').gte('charged_date', periodStart).lte('charged_date', periodEnd),
    ])
    const closing = (accountsRes.data || []).reduce((s, a: any) => s + Number(a.total_value || 0), 0)
    const contribs = (contribsRes.data || []).reduce((s, x: any) => s + Number(x.gross_amount || 0), 0)
    const withdrawals = (txnsRes.data || []).filter((t: any) => ['drawdown', 'pcls', 'ufpls_taxable'].includes(t.transaction_type)).reduce((s, t: any) => s + Math.abs(Number(t.amount || 0)), 0)
    const fees = (feesRes.data || []).reduce((s, f: any) => s + Number(f.total || 0), 0)

    await supabase.from('statements').insert({
      client_id: c.id,
      statement_type: 'annual',
      period_start: periodStart,
      period_end: periodEnd,
      opening_value: Math.max(0, closing - contribs + withdrawals + fees),
      closing_value: closing,
      contributions_total: contribs,
      withdrawals_total: withdrawals,
      fees_total: fees,
      growth: 0,
    })
    count++
  }

  await supabase.from('activity_log').insert({
    entity_type: 'system', action: 'cron', description: `Annual statements generated: ${count} for ${taxYearStart}/${taxYearStart + 1}`, performed_by: 'System'
  })

  return new Response(JSON.stringify({ count, taxYear: `${taxYearStart}/${taxYearStart + 1}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
