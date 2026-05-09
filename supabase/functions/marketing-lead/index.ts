// Marketing site lead capture — validates, blocks spam, persists to CRM,
// and triggers confirmation + internal notification emails.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const Schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  firm: z.string().trim().min(1).max(160),
  message: z.string().trim().max(2000).optional().default(''),
  // Anti-spam fields (not persisted as-is)
  website: z.string().max(0).optional().default(''), // honeypot — must be empty
  elapsedMs: z.number().int().nonnegative().optional().default(0),
  source: z.string().max(80).optional().default('site/contact'),
})

// Tiny in-memory rate limit per IP (best-effort; resets on cold start).
const recent = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 3

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + ':marketing-lead')
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let raw: unknown
  try { raw = await req.json() } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const data = parsed.data

  // Honeypot tripped → silently accept to avoid signalling bots.
  if (data.website && data.website.length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  // Submitted in under 1.5s → almost certainly a bot.
  if (data.elapsedMs > 0 && data.elapsedMs < 1500) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Per-IP rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const stamps = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (stamps.length >= MAX_PER_WINDOW) {
    return new Response(JSON.stringify({ ok: false, error: 'Too many requests, please try again shortly.' }), {
      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  stamps.push(now)
  recent.set(ip, stamps)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const ipHash = await hashIp(ip)
  const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 500)

  const { data: lead, error } = await supabase
    .from('marketing_leads')
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      firm: data.firm,
      message: data.message || null,
      source: data.source,
      ip_hash: ipHash,
      user_agent: userAgent,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Lead insert failed:', error)
    return new Response(JSON.stringify({ ok: false, error: 'Could not save your message. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Audit
  await supabase.from('activity_log').insert({
    action: 'marketing_lead_captured',
    entity_type: 'marketing_lead',
    entity_id: lead.id,
    description: `Lead from ${data.firstName} ${data.lastName} <${data.email}> (${data.firm})`,
    performed_by: 'marketing-lead',
    new_values: { source: data.source, firm: data.firm },
  }).then(() => {}, (e) => console.warn('audit log failed', e))

  // Confirmation + internal notification (best-effort; non-blocking on failure).
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  const internalTo = Deno.env.get('LEADS_NOTIFY_EMAIL') ?? 'hello@airgead.co.uk'

  const confirmHtml = `
    <p>Hi ${escapeHtml(data.firstName)},</p>
    <p>Thanks for getting in touch with <strong>Pension Navigator by Airgead</strong>. We've received your enquiry and a member of our pensions team will be in touch within one business day.</p>
    <p>For reference, this is what you sent us:</p>
    <blockquote style="border-left:3px solid #ccc;padding:8px 12px;color:#555;">
      <strong>${escapeHtml(fullName)} · ${escapeHtml(data.firm)}</strong><br/>
      ${escapeHtml(data.message || '(no message)').replace(/\n/g, '<br/>')}
    </blockquote>
    <p>Kind regards,<br/>The Airgead team</p>
  `
  const internalHtml = `
    <h2>New marketing lead</h2>
    <p><strong>${escapeHtml(fullName)}</strong> &lt;${escapeHtml(data.email)}&gt;</p>
    <p><strong>Firm:</strong> ${escapeHtml(data.firm)}<br/>
       <strong>Source:</strong> ${escapeHtml(data.source)}<br/>
       <strong>Lead ID:</strong> ${lead.id}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(data.message || '(no message)').replace(/\n/g, '<br/>')}</p>
  `

  try {
    await Promise.all([
      supabase.functions.invoke('send-email', {
        body: {
          to: data.email,
          subject: 'Thanks for contacting Pension Navigator',
          html: confirmHtml,
          category: 'marketing_lead_confirmation',
        },
      }),
      supabase.functions.invoke('send-email', {
        body: {
          to: internalTo,
          subject: `New lead: ${fullName} (${data.firm})`,
          html: internalHtml,
          category: 'marketing_lead_internal',
        },
      }),
    ])
  } catch (e) {
    console.warn('Email dispatch failed (non-fatal):', e)
  }

  return new Response(JSON.stringify({ ok: true, id: lead.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
