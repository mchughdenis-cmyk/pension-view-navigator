// Generic email dispatcher backed by Resend. Restricted to admin/adviser callers.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Payload {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  category?: 'secure_message' | 'statement' | 'system' | string
  client_id?: string | null
  message_id?: string | null
}

async function requireStaff(authHeader: string | null, supabase: ReturnType<typeof createClient>) {
  if (!authHeader) return { ok: false as const, status: 401, error: 'Missing authorization' }
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
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
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const auth = await requireStaff(req.headers.get('Authorization'), supabase)
  if (!auth.ok) {
    return new Response(JSON.stringify({ ok: false, error: auth.error }), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('EMAIL_FROM') ?? 'Pension Navigator <noreply@airgead.co.uk>'

  let payload: Payload
  try { payload = await req.json() } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing to/subject/body' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!apiKey) {
    await supabase.from('activity_log').insert({
      action: 'email_dispatch_simulated', entity_type: 'email',
      description: `(no RESEND_API_KEY) would send to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`,
      performed_by: auth.user.email ?? 'send-email',
      new_values: { to: payload.to, subject: payload.subject, category: payload.category ?? 'system' },
    })
    return new Response(JSON.stringify({ ok: true, simulated: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject, html: payload.html, text: payload.text,
    }),
  })
  const body = await res.json().catch(() => ({}))

  await supabase.from('activity_log').insert({
    action: res.ok ? 'email_sent' : 'email_failed',
    entity_type: 'email', entity_id: payload.message_id ?? null,
    description: `${payload.category ?? 'system'} → ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`,
    performed_by: auth.user.email ?? 'send-email',
    new_values: { subject: payload.subject, status: res.status, response: body },
  })

  return new Response(JSON.stringify({ ok: res.ok, status: res.status, body }), {
    status: res.ok ? 200 : 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
