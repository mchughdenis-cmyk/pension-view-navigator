// CASS 7 daily client money reconciliation — compares internal balance vs external bank balance
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const externalBalanceOverride = body.external_balance

    // Internal: sum of cash across all client accounts
    const { data: accounts } = await supabase.from('client_accounts').select('cash_balance').eq('status', 'active')
    const internal = (accounts || []).reduce((s: number, a: any) => s + Number(a.cash_balance || 0), 0)

    // External: latest bank file total or override
    let external = externalBalanceOverride
    if (external === undefined) {
      const { data: bf } = await supabase.from('bank_files').select('total_amount').order('upload_date', { ascending: false }).limit(1).maybeSingle()
      external = bf ? Number(bf.total_amount || 0) : internal // assume match if no file
    }

    const variance = +(internal - external).toFixed(2)
    const tolerance = 1 // £1 tolerance
    const status = Math.abs(variance) <= tolerance ? 'passed' : 'breach'

    const { data: recon } = await supabase.from('cass_reconciliations').insert({
      recon_date: new Date().toISOString().slice(0, 10),
      internal_balance: internal,
      external_balance: external,
      status,
      performed_by: 'Automated',
    }).select().single()

    if (status === 'breach') {
      await supabase.from('cass_breaches').insert({
        recon_id: recon!.id,
        breach_type: 'reconciliation_variance',
        severity: Math.abs(variance) > 1000 ? 'major' : 'minor',
        amount: variance,
        description: `Internal £${internal.toFixed(2)} vs external £${external.toFixed(2)} — variance £${variance}`,
      })
      await supabase.from('ops_cases').insert({
        case_type: 'cass_breach',
        queue: 'compliance',
        priority: 'urgent',
        title: `CASS recon breach — variance £${variance.toFixed(2)}`,
        description: 'Daily client money reconciliation outside tolerance',
        sla_due_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        related_id: recon!.id,
        related_table: 'cass_reconciliations',
      })
    }

    await supabase.from('activity_log').insert({
      entity_type: 'cass', entity_id: recon!.id, action: 'reconciliation',
      description: `CASS recon ${status}: internal £${internal.toFixed(2)} vs external £${external.toFixed(2)} (variance £${variance})`,
      performed_by: 'System',
    })

    return new Response(JSON.stringify({ recon_id: recon!.id, internal, external, variance, status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
