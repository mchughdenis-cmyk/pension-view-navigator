// Integration stub — simulates external API calls. Staff-only.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function requireStaff(authHeader: string | null, supabase: ReturnType<typeof createClient>) {
  if (!authHeader) return { ok: false as const, status: 401, error: 'Missing authorization' }
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (error || !user) return { ok: false as const, status: 401, error: 'Invalid token' }
  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id)
  const list = (roles ?? []).map(r => r.role as string)
  if (!list.includes('admin') && !list.includes('adviser')) {
    return { ok: false as const, status: 403, error: 'Forbidden: admin or adviser role required' }
  }
  return { ok: true as const, user }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const auth = await requireStaff(req.headers.get('Authorization'), supabase)
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const start = Date.now()
  let response: any = {}
  let status = 'success'
  let error: string | null = null

  try {
    const body = await req.json()
    const { provider, endpoint, payload } = body

    // Route to mock handlers
    switch (provider) {
      case 'modulr':
        if (endpoint === 'create_payment') {
          response = { paymentId: `MDR-${Date.now()}`, status: 'PENDING', amount: payload.amount, recipient: payload.recipient, eta: '2 hours' }
        } else if (endpoint === 'create_mandate') {
          response = { mandateId: `DDM-${Date.now()}`, status: 'ACTIVE', sortCode: payload.sortCode, accountLast4: '****' + (payload.account?.slice(-4) || '0000') }
        }
        break

      case 'fe_fundinfo':
        if (endpoint === 'price_lookup') {
          // Generate deterministic-ish prices
          const symbols: string[] = payload.symbols || ['VWRL.L', 'VUKE.L', 'IWDG.L']
          response = {
            prices: symbols.map(s => ({
              symbol: s,
              price: +(50 + Math.random() * 200).toFixed(4),
              currency: 'GBP',
              date: new Date().toISOString().slice(0, 10),
            }))
          }
          // Persist into market_prices table
          for (const p of response.prices) {
            await supabase.from('market_prices').insert({ symbol: p.symbol, price: p.price, currency: p.currency, price_date: p.date, source: 'fe_fundinfo_stub' })
          }
        }
        break

      case 'hmrc':
        if (endpoint === 'ras_reclaim') {
          response = { submissionRef: `HMRC-RAS-${Date.now()}`, taxYear: payload.taxYear, totalReclaim: payload.totalReclaim, status: 'ACCEPTED', expectedPayment: '6 weeks' }
        } else if (endpoint === 'rti_paye') {
          response = { submissionRef: `HMRC-RTI-${Date.now()}`, period: payload.period, totalTax: payload.totalTax, status: 'ACCEPTED' }
        } else if (endpoint === 'event_report') {
          response = { reportRef: `HMRC-EVT-${Date.now()}`, schemeRef: payload.schemeRef, eventCount: payload.events?.length || 0, status: 'SUBMITTED' }
        }
        break

      case 'docusign':
        if (endpoint === 'create_envelope') {
          response = { envelopeId: `DSE-${Date.now()}`, status: 'sent', signingUrl: `https://demo.docusign.net/sign/${Date.now()}`, recipients: payload.recipients }
        }
        break

      case 'onfido':
        if (endpoint === 'create_check') {
          // 90% pass rate for demo realism
          const passed = Math.random() > 0.1
          response = {
            checkId: `ONF-${Date.now()}`,
            status: passed ? 'complete' : 'consider',
            result: passed ? 'clear' : 'consider',
            breakdown: { identity: passed, address: passed, pep: passed, sanctions: passed },
          }
          if (payload.clientId) {
            await supabase.from('kyc_records').insert({
              client_id: payload.clientId,
              provider: 'onfido',
              reference: response.checkId,
              status: passed ? 'passed' : 'manual_review',
              identity_check: passed,
              address_check: passed,
              pep_sanctions_check: passed,
              raw_result: response,
              checked_at: new Date().toISOString(),
            })
          }
        }
        break

      case 'calastone':
        if (endpoint === 'place_order') {
          response = { orderId: `CAL-${Date.now()}`, status: 'received', isin: payload.isin, units: payload.units, settlement: 'T+3' }
        }
        break

      default:
        status = 'error'
        error = `Unknown provider: ${provider}`
    }

    // Log
    await supabase.from('integration_log').insert({
      provider,
      endpoint,
      request_payload: payload,
      response_payload: response,
      status,
      error_message: error,
      duration_ms: Date.now() - start,
    })

    return new Response(JSON.stringify({ provider, endpoint, ...response, _stub: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status === 'error' ? 400 : 200,
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
