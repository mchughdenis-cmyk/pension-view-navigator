// Seeds the system admin account. Protected by an internal SEED_ADMIN_SECRET shared
// secret to prevent any authenticated user from resetting admin credentials.
// The admin email/password are read from environment variables — never hardcoded.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-seed-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const expected = Deno.env.get('SEED_ADMIN_SECRET')
  if (!expected) {
    return new Response(JSON.stringify({ ok: false, error: 'Seed disabled (no SEED_ADMIN_SECRET configured).' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const provided = req.headers.get('x-seed-secret') ?? ''
  if (provided !== expected) {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const ADMIN_EMAIL = Deno.env.get('ADMIN_SEED_EMAIL')
  const ADMIN_PASSWORD = Deno.env.get('ADMIN_SEED_PASSWORD')
  const ADMIN_NAME = Deno.env.get('ADMIN_SEED_NAME') ?? 'System Admin'
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: 'ADMIN_SEED_EMAIL/PASSWORD not set' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listErr) throw listErr
    let user = list.users.find((u) => (u.email ?? '').toLowerCase() === ADMIN_EMAIL.toLowerCase())

    if (!user) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: ADMIN_NAME, source: 'seed-admin' },
      })
      if (createErr) throw createErr
      user = created.user!
    } else {
      await supabase.auth.admin.updateUserById(user.id, { password: ADMIN_PASSWORD, email_confirm: true })
    }

    await supabase.from('user_roles').upsert(
      { user_id: user!.id, role: 'admin' },
      { onConflict: 'user_id,role' },
    )

    return new Response(JSON.stringify({ ok: true, user_id: user!.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('seed-admin failed', e)
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
